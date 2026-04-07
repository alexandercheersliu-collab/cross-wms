# Vercel 部署指南

## 前置准备

### 1. 创建 Vercel 项目

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录并部署
vercel login
vercel
```

### 2. 数据库设置

在 Vercel Dashboard 中：
1. 进入项目 → Storage → Create Database
2. 选择 "Postgres" → 创建
3. 复制连接字符串（带 `postgres://` 前缀的）

### 3. 环境变量配置

在 Vercel Dashboard → Project Settings → Environment Variables 添加：

```
DATABASE_URL=postgres://default:xxxx@xxxx.vercel-storage.com:5432/verceldb
```

或者使用 Vercel Postgres 自动注入的环境变量。

## 代码调整

### 1. 更新 Prisma Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. 安装 Vercel Postgres 适配器

```bash
npm install @vercel/postgres
```

### 3. 可选：更新数据库连接方式

如果继续使用 Prisma + pg：
- 无需代码改动，只需更新 `DATABASE_URL` 环境变量

如果切换到 @vercel/postgres：
```typescript
// lib/db.ts
import { sql } from '@vercel/postgres';
export const db = sql;
```

### 4. 更新 package.json 构建脚本

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

### 5. 配置 next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 输出静态文件（可选，但推荐用于无服务器部署）
  // output: 'standalone',
  
  // 图片优化配置
  images: {
    unoptimized: true, // 如果使用 Vercel 免费版，建议开启
  },
  
  // 环境变量（仅客户端可用）
  env: {
    NEXT_PUBLIC_APP_NAME: "Cross WMS",
  },
};

export default nextConfig;
```

## 部署步骤

### 方式一：Git 集成（推荐）

1. 将代码推送到 GitHub/GitLab
2. 在 Vercel Dashboard 导入项目
3. 配置环境变量
4. 点击 Deploy

### 方式二：CLI 部署

```bash
# 构建并部署
vercel --prod

# 设置环境变量
vercel env add DATABASE_URL
```

## 数据库迁移

首次部署需要手动运行迁移：

```bash
# 本地执行（确保 DATABASE_URL 指向 Vercel Postgres）
export DATABASE_URL="你的Vercel Postgres连接字符串"
npx prisma migrate deploy
```

或在 Vercel Dashboard 的 Console 中运行：
```bash
cd /var/task && npx prisma migrate deploy
```

## 验证清单

- [ ] Vercel Postgres 已创建
- [ ] DATABASE_URL 环境变量已配置
- [ ] `prisma/schema.prisma` 中 datasource 配置正确
- [ ] package.json build 脚本包含 `prisma generate && prisma migrate deploy`
- [ ] 代码已推送到 Git 仓库
- [ ] 首次数据库迁移已执行

## 常见问题

### 1. Build 失败 "prisma: not found"
确保 `prisma` 在 dependencies 中（不是 devDependencies）。

### 2. 运行时错误 "Can't reach database"
检查 `DATABASE_URL` 是否正确，Vercel Postgres 的连接字符串格式为：
```
postgres://default:password@host:5432/verceldb
```

### 3. 中间件/Edge Runtime 不支持 Prisma
当前项目使用 Node.js Runtime，无需更改。如果使用 Edge Runtime，需要切换到 `@vercel/postgres`。

## 成本预估

- **Vercel Hobby（免费）**：适合个人使用，每月 100GB 带宽，1000 分钟构建时间
- **Vercel Postgres（免费）**：每月 500MB 存储，60 天数据保留

超出后按量付费，小型 WMS 系统免费版通常够用。
