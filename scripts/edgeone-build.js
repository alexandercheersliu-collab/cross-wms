#!/usr/bin/env node
/**
 * EdgeOne 构建脚本
 * 临时移除 API 路由后进行静态构建
 * API 路由由 EdgeOne Pages Functions 处理
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_DIR = path.join(process.cwd(), 'app', 'api');
const API_BACKUP_DIR = path.join(process.cwd(), '.temp-api-backup');

function main() {
  console.log('🚀 开始 EdgeOne 构建...\n');

  try {
    // 备份 API 目录
    if (fs.existsSync(API_DIR)) {
      console.log('📦 备份 API 路由...');
      fs.renameSync(API_DIR, API_BACKUP_DIR);
    }

    // 执行构建
    console.log('🔨 执行 Next.js 构建...');
    execSync('npx next build', { stdio: 'inherit' });

    console.log('\n✅ 构建完成！输出目录: dist/');
    console.log('⚠️ 注意: API 路由已排除，由 EdgeOne Pages Functions 处理');
  } catch (error) {
    console.error('\n❌ 构建失败:', error.message);
    process.exit(1);
  } finally {
    // 恢复 API 目录
    if (fs.existsSync(API_BACKUP_DIR)) {
      console.log('\n📦 恢复 API 路由...');
      fs.renameSync(API_BACKUP_DIR, API_DIR);
    }
  }
}

main();
