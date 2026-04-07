import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const productId = searchParams.get('productId')
    const transactionType = searchParams.get('transactionType')
    const referenceType = searchParams.get('referenceType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * pageSize

    const where: any = {
      ...(productId && { productId }),
      ...(transactionType && { transactionType }),
      ...(referenceType && { referenceType }),
      ...(startDate && { createdAt: { gte: new Date(startDate) } }),
      ...(endDate && { createdAt: { lte: new Date(endDate) } }),
    }

    const [transactions, total] = await Promise.all([
      db.inventoryTransaction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
            },
          },
        },
      }),
      db.inventoryTransaction.count({ where }),
    ])

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        data: transactions,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('获取库存变动记录失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '获取库存变动记录失败',
    }, { status: 500 })
  }
}
