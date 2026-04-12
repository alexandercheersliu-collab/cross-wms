import { jsonResponse } from "../[[path]]";
import type { Env } from "../[[path]]";

/**
 * 商品 API 处理器
 * 兼容 EdgeOne Pages Functions
 */

export async function handleProducts(
  request: Request,
  env: Env,
  path: string[]
): Promise<Response> {
  const id = path[0];
  const url = new URL(request.url);

  switch (request.method) {
    case "GET":
      if (id) {
        return getProductById(env, id);
      }
      return getProducts(env, url);

    case "POST":
      if (!id) {
        return createProduct(request, env);
      }
      break;

    case "PUT":
      if (id) {
        return updateProduct(request, env, id);
      }
      break;

    case "DELETE":
      if (id) {
        return deleteProduct(env, id);
      }
      break;
  }

  return jsonResponse({ success: false, error: "方法不允许" }, 405);
}

// 获取商品列表
async function getProducts(env: Env, url: URL): Promise<Response> {
  try {
    // 从 URL 获取查询参数
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");
    const search = url.searchParams.get("search");
    const category = url.searchParams.get("category");

    // 调用数据库
    const { results, total } = await queryProducts(env, { page, pageSize, search, category });

    return jsonResponse({
      success: true,
      data: {
        data: results,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取商品列表失败:", error);
    return jsonResponse({ success: false, error: "获取商品列表失败" }, 500);
  }
}

// 获取单个商品
async function getProductById(env: Env, id: string): Promise<Response> {
  try {
    const product = await queryProductById(env, id);
    if (!product) {
      return jsonResponse({ success: false, error: "商品不存在" }, 404);
    }
    return jsonResponse({ success: true, data: product });
  } catch (error) {
    console.error("获取商品详情失败:", error);
    return jsonResponse({ success: false, error: "获取商品详情失败" }, 500);
  }
}

// 创建商品
async function createProduct(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.sku || !body.name || !body.salePrice) {
      return jsonResponse({ success: false, error: "SKU、名称和售价不能为空" }, 400);
    }

    // 检查 SKU 是否已存在
    const existing = await queryProductBySku(env, body.sku);
    if (existing) {
      return jsonResponse({ success: false, error: `SKU "${body.sku}" 已存在` }, 400);
    }

    // 创建商品
    const product = await insertProduct(env, body);

    // 创建库存记录
    await insertInventory(env, product.id);

    return jsonResponse({ success: true, data: product, message: "商品创建成功" }, 201);
  } catch (error) {
    console.error("创建商品失败:", error);
    return jsonResponse({ success: false, error: "创建商品失败" }, 500);
  }
}

// 更新商品
async function updateProduct(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const body = await request.json();

    // 检查商品是否存在
    const existing = await queryProductById(env, id);
    if (!existing) {
      return jsonResponse({ success: false, error: "商品不存在" }, 404);
    }

    // 如果更新 SKU，检查是否与其他商品冲突
    if (body.sku && body.sku !== existing.sku) {
      const conflict = await queryProductBySku(env, body.sku);
      if (conflict) {
        return jsonResponse({ success: false, error: `SKU "${body.sku}" 已存在` }, 400);
      }
    }

    const product = await updateProductData(env, id, body);
    return jsonResponse({ success: true, data: product, message: "商品更新成功" });
  } catch (error) {
    console.error("更新商品失败:", error);
    return jsonResponse({ success: false, error: "更新商品失败" }, 500);
  }
}

// 删除商品
async function deleteProduct(env: Env, id: string): Promise<Response> {
  try {
    // 检查商品是否存在
    const existing = await queryProductById(env, id);
    if (!existing) {
      return jsonResponse({ success: false, error: "商品不存在" }, 404);
    }

    // 检查是否有关联订单
    const hasOrders = await checkProductOrders(env, id);
    if (hasOrders) {
      return jsonResponse({ success: false, error: "该商品有关联订单，无法删除" }, 400);
    }

    await deleteProductData(env, id);
    return jsonResponse({ success: true, message: "商品删除成功" });
  } catch (error) {
    console.error("删除商品失败:", error);
    return jsonResponse({ success: false, error: "删除商品失败" }, 500);
  }
}

// ==================== 数据库操作 ====================

async function queryProducts(
  env: Env,
  params: { page: number; pageSize: number; search?: string | null; category?: string | null }
): Promise<{ results: any[]; total: number }> {
  // 这里应该使用实际的数据库连接
  // 示例使用 EdgeOne 的 D1 数据库或外部 PostgreSQL
  // 简化示例，实际实现需要根据具体数据库配置

  throw new Error("需要配置数据库连接");
}

async function queryProductById(env: Env, id: string): Promise<any | null> {
  throw new Error("需要配置数据库连接");
}

async function queryProductBySku(env: Env, sku: string): Promise<any | null> {
  throw new Error("需要配置数据库连接");
}

async function insertProduct(env: Env, data: any): Promise<any> {
  throw new Error("需要配置数据库连接");
}

async function insertInventory(env: Env, productId: string): Promise<void> {
  throw new Error("需要配置数据库连接");
}

async function updateProductData(env: Env, id: string, data: any): Promise<any> {
  throw new Error("需要配置数据库连接");
}

async function deleteProductData(env: Env, id: string): Promise<void> {
  throw new Error("需要配置数据库连接");
}

async function checkProductOrders(env: Env, productId: string): Promise<boolean> {
  throw new Error("需要配置数据库连接");
}
