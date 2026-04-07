import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiResponse, ReceivingItem } from '@/types'

// 生成入库单号
function generateReceivingNo(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `RCV-${year}${month}${day}-${random}`
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

    const [receivings, total] = await Promise.all([
      db.receiving.findMany({
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
      db.receiving.count({ where }),
    ])

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        data: receivings,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('获取入库单列表失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '获取入库单列表失败',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notes, items }: { notes?: string; items: ReceivingItem[] } = body

    if (!items || items.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '入库项不能为空',
      }, { status: 400 })
    }

    // 验证所有商品是否存在，并获取商品信息（包括成本价）
    const productIds = items.map(item => item.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, sku: true, costPrice: true },
    })

    if (products.length !== items.length) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '部分商品不存在',
      }, { status: 400 })
    }

    // 使用事务处理入库操作
    const result = await db.$transaction(async (tx) => {
      // 1. 创建入库单
      const receiving = await tx.receiving.create({
        data: {
          receivingNo: generateReceivingNo(),
          status: 'PENDING',
          notes,
        },
      })

      // 2. 创建入库项并更新库存
      for (const item of items) {
        const product = products.find(p => p.id === item.productId)

        // 如果没有填写成本价，使用商品的默认成本价
        const unitCost = item.unitCost !== undefined
          ? item.unitCost
          : product?.costPrice
            ? Number(product.costPrice)
            : null

        // 创建入库项
        const receivingItemData: any = {
          receivingId: receiving.id,
          productId: item.productId,
          quantity: item.quantity,
        }
        if (unitCost !== null) {
          receivingItemData.unitCost = unitCost
        }

        await tx.receivingItem.create({
          data: receivingItemData,
        })

        // 查找或创建库存记录
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId },
        })

        if (inventory) {
          // 更新现有库存
          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              quantity: { increment: item.quantity },
              updatedAt: new Date(),
            },
          })
        } else {
          // 创建新的库存记录
          await tx.inventory.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              reserved: 0,
            },
          })
        }

        // 3. 记录库存变动
        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            quantityChange: item.quantity,
            transactionType: 'INBOUND',
            referenceId: receiving.id,
            referenceType: 'RECEIVING',
            notes: `入库单: ${receiving.receivingNo}`,
          },
        })
      }

      // 4. 更新入库单状态为已接收
      const updatedReceiving = await tx.receiving.update({
        where: { id: receiving.id },
        data: {
          status: 'RECEIVED',
          receivedAt: new Date(),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      return updatedReceiving
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: '入库成功',
    }, { status: 201 })
  } catch (error) {
    console.error('入库操作失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '入库操作失败',
    }, { status: 500 })
  }
}