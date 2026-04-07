import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const authSession = request.cookies.get("auth_session")
  const { pathname } = request.nextUrl

  // 公开路由
  const publicRoutes = ["/login", "/api/auth/login", "/api/auth/logout"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // API 路由（除了认证相关的）
  const isApiRoute = pathname.startsWith("/api")

  // 如果没有登录且不是公开路由
  if (!authSession && !isPublicRoute) {
    // API 路由返回 401 而不是重定向
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      )
    }
    // 页面路由重定向到登录页
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 如果已登录且访问登录页，重定向到首页
  if (authSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
}
