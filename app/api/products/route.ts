import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { CreateProductInput, UpdateProductInput, ApiResponse, PaginatedResponse, ProductFilters } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const sku = searchParams.get('sku')
    const name = searchParams.get('name')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * pageSize

    const where: any = {
      ...(sku && { sku: { contains: sku, mode: 'insensitive' as const } }),
      ...(name && { name: { contains: name, mode: 'insensitive' as const } }),
      ...(category && { category: { contains: category, mode: 'insensitive' as const } }),
      ...(search && {
        OR: [
          { sku: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          inventory: true,
        },
      }),
      db.product.count({ where }),
    ])

    const response: PaginatedResponse<any> = {
      data: products,
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
    console.error('获取商品列表失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '获取商品列表失败',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProductInput = await request.json()

    // 检查SKU是否已存在
    const existingProduct = await db.product.findUnique({
      where: { sku: body.sku },
    })

    if (existingProduct) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `SKU "${body.sku}" 已存在`,
      }, { status: 400 })
    }

    const product = await db.product.create({
      data: {
        sku: body.sku,
        name: body.name,
        description: body.description,
        category: body.category,
        imageUrl: body.imageUrl,
        weight: body.weight,
        length: body.length,
        width: body.width,
        height: body.height,
        costPrice: body.costPrice,
        salePrice: body.salePrice,
      },
    })

    // 创建对应的库存记录
    await db.inventory.create({
      data: {
        productId: product.id,
        quantity: 0,
        reserved: 0,
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: product,
      message: '商品创建成功',
    }, { status: 201 })
  } catch (error) {
    console.error('创建商品失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '创建商品失败',
    }, { status: 500 })
  }
}