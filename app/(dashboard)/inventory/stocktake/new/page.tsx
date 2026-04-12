"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, ClipboardList, Loader2 } from "lucide-react"
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
  inventory?: { quantity: number }
}

interface StocktakeItem {
  productId: string
  countedQuantity: number
}

export default function NewStocktakePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [items, setItems] = useState<StocktakeItem[]>([{ productId: "", countedQuantity: 0 }])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await apiFetch('/api/products?pageSize=1000')
        const result: any = await response.json()
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

  const handleAddItem = () => setItems([...items, { productId: "", countedQuantity: 0 }])
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const handleItemChange = (index: number, field: keyof StocktakeItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validItems = items.filter(item => item.productId && item.countedQuantity >= 0)
    if (validItems.length === 0) {
      alert('请至少添加一个有效的盘点项')
      return
    }

    try {
      setSubmitting(true)
      const response = await apiFetch('/api/inventory/stocktake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, items: validItems }),
      })
      const result: any = await response.json()
      if (result.success) {
        router.push('/inventory/stocktake')
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
        <Link href="/inventory/stocktake">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />返回盘点列表</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新建盘点单</h1>
          <p className="text-muted-foreground">盘点库存数量，记录实际库存与系统库存的差异</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>盘点信息</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="请输入盘点备注..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" />盘点商品</CardTitle>
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
                      <TableHead>系统库存</TableHead>
                      <TableHead>盘点数量</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const product = getProductById(item.productId)
                      const systemQty = product?.inventory?.quantity || 0
                      const variance = item.countedQuantity - systemQty
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
                          <TableCell><span className="text-sm text-muted-foreground">{systemQty}</span></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input type="number" min={0} value={item.countedQuantity} onChange={(e) => handleItemChange(index, 'countedQuantity', parseInt(e.target.value) || 0)} className="w-24" />
                              {item.productId && (
                                <span className={`text-sm ${variance > 0 ? 'text-green-600' : variance < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                  {variance > 0 ? `+${variance}` : variance}
                                </span>
                              )}
                            </div>
                          </TableCell>
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
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/inventory/stocktake"><Button type="button" variant="outline" disabled={submitting}>取消</Button></Link>
          <Button type="submit" disabled={submitting || loading}>{submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />提交中...</> : '确认盘点'}</Button>
        </div>
      </form>
    </div>
  )
}
