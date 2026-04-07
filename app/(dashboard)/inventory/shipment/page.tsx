"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Truck, CheckCircle, Clock, Package, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

interface Shipment {
  id: string
  shipmentNo: string
  status: 'PENDING' | 'PACKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  shippedAt?: string
  trackingNumber?: string
  notes?: string
  createdAt: string
  orderId?: string
  order?: {
    id: string
    orderNo: string
  }
  items: Array<{
    id: string
    productId: string
    quantity: number
    product: { sku: string; name: string }
  }>
}

export default function ShipmentPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchShipments()
  }, [page, statusFilter])

  const fetchShipments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(), pageSize: '20',
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      })
      const response = await fetch(`/api/inventory/shipment?${params}`)
      const result = await response.json()
      if (result.success) {
        setShipments(result.data.data)
        setTotal(result.data.total)
        setTotalPages(result.data.totalPages)
      }
    } catch (error) {
      console.error("获取出库单失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }> = {
      'PENDING': { label: '待处理', variant: 'warning' },
      'PACKING': { label: '打包中', variant: 'secondary' },
      'SHIPPED': { label: '已发货', variant: 'success' },
      'DELIVERED': { label: '已送达', variant: 'default' },
      'CANCELLED': { label: '已取消', variant: 'destructive' },
    }
    return map[status] || { label: status, variant: 'default' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />返回库存管理</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">出库管理</h1>
            <p className="text-muted-foreground">管理商品出库，处理订单发货</p>
          </div>
        </div>
        <Link href="/inventory/shipment/new">
          <Button><Plus className="mr-2 h-4 w-4" />新建出库单</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" />出库单列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="全部状态" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部状态</SelectItem>
                  <SelectItem value="PENDING">待处理</SelectItem>
                  <SelectItem value="SHIPPED">已发货</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">共 {total} 个出库单</div>
            </div>

            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>出库单号</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>关联订单</TableHead>
                        <TableHead>商品数量</TableHead>
                        <TableHead>总件数</TableHead>
                        <TableHead>跟踪号</TableHead>
                        <TableHead>创建时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shipments.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="text-center py-8">
                          <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-muted-foreground">暂无出库单</p>
                        </TableCell></TableRow>
                      ) : shipments.map((s) => {
                        const status = getStatusBadge(s.status)
                        const totalQty = s.items.reduce((sum, i) => sum + i.quantity, 0)
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.shipmentNo}</TableCell>
                            <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                            <TableCell>
                              {s.order ? (
                                <Link href={`/orders/${s.order.id}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline">
                                  <ShoppingCart className="h-3 w-3" />
                                  {s.order.orderNo}
                                </Link>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>{s.items.length} 种商品</TableCell>
                            <TableCell>{totalQty} 件</TableCell>
                            <TableCell>{s.trackingNumber || '-'}</TableCell>
                            <TableCell>{new Date(s.createdAt).toLocaleDateString('zh-CN')}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                {shipments.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">第 {page} 页，共 {totalPages} 页</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}><ChevronLeft className="h-4 w-4" />上一页</Button>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>下一页<ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
