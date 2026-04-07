"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Bell,
  HelpCircle,
  LogOut,
  User,
  ShoppingCart,
  Package,
  Warehouse,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SearchResult {
  type: "order" | "product" | "inventory"
  id: string
  title: string
  subtitle?: string
  url: string
}

export default function Header() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 防抖搜索
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results: SearchResult[] = []

      // 并行搜索订单和商品
      const [ordersRes, productsRes] = await Promise.all([
        fetch(`/api/orders?search=${encodeURIComponent(query)}&pageSize=5`).catch(() => null),
        fetch(`/api/products?search=${encodeURIComponent(query)}&pageSize=5`).catch(() => null),
      ])

      // 处理订单结果
      if (ordersRes?.ok) {
        const ordersData = await ordersRes.json()
        if (ordersData.success && ordersData.data.data.length > 0) {
          results.push(
            ...ordersData.data.data.map((order: any) => ({
              type: "order" as const,
              id: order.id,
              title: order.orderNo,
              subtitle: `${order.platform} · ${order.customerName || "匿名客户"} · ¥${order.totalAmount}`,
              url: `/orders/${order.id}`,
            }))
          )
        }
      }

      // 处理商品结果
      if (productsRes?.ok) {
        const productsData = await productsRes.json()
        if (productsData.success && productsData.data.data.length > 0) {
          results.push(
            ...productsData.data.data.map((product: any) => ({
              type: "product" as const,
              id: product.id,
              title: product.sku,
              subtitle: `${product.name} · ¥${product.salePrice}`,
              url: `/products/${product.id}`,
            }))
          )
        }
      }

      setSearchResults(results.slice(0, 10))
    } catch (error) {
      console.error("搜索失败:", error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleResultClick(searchResults[selectedIndex])
        } else if (searchResults.length > 0) {
          handleResultClick(searchResults[0])
        }
        break
      case "Escape":
        setShowResults(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    setSearchQuery("")
    setShowResults(false)
    setSearchResults([])
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4" />
      case "product":
        return <Package className="h-4 w-4" />
      case "inventory":
        return <Warehouse className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case "order":
        return "订单"
      case "product":
        return "商品"
      case "inventory":
        return "库存"
      default:
        return ""
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("登出失败:", error)
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur dark:bg-gray-950/95">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex flex-1 items-center gap-4">
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="搜索订单号、SKU或商品名称..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowResults(true)
                setSelectedIndex(-1)
              }}
              onFocus={() => setShowResults(true)}
              onKeyDown={handleKeyDown}
            />

            {/* 搜索结果下拉框 */}
            {showResults && (searchQuery || isSearching) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-950 rounded-md border shadow-lg z-50 max-h-96 overflow-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">搜索中...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500">
                    {searchQuery ? "未找到相关结果" : "输入关键词开始搜索"}
                  </div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        className={`w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors ${
                          index === selectedIndex ? "bg-gray-100 dark:bg-gray-900" : ""
                        }`}
                        onClick={() => handleResultClick(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="mt-0.5 text-gray-500">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {result.title}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                              {getResultTypeLabel(result.type)}
                            </span>
                          </div>
                          {result.subtitle && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}

                {/* 查看更多提示 */}
                {!isSearching && searchResults.length > 0 && (
                  <div className="px-4 py-2 border-t text-xs text-gray-500 text-center">
                    按 Enter 跳转，ESC 关闭
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>

          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 gap-2 px-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">管理员</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}