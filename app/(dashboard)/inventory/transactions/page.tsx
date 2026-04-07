"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, History, ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, Minus, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Transaction {
  id: string
  productId: string
  quantityChange: number
  transactionType: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT' | 'STOCKTAKE'
  referenceType?: 'ORDER' | 'RECEIVING' | 'SHIPMENT' | 'STOCKTAKE' | 'MANUAL'
  referenceId?: string
  notes?: string
  createdAt: string
  product: {
    sku: string
    name: string
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [typeFilter, setTypeFilter] = useState('ALL')

  useEffect(() => {
    fetchTransactions()
  }, [page, typeFilter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(typeFilter !== 'ALL' && { transactionType: typeFilter }),
      })

      const response = await fetch(`/api/inventory/transactions?${params}`)
      const result = await response.json()

      if (result.success) {
        setTransactions(result.data.data)
        setTotal(result.data.total)
        setTotalPages(result.data.totalPages)
      }
    } catch (error) {
      console.error("获取变动记录失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeBadge = (type: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive'; icon: any }> = {
      'INBOUND': { label: '入库', variant: 'success', icon: ArrowDownLeft },
      'OUTBOUND': { label: '出库', variant: 'destructive', icon: ArrowUpRight },
      'ADJUSTMENT': { label: '调整', variant: 'warning', icon: Minus },
      'STOCKTAKE': { label: '盘点', variant: 'secondary', icon: Plus },
    }
    return map[type] || { label: type, variant: 'default', icon: Minus }
  }

  const getReferenceLabel = (type?: string) => {
    const map: Record<string, string> = {
      'ORDER': '订单',
      'RECEIVING': '入库单',
      'SHIPMENT': '出库单',
      'STOCKTAKE': '盘点单',
      'MANUAL': '手动',
    }
    return type ? map[type] || type : '-'
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
            <h1 className="text-3xl font-bold tracking-tight">库存变动记录</h1>
            <p className="text-muted-foreground">查看所有库存变动的详细记录</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            变动记录列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部类型</SelectItem>
                  <SelectItem value="INBOUND">入库</SelectItem>
                  <SelectItem value="OUTBOUND">出库</SelectItem>
                  <SelectItem value="STOCKTAKE">盘点</SelectItem>
                  <SelectItem value="ADJUSTMENT">调整</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                共 {total} 条记录
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
                        <TableHead>时间</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>商品名称</TableHead>
                        <TableHead>变动数量</TableHead>
                        <TableHead>关联单据</TableHead>
                        <TableHead>备注</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <History className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-muted-foreground">暂无变动记录</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((t) => {
                          const type = getTypeBadge(t.transactionType)
                          return (
                            <TableRow key={t.id}>
                              <TableCell className="text-sm">
                                {new Date(t.createdAt).toLocaleString('zh-CN')}
                              </TableCell>
                              <TableCell>
                                <Badge variant={type.variant} className="flex items-center gap-1 w-fit">
                                  <type.icon className="h-3 w-3" />
                                  {type.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{t.product.sku}</TableCell>
                              <TableCell>{t.product.name}</TableCell>
                              <TableCell>
                                <span className={t.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {getReferenceLabel(t.referenceType)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                                  {t.notes || '-'}
                                </span>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {transactions.length > 0 && (
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
