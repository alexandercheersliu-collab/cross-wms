"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductForm } from "@/components/shared/product-form"
import { ProductFormData } from "@/lib/validations"

export function EditProductPageClient() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<(ProductFormData & { id: string }) | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await apiFetch(`/api/products/${params.id}`)
        const result: any = await response.json()

        if (result.success) {
          const productData = result.data
          setProduct({
            id: productData.id,
            sku: productData.sku,
            name: productData.name,
            description: productData.description || "",
            category: productData.category || "",
            imageUrl: productData.imageUrl || "",
            weight: productData.weight || undefined,
            length: productData.length || undefined,
            width: productData.width || undefined,
            height: productData.height || undefined,
            costPrice: productData.costPrice || undefined,
            salePrice: productData.salePrice,
          })
        } else {
          setError(result.error || "获取商品失败")
        }
      } catch (error) {
        console.error("获取商品失败:", error)
        setError("获取商品失败，请重试")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">加载商品信息中...</p>
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">编辑商品</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">编辑商品</h1>
          </div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回商品列表
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">编辑商品</h1>
          <p className="text-muted-foreground">
            修改商品信息，更新商品记录
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>商品信息</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            initialData={product}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  )
}
