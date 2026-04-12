export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

import OrderDetailPageClient from "./client"

export default function Page() {
  return <OrderDetailPageClient />
}
