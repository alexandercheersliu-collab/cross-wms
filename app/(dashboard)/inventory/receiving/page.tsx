"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
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

interface ReceivingItem {
  id: string
  productId: string
  quantity: number
  unitCost?: number
  product: {
    sku: string
    name: string
  }
}

interface Receiving {
  id: string
  receivingNo: string
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED'
  receivedAt?: string
  notes?: string
  createdAt: string
  items: ReceivingItem[]
}

interface PaginatedResponse {
  data: Receiving[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function ReceivingPage() {
  const [receivings, setReceivings] = useState<Receiving[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const fetchReceivings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      })

      const response = await fetch(`/api/inventory/receiving?${params}`)
      const result = await response.json()

      if (result.success) {
        setReceivings(result.data.data)
        setTotal(result.data.total)
        setTotalPages(result.data.totalPages)
      } else {
        console.error("获取入库单失败:", result.error)
      }
    } catch (error) {
      console.error("获取入库单失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReceivings()
  }, [page, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return { label: '已入库', variant: 'success' as const, icon: CheckCircle }
      case 'PENDING':
        return { label: '待处理', variant: 'warning' as const, icon: Clock }
      case 'CANCELLED':
        return { label: '已取消', variant: 'secondary' as const, icon: XCircle }
      default:
        return { label: status, variant: 'default' as const, icon: Package }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回库存管理
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">入库管理</h1>
            <p className="text-muted-foreground">
              管理商品入库记录，查看入库历史
            </p>
          </div>
        </div>
        <Link href="/inventory/receiving/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建入库单
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            入库单列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">全部状态</SelectItem>
                    <SelectItem value="PENDING">待处理</SelectItem>
                    <SelectItem value="RECEIVED">已入库</SelectItem>
                    <SelectItem value="CANCELLED">已取消</SelectItem>
                  </SelectContent>
                </Select>
                {statusFilter !== 'ALL' && (
                  <Button variant="ghost" size="sm" onClick={() => setStatusFilter('ALL')}>
                    清除筛选
                  </Button>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                共 {total} 个入库单
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>入库单号</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>商品数量</TableHead>
                        <TableHead>总件数</TableHead>
                        <TableHead>入库时间</TableHead>
                        <TableHead>备注</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receivings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Package className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-muted-foreground">暂无入库单</p>
                              <Link href="/inventory/receiving/new">
                                <Button variant="outline" size="sm">
                                  创建入库单
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        receivings.map((receiving) => {
                          const status = getStatusBadge(receiving.status)
                          const totalQuantity = receiving.items.reduce((sum, item) => sum + item.quantity, 0)
                          return (
                            <TableRow key={receiving.id}>
                              <TableCell className="font-medium">
                                {receiving.receivingNo}
                              </TableCell>
                              <TableCell>
                                <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                                  <status.icon className="h-3 w-3" />
                                  {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell>{receiving.items.length} 种商品</TableCell>
                              <TableCell>{totalQuantity} 件</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  {formatDate(receiving.receivedAt || receiving.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                                  {receiving.notes || '-'}
                                </span>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {receivings.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      第 {page} 页，共 {totalPages} 页
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        上一页
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                      >
                        下一页
                        <ChevronRight className="h-4 w-4" />
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
