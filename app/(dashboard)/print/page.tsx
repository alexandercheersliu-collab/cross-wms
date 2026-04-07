"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { apiFetch } from "@/lib/api"
import { useSearchParams } from "next/navigation"
import { useReactToPrint } from "react-to-print"
import {
  Printer,
  Package,
  Search,
  FileText,
  Barcode,
  Loader2,
  Eye,
  History,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PicklistPrint } from "@/components/print/picklist-print"
import { FBALabelPrint } from "@/components/print/fba-label-print"

interface PicklistItem {
  productId: string
  sku: string
  name: string
  quantity: number
  location?: string
}

interface PicklistData {
  orderId: string
  orderNo: string
  items: PicklistItem[]
  totalItems: number
  printedAt: Date
  notes?: string
}

function PrintPageContent() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || "")
  const [sku, setSku] = useState("")
  const [loading, setLoading] = useState(false)
  const [picklistData, setPicklistData] = useState<PicklistData | null>(null)
  const [pickerName, setPickerName] = useState("")
  const [activeTab, setActiveTab] = useState<'picklist' | 'fba'>('picklist')

  const picklistRef = useRef<HTMLDivElement>(null)
  const fbaLabelRef = useRef<HTMLDivElement>(null)

  const handlePrintPicklist = useReactToPrint({
    contentRef: picklistRef,
    documentTitle: `拣货单-${picklistData?.orderNo || '打印'}`,
  })

  const handlePrintFBALabel = useReactToPrint({
    contentRef: fbaLabelRef,
    documentTitle: `FBA标签-${sku || '打印'}`,
  })

  const fetchPicklistData = async () => {
    if (!orderId) return
    try {
      setLoading(true)
      const response = await apiFetch(`/api/print/picklist?orderId=${orderId}`)
      const result = await response.json()
      if (result.success) {
        setPicklistData(result.data)
      } else {
        alert('获取订单数据失败: ' + result.error)
      }
    } catch (error) {
      console.error('获取拣货单数据失败:', error)
      alert('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 模拟FBA标签数据
  const fbaLabelData = sku
    ? [{
        sku: sku,
        fnsku: 'X00' + sku.replace(/[^A-Z0-9]/gi, '').slice(0, 8).toUpperCase(),
        name: '商品 ' + sku,
        condition: 'New',
        quantity: 1,
        madeIn: 'China'
      }]
    : []

  // 如果有orderId参数，自动加载订单数据
  useEffect(() => {
    if (orderId) {
      fetchPicklistData()
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">打印中心</h1>
        <p className="text-muted-foreground">打印拣货单、FBA标签等</p>
      </div>

      <div className="space-y-4">
        {/* 标签切换 */}
        <div className="flex gap-2 border-b pb-4">
          <button
            onClick={() => setActiveTab('picklist')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'picklist'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <FileText className="h-4 w-4" />
            拣货单打印
          </button>
          <button
            onClick={() => setActiveTab('fba')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'fba'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <Barcode className="h-4 w-4" />
            FBA标签打印
          </button>
        </div>

        {/* 拣货单打印 */}
        {activeTab === 'picklist' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                打印拣货单
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">订单号</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="输入订单号或订单ID"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                    <Button onClick={fetchPicklistData} disabled={loading || !orderId}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <><Search className="mr-2 h-4 w-4" />查询</>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="w-48">
                  <label className="text-sm font-medium mb-2 block">拣货员</label>
                  <Input
                    placeholder="拣货员姓名"
                    value={pickerName}
                    onChange={(e) => setPickerName(e.target.value)}
                  />
                </div>
              </div>

              {picklistData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">订单: {picklistData.orderNo}</p>
                      <p className="text-sm text-muted-foreground">
                        共 {picklistData.totalItems} 件商品
                      </p>
                    </div>
                    <Button onClick={handlePrintPicklist}>
                      <Printer className="mr-2 h-4 w-4" />
                      打印拣货单
                    </Button>
                  </div>

                  {/* 打印预览 */}
                  <div className="border rounded-lg p-4 bg-gray-50 overflow-auto">
                    <p className="text-sm text-muted-foreground mb-2">打印预览:</p>
                    <div className="scale-75 origin-top-left">
                      <PicklistPrint
                        ref={picklistRef}
                        orderNo={picklistData.orderNo}
                        items={picklistData.items}
                        picker={pickerName}
                        printedAt={new Date()}
                        notes={picklistData.notes}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
                )}

        {/* FBA标签打印 */}
        {activeTab === 'fba' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                打印FBA标签
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">SKU</label>
                  <Input
                    placeholder="输入商品SKU"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handlePrintFBALabel} disabled={!sku}>
                    <Printer className="mr-2 h-4 w-4" />
                    打印标签
                  </Button>
                </div>
              </div>

              {sku && (
                <div className="border rounded-lg p-4 bg-gray-50 overflow-auto">
                  <p className="text-sm text-muted-foreground mb-2">打印预览:</p>
                  <div className="scale-75 origin-top-left">
                    <FBALabelPrint ref={fbaLabelRef} items={fbaLabelData} />
                  </div>
                </div>
              )}

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">说明</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>FBA标签尺寸: 100mm × 60mm</li>
                  <li>建议使用热敏标签纸打印</li>
                  <li>打印前请确认SKU和FNSKU正确</li>
                  <li>实际条码需要使用条码打印机生成</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


// 导出默认组件，使用 Suspense 包装
export default function PrintPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">加载中...</div>}>
      <PrintPageContent />
    </Suspense>
  )
}
