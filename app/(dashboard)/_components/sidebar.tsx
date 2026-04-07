"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Package,
  Warehouse,
  ShoppingCart,
  BarChart3,
  Printer,
  Settings,
  Home
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "仪表板",
    href: "/",
    icon: Home,
  },
  {
    title: "商品管理",
    href: "/products",
    icon: Package,
  },
  {
    title: "库存管理",
    href: "/inventory",
    icon: Warehouse,
  },
  {
    title: "订单管理",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "打印中心",
    href: "/print",
    icon: Printer,
  },
  {
    title: "数据看板",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "系统设置",
    href: "/settings",
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 border-r bg-card lg:block">
      <div className="flex h-full flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">跨境电商WMS</h1>
          <p className="text-sm text-muted-foreground">仓库管理系统</p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium">用户</span>
            </div>
            <div>
              <p className="text-sm font-medium">单用户模式</p>
              <p className="text-xs text-muted-foreground">管理员</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}