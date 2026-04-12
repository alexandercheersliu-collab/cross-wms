"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Scale,
  Box,
  Calendar,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

interface ProductDetail {
  id: string
  sku: string
  name: string
  description?: string | null
  category?: string | null
  imageUrl?: string | null
  weight?: number | null
  length?: number | null
  width?: number | null
  height?: number | null
  costPrice?: number | null
  salePrice: number
  createdAt: string
  updatedAt: string
  inventory?: {
    quantity: number
    reserved: number
    location?: string | null
    updatedAt: string
  }
}

export function ProductDetailPageClient() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await apiFetch(`/api/products/${params.id}`)
        const result: any = await response.json()

        if (result.success) {
          setProduct(result.data)
        } else {
          setError(result.error || "获取商品详情失败")
        }
      } catch (error) {
        console.error("获取商品详情失败:", error)
        setError("获取商品详情失败，请重试")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleDelete = async () => {
    if (!product) return

    try {
      setDeleting(true)
      const response = await apiFetch(`/api/products/${product.id}`, {
        method: "DELETE",
      })
      const result: any = await response.json()

      if (result.success) {
        router.push("/products")
        router.refresh()
      } else {
        alert(`删除失败: ${result.error}`)
      }
    } catch (error) {
      console.error("删除失败:", error)
      alert("删除失败，请重试")
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "未设置"
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { label: "缺货", variant: "destructive" as const }
    if (quantity <= 10) return { label: "低库存", variant: "warning" as const }
    return { label: "充足", variant: "success" as const }
  }

  const getAvailableQuantity = () => {
    if (!product?.inventory) return 0
    return product.inventory.quantity - product.inventory.reserved
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">加载商品详情中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回商品列表
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/products")}
              >
                返回商品列表
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回商品列表
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">商品不存在</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/products")}
              >
                返回商品列表
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stockStatus = getStockStatus(product.inventory?.quantity || 0)
  const availableQuantity = getAvailableQuantity()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground">
              SKU: {product.sku} • {product.category || "未分类"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/products/${product.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              编辑商品
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 商品信息 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              商品信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">描述</h3>
              <p className="text-sm">
                {product.description || "暂无描述"}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">规格信息</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">重量</span>
                  </div>
                  <p className="text-sm">
                    {product.weight ? `${product.weight} 克` : "未设置"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">尺寸</span>
                  </div>
                  <p className="text-sm">
                    {product.length && product.width && product.height
                      ? `${product.length} × ${product.width} × ${product.height} cm`
                      : "未设置"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">价格信息</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">成本价</span>
                  </div>
                  <p className="text-sm">{formatCurrency(product.costPrice)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">售价</span>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(product.salePrice)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 库存信息 */}
        <Card>
          <CardHeader>
            <CardTitle>库存信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">库存状态</span>
                <Badge variant={stockStatus.variant}>
                  {stockStatus.label}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">总库存</span>
                  <span className="text-lg font-semibold">
                    {product.inventory?.quantity || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">已预留</span>
                  <span className="text-lg font-semibold">
                    {product.inventory?.reserved || 0}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">可用库存</span>
                  <span className={`text-lg font-bold ${availableQuantity <= 10 ? "text-yellow-600" : "text-green-600"}`}>
                    {availableQuantity}
                  </span>
                </div>
              </div>

              {product.inventory?.location && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">库位信息</h3>
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{product.inventory.location}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">时间信息</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">创建时间</span>
                  <span>{formatDate(product.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">更新时间</span>
                  <span>{formatDate(product.updatedAt)}</span>
                </div>
                {product.inventory?.updatedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">库存更新</span>
                    <span>{formatDate(product.inventory.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除商品</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除商品 "{product.sku} - {product.name}" 吗？
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

export default ProductDetailPageClient
