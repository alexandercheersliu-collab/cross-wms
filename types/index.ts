// 商品相关类型
export interface Product {
  id: string
  sku: string
  name: string
  description?: string | null
  category?: string | null
  imageUrl?: string | null
  weight?: number | null
  length?: number | null
  width?: number | null
  height?: number | null
  costPrice?: number | null
  salePrice: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductInput {
  sku: string
  name: string
  description?: string
  category?: string
  imageUrl?: string
  weight?: number
  length?: number
  width?: number
  height?: number
  costPrice?: number
  salePrice: number
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

// 库存相关类型
export interface Inventory {
  id: string
  productId: string
  quantity: number
  reserved: number
  location?: string | null
  updatedAt: Date
  product?: Product
}

export interface InventoryTransaction {
  id: string
  productId: string
  quantityChange: number
  transactionType: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT' | 'STOCKTAKE'
  referenceId?: string | null
  referenceType?: 'ORDER' | 'RECEIVING' | 'SHIPMENT' | 'STOCKTAKE' | 'MANUAL' | null
  notes?: string | null
  createdAt: Date
}

export interface ReceivingItem {
  productId: string
  quantity: number
  unitCost?: number
}

export interface Receiving {
  id: string
  receivingNo: string
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED'
  receivedAt?: Date | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  items: ReceivingItem[]
}

export interface ShipmentItem {
  productId: string
  quantity: number
}

export interface Shipment {
  id: string
  shipmentNo: string
  orderId?: string | null
  status: 'PENDING' | 'PACKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  shippedAt?: Date | null
  trackingNumber?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  items: ShipmentItem[]
}

export interface StocktakeItem {
  productId: string
  countedQuantity: number
  systemQuantity: number
  variance: number
}

export interface Stocktake {
  id: string
  stocktakeNo: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  countedAt?: Date | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  items: StocktakeItem[]
}

// 订单相关类型
export interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  orderNo: string
  platform: string
  status: 'PENDING' | 'PROCESSING' | 'PICKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  customerName?: string | null
  customerEmail?: string | null
  shippingAddress?: string | null
  totalAmount: number
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  shippedAt?: Date | null
  items: OrderItem[]
}

export interface CreateOrderInput {
  orderNo: string
  platform: string
  customerName?: string
  customerEmail?: string
  shippingAddress?: string
  notes?: string
  items: OrderItem[]
}

export interface UpdateOrderInput {
  customerName?: string
  customerEmail?: string
  shippingAddress?: string
  notes?: string
  status?: 'PENDING' | 'PROCESSING' | 'PICKING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 查询参数类型
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ProductFilters extends PaginationParams {
  sku?: string
  name?: string
  category?: string
  minPrice?: number
  maxPrice?: number
}

export interface OrderFilters extends PaginationParams {
  status?: string
  platform?: string
  startDate?: Date
  endDate?: Date
}

// 打印相关类型
export interface PrintPicklistData {
  orderId: string
  orderNo: string
  items: Array<{
    productId: string
    sku: string
    name: string
    quantity: number
    location?: string
  }>
  totalItems: number
  picker?: string
  printedAt: Date
}

export interface PrintFBALabelData {
  productId: string
  sku: string
  fnsku?: string
  name: string
  quantity?: number
  condition?: string
  expirationDate?: Date
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}