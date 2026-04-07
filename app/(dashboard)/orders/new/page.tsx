"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, ShoppingCart, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: string
  sku: string
  name: string
  salePrice: number
  inventory?: { quantity: number; reserved: number }
}

interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [items, setItems] = useState<OrderItem[]>([{ productId: "", quantity: 1, unitPrice: 0 }])
  const [orderNo, setOrderNo] = useState("")
  const [platform, setPlatform] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await apiFetch('/api/products?pageSize=1000')
        const result = await response.json()
        if (result.success) {
          setProducts(result.data.data)
        }
      } catch (error) {
        console.error('获取商品失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1, unitPrice: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // 如果选择了商品，自动填充单价
    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index].unitPrice = Number(product.salePrice)
      }
    }

    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!orderNo || !platform) {
      alert('请填写订单号和平台')
      return
    }

    const validItems = items.filter(item => item.productId && item.quantity > 0)
    if (validItems.length === 0) {
      alert('请至少添加一个有效的订单项')
      return
    }

    try {
      setSubmitting(true)
      const response = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNo,
          platform,
          customerName,
          customerEmail,
          shippingAddress,
          notes,
          items: validItems
        }),
      })

      const result = await response.json()
      if (result.success) {
        router.push('/orders')
        router.refresh()
      } else {
        alert(`提交失败: ${result.error}`)
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const getProductById = (id: string) => products.find(p => p.id === id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />返回订单列表</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新建订单</h1>
          <p className="text-muted-foreground">创建新的销售订单</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>订单信息</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="orderNo">订单号 *</Label>
                <Input id="orderNo" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="例如: ORD-20240101-0001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">平台 *</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger><SelectValue placeholder="选择平台" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="ebay">eBay</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">客户姓名</Label>
                <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="客户姓名" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">客户邮箱</Label>
                <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="customer@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingAddress">收货地址</Label>
              <Textarea id="shippingAddress" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="请输入收货地址..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="订单备注..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />订单商品</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}><Plus className="mr-2 h-4 w-4" />添加商品</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">加载商品中...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品</TableHead>
                      <TableHead>可用库存</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>单价</TableHead>
                      <TableHead>小计</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const product = getProductById(item.productId)
                      const availableQty = product?.inventory ? product.inventory.quantity - product.inventory.reserved : 0
                      const subtotal = item.unitPrice * item.quantity
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Select value={item.productId} onValueChange={(value) => handleItemChange(index, 'productId', value)}>
                              <SelectTrigger className="w-64"><SelectValue placeholder="选择商品" /></SelectTrigger>
                              <SelectContent>
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>{p.sku} - {p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell><span className="text-sm text-muted-foreground">{availableQty}</span></TableCell>
                          <TableCell>
                            <Input type="number" min={1} value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)} className="w-20" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" step="0.01" min={0} value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-28" />
                          </TableCell>
                          <TableCell className="font-semibold">¥{subtotal.toFixed(2)}</TableCell>
                          <TableCell>
                            {items.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-4 text-right">
              <span className="text-lg font-bold">订单总额: ¥{calculateTotal().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/orders"><Button type="button" variant="outline" disabled={submitting}>取消</Button></Link>
          <Button type="submit" disabled={submitting || loading}>
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />提交中...</> : '创建订单'}
          </Button>
        </div>
      </form>
    </div>
  )
}
