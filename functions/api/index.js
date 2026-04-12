/**
 * EdgeOne Pages Cloud Functions - API 路由入口
 */

export default function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathParts = url.pathname.replace('/api/', '').split('/').filter(p => p);
  const route = pathParts[0] || "";

  console.log(`[API] ${request.method} ${url.pathname}`);

  // CORS 头
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // 预检请求
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 路由分发
    if (route === "products") {
      return handleProducts(request, pathParts.slice(1));
    }
    if (route === "orders") {
      return handleOrders(request, pathParts.slice(1));
    }
    if (route === "inventory") {
      return handleInventory(request, pathParts.slice(1));
    }
    if (route === "auth") {
      return handleAuth(request, pathParts.slice(1));
    }
    if (route === "dashboard") {
      return handleDashboard(request);
    }
    if (route === "") {
      return jsonResponse({ success: true, message: "WMS API", version: "1.0" });
    }

    return jsonResponse({ success: false, error: "Not found" }, 404);
  } catch (error) {
    console.error("[Error]", error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function handleProducts(request, path) {
  const id = path[0];
  const method = request.method;

  if (method === "GET" && !id) {
    return jsonResponse({
      success: true,
      data: { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
    });
  }

  if (method === "GET" && id) {
    return jsonResponse({ success: true, data: { id, name: "Test Product" } });
  }

  if (method === "POST") {
    return jsonResponse({ success: true, message: "Created" }, 201);
  }

  if (method === "PUT" && id) {
    return jsonResponse({ success: true, message: "Updated" });
  }

  if (method === "DELETE" && id) {
    return jsonResponse({ success: true, message: "Deleted" });
  }

  return jsonResponse({ success: false, error: "Method not allowed" }, 405);
}

function handleOrders(request, path) {
  const id = path[0];
  const method = request.method;

  if (method === "GET" && !id) {
    return jsonResponse({
      success: true,
      data: { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
    });
  }

  if (method === "GET" && id) {
    return jsonResponse({ success: true, data: { id, orderNo: "ORD-001" } });
  }

  if (method === "POST") {
    return jsonResponse({ success: true, message: "Created" }, 201);
  }

  if (method === "PUT" && id) {
    return jsonResponse({ success: true, message: "Updated" });
  }

  return jsonResponse({ success: false, error: "Method not allowed" }, 405);
}

function handleInventory(request, path) {
  const subRoute = path[0];
  const method = request.method;

  if (method === "GET") {
    return jsonResponse({
      success: true,
      data: { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
    });
  }

  if (method === "POST") {
    const messages = {
      stocktake: "盘点成功",
      shipment: "出库成功",
      receiving: "入库成功"
    };
    return jsonResponse({
      success: true,
      message: messages[subRoute] || "操作成功"
    });
  }

  return jsonResponse({ success: false, error: "Method not allowed" }, 405);
}

function handleAuth(request, path) {
  const action = path[0];
  const method = request.method;

  if (method === "POST" && action === "login") {
    return jsonResponse({
      success: true,
      data: {
        token: "token-" + Date.now(),
        user: { id: "1", username: "admin", name: "管理员" }
      }
    });
  }

  if (method === "POST" && action === "logout") {
    return jsonResponse({ success: true, message: "登出成功" });
  }

  return jsonResponse({ success: false, error: "Not found" }, 404);
}

function handleDashboard(request) {
  if (request.method !== "GET") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  return jsonResponse({
    success: true,
    data: {
      stats: {
        totalOrders: 156,
        pendingOrders: 23,
        todayOrders: 12,
        lowStockProducts: 5
      },
      recentOrders: [],
      lowStockItems: [],
      platformStats: [
        { platform: "tmall", orderCount: 80, totalAmount: 25000 },
        { platform: "jd", orderCount: 45, totalAmount: 18000 },
        { platform: "douyin", orderCount: 31, totalAmount: 12000 }
      ]
    }
  });
}
