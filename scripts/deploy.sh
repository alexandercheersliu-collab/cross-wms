#!/bin/bash
# Vercel 部署脚本

set -e

echo "🚀 开始部署到 Vercel..."

# 检查 vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ 未安装 Vercel CLI，正在安装..."
    npm i -g vercel
fi

# 检查是否登录
if ! vercel whoami &> /dev/null; then
    echo "🔑 请先登录 Vercel"
    vercel login
fi

# 检查环境变量
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  警告: 本地环境未设置 DATABASE_URL"
    echo "请确保在 Vercel Dashboard 中设置了 DATABASE_URL"
fi

echo "📦 安装依赖..."
npm ci

echo "🔧 生成 Prisma 客户端..."
npx prisma generate

echo "📤 部署到 Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "📋 部署后需要手动执行："
echo "1. 在 Vercel Dashboard → Storage 中创建 Postgres 数据库"
echo "2. 在 Project Settings → Environment Variables 中设置 DATABASE_URL"
echo "3. 在 Vercel Console 中运行数据库迁移:"
echo "   npx prisma migrate deploy"
