/**
 * EdgeOne Pages Functions - API 路由入口
 * 使用标准 Web API 格式
 */

export interface Env {
  DATABASE_URL: string;
}

// 默认导出 - EdgeOne 可能期望这种格式
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/', '').split('/');

    // 设置 CORS 头
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // 处理预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {
      const route = path[0] || "";

      switch (route) {
        case "products":
          return await handleProducts(request, env, path.slice(1));
        case "orders":
          return await handleOrders(request, env, path.slice(1));
        case "inventory":
          return await handleInventory(request, env, path.slice(1));
        case "auth":
          return await handleAuth(request, env, path.slice(1));
        case "dashboard":
          return await handleDashboard(request, env);
        default:
          return jsonResponse({ success: false, error: "未找到路由" }, 404);
      }
    } catch (error) {
      console.error("API 错误:", error);
      return jsonResponse({
        success: false,
        error: "服务器内部错误"
      }, 500);
    }
  }
};

// 辅助函数：JSON 响应
function jsonResponse(data: any, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...headers,
    },
  });
}

// 商品处理器
async function handleProducts(
  request: Request,
  env: Env,
  path: string[]
): Promise<Response> {
  const id = path[0];

  switch (request.method) {
    case "GET":
      if (id) {
        return jsonResponse({ success: true, data: { id, name: "测试商品" } });
      }
      return jsonResponse({
        success: true,
        data: {
          data: [],
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0
        }
      });

    case "POST":
      return jsonResponse({ success: true, message: "商品创建成功" }, 201);

    case "PUT":
      if (id) {
        return jsonResponse({ success: true, message: "商品更新成功" });
      }
      break;

    case "DELETE":
      if (id) {
        return jsonResponse({ success: true, message: "商品删除成功" });
      }
      break;
  }

  return jsonResponse({ success: false, error: "方法不允许" }, 405);
}

// 订单处理器
async function handleOrders(
  request: Request,
  env: Env,
  path: string[]
): Promise<Response> {
  const id = path[0];

  switch (request.method) {
    case "GET":
      if (id) {
        return jsonResponse({ success: true, data: { id, orderNo: "ORD-001" } });
      }
      return jsonResponse({
        success: true,
        data: {
          data: [],
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0
        }
      });

    case "POST":
      return jsonResponse({ success: true, message: "订单创建成功" }, 201);

    case "PUT":
      if (id) {
        return jsonResponse({ success: true, message: "订单更新成功" });
      }
      break;
  }

  return jsonResponse({ success: false, error: "方法不允许" }, 405);
}

// 库存处理器
async function handleInventory(
  request: Request,
  env: Env,
  path: string[]
): Promise<Response> {
  const subRoute = path[0];

  if (request.method === "GET") {
    return jsonResponse({
      success: true,
      data: {
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      }
    });
  }

  if (request.method === "POST") {
    switch (subRoute) {
      case "stocktake":
        return jsonResponse({ success: true, message: "盘点记录创建成功" });
      case "shipment":
        return jsonResponse({ success: true, message: "出库单创建成功" });
      case "receiving":
        return jsonResponse({ success: true, message: "入库单创建成功" });
      default:
        return jsonResponse({ success: true, message: "操作成功" });
    }
  }

  return jsonResponse({ success: false, error: "方法不允许" }, 405);
}

// 认证处理器
async function handleAuth(
  request: Request,
  env: Env,
  path: string[]
): Promise<Response> {
  const action = path[0];

  if (request.method === "POST") {
    switch (action) {
      case "login":
        return jsonResponse({
          success: true,
          data: {
            token: "mock-token",
            user: {
              id: "1",
              username: "admin",
              name: "管理员",
            },
          },
        });
      case "logout":
        return jsonResponse({ success: true, message: "登出成功" });
    }
  }

  return jsonResponse({ success: false, error: "未找到路由" }, 404);
}

// 仪表盘处理器
async function handleDashboard(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonResponse({ success: false, error: "方法不允许" }, 405);
  }

  return jsonResponse({
    success: true,
    data: {
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
    },
  });
}
