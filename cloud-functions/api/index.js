/**
 * EdgeOne Pages Cloud Functions - API 路由入口
 */

// Cloud Function 入口 - 使用 onRequest 格式
export default function onRequest(context) {
  const { request, env } = context;

  // 获取 URL 和路径
  const url = new URL(request.url);
  const pathParts = url.pathname.replace('/api/', '').split('/').filter(p => p);
  const route = pathParts[0] || "";

  console.log(`[API] ${request.method} ${url.pathname} - route: ${route}`);

  // 设置 CORS 头
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
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
    switch (route) {
      case "products":
        return handleProducts(request, env, pathParts.slice(1));
      case "orders":
        return handleOrders(request, env, pathParts.slice(1));
      case "inventory":
        return handleInventory(request, env, pathParts.slice(1));
      case "auth":
        return handleAuth(request, env, pathParts.slice(1));
      case "dashboard":
        return handleDashboard(request, env);
      case "":
        // API 根路径
        return jsonResponse({
          success: true,
          message: "WMS API Server",
          version: "1.0.0",
          routes: ["/api/products", "/api/orders", "/api/inventory", "/api/auth", "/api/dashboard"]
        });
      default:
        return jsonResponse({ success: false, error: `未找到路由: ${route}` }, 404);
    }
  } catch (error) {
    console.error("[API] 错误:", error);
    return jsonResponse({
      success: false,
      error: "服务器内部错误",
      message: error.message
    }, 500);
  }
}

// 辅助函数：JSON 响应
function jsonResponse(data, status = 200, extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    ...extraHeaders
  };

  return new Response(JSON.stringify(data), { status, headers });
}

// 商品处理器
function handleProducts(request, env, path) {
  const id = path[0];
  const method = request.method;

  console.log(`[Products] ${method} id=${id || 'none'}`);

  // 获取商品列表
  if (method === "GET" && !id) {
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

  // 获取单个商品
  if (method === "GET" && id) {
    return jsonResponse({
      success: true,
      data: { id, name: "测试商品", sku: "SKU001", price: 99.99 }
    });
  }

  // 创建商品
  if (method === "POST") {
    return jsonResponse({ success: true, message: "商品创建成功" }, 201);
  }

  // 更新商品
  if (method === "PUT" && id) {
    return jsonResponse({ success: true, message: "商品更新成功" });
  }

  // 删除商品
  if (method === "DELETE" && id) {
    return jsonResponse({ success: true, message: "商品删除成功" });
  }

  return jsonResponse({
    success: false,
    error: "方法不允许",
    method: method,
    id: id || null
  }, 405);
}

// 订单处理器
function handleOrders(request, env, path) {
  const id = path[0];
  const method = request.method;

  console.log(`[Orders] ${method} id=${id || 'none'}`);

  if (method === "GET" && !id) {
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

  if (method === "GET" && id) {
    return jsonResponse({
      success: true,
      data: { id, orderNo: "ORD-001", status: "pending" }
    });
  }

  if (method === "POST") {
    return jsonResponse({ success: true, message: "订单创建成功" }, 201);
  }

  if (method === "PUT" && id) {
    return jsonResponse({ success: true, message: "订单更新成功" });
  }

  if (method === "DELETE" && id) {
    return jsonResponse({ success: true, message: "订单删除成功" });
  }

  return jsonResponse({ success: false, error: "方法不允许", method }, 405);
}

// 库存处理器
function handleInventory(request, env, path) {
  const subRoute = path[0];
  const method = request.method;

  console.log(`[Inventory] ${method} subRoute=${subRoute || 'none'}`);

  if (method === "GET" && !subRoute) {
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

  if (method === "POST") {
    switch (subRoute) {
      case "stocktake":
        return jsonResponse({ success: true, message: "盘点记录创建成功" });
      case "shipment":
        return jsonResponse({ success: true, message: "出库单创建成功" });
      case "receiving":
        return jsonResponse({ success: true, message: "入库单创建成功" });
      case undefined:
      case "":
        return jsonResponse({ success: true, message: "库存操作成功" });
      default:
        return jsonResponse({ success: true, message: "操作成功", subRoute });
    }
  }

  return jsonResponse({ success: false, error: "方法不允许", method }, 405);
}

// 认证处理器
function handleAuth(request, env, path) {
  const action = path[0];
  const method = request.method;

  console.log(`[Auth] ${method} action=${action || 'none'}`);

  if (method === "POST") {
    switch (action) {
      case "login":
        return jsonResponse({
          success: true,
          data: {
            token: "mock-token-" + Date.now(),
            user: {
              id: "1",
              username: "admin",
              name: "管理员",
            },
          },
        });
      case "logout":
        return jsonResponse({ success: true, message: "登出成功" });
      case "register":
        return jsonResponse({ success: true, message: "注册成功" });
      default:
        return jsonResponse({ success: false, error: "未找到认证操作" }, 404);
    }
  }

  return jsonResponse({ success: false, error: "方法不允许", method }, 405);
}

// 仪表盘处理器
function handleDashboard(request, env) {
  const method = request.method;

  console.log(`[Dashboard] ${method}`);

  if (method !== "GET") {
    return jsonResponse({ success: false, error: "方法不允许", method }, 405);
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
