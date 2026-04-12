"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import {
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  MoreVertical
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  sku: string
  name: string
  category?: string | null
  salePrice: number
  inventory?: {
    quantity: number
    reserved: number
  }
  createdAt: string
}

interface PaginatedResponse {
  data: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { sku: search }),
      })

      const response = await apiFetch(`/api/products?${params}`)

      const result: any = await response.json()

      if (result.success) {
        setProducts(result.data.data)
        setTotal(result.data.total)
        setTotalPages(result.data.totalPages)
        setPage(result.data.page)
        setPageSize(result.data.pageSize)
      } else {
        console.error("获取商品失败:", result.error)
      }
    } catch (error) {
      console.error("获取商品失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page, search])

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      setDeleting(true)
      const response = await apiFetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      })
      const result: any = await response.json()

      if (result.success) {
        // 重新获取商品列表
        fetchProducts()
        setDeleteDialogOpen(false)
        setProductToDelete(null)
      } else {
        alert(`删除失败: ${result.error}`)
      }
    } catch (error) {
      console.error("删除失败:", error)
      alert("删除失败，请重试")
    } finally {
      setDeleting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN")
  }

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { label: "缺货", variant: "destructive" as const }
    if (quantity <= 10) return { label: "低库存", variant: "warning" as const }
    return { label: "充足", variant: "success" as const }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">商品管理</h1>
          <p className="text-muted-foreground">
            管理您的商品信息，包括SKU、价格、库存等
          </p>
        </div>
        <Link href="/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建商品
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>商品列表</CardTitle>
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
              </div>
              <div className="text-sm text-muted-foreground">
                共 {total} 个商品
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
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
                        <TableHead>售价</TableHead>
                        <TableHead>库存状态</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Package className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-muted-foreground">暂无商品数据</p>
                              <Link href="/products/new">
                                <Button variant="outline" size="sm">
                                  创建第一个商品
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product) => {
                          const stockStatus = getStockStatus(
                            product.inventory?.quantity || 0
                          )
                          return (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  {product.sku}
                                </div>
                              </TableCell>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>
                                {product.category || (
                                  <span className="text-muted-foreground">未分类</span>
                                )}
                              </TableCell>
                              <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge variant={stockStatus.variant}>
                                    {stockStatus.label}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    库存: {product.inventory?.quantity || 0}
                                    {product.inventory?.reserved && product.inventory.reserved > 0 && (
                                      <span className="ml-1">
                                        (预留: {product.inventory.reserved})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{formatDate(product.createdAt)}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(`/products/${product.id}`)
                                      }
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      查看详情
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(`/products/${product.id}/edit`)
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      编辑
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => {
                                        setProductToDelete(product)
                                        setDeleteDialogOpen(true)
                                      }}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      删除
                                    </DropdownMenuItem>
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

                {products.length > 0 && (
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除商品</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除商品 "{productToDelete?.sku} - {productToDelete?.name}" 吗？
              此操作无法撤销，且会删除相关的库存记录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}