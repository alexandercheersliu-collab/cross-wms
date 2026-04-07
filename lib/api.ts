// 通用 API 请求工具，自动处理 401 未登录
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init)

  // 如果返回 401，重定向到登录页
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    throw new Error("未登录")
  }

  return response
}
