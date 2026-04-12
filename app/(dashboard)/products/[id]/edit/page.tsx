import { EditProductPageClient } from "./client"

// 为静态导出生成空参数（实际数据在客户端获取）
export function generateStaticParams() {
  return []
}

export default function EditProductPage() {
  return <EditProductPageClient />
}
