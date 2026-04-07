"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import {
  Search,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
  History,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Warehouse,
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

interface InventoryItem {
  id: string
  productId: string
  quantity: number
  reserved: number
  location?: string
  updatedAt: string
  product: {
    id: string
    sku: string
    name: string
    category?: string
    salePrice: number
  }
  availableQuantity: number
  isLowStock: boolean
}

interface PaginatedResponse {
  data: InventoryItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function InventoryPage() {
  const router = useRouter()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [activeTab, setActiveTab] = useState<"inventory" | "lowstock">("inventory")

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { sku: search }),
        ...(lowStockOnly && { lowStock: 'true' }),
      })

      const response = await apiFetch(`/api/inventory?${params}`)
      const result = await response.json()

      if (result.success) {
        setInventory(result.data.data)
        setTotal(result.data.total)
        setTotalPages(result.data.totalPages)
        setPage(result.data.page)
        setPageSize(result.data.pageSize)
      } else {
        console.error("获取库存失败:", result.error)
      }
    } catch (error) {
      console.error("获取库存失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [page, search, lowStockOnly])

  const getStockStatus = (quantity: number, reserved: number) => {
    const available = quantity - reserved
    if (quantity <= 0) return { label: "缺货", variant: "destructive" as const }
    if (quantity <= 10) return { label: "低库存", variant: "warning" as const }
    if (available <= 5) return { label: "紧张", variant: "secondary" as const }
    return { label: "充足", variant: "success" as const }
  }

  const quickActions = [
    {
      title: "入库管理",
      description: "处理商品入库",
      icon: ArrowDownLeft,
      href: "/inventory/receiving",
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "出库管理",
      description: "处理订单出库",
      icon: ArrowUpRight,
      href: "/inventory/shipment",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "库存盘点",
      description: "盘点库存差异",
      icon: ClipboardList,
      href: "/inventory/stocktake",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      title: "变动记录",
      description: "查看库存流水",
      icon: History,
      href: "/inventory/transactions",
      color: "bg-orange-500/10 text-orange-600",
    },
  ]

  const lowStockCount = inventory.filter(i => i.isLowStock).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">库存管理</h1>
          <p className="text-muted-foreground">
            管理库存数量、入库出库、盘点等操作
          </p>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 自定义 Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "inventory"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            库存列表
          </button>
          <button
            onClick={() => setActiveTab("lowstock")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "lowstock"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            低库存预警
            {lowStockCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {lowStockCount}
              </Badge>
            )}
          </button>
        </div>

        {activeTab === "inventory" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                库存列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="搜索SKU或商品名称..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button
                      variant={lowStockOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLowStockOnly(!lowStockOnly)}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      仅看低库存
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    共 {total} 个库存记录
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>商品名称</TableHead>
                            <TableHead>分类</TableHead>
                            <TableHead>总库存</TableHead>
                            <TableHead>已预留</TableHead>
                            <TableHead>可用库存</TableHead>
                            <TableHead>库位</TableHead>
                            <TableHead>状态</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inventory.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8">
                                <div className="flex flex-col items-center gap-2">
                                  <Package className="h-12 w-12 text-muted-foreground/50" />
                                  <p className="text-muted-foreground">暂无库存数据</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            inventory.map((item) => {
                              const stockStatus = getStockStatus(item.quantity, item.reserved)
                              return (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">
                                    <Link
                                      href={`/products/${item.productId}`}
                                      className="hover:underline"
                                    >
                                      {item.product.sku}
                                    </Link>
                                  </TableCell>
                                  <TableCell>{item.product.name}</TableCell>
                                  <TableCell>
                                    {item.product.category || (
                                      <span className="text-muted-foreground">未分类</span>
                                    )}
                                  </TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>{item.reserved}</TableCell>
                                  <TableCell className="font-semibold">
                                    <span className={item.availableQuantity <= 5 ? "text-red-600" : ""}>
                                      {item.availableQuantity}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {item.location || (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={stockStatus.variant}>
                                      {stockStatus.label}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {inventory.length > 0 && (
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                低库存预警
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>商品名称</TableHead>
                      <TableHead>当前库存</TableHead>
                      <TableHead>建议操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.filter(i => i.isLowStock).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <p className="text-muted-foreground">暂无低库存商品</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventory
                        .filter(i => i.isLowStock)
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.product.sku}</TableCell>
                            <TableCell>{item.product.name}</TableCell>
                            <TableCell>
                              <Badge variant="destructive">{item.quantity}</Badge>
                            </TableCell>
                            <TableCell>
                              <Link href="/inventory/receiving/new">
                                <Button size="sm" variant="outline">
                                  <ArrowDownLeft className="mr-2 h-4 w-4" />
                                  入库补货
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
