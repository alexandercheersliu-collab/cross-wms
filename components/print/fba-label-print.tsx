"use client"

import { forwardRef } from "react"
// FBA Label Print Component

interface FBALabelPrintProps {
  sku: string
  fnsku?: string
  name: string
  condition: string
  quantity: number
  madeIn?: string
}

export const FBALabelPrint = forwardRef<HTMLDivElement, { items: FBALabelPrintProps[] }>(
  ({ items }, ref) => {
    return (
      <div ref={ref} className="p-4 bg-white">
        <div className="grid grid-cols-2 gap-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="border-2 border-black p-4"
              style={{ width: '100mm', height: '60mm' }}
            >
              {/* FNSKU (模拟条码) */}
              <div className="text-center mb-2">
                <div className="font-mono text-2xl font-bold tracking-wider">
                  {item.fnsku || item.sku}
                </div>
                <div className="h-8 bg-gray-200 mt-1 flex items-center justify-center text-xs text-gray-500">
                  [条码区域]
                </div>
              </div>

              {/* 商品名称 */}
              <div className="text-xs font-medium mb-2 truncate">
                {item.name}
              </div>

              {/* 信息网格 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-mono ml-1">{item.sku}</span>
                </div>
                <div>
                  <span className="text-gray-600">Condition:</span>
                  <span className="ml-1">{item.condition}</span>
                </div>
                <div>
                  <span className="text-gray-600">Qty:</span>
                  <span className="font-bold ml-1">{item.quantity}</span>
                </div>
                <div>
                  <span className="text-gray-600">Made in:</span>
                  <span className="ml-1">{item.madeIn || 'China'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
)

FBALabelPrint.displayName = "FBALabelPrint"
