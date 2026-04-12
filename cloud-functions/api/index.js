/**
 * EdgeOne Pages Cloud Functions - API 路由入口
 */

// Cloud Function 入口 - 使用 onRequest 格式
export default function onRequest(context) {
  const { request, env } = context;
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
        return handleProducts(request, env, path.slice(1));
      case "orders":
        return handleOrders(request, env, path.slice(1));
      case "inventory":
        return handleInventory(request, env, path.slice(1));
      case "auth":
        return handleAuth(request, env, path.slice(1));
      case "dashboard":
        return handleDashboard(request, env);
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

// 辅助函数：JSON 响应
function jsonResponse(data, status = 200, headers = {}) {
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
function handleProducts(request, env, path) {
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
      return jsonResponse({ success: false, error: "需要指定商品ID" }, 400);

    case "DELETE":
      if (id) {
        return jsonResponse({ success: true, message: "商品删除成功" });
      }
      return jsonResponse({ success: false, error: "需要指定商品ID" }, 400);

    default:
      return jsonResponse({ success: false, error: "方法不允许" }, 405);
  }
}

// 订单处理器
function handleOrders(request, env, path) {
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
      return jsonResponse({ success: false, error: "需要指定订单ID" }, 400);

    default:
      return jsonResponse({ success: false, error: "方法不允许" }, 405);
  }
}

// 库存处理器
function handleInventory(request, env, path) {
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
function handleAuth(request, env, path) {
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
function handleDashboard(request, env) {
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
