import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("auth_session")

    return NextResponse.json({
      success: true,
      message: "登出成功",
    })
  } catch (error) {
    console.error("登出失败:", error)
    return NextResponse.json({
      success: false,
      error: "登出失败",
    }, { status: 500 })
  }
}
