import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiResponse, PaginatedResponse, CreateOrderInput } from '@/types'

// 生成订单号
function generateOrderNo(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD-${year}${month}${day}-${random}`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * pageSize

    const where: any = {
      ...(status && { status }),
      ...(platform && { platform }),
      ...(startDate && { createdAt: { gte: new Date(startDate) } }),
      ...(endDate && { createdAt: { lte: new Date(endDate) } }),
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, sku: true, name: true }
              }
            }
          }
        }
      }),
      db.order.count({ where })
    ])

    const response = {
      data: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }

    return NextResponse.json<ApiResponse<typeof response>>({
      success: true,
      data: response
    })
  } catch (error) {
    console.error('获取订单列表失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '获取订单列表失败'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderInput = await request.json()

    // 验证必填字段
    if (!body.orderNo || !body.platform || !body.items || body.items.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '订单号、平台和订单项不能为空'
      }, { status: 400 })
    }

    // 检查订单号是否已存在
    const existingOrder = await db.order.findUnique({
      where: { orderNo: body.orderNo }
    })

    if (existingOrder) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `订单号 "${body.orderNo}" 已存在`
      }, { status: 400 })
    }

    // 验证所有商品是否存在并检查库存
    const productIds = body.items.map(item => item.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: { inventory: true }
    })

    if (products.length !== body.items.length) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '部分商品不存在'
      }, { status: 400 })
    }

    // 检查库存是否充足
    for (const item of body.items) {
      const product = products.find(p => p.id === item.productId)
      if (!product?.inventory) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: `商品 ${product?.sku || item.productId} 没有库存记录`
        }, { status: 400 })
      }
      const availableQty = product.inventory.quantity - product.inventory.reserved
      if (availableQty < item.quantity) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: `商品 ${product.sku} 库存不足（可用: ${availableQty}, 需要: ${item.quantity}）`
        }, { status: 400 })
      }
    }

    // 计算订单总金额
    const totalAmount = body.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)

    // 使用事务创建订单
    const order = await db.$transaction(async (tx) => {
      // 1. 创建订单
      const newOrder = await tx.order.create({
        data: {
          orderNo: body.orderNo,
          platform: body.platform,
          status: 'PENDING',
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          shippingAddress: body.shippingAddress,
          totalAmount,
          notes: body.notes
        }
      })

      // 2. 创建订单项并预留库存
      for (const item of body.items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }
        })

        // 预留库存
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            reserved: { increment: item.quantity }
          }
        })
      }

      // 3. 返回完整订单信息
      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, sku: true, name: true }
              }
            }
          }
        }
      })
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: order,
      message: '订单创建成功'
    }, { status: 201 })
  } catch (error) {
    console.error('创建订单失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '创建订单失败'
    }, { status: 500 })
  }
}
