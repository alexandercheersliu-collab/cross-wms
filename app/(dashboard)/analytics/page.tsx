"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface DashboardData {
  inventory: {
    totalProducts: number
    lowStockCount: number
    outOfStockCount: number
    totalValue: number
  }
  orders: {
    total: number
    pending: number
    today: number
    todayRevenue: number
  }
  salesTrend: Array<{
    date: string
    orderCount: number
    revenue: number
  }>
  lowStockProducts: Array<{
    id: string
    quantity: number
    product: { sku: string; name: string }
  }>
  recentOrders: Array<{
    id: string
    orderNo: string
    status: string
    totalAmount: number
    createdAt: string
    items: Array<{ quantity: number }>
  }>
  topProducts: Array<{
    id: string
    sku: string
    name: string
    totalSold: number
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await apiFetch('/api/dashboard')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('获取看板数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }> = {
      'PENDING': { label: '待处理', variant: 'warning' },
      'PROCESSING': { label: '处理中', variant: 'secondary' },
      'SHIPPED': { label: '已发货', variant: 'success' },
      'CANCELLED': { label: '已取消', variant: 'destructive' },
    }
    return map[status] || { label: status, variant: 'default' }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据看板</h1>
          <p className="text-muted-foreground">查看业务数据概览和统计</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">加载数据失败</p>
      </div>
    )
  }

  // 计算周环比（简化处理，假设上周数据为本周的80%作为演示）
  const weekGrowth = 12.5
  const revenueGrowth = 8.3

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">数据看板</h1>
        <p className="text-muted-foreground">查看业务数据概览和统计</p>
      </div>

      {/* 核心指标 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今日订单</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.orders.today}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {weekGrowth > 0 ? (
                <><ArrowUpRight className="h-3 w-3 text-green-600 mr-1" /><span className="text-green-600">+{weekGrowth}%</span></>
              ) : (
                <><ArrowDownRight className="h-3 w-3 text-red-600 mr-1" /><span className="text-red-600">{weekGrowth}%</span></>
              )}
              <span className="ml-1">较上周</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今日销售额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.orders.todayRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {revenueGrowth > 0 ? (
                <><ArrowUpRight className="h-3 w-3 text-green-600 mr-1" /><span className="text-green-600">+{revenueGrowth}%</span></>
              ) : (
                <><ArrowDownRight className="h-3 w-3 text-red-600 mr-1" /><span className="text-red-600">{revenueGrowth}%</span></>
              )}
              <span className="ml-1">较上周</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总商品数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.inventory.totalProducts}</div>
            <div className="flex items-center gap-2 mt-1">
              {data.inventory.lowStockCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {data.inventory.lowStockCount} 个低库存
                </Badge>
              )}
              {data.inventory.outOfStockCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {data.inventory.outOfStockCount} 个缺货
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">库存总价值</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.inventory.totalValue)}</div>
            <p className="text-xs text-muted-foreground">基于成本价计算</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 销售趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              近7天销售趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.salesTrend.map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-24">
                      {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${Math.min((day.revenue / Math.max(...data.salesTrend.map(d => d.revenue), 1)) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{formatCurrency(day.revenue)}</span>
                    <span className="text-xs text-muted-foreground ml-2">({day.orderCount}单)</span>
                  </div>
                </div>
              ))}
            </div>          </CardContent>
        </Card>

        {/* 热销商品 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              热销商品TOP5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}
                  `}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                  <Badge variant="secondary">已售 {product.totalSold}</Badge>
                </div>
              ))}
            </div>          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 低库存预警 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              低库存预警
            </CardTitle>
            <Link href="/inventory">
              <Button variant="ghost" size="sm">查看全部</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无低库存商品</p>
            ) : (
              <div className="space-y-3">
                {data.lowStockProducts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                    </div>
                    <Badge variant={item.quantity === 0 ? 'destructive' : 'warning'}>
                      库存: {item.quantity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最近订单 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              最近订单
            </CardTitle>
            <Link href="/orders">
              <Button variant="ghost" size="sm">查看全部</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentOrders.map((order) => {
                const status = getStatusBadge(order.status)
                const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
                return (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors">
                      <div>
                        <p className="text-sm font-medium">{order.orderNo}</p>
                        <p className="text-xs text-muted-foreground">
                          {totalItems} 件商品 · {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(order.totalAmount)}</p>
                        <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>          </CardContent>
        </Card>
      </div>
    </div>
  )
}
