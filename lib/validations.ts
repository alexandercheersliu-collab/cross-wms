import { z } from "zod"

// 商品验证模式
export const productSchema = z.object({
  sku: z.string().min(1, "SKU不能为空").max(50, "SKU最多50个字符"),
  name: z.string().min(1, "商品名称不能为空").max(200, "商品名称最多200个字符"),
  description: z.string().max(1000, "描述最多1000个字符").optional(),
  category: z.string().max(100, "分类最多100个字符").optional(),
  imageUrl: z.string().url("请输入有效的URL").optional().or(z.literal("")),
  weight: z.number().min(0, "重量不能为负数").optional(),
  length: z.number().min(0, "长度不能为负数").optional(),
  width: z.number().min(0, "宽度不能为负数").optional(),
  height: z.number().min(0, "高度不能为负数").optional(),
  costPrice: z.number().min(0, "成本价不能为负数").optional(),
  salePrice: z.number().min(0, "售价不能为负数"),
})

export type ProductFormData = z.infer<typeof productSchema>

// 订单验证模式
export const orderSchema = z.object({
  orderNo: z.string().min(1, "订单号不能为空").max(50, "订单号最多50个字符"),
  platform: z.string().min(1, "平台不能为空").max(50, "平台最多50个字符"),
  customerName: z.string().max(100, "客户姓名最多100个字符").optional(),
  customerEmail: z.string().email("请输入有效的邮箱").optional().or(z.literal("")),
  shippingAddress: z.string().max(500, "收货地址最多500个字符").optional(),
  notes: z.string().max(1000, "备注最多1000个字符").optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, "请选择商品"),
      quantity: z.coerce.number().min(1, "数量必须大于0"),
      unitPrice: z.coerce.number().min(0, "单价不能为负数"),
    })
  ).min(1, "至少需要一个订单项"),
})

export type OrderFormData = z.infer<typeof orderSchema>

// 入库验证模式
export const receivingSchema = z.object({
  receivingNo: z.string().min(1, "入库单号不能为空").max(50, "入库单号最多50个字符"),
  notes: z.string().max(1000, "备注最多1000个字符").optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, "请选择商品"),
      quantity: z.coerce.number().min(1, "数量必须大于0"),
      unitCost: z.coerce.number().min(0, "成本价不能为负数").optional(),
    })
  ).min(1, "至少需要一个入库项"),
})

export type ReceivingFormData = z.infer<typeof receivingSchema>

// 出库验证模式
export const shipmentSchema = z.object({
  shipmentNo: z.string().min(1, "出库单号不能为空").max(50, "出库单号最多50个字符"),
  orderId: z.string().optional(),
  trackingNumber: z.string().max(100, "跟踪号最多100个字符").optional(),
  notes: z.string().max(1000, "备注最多1000个字符").optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, "请选择商品"),
      quantity: z.coerce.number().min(1, "数量必须大于0"),
    })
  ).min(1, "至少需要一个出库项"),
})

export type ShipmentFormData = z.infer<typeof shipmentSchema>