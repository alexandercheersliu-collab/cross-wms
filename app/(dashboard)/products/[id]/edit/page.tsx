export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

import EditProductPageClient from "./client"

export default function Page() {
  return <EditProductPageClient />
}
