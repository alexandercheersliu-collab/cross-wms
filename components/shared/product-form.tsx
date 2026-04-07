"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ProductFormData, productSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Package, Save, X } from "lucide-react"

interface ProductFormProps {
  initialData?: Partial<ProductFormData> & { id?: string }
  onSubmit?: (data: ProductFormData) => Promise<void>
  onCancel?: () => void
  mode?: "create" | "edit"
}

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  mode = "create",
}: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      sku: "",
      name: "",
      description: "",
      category: "",
      imageUrl: "",
      weight: undefined,
      length: undefined,
      width: undefined,
      height: undefined,
      costPrice: undefined,
      salePrice: 0,
    },
  })

  const handleSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true)

      if (onSubmit) {
        await onSubmit(data)
      } else {
        // 默认提交逻辑
        const url = mode === "edit" && initialData?.id
          ? `/api/products/${initialData.id}`
          : "/api/products"

        const method = mode === "edit" ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (result.success) {
          router.push("/products")
          router.refresh()
        } else {
          alert(`提交失败: ${result.error}`)
        }
      }
    } catch (error) {
      console.error("提交失败:", error)
      alert("提交失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* 基础信息 */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">基础信息</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <FormControl>
                          <Input placeholder="例如: PROD-001" {...field} />
                        </FormControl>
                        <FormDescription>
                          商品的唯一标识符
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>商品名称 *</FormLabel>
                        <FormControl>
                          <Input placeholder="例如: iPhone 15 Pro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>商品描述</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="请输入商品描述..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>分类</FormLabel>
                        <FormControl>
                          <Input placeholder="例如: 电子产品" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>图片URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="md:col-span-2" />

              {/* 规格信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">规格信息</h3>

                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>重量 (克)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="例如: 200"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>长度 (厘米)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="例如: 15"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>宽度 (厘米)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="例如: 8"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>高度 (厘米)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="例如: 1"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 价格信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">价格信息</h3>

                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>成本价 (元)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="例如: 699.99"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>售价 (元) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="例如: 999.99"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-3">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              取消
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/products")}
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              取消
            </Button>
          )}

          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading
              ? "提交中..."
              : mode === "edit"
              ? "更新商品"
              : "创建商品"}
          </Button>
        </div>
      </form>
    </Form>
  )
}