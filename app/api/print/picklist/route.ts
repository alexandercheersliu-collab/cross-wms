import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '订单ID不能为空'
      }, { status: 400 })
    }

    // 获取订单信息 - 先尝试按ID查询，再尝试按订单号查询
    let order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                sku: true,
                name: true,
                imageUrl: true
              }
            }
          }
        }
      }
    })

    // 如果没找到，尝试按订单号查询
    if (!order) {
      order = await db.order.findFirst({
        where: { orderNo: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  sku: true,
                  name: true,
                  imageUrl: true
                }
              }
            }
          }
        }
      })
    }

    if (!order) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '订单不存在'
      }, { status: 404 })
    }

    // 获取库存库位信息
    const productIds = order.items.map(item => item.productId)
    const inventories = await db.inventory.findMany({
      where: { productId: { in: productIds } },
      select: { productId: true, location: true }
    })

    const locationMap = new Map(inventories.map(inv => [inv.productId, inv.location]))

    const picklistData = {
      orderId: order.id,
      orderNo: order.orderNo,
      items: order.items.map(item => ({
        productId: item.productId,
        sku: item.product.sku,
        name: item.product.name,
        quantity: item.quantity,
        location: locationMap.get(item.productId) || undefined
      })),
      totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
      printedAt: new Date(),
      notes: order.notes
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: picklistData
    })
  } catch (error) {
    console.error('获取拣货单数据失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '获取拣货单数据失败'
    }, { status: 500 })
  }
}
