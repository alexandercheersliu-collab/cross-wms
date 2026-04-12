// Server Component
export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

import ProductDetailPageClient from "./client"

export default function Page() {
  return <ProductDetailPageClient />
}
