import { jsonResponse } from "../[[path]]";
import type { Env } from "../[[path]]";

/**
 * 仪表盘数据 API 处理器
 */

export async function handleDashboard(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonResponse({ success: false, error: "方法不允许" }, 405);
  }

  try {
    // TODO: 从数据库获取真实数据
    const mockData = {
      stats: {
        totalOrders: 156,
        pendingOrders: 23,
        todayOrders: 12,
        lowStockProducts: 5,
      },
      recentOrders: [],
      lowStockItems: [],
      platformStats: [
        { platform: "tmall", orderCount: 80, totalAmount: 25000 },
        { platform: "jd", orderCount: 45, totalAmount: 18000 },
        { platform: "douyin", orderCount: 31, totalAmount: 12000 },
      ],
    };

    return jsonResponse({
      success: true,
      data: mockData,
    });
  } catch (error) {
    return jsonResponse({ success: false, error: "获取仪表盘数据失败" }, 500);
  }
}
