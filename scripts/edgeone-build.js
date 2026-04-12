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

  let apiBackedUp = false;

  try {
    // 备份 API 目录
    if (fs.existsSync(API_DIR)) {
      console.log('📦 备份 API 路由...');
      fs.renameSync(API_DIR, API_BACKUP_DIR);
      apiBackedUp = true;
    }

    // 执行构建
    console.log('🔨 执行 Next.js 构建...');
    console.log('   构建目录:', process.cwd());
    console.log('   API 已排除:', apiBackedUp);

    execSync('npx next build', {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('\n✅ 构建完成！输出目录: dist/');

    // 验证 dist 目录存在
    if (!fs.existsSync(path.join(process.cwd(), 'dist'))) {
      throw new Error('dist 目录未生成');
    }

    console.log('📁 dist 目录内容:');
    const distFiles = fs.readdirSync(path.join(process.cwd(), 'dist'));
    distFiles.forEach(f => console.log('   -', f));

  } catch (error) {
    console.error('\n❌ 构建失败:', error.message);
    process.exit(1);
  } finally {
    // 恢复 API 目录
    if (apiBackedUp && fs.existsSync(API_BACKUP_DIR)) {
      console.log('\n📦 恢复 API 路由...');
      fs.renameSync(API_BACKUP_DIR, API_DIR);
    }
  }
}

main();
