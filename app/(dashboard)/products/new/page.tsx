"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductForm } from "@/components/shared/product-form"

export default function NewProductPage() {
  const router = useRouter()

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
          <h1 className="text-3xl font-bold tracking-tight">创建新商品</h1>
          <p className="text-muted-foreground">
            填写商品信息，创建新的商品记录
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>商品信息</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}