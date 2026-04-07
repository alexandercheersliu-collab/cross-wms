import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiResponse } from '@/types'

// 生成盘点单号
function generateStocktakeNo(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `STK-${year}${month}${day}-${random}`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * pageSize

    const where: any = {
      ...(status && { status }),
      ...(startDate && { createdAt: { gte: new Date(startDate) } }),
      ...(endDate && { createdAt: { lte: new Date(endDate) } }),
    }

    const [stocktakes, total] = await Promise.all([
      db.stocktake.findMany({
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
        },
      }),
      db.stocktake.count({ where }),
    ])

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        data: stocktakes,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('获取盘点单列表失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '获取盘点单列表失败',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notes, items }: {
      notes?: string
      items: Array<{ productId: string; countedQuantity: number }>
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '盘点项不能为空',
      }, { status: 400 })
    }

    // 验证所有商品是否存在并获取当前库存
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

    // 使用事务处理盘点操作
    const result = await db.$transaction(async (tx) => {
      // 1. 创建盘点单
      const stocktake = await tx.stocktake.create({
        data: {
          stocktakeNo: generateStocktakeNo(),
          status: 'IN_PROGRESS',
          notes,
        },
      })

      // 2. 创建盘点项
      for (const item of items) {
        const product = products.find(p => p.id === item.productId)
        const systemQuantity = product?.inventory?.quantity || 0
        const variance = item.countedQuantity - systemQuantity

        await tx.stocktakeItem.create({
          data: {
            stocktakeId: stocktake.id,
            productId: item.productId,
            countedQuantity: item.countedQuantity,
            systemQuantity,
            variance,
          },
        })

        // 3. 如果有差异，更新库存
        if (variance !== 0) {
          if (product?.inventory) {
            await tx.inventory.update({
              where: { productId: item.productId },
              data: {
                quantity: item.countedQuantity,
                updatedAt: new Date(),
              },
            })
          } else {
            // 创建新的库存记录
            await tx.inventory.create({
              data: {
                productId: item.productId,
                quantity: item.countedQuantity,
                reserved: 0,
              },
            })
          }

          // 4. 记录库存变动
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              quantityChange: variance,
              transactionType: 'STOCKTAKE',
              referenceId: stocktake.id,
              referenceType: 'STOCKTAKE',
              notes: `盘点单: ${stocktake.stocktakeNo}, 系统数量: ${systemQuantity}, 盘点数量: ${item.countedQuantity}`,
            },
          })
        }
      }

      // 5. 完成盘点单
      const updatedStocktake = await tx.stocktake.update({
        where: { id: stocktake.id },
        data: {
          status: 'COMPLETED',
          countedAt: new Date(),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      return updatedStocktake
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: '盘点完成',
    }, { status: 201 })
  } catch (error) {
    console.error('盘点操作失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '盘点操作失败',
    }, { status: 500 })
  }
}
