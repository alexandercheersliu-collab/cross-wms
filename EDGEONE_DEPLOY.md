# EdgeOne Pages 全栈部署指南

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    EdgeOne Pages                        │
│  ┌──────────────┐      ┌──────────────────────────┐    │
│  │  静态前端     │      │   Pages Functions         │    │
│  │  (Next.js)   │──────▶│  ┌────────────────────┐  │    │
│  │              │      │  │ /api/* 路由         │  │    │
│  └──────────────┘      │  │  - products         │  │    │
│                        │  │  - orders           │  │    │
│                        │  │  - inventory        │  │    │
│                        │  │  - auth             │  │    │
│                        │  └────────────────────┘  │    │
│                        └──────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   数据库       │
                    │ (PostgreSQL)  │
                    └───────────────┘
```

## 部署前准备

### 1. 安装 EdgeOne CLI

```bash
npm install -g @edgeone/cli
```

### 2. 登录 EdgeOne

```bash
eone login
```

### 3. 创建 Pages 项目

```bash
eone pages create cross-wms
```

## 部署步骤

### 方式一：通过 CLI 部署

```bash
# 1. 构建项目
npm run build

# 2. 部署到 EdgeOne Pages
eone pages deploy
```

### 方式二：通过 Git 集成部署

1. 推送代码到 GitHub
2. 在 EdgeOne 控制台连接 Git 仓库
3. 配置构建设置：
   - 构建命令：`npm run build`
   - 输出目录：`dist`
   - Functions 目录：`functions`

### 方式三：控制台手动上传

1. 登录 [EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
2. 进入 Pages 服务
3. 创建项目 → 上传构建后的 `dist` 文件夹和 `functions` 文件夹

## 环境变量配置

在 EdgeOne 控制台设置以下环境变量：

```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-jwt-secret-key
```

## 数据库连接

EdgeOne Pages Functions 支持以下数据库方案：

### 方案 1：EdgeOne D1 数据库（推荐）

EdgeOne D1 是兼容 SQLite 的边缘数据库：

```typescript
// functions/api/handlers/products.ts
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function handleProducts(request: Request, env: Env) {
  const { env: { DB } } = getRequestContext();
  
  const results = await DB.prepare("SELECT * FROM products LIMIT 10").all();
  return jsonResponse({ success: true, data: results });
}
```

### 方案 2：外部 PostgreSQL

使用连接池连接到外部 PostgreSQL：

```typescript
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: env.DATABASE_URL });
```

### 方案 3：Prisma + PostgreSQL

使用 Prisma 需要特殊配置，因为 EdgeOne Functions 的 Node.js 运行时有限制。

## 路由映射

| 路由 | 处理方式 |
|------|----------|
| `/` | 静态页面 (Next.js 导出) |
| `/products` | 静态页面 |
| `/products/[id]` | 静态页面 (generateStaticParams) |
| `/api/*` | EdgeOne Pages Functions |

## Functions 目录结构

```
functions/
└── api/
    └── [[path]].ts          # 主入口，路由分发
    └── handlers/
        ├── products.ts      # 商品 API
        ├── orders.ts        # 订单 API
        ├── inventory.ts     # 库存 API
        ├── auth.ts          # 认证 API
        └── dashboard.ts     # 仪表盘 API
```

## 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动 Next.js 开发服务器
npm run dev

# 3. 在另一个终端启动 EdgeOne Pages 本地模拟
eone pages dev
```

## 类型支持

EdgeOne Pages Functions 使用 Cloudflare Workers 运行时，需要安装类型定义：

```bash
npm install -D @cloudflare/workers-types
```

在 `tsconfig.json` 中添加：

```json
{
  "compilerOptions": {
    "types": ["@cloudflare/workers-types"]
  }
}
```

## 注意事项

1. **Node.js 兼容性**：EdgeOne Pages Functions 运行在 V8 隔离环境，部分 Node.js API 不可用
2. **数据库连接**：推荐使用 D1 或外部连接池，避免每次请求新建连接
3. **冷启动**：首次请求可能有延迟，建议使用 Edge Functions 减少延迟
4. **文件大小**：Functions 有大小限制，注意依赖包体积

## 故障排查

### API 404

检查 `edgeone.json` 中的路由配置：

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "function": "api/[[path]]"
    }
  ]
}
```

### 数据库连接失败

1. 确认 `DATABASE_URL` 环境变量已设置
2. 检查数据库白名单是否包含 EdgeOne IP 段
3. 使用连接池管理连接

### 构建失败

1. 确保所有动态路由都有 `generateStaticParams`
2. 检查 `next.config.ts` 中 `output: 'export'` 已配置
3. 确认 `dist` 目录生成成功

## 与 Vercel 部署对比

| 功能 | Vercel | EdgeOne Pages |
|------|--------|---------------|
| 前端托管 | ✅ | ✅ |
| API Functions | ✅ Edge/Node.js | ✅ Edge/Cloud |
| 数据库 | ✅ 多种选择 | ✅ D1/外部 |
| 国内访问 | ⚠️ 需 CDN | ✅ 原生加速 |
| 冷启动 | ~100ms | ~50ms |

## 推荐阅读

- [EdgeOne Pages 文档](https://www.tencentcloud.com/document/product/1552/96350)
- [Pages Functions 指南](https://www.tencentcloud.com/document/product/1552/96353)
- [EdgeOne D1 数据库](https://www.tencentcloud.com/document/product/1552/96352)
