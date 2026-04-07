"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, ClipboardList, CheckCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Stocktake {
  id: string
  stocktakeNo: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  countedAt?: string
  notes?: string
  createdAt: string
  items: Array<{
    id: string
    productId: string
    countedQuantity: number
    systemQuantity: number
    variance: number
    product: { sku: string; name: string }
  }>
}

export default function StocktakePage() {
  const [stocktakes, setStocktakes] = useState<Stocktake[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchStocktakes()
  }, [page, statusFilter])

  const fetchStocktakes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(), pageSize: '20',
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      })
      const response = await fetch(`/api/inventory/stocktake?${params}`)
      const result = await response.json()
      if (result.success) {
        setStocktakes(result.data.data)
        setTotal(result.data.total)
        setTotalPages(result.data.totalPages)
      }
    } catch (error) {
      console.error("获取盘点单失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }> = {
      'IN_PROGRESS': { label: '进行中', variant: 'warning' },
      'COMPLETED': { label: '已完成', variant: 'success' },
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
            <h1 className="text-3xl font-bold tracking-tight">库存盘点</h1>
            <p className="text-muted-foreground">盘点库存数量，调整库存差异</p>
          </div>
        </div>
        <Link href="/inventory/stocktake/new">
          <Button><Plus className="mr-2 h-4 w-4" />新建盘点单</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" />盘点单列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="全部状态" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部状态</SelectItem>
                  <SelectItem value="IN_PROGRESS">进行中</SelectItem>
                  <SelectItem value="COMPLETED">已完成</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">共 {total} 个盘点单</div>
            </div>

            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>盘点单号</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>商品数量</TableHead>
                        <TableHead>差异项</TableHead>
                        <TableHead>完成时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stocktakes.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-8">
                          <ClipboardList className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-muted-foreground">暂无盘点单</p>
                        </TableCell></TableRow>
                      ) : stocktakes.map((s) => {
                        const status = getStatusBadge(s.status)
                        const varianceCount = s.items.filter(i => i.variance !== 0).length
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.stocktakeNo}</TableCell>
                            <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                            <TableCell>{s.items.length} 种商品</TableCell>
                            <TableCell>
                              {varianceCount > 0 ? (
                                <Badge variant="destructive">{varianceCount} 项差异</Badge>
                              ) : (
                                <span className="text-muted-foreground">无差异</span>
                              )}
                            </TableCell>
                            <TableCell>{s.countedAt ? new Date(s.countedAt).toLocaleDateString('zh-CN') : '-'}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                {stocktakes.length > 0 && (
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
