import type { NextConfig } from "next";

/**
 * EdgeOne Pages 全栈部署配置
 * - output: 'export' 生成静态文件
 * - distDir: 'dist' 输出目录
 * - images.unoptimized: 禁用图片优化（EdgeOne 不支持 Next.js Image API）
 */
const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
};

export default nextConfig;
