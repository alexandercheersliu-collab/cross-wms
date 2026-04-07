"use client"

import { forwardRef } from "react"
import { Package, Calendar, User, ClipboardList } from "lucide-react"

interface PicklistItem {
  productId: string
  sku: string
  name: string
  quantity: number
  location?: string
  picked?: boolean
}

interface PicklistPrintProps {
  orderNo: string
  items: PicklistItem[]
  picker?: string
  printedAt: Date
  notes?: string
}

export const PicklistPrint = forwardRef<HTMLDivElement, PicklistPrintProps>(
  ({ orderNo, items, picker, printedAt, notes }, ref) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
      <div ref={ref} className="p-8 bg-white text-black" style={{ width: '210mm', minHeight: '297mm' }}>
        {/* 头部 */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">拣货单</h1>
                <p className="text-sm text-gray-600">Picking List</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{orderNo}</p>
              <p className="text-sm text-gray-600">订单号</p>
            </div>
          </div>
        </div>

        {/* 信息栏 */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-gray-600">打印时间:</span>
            <span className="font-medium">
              {printedAt.toLocaleString('zh-CN')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-gray-600">拣货员:</span>
            <span className="font-medium">{picker || '_____________'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="text-gray-600">总件数:</span>
            <span className="font-bold text-lg">{totalItems}</span>
          </div>
        </div>

        {/* 商品表格 */}
        <table className="w-full border-collapse border border-black mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-3 py-2 text-left w-12">序号</th>
              <th className="border border-black px-3 py-2 text-left">SKU</th>
              <th className="border border-black px-3 py-2 text-left">商品名称</th>
              <th className="border border-black px-3 py-2 text-center w-20">库位</th>
              <th className="border border-black px-3 py-2 text-center w-20">数量</th>
              <th className="border border-black px-3 py-2 text-center w-20">已拣</th>
              <th className="border border-black px-3 py-2 text-center w-20">核对</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.productId}>
                <td className="border border-black px-3 py-3 text-center">{index + 1}</td>
                <td className="border border-black px-3 py-3 font-mono text-sm">{item.sku}</td>
                <td className="border border-black px-3 py-3">{item.name}</td>
                <td className="border border-black px-3 py-3 text-center font-medium">
                  {item.location || '-'}
                </td>
                <td className="border border-black px-3 py-3 text-center font-bold text-lg">
                  {item.quantity}
                </td>
                <td className="border border-black px-3 py-3 text-center">
                  <div className="w-6 h-6 border-2 border-black mx-auto"></div>
                </td>
                <td className="border border-black px-3 py-3 text-center">
                  <div className="w-6 h-6 border-2 border-black mx-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 备注 */}
        {notes && (
          <div className="mb-6 p-3 border border-black bg-gray-50">
            <p className="text-sm font-bold mb-1">备注:</p>
            <p className="text-sm">{notes}</p>
          </div>
        )}

        {/* 底部签名 */}
        <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-black">
          <div>
            <p className="text-sm text-gray-600 mb-8">拣货员签字:</p>
            <div className="border-b border-black w-48"></div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-8">复核员签字:</p>
            <div className="border-b border-black w-48"></div>
          </div>
        </div>

        {/* 打印提示 */}
        <div className="mt-12 text-center text-xs text-gray-500">
          <p>此拣货单由 WMS 系统自动生成</p>
          <p>打印时间: {printedAt.toLocaleString('zh-CN')}</p>
        </div>
      </div>
    )
  }
)

PicklistPrint.displayName = "PicklistPrint"
