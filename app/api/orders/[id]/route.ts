import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiResponse, UpdateOrderInput } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, sku: true, name: true, imageUrl: true }
            }
          }
        },
        shipments: {
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, sku: true, name: true }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '订单不存在'
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('获取订单详情失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '获取订单详情失败'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateOrderInput = await request.json()

    // 检查订单是否存在
    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!existingOrder) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '订单不存在'
      }, { status: 404 })
    }

    // 如果状态变为 CANCELLED，需要释放库存预留
    if (body.status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      await db.$transaction(async (tx) => {
        // 更新订单状态
        await tx.order.update({
          where: { id },
          data: { status: 'CANCELLED' }
        })

        // 释放库存预留
        for (const item of existingOrder.items) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: {
              reserved: { decrement: item.quantity }
            }
          })

          // 记录库存变动
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              quantityChange: 0,
              transactionType: 'ADJUSTMENT',
              referenceId: id,
              referenceType: 'ORDER',
              notes: `订单取消，释放预留: ${item.quantity}`
            }
          })
        }
      })

      return NextResponse.json<ApiResponse>({
        success: true,
        message: '订单已取消，库存预留已释放'
      })
    }

    // 更新订单基本信息
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        ...(body.customerName !== undefined && { customerName: body.customerName }),
        ...(body.customerEmail !== undefined && { customerEmail: body.customerEmail }),
        ...(body.shippingAddress !== undefined && { shippingAddress: body.shippingAddress }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.status && { status: body.status })
      },
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

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedOrder,
      message: '订单更新成功'
    })
  } catch (error) {
    console.error('更新订单失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '更新订单失败'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 检查订单是否存在
    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!existingOrder) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '订单不存在'
      }, { status: 404 })
    }

    // 如果订单不是取消状态，需要先释放库存预留
    await db.$transaction(async (tx) => {
      if (existingOrder.status !== 'CANCELLED') {
        for (const item of existingOrder.items) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: {
              reserved: { decrement: item.quantity }
            }
          })
        }
      }

      // 删除订单（级联删除订单项）
      await tx.order.delete({
        where: { id }
      })
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: '订单删除成功'
    })
  } catch (error) {
    console.error('删除订单失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '删除订单失败'
    }, { status: 500 })
  }
}
