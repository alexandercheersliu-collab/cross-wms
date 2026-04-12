import { jsonResponse } from "../[[path]]";
import type { Env } from "../[[path]]";

/**
 * 库存 API 处理器
 */

export async function handleInventory(
  request: Request,
  env: Env,
  path: string[]
): Promise<Response> {
  const subRoute = path[0];

  switch (subRoute) {
    case "stocktake":
      return handleStocktake(request, env);
    case "transactions":
      return handleTransactions(request, env);
    case "shipment":
      return handleShipment(request, env);
    case "receiving":
      return handleReceiving(request, env);
    default:
      // 主库存路由
      if (request.method === "GET") {
        return getInventory(env, new URL(request.url));
      }
      return jsonResponse({ success: false, error: "未找到路由" }, 404);
  }
}

async function getInventory(env: Env, url: URL): Promise<Response> {
  try {
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");
    const lowStock = url.searchParams.get("lowStock") === "true";

    // TODO: 实现数据库查询
    return jsonResponse({
      success: true,
      data: {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      },
    });
  } catch (error) {
    return jsonResponse({ success: false, error: "获取库存列表失败" }, 500);
  }
}

async function handleStocktake(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "方法不允许" }, 405);
  }

  try {
    const body = await request.json();
    // TODO: 实现盘点逻辑
    return jsonResponse({ success: true, message: "盘点记录创建成功" });
  } catch (error) {
    return jsonResponse({ success: false, error: "创建盘点记录失败" }, 500);
  }
}

async function handleTransactions(request: Request, env: Env): Promise<Response> {
  if (request.method !== "GET") {
    return jsonResponse({ success: false, error: "方法不允许" }, 405);
  }

  try {
    // TODO: 实现交易记录查询
    return jsonResponse({ success: true, data: [] });
  } catch (error) {
    return jsonResponse({ success: false, error: "获取交易记录失败" }, 500);
  }
}

async function handleShipment(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "方法不允许" }, 405);
  }

  try {
    const body = await request.json();
    // TODO: 实现出库逻辑
    return jsonResponse({ success: true, message: "出库单创建成功" });
  } catch (error) {
    return jsonResponse({ success: false, error: "创建出库单失败" }, 500);
  }
}

async function handleReceiving(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "方法不允许" }, 405);
  }

  try {
    const body = await request.json();
    // TODO: 实现入库逻辑
    return jsonResponse({ success: true, message: "入库单创建成功" });
  } catch (error) {
    return jsonResponse({ success: false, error: "创建入库单失败" }, 500);
  }
}
