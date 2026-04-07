"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import {
  ShoppingCart,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  MoreVertical,
  Filter,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  product: {
    sku: string
    name: string
  }
}

interface Order {
  id: string
  orderNo: string
  platform: string
  status: 'PENDING' | 'PROCESSING' | 'PICKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  customerName?: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [platformFilter, setPlatformFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(platformFilter !== 'ALL' && { platform: platformFilter }),
      })

      const response = await apiFetch(`/api/orders?${params}`)
      const result = await response.json()

      if (result.success) {
        setOrders(result.data.data)
        setTotal(result.data.total)
        setTotalPages(result.data.totalPages)
      } else {
        console.error('获取订单失败:', result.error)
      }
    } catch (error) {
      console.error('获取订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, statusFilter, platformFilter])

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

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('确定要取消此订单吗？取消后库存预留将被释放。')) return

    try {
      const response = await apiFetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })
      const result = await response.json()
      if (result.success) {
        fetchOrders()
      } else {
        alert(`取消失败: ${result.error}`)
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      alert('取消订单失败')
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await apiFetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const result = await response.json()
      if (result.success) {
        fetchOrders()
      } else {
        alert(`更新失败: ${result.error}`)
      }
    } catch (error) {
      console.error('更新订单状态失败:', error)
      alert('更新订单状态失败')
    }
  }

  const handleCreateShipment = async (order: Order) => {
    try {
      const response = await apiFetch('/api/inventory/shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          items: order.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        })
      })
      const result = await response.json()
      if (result.success) {
        alert('出库单创建成功')
        fetchOrders()
      } else {
        alert('创建出库单失败: ' + result.error)
      }
    } catch (error) {
      console.error('创建出库单失败:', error)
      alert('创建出库单失败')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }

  const filteredOrders = orders.filter(order =>
    order.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">订单管理</h1>
          <p className="text-muted-foreground">管理销售订单，跟踪订单状态</p>
        </div>
        <Link href="/orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建订单
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            订单列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索订单号或客户..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部状态</SelectItem>
                  <SelectItem value="PENDING">待处理</SelectItem>
                  <SelectItem value="PROCESSING">处理中</SelectItem>
                  <SelectItem value="PICKING">拣货中</SelectItem>
                  <SelectItem value="SHIPPED">已发货</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>

              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部平台</SelectItem>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="shopify">Shopify</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="ebay">eBay</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>

              {(statusFilter !== 'ALL' || platformFilter !== 'ALL') && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setStatusFilter('ALL')
                  setPlatformFilter('ALL')
                }}>
                  清除筛选
                </Button>
              )}

              <div className="flex-1 text-right text-sm text-muted-foreground">
                共 {total} 个订单
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>订单号</TableHead>
                        <TableHead>平台</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>客户</TableHead>
                        <TableHead>商品数</TableHead>
                        <TableHead>总金额</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-muted-foreground">暂无订单</p>
                              <Link href="/orders/new">
                                <Button variant="outline" size="sm">创建订单</Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map((order) => {
                          const status = getStatusBadge(order.status)
                          return (
                            <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/orders/${order.id}`)}>
                              <TableCell className="font-medium">{order.orderNo}</TableCell>
                              <TableCell className="uppercase">{order.platform}</TableCell>
                              <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                              <TableCell>{order.customerName || '-'}</TableCell>
                              <TableCell>{order.items.length} 项</TableCell>
                              <TableCell className="font-semibold">{formatCurrency(order.totalAmount)}</TableCell>
                              <TableCell>{new Date(order.createdAt).toLocaleDateString('zh-CN')}</TableCell>
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
                                      <Eye className="mr-2 h-4 w-4" />查看详情
                                    </DropdownMenuItem>
                                    {order.status === 'PENDING' && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}>
                                          <CheckCircle className="mr-2 h-4 w-4" />开始处理
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleCancelOrder(order.id)} className="text-destructive">
                                          <XCircle className="mr-2 h-4 w-4" />取消订单
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {order.status === 'PROCESSING' && (
                                      <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'PICKING')}>
                                        <Package className="mr-2 h-4 w-4" />开始拣货
                                      </DropdownMenuItem>
                                    )}
                                    {order.status === 'PICKING' && (
                                      <>
                                        <DropdownMenuItem onClick={() => router.push(`/print?orderId=${order.id}`)}>
                                          <Eye className="mr-2 h-4 w-4" />打印拣货单
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleCreateShipment(order)}>
                                          <Truck className="mr-2 h-4 w-4" />创建出库单
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filteredOrders.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">第 {page} 页，共 {totalPages} 页</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
                        <ChevronLeft className="h-4 w-4" />上一页
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                        下一页<ChevronRight className="h-4 w-4" />
                      </Button>
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
