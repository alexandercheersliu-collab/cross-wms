import { jsonResponse } from "../[[path]]";
import type { Env } from "../[[path]]";

/**
 * 认证 API 处理器
 */

export async function handleAuth(
  request: Request,
  env: Env,
  path: string[]
): Promise<Response> {
  const action = path[0];

  switch (action) {
    case "login":
      if (request.method === "POST") {
        return handleLogin(request, env);
      }
      break;
    case "logout":
      if (request.method === "POST") {
        return handleLogout(request, env);
      }
      break;
  }

  return jsonResponse({ success: false, error: "未找到路由" }, 404);
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();

    // TODO: 实现登录逻辑
    // 验证用户名密码，生成 JWT token

    return jsonResponse({
      success: true,
      data: {
        token: "mock-token",
        user: {
          id: "1",
          username: body.username,
          name: "管理员",
        },
      },
    });
  } catch (error) {
    return jsonResponse({ success: false, error: "登录失败" }, 500);
  }
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
  try {
    // TODO: 实现登出逻辑
    return jsonResponse({ success: true, message: "登出成功" });
  } catch (error) {
    return jsonResponse({ success: false, error: "登出失败" }, 500);
  }
}
