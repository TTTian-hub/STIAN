#!/usr/bin/env node

/**
 * Postinstall script for fortuning-ai
 *
 * 注意：这是一个纯提示性的脚本，绝不应中断 `npm ci` / Docker 构建。
 * 因此整体包在 try/catch 中，任何异常都安全退出（code 0）；
 * 且不再递归执行 `npm install`（依赖已由 npm ci 安装完毕，递归调用在
 * 容器/CI 环境下可能触发非预期失败）。
 */

try {
  const fs = require('fs');
  const path = require('path');

  const projectRoot = path.resolve(__dirname, '..');

  console.log('🔮 Setting up Fortuning AI...\n');

  // 提示：缺少 .env.local
  const envPath = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  No .env.local found. Please create it from .env.example');
    console.log('   (Not required for build; only needed at runtime.)\n');
  }

  console.log('✅ Setup complete!\n');
  console.log('Quick start:');
  console.log('  npm run dev       Development mode');
  console.log('  npm run build     Build for production');
  console.log('  npm start         Start the production server');
  console.log('\nHappy fortune telling! 🔮\n');
} catch (err) {
  // 任何异常都不应阻断安装 / 构建流程
  console.warn('postinstall skipped (non-fatal):', err && err.message);
  process.exit(0);
}
