import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UpdateProductInput, ApiResponse } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({
      where: { id },
      include: {
        inventory: true,
      },
    })

    if (!product) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '商品不存在',
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('获取商品详情失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '获取商品详情失败',
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateProductInput = await request.json()

    // 检查商品是否存在
    const existingProduct = await db.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '商品不存在',
      }, { status: 404 })
    }

    // 如果更新SKU，检查新SKU是否已存在
    if (body.sku && body.sku !== existingProduct.sku) {
      const skuExists = await db.product.findUnique({
        where: { sku: body.sku },
      })

      if (skuExists) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: `SKU "${body.sku}" 已存在`,
        }, { status: 400 })
      }
    }

    const updatedProduct = await db.product.update({
      where: { id },
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

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedProduct,
      message: '商品更新成功',
    })
  } catch (error) {
    console.error('更新商品失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '更新商品失败',
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 检查商品是否存在
    const existingProduct = await db.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '商品不存在',
      }, { status: 404 })
    }

    // 检查商品是否有关联订单
    const orderItems = await db.orderItem.findMany({
      where: { productId: id },
      take: 1,
    })

    if (orderItems.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '该商品有关联订单，无法删除',
      }, { status: 400 })
    }

    // 使用事务删除商品及其关联数据
    await db.$transaction([
      // 删除库存记录
      db.inventory.deleteMany({
        where: { productId: id },
      }),
      // 删除库存事务记录
      db.inventoryTransaction.deleteMany({
        where: { productId: id },
      }),
      // 删除商品
      db.product.delete({
        where: { id },
      }),
    ])

    return NextResponse.json<ApiResponse>({
      success: true,
      message: '商品删除成功',
    })
  } catch (error) {
    console.error('删除商品失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '删除商品失败',
    }, { status: 500 })
  }
}