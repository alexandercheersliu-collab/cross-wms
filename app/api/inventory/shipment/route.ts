import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiResponse } from '@/types'

// 生成出库单号
function generateShipmentNo(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `SHP-${year}${month}${day}-${random}`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status')
    const orderId = searchParams.get('orderId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * pageSize

    const where: any = {
      ...(status && { status }),
      ...(orderId && { orderId }),
      ...(startDate && { createdAt: { gte: new Date(startDate) } }),
      ...(endDate && { createdAt: { lte: new Date(endDate) } }),
    }

    const [shipments, total] = await Promise.all([
      db.shipment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          order: true,
        },
      }),
      db.shipment.count({ where }),
    ])

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        data: shipments,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('获取出库单列表失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '获取出库单列表失败',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, trackingNumber, notes, items }: {
      orderId?: string
      trackingNumber?: string
      notes?: string
      items: Array<{ productId: string; quantity: number }>
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '出库项不能为空',
      }, { status: 400 })
    }

    // 验证所有商品是否存在并检查库存
    const productIds = items.map(item => item.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: { inventory: true },
    })

    if (products.length !== items.length) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '部分商品不存在',
      }, { status: 400 })
    }

    // 检查库存是否充足
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product?.inventory) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: `商品 ${product?.sku || item.productId} 没有库存记录`,
        }, { status: 400 })
      }
      // 实际库存必须大于等于出库数量（预留是逻辑锁定，实际库存仍存在）
      if (product.inventory.quantity < item.quantity) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: `商品 ${product.sku} 库存不足（实际库存: ${product.inventory.quantity}, 需要: ${item.quantity}）`,
        }, { status: 400 })
      }
    }

    // 使用事务处理出库操作
    const result = await db.$transaction(async (tx) => {
      // 1. 创建出库单
      const shipment = await tx.shipment.create({
        data: {
          shipmentNo: generateShipmentNo(),
          orderId,
          trackingNumber,
          status: 'PENDING',
          notes,
        },
      })

      // 2. 创建出库项并更新库存
      for (const item of items) {
        // 创建出库项
        await tx.shipmentItem.create({
          data: {
            shipmentId: shipment.id,
            productId: item.productId,
            quantity: item.quantity,
          },
        })

        // 更新库存：扣减实际数量，同时释放预留（但不小于0）
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId },
        })
        const newReserved = Math.max(0, (inventory?.reserved || 0) - item.quantity)
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: { decrement: item.quantity },
            reserved: newReserved,
            updatedAt: new Date(),
          },
        })

        // 3. 记录库存变动
        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            quantityChange: -item.quantity,
            transactionType: 'OUTBOUND',
            referenceId: shipment.id,
            referenceType: 'SHIPMENT',
            notes: `出库单: ${shipment.shipmentNo}`,
          },
        })
      }

      // 4. 更新出库单状态为已发货
      const updatedShipment = await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: 'SHIPPED',
          shippedAt: new Date(),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      // 5. 如果有关联订单，更新订单状态
      if (orderId) {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'SHIPPED',
            shippedAt: new Date(),
          },
        })
      }

      return updatedShipment
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: '出库成功',
    }, { status: 201 })
  } catch (error) {
    console.error('出库操作失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '出库操作失败',
    }, { status: 500 })
  }
}
