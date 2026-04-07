import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// 简单的单用户认证配置
const AUTH_CONFIG = {
  username: "admin",
  password: "admin123",
  sessionTimeout: 24 * 60 * 60 * 1000, // 24小时
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: "请输入用户名和密码",
      }, { status: 400 })
    }

    // 验证用户名密码
    if (username !== AUTH_CONFIG.username || password !== AUTH_CONFIG.password) {
      return NextResponse.json({
        success: false,
        error: "用户名或密码错误",
      }, { status: 401 })
    }

    // 设置登录 cookie
    const cookieStore = await cookies()
    cookieStore.set("auth_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24小时
      path: "/",
    })

    return NextResponse.json({
      success: true,
      message: "登录成功",
    })
  } catch (error) {
    console.error("登录失败:", error)
    return NextResponse.json({
      success: false,
      error: "登录失败",
    }, { status: 500 })
  }
}
