/// <reference types="@cloudflare/workers-types" />

/**
 * EdgeOne Pages Functions - API 路由入口
 * 将所有 /api/* 请求转发到对应的处理函数
 */

import { handleProducts } from "./handlers/products";
import { handleOrders } from "./handlers/orders";
import { handleInventory } from "./handlers/inventory";
import { handleAuth } from "./handlers/auth";
import { handleDashboard } from "./handlers/dashboard";

export interface Env {
  DATABASE_URL: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = params.path as string[] || [];

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
};

// 辅助函数：JSON 响应
export function jsonResponse(data: any, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...headers,
    },
  });
}
