"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Truck, Loader2, ShoppingCart, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: string
  sku: string
  name: string
  quantity: number
  reserved: number
}

interface ShipmentItem {
  productId: string
  quantity: number
}

interface Order {
  id: string
  orderNo: string
  customerName?: string
  items: Array<{
    productId: string
    quantity: number
    product: { sku: string; name: string }
  }>
}

function NewShipmentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [products, setProducts] = useState<Product[]>([])
  const [items, setItems] = useState<ShipmentItem[]>([{ productId: "", quantity: 0 }])
  const [trackingNumber, setTrackingNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)

  // 获取关联订单信息
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        const result = await response.json()
        if (result.success) {
          setOrder(result.data)
          // 预填充订单商品到出库项
          const orderItems = result.data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity - (item.pickedQty || 0)
          })).filter((item: any) => item.quantity > 0)
          if (orderItems.length > 0) {
            setItems(orderItems)
          }
        }
      } catch (error) {
        console.error('获取订单失败:', error)
      }
    }
    fetchOrder()
  }, [orderId])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/inventory?pageSize=1000')
        const result = await response.json()
        if (result.success) {
          // 只显示有库存的商品，并保留库存数量信息
          const inventoryItems = result.data.data.filter((i: any) => i.quantity > 0)
          setProducts(inventoryItems.map((i: any) => ({
            id: i.product.id,
            sku: i.product.sku,
            name: i.product.name,
            quantity: i.quantity,
            reserved: i.reserved,
          })))
        }
      } catch (error) {
        console.error('获取商品失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleAddItem = () => setItems([...items, { productId: "", quantity: 0 }])
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const handleItemChange = (index: number, field: keyof ShipmentItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validItems = items.filter(item => item.productId && item.quantity > 0)
    if (validItems.length === 0) {
      alert('请至少添加一个有效的出库项')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/inventory/shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId || undefined, trackingNumber, notes, items: validItems }),
      })
      const result = await response.json()
      if (result.success) {
        router.push('/inventory/shipment')
        router.refresh()
      } else {
        alert(`提交失败: ${result.error}`)
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const getProductById = (id: string) => products.find(p => p.id === id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory/shipment">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />返回出库列表</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新建出库单</h1>
          <p className="text-muted-foreground">处理商品出库，扣减库存数量</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>出库信息</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* 关联订单信息 */}
            {order && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">关联订单</span>
                  </div>
                  <Link href={`/orders/${order.id}`} target="_blank">
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      查看订单
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-blue-700 dark:text-blue-300">订单号: </span>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">{order.orderNo}</span>
                  {order.customerName && (
                    <span className="ml-4 text-blue-700 dark:text-blue-300">
                      客户: {order.customerName}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tracking">跟踪号（可选）</Label>
                <Input id="tracking" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="例如: SF1234567890" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="请输入出库备注..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" />出库商品</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}><Plus className="mr-2 h-4 w-4" />添加商品</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">加载商品中...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品</TableHead>
                      <TableHead>可用库存</TableHead>
                      <TableHead>出库数量</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const product = getProductById(item.productId)
                      const availableQty = product ? product.quantity - product.reserved : 0
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Select value={item.productId} onValueChange={(value) => handleItemChange(index, 'productId', value)}>
                              <SelectTrigger className="w-64"><SelectValue placeholder="选择商品" /></SelectTrigger>
                              <SelectContent>
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>{p.sku} - {p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell><span className="text-sm text-muted-foreground">{availableQty}</span></TableCell>
                          <TableCell>
                            <Input type="number" min={1} max={availableQty} value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)} className="w-24" />
                          </TableCell>
                          <TableCell>
                            {items.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/inventory/shipment"><Button type="button" variant="outline" disabled={submitting}>取消</Button></Link>
          <Button type="submit" disabled={submitting || loading}>{submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />提交中...</> : '确认出库'}</Button>
        </div>
      </form>
    </div>
  )
}

// 使用 Suspense 包装组件，因为使用了 useSearchParams
export default function NewShipmentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">加载中...</div>}>
      <NewShipmentPageContent />
    </Suspense>
  )
}
