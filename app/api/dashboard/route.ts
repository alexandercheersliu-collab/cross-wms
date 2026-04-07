import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // 获取库存统计
    const [totalProducts, lowStockCount, outOfStockCount, totalInventoryValue] = await Promise.all([
      // 总商品数
      db.product.count(),

      // 低库存商品数（<=10）
      db.inventory.count({
        where: { quantity: { lte: 10, gt: 0 } }
      }),

      // 缺货商品数
      db.inventory.count({
        where: { quantity: 0 }
      }),

      // 库存总价值（使用成本价计算）
      db.$queryRaw`
        SELECT COALESCE(SUM(i.quantity * p."costPrice"), 0) as value
        FROM "Inventory" i
        JOIN "Product" p ON i."productId" = p.id
      `
    ])

    // 获取订单统计
    const [totalOrders, pendingOrders, todayOrders, todayRevenue] = await Promise.all([
      // 总订单数
      db.order.count(),

      // 待处理订单数
      db.order.count({
        where: { status: 'PENDING' }
      }),

      // 今日订单数
      db.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),

      // 今日销售额
      db.$queryRaw`
        SELECT COALESCE(SUM("totalAmount"), 0) as revenue
        FROM "Order"
        WHERE "createdAt" >= ${new Date(new Date().setHours(0, 0, 0, 0))}
      `
    ])

    // 获取各状态订单数量
    const orderStatusCountsRaw = await db.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM "Order"
      GROUP BY status
    `
    // 转换 BigInt 为 Number
    const orderStatusCounts = (orderStatusCountsRaw as any[]).map(item => ({
      status: item.status,
      count: Number(item.count)
    }))

    // 获取最近7天销售趋势
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      return date
    }).reverse()

    const salesTrend = await Promise.all(
      last7Days.map(async (date) => {
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const result = await db.$queryRaw`
          SELECT
            COUNT(*) as orderCount,
            COALESCE(SUM("totalAmount"), 0) as revenue
          FROM "Order"
          WHERE "createdAt" >= ${date} AND "createdAt" < ${nextDate}
        `
        const row = (result as any)[0]
        return {
          date: date.toISOString().split('T')[0],
          orderCount: Number(row?.orderCount || 0),
          revenue: Number(row?.revenue || 0)
        }
      })
    )

    // 获取低库存商品列表
    const lowStockProducts = await db.inventory.findMany({
      where: { quantity: { lte: 10 } },
      orderBy: { quantity: 'asc' },
      take: 10,
      include: {
        product: {
          select: { sku: true, name: true }
        }
      }
    })

    // 获取最近订单
    const recentOrders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: {
          select: { quantity: true }
        }
      }
    })

    // 获取热销商品TOP5
    const topProductsRaw = await db.$queryRaw`
      SELECT
        p.id,
        p.sku,
        p.name,
        SUM(oi.quantity) as totalSold
      FROM "OrderItem" oi
      JOIN "Product" p ON oi."productId" = p.id
      GROUP BY p.id, p.sku, p.name
      ORDER BY totalSold DESC
      LIMIT 5
    `
    // 转换 BigInt 为 Number
    const topProducts = (topProductsRaw as any[]).map(item => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      totalSold: Number(item.totalSold)
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        inventory: {
          totalProducts,
          lowStockCount,
          outOfStockCount,
          totalValue: Number((totalInventoryValue as any)[0]?.value || 0)
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          today: todayOrders,
          todayRevenue: Number((todayRevenue as any)[0]?.revenue || 0)
        },
        orderStatusCounts,
        salesTrend,
        lowStockProducts,
        recentOrders,
        topProducts
      }
    })
  } catch (error) {
    console.error('获取看板数据失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '获取看板数据失败'
    }, { status: 500 })
  }
}
