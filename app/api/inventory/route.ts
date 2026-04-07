import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiResponse, PaginatedResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const sku = searchParams.get('sku')
    const name = searchParams.get('name')
    const category = searchParams.get('category')
    const minQuantity = searchParams.get('minQuantity')
    const maxQuantity = searchParams.get('maxQuantity')
    const lowStock = searchParams.get('lowStock') === 'true'
    const sortBy = searchParams.get('sortBy') || 'product.name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const skip = (page - 1) * pageSize

    // 构建查询条件
    const where: any = {
      product: {
        ...(sku && { sku: { contains: sku, mode: 'insensitive' as const } }),
        ...(name && { name: { contains: name, mode: 'insensitive' as const } }),
        ...(category && { category: { contains: category, mode: 'insensitive' as const } }),
      },
      ...(minQuantity !== null && { quantity: { gte: parseInt(minQuantity) } }),
      ...(maxQuantity !== null && { quantity: { lte: parseInt(maxQuantity) } }),
      ...(lowStock && { quantity: { lte: 10 } }), // 低库存定义为少于等于10
    }

    // 构建排序
    let orderBy: any = {}
    if (sortBy === 'product.name') {
      orderBy = { product: { name: sortOrder } }
    } else if (sortBy === 'quantity') {
      orderBy = { quantity: sortOrder }
    } else if (sortBy === 'product.sku') {
      orderBy = { product: { sku: sortOrder } }
    } else {
      orderBy = { updatedAt: 'desc' }
    }

    const [inventoryItems, total] = await Promise.all([
      db.inventory.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          product: true,
        },
      }),
      db.inventory.count({ where }),
    ])

    // 计算可用库存和低库存状态
    const enhancedItems = inventoryItems.map(item => ({
      ...item,
      availableQuantity: item.quantity - item.reserved,
      isLowStock: item.quantity <= 10,
    }))

    const response: PaginatedResponse<any> = {
      data: enhancedItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }

    return NextResponse.json<ApiResponse<PaginatedResponse<any>>>({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error('获取库存列表失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '获取库存列表失败',
    }, { status: 500 })
  }
}