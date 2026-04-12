/**
 * EdgeOne Pages Cloud Functions - API 路由入口
 * 使用 Neon 数据库
 */

import { neon } from '@neondatabase/serverless';

// 获取数据库连接
function getDb(env) {
  const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not configured');
  }
  return neon(databaseUrl);
}

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
      return handleProducts(request, env, pathParts.slice(1));
    }
    if (route === "orders") {
      return handleOrders(request, env, pathParts.slice(1));
    }
    if (route === "inventory") {
      return handleInventory(request, env, pathParts.slice(1));
    }
    if (route === "auth") {
      return handleAuth(request, env, pathParts.slice(1));
    }
    if (route === "dashboard") {
      return handleDashboard(request, env);
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

// 商品处理器 - 使用数据库
async function handleProducts(request, env, path) {
  const id = path[0];
  const method = request.method;

  try {
    const sql = getDb(env);

    if (method === "GET" && !id) {
      // 获取商品列表
      const products = await sql`SELECT * FROM "Product" ORDER BY "createdAt" DESC LIMIT 20`;
      const count = await sql`SELECT COUNT(*) FROM "Product"`;
      return jsonResponse({
        success: true,
        data: {
          data: products,
          total: parseInt(count[0].count),
          page: 1,
          pageSize: 20,
          totalPages: Math.ceil(parseInt(count[0].count) / 20)
        }
      });
    }

    if (method === "GET" && id) {
      // 获取单个商品
      const products = await sql`SELECT * FROM "Product" WHERE id = ${id}`;
      if (products.length === 0) {
        return jsonResponse({ success: false, error: "Product not found" }, 404);
      }
      return jsonResponse({ success: true, data: products[0] });
    }

    if (method === "POST") {
      // 创建商品
      const body = await request.json();
      const result = await sql`
        INSERT INTO "Product" (id, sku, name, "salePrice", description, category, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${body.sku}, ${body.name}, ${body.salePrice}, ${body.description || null}, ${body.category || null}, NOW(), NOW())
        RETURNING *
      `;
      return jsonResponse({ success: true, data: result[0] }, 201);
    }

    if (method === "PUT" && id) {
      // 更新商品
      const body = await request.json();
      const result = await sql`
        UPDATE "Product"
        SET name = ${body.name}, "salePrice" = ${body.salePrice}, description = ${body.description || null},
            category = ${body.category || null}, "updatedAt" = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      if (result.length === 0) {
        return jsonResponse({ success: false, error: "Product not found" }, 404);
      }
      return jsonResponse({ success: true, data: result[0] });
    }

    if (method === "DELETE" && id) {
      // 删除商品
      await sql`DELETE FROM "Product" WHERE id = ${id}`;
      return jsonResponse({ success: true, message: "Deleted" });
    }

    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("[Products Error]", error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

// 订单处理器
async function handleOrders(request, env, path) {
  const id = path[0];
  const method = request.method;

  try {
    const sql = getDb(env);

    if (method === "GET" && !id) {
      const orders = await sql`SELECT * FROM "Order" ORDER BY "createdAt" DESC LIMIT 20`;
      const count = await sql`SELECT COUNT(*) FROM "Order"`;
      return jsonResponse({
        success: true,
        data: {
          data: orders,
          total: parseInt(count[0].count),
          page: 1,
          pageSize: 20,
          totalPages: Math.ceil(parseInt(count[0].count) / 20)
        }
      });
    }

    if (method === "GET" && id) {
      const orders = await sql`SELECT * FROM "Order" WHERE id = ${id}`;
      if (orders.length === 0) {
        return jsonResponse({ success: false, error: "Order not found" }, 404);
      }
      return jsonResponse({ success: true, data: orders[0] });
    }

    if (method === "POST") {
      const body = await request.json();
      const result = await sql`
        INSERT INTO "Order" (id, "orderNo", platform, "platformOrderId", status, "totalAmount", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${body.orderNo}, ${body.platform}, ${body.platformOrderId}, 'pending', ${body.totalAmount}, NOW(), NOW())
        RETURNING *
      `;
      return jsonResponse({ success: true, data: result[0] }, 201);
    }

    if (method === "PUT" && id) {
      const body = await request.json();
      const result = await sql`
        UPDATE "Order" SET status = ${body.status}, "updatedAt" = NOW() WHERE id = ${id} RETURNING *
      `;
      if (result.length === 0) {
        return jsonResponse({ success: false, error: "Order not found" }, 404);
      }
      return jsonResponse({ success: true, data: result[0] });
    }

    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("[Orders Error]", error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

// 库存处理器
async function handleInventory(request, env, path) {
  const subRoute = path[0];
  const method = request.method;

  try {
    const sql = getDb(env);

    if (method === "GET") {
      const inventory = await sql`
        SELECT i.*, p.name as "productName", p.sku
        FROM "Inventory" i
        JOIN "Product" p ON i."productId" = p.id
        LIMIT 50
      `;
      return jsonResponse({ success: true, data: inventory });
    }

    if (method === "POST") {
      const body = await request.json();

      if (subRoute === "receiving") {
        // 入库
        const result = await sql`
          INSERT INTO "Receiving" (id, "receivingNo", "productId", quantity, "createdAt")
          VALUES (gen_random_uuid(), ${body.receivingNo}, ${body.productId}, ${body.quantity}, NOW())
          RETURNING *
        `;
        // 更新库存
        await sql`
          UPDATE "Inventory" SET quantity = quantity + ${body.quantity}, "updatedAt" = NOW()
          WHERE "productId" = ${body.productId}
        `;
        return jsonResponse({ success: true, data: result[0] });
      }

      if (subRoute === "shipment") {
        // 出库
        const result = await sql`
          INSERT INTO "Shipment" (id, "shipmentNo", "productId", quantity, "createdAt")
          VALUES (gen_random_uuid(), ${body.shipmentNo}, ${body.productId}, ${body.quantity}, NOW())
          RETURNING *
        `;
        // 更新库存
        await sql`
          UPDATE "Inventory" SET quantity = quantity - ${body.quantity}, "updatedAt" = NOW()
          WHERE "productId" = ${body.productId}
        `;
        return jsonResponse({ success: true, data: result[0] });
      }

      return jsonResponse({ success: true, message: "操作成功" });
    }

    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("[Inventory Error]", error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}

// 认证处理器
function handleAuth(request, env, path) {
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

// 仪表盘处理器
async function handleDashboard(request, env) {
  if (request.method !== "GET") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    const sql = getDb(env);

    // 统计数据
    const orderCount = await sql`SELECT COUNT(*) FROM "Order"`;
    const pendingCount = await sql`SELECT COUNT(*) FROM "Order" WHERE status = 'pending'`;
    const todayOrders = await sql`SELECT COUNT(*) FROM "Order" WHERE "createdAt" >= CURRENT_DATE`;
    const lowStock = await sql`SELECT COUNT(*) FROM "Inventory" WHERE quantity < 10`;

    // 平台统计
    const platformStats = await sql`
      SELECT platform, COUNT(*) as "orderCount", SUM("totalAmount") as "totalAmount"
      FROM "Order"
      GROUP BY platform
    `;

    return jsonResponse({
      success: true,
      data: {
        stats: {
          totalOrders: parseInt(orderCount[0].count),
          pendingOrders: parseInt(pendingCount[0].count),
          todayOrders: parseInt(todayOrders[0].count),
          lowStockProducts: parseInt(lowStock[0].count)
        },
        recentOrders: [],
        lowStockItems: [],
        platformStats: platformStats.map(p => ({
          platform: p.platform,
          orderCount: parseInt(p.orderCount),
          totalAmount: parseFloat(p.totalAmount || 0)
        }))
      }
    });
  } catch (error) {
    console.error("[Dashboard Error]", error);
    return jsonResponse({ success: false, error: error.message }, 500);
  }
}
