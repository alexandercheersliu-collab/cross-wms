"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingCart,
  Printer,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  pickedQty: number
  product: {
    sku: string
    name: string
    imageUrl?: string
  }
}

interface Shipment {
  id: string
  shipmentNo: string
  status: string
  shippedAt?: string
  trackingNumber?: string
  items: Array<{
    productId: string
    quantity: number
    product: { sku: string; name: string }
  }>
}

interface Order {
  id: string
  orderNo: string
  platform: string
  status: 'PENDING' | 'PROCESSING' | 'PICKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  customerName?: string
  customerEmail?: string
  shippingAddress?: string
  totalAmount: number
  notes?: string
  createdAt: string
  updatedAt: string
  shippedAt?: string
  items: OrderItem[]
  shipments: Shipment[]
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${params.id}`)
      const result = await response.json()
      if (result.success) {
        setOrder(result.data)
      } else {
        alert('获取订单失败: ' + result.error)
      }
    } catch (error) {
      console.error('获取订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    try {
      setCancelling(true)
      const response = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })
      const result = await response.json()
      if (result.success) {
        fetchOrder()
      } else {
        alert('取消失败: ' + result.error)
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      alert('取消订单失败')
    } finally {
      setCancelling(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const result = await response.json()
      if (result.success) {
        fetchOrder()
      } else {
        alert('更新失败: ' + result.error)
      }
    } catch (error) {
      console.error('更新订单状态失败:', error)
      alert('更新订单状态失败')
    }
  }

  const handleCreateShipment = async () => {
    try {
      const response = await fetch('/api/inventory/shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order?.id,
          items: order?.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity - item.pickedQty
          })).filter(item => item.quantity > 0)
        })
      })
      const result = await response.json()
      if (result.success) {
        alert('出库单创建成功')
        fetchOrder()
      } else {
        alert('创建出库单失败: ' + result.error)
      }
    } catch (error) {
      console.error('创建出库单失败:', error)
      alert('创建出库单失败')
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }> = {
      'PENDING': { label: '待处理', variant: 'warning' },
      'PROCESSING': { label: '处理中', variant: 'secondary' },
      'PICKING': { label: '拣货中', variant: 'secondary' },
      'SHIPPED': { label: '已发货', variant: 'success' },
      'DELIVERED': { label: '已送达', variant: 'default' },
      'CANCELLED': { label: '已取消', variant: 'destructive' },
    }
    return map[status] || { label: status, variant: 'default' }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground mt-2">加载订单中...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">订单不存在</p>
        <Link href="/orders">
          <Button variant="outline" className="mt-4">返回订单列表</Button>
        </Link>
      </div>
    )
  }

  const status = getStatusBadge(order.status)
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPicked = order.items.reduce((sum, item) => sum + item.pickedQty, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回订单列表
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">订单详情</h1>
            <p className="text-muted-foreground">
              {order.orderNo} · {order.platform.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={status.variant} className="text-lg px-3 py-1">
            {status.label}
          </Badge>
          {/* 订单操作按钮 */}
          <div className="flex items-center gap-2">
            {order.status === 'PENDING' && (
              <>
                <Button onClick={() => handleUpdateStatus('PROCESSING')}>
                  <Package className="mr-2 h-4 w-4" />
                  开始处理
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={cancelling}>
                      <XCircle className="mr-2 h-4 w-4" />
                      取消订单
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认取消订单</AlertDialogTitle>
                      <AlertDialogDescription>
                        确定要取消此订单吗？取消后库存预留将被释放。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive">
                        确认取消
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            {order.status === 'PROCESSING' && (
              <Button onClick={() => handleUpdateStatus('PICKING')}>
                <Package className="mr-2 h-4 w-4" />
                开始拣货
              </Button>
            )}
            {order.status === 'PICKING' && (
              <>
                <Link href={`/print?orderId=${order.id}`}>
                  <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    打印拣货单
                  </Button>
                </Link>
                <Button onClick={handleCreateShipment}>
                  <Truck className="mr-2 h-4 w-4" />
                  创建出库单
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 订单信息 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              订单信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 商品列表 */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">商品明细</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>商品名称</TableHead>
                      <TableHead>单价</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>已拣货</TableHead>
                      <TableHead>小计</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product.sku}</TableCell>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <span className={item.pickedQty >= item.quantity ? 'text-green-600' : ''}>
                            {item.pickedQty}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator />

            {/* 金额汇总 */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                共 {totalItems} 件商品 · 已拣货 {totalPicked} 件
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">订单总额</span>
                <div className="text-2xl font-bold">{formatCurrency(order.totalAmount)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 客户信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              客户信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{order.customerName || '未填写'}</span>
              </div>
              {order.customerEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customerEmail}</span>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                收货地址
              </h3>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress || '未填写'}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">创建时间</span>
                <span>{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">更新时间</span>
                <span>{new Date(order.updatedAt).toLocaleString('zh-CN')}</span>
              </div>
              {order.shippedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">发货时间</span>
                  <span>{new Date(order.shippedAt).toLocaleString('zh-CN')}</span>
                </div>
              )}
            </div>

            {order.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-2">备注</h3>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 发货记录 */}
      {order.shipments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              发货记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>出库单号</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>跟踪号</TableHead>
                    <TableHead>发货时间</TableHead>
                    <TableHead>商品</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">{shipment.shipmentNo}</TableCell>
                      <TableCell>
                        <Badge variant={shipment.status === 'SHIPPED' ? 'success' : 'secondary'}>
                          {shipment.status === 'SHIPPED' ? '已发货' : shipment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{shipment.trackingNumber || '-'}</TableCell>
                      <TableCell>
                        {shipment.shippedAt
                          ? new Date(shipment.shippedAt).toLocaleString('zh-CN')
                          : '-'}
                      </TableCell>
                      <TableCell>{shipment.items.length} 项</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
