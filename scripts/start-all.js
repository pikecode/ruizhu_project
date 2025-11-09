#!/usr/bin/env node

/**
 * 一键启动所有服务脚本
 * 同时启动：
 * 1. NestAPI 后端服务（端口 3000）
 * 2. Admin 管理后台（端口 5173）
 * 3. MiniProgram 小程序（H5 版本，端口 5173）
 */

const { spawn } = require('child_process');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, prefix, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

function startService(name, cwd, command, args, color) {
  log(color, name, `启动服务... (${command} ${args.join(' ')})`);

  const child = spawn(command, args, {
    cwd: cwd,
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (err) => {
    log(colors.red, name, `启动失败: ${err.message}`);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      log(colors.red, name, `进程异常退出 (退出码: ${code})`);
    } else {
      log(colors.yellow, name, `进程正常退出`);
    }
  });

  return child;
}

console.log(`
${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║       Yunjie 电商平台 - 本地开发环境启动                    ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}
`);

const projectRoot = path.resolve(__dirname, '..');

log(colors.blue, '📍 项目根目录', projectRoot);
console.log('');

// 启动 NestAPI 后端
const nestapi = startService(
  '🚀 NestAPI',
  path.join(projectRoot, 'nestapi'),
  'npm',
  ['run', 'start:dev'],
  colors.green
);

// 延迟 3 秒后启动 Admin
setTimeout(() => {
  console.log('');
  const admin = startService(
    '⚙️  Admin',
    path.join(projectRoot, 'admin'),
    'npm',
    ['run', 'dev'],
    colors.blue
  );
}, 3000);

console.log(`
${colors.cyan}
✅ 服务启动命令已执行
${colors.reset}

${colors.bright}📍 本地访问地址：${colors.reset}
  • NestAPI 后端:  ${colors.green}http://localhost:3000${colors.reset}
  • API 文档:      ${colors.green}http://localhost:3000/api/docs${colors.reset}
  • Admin 后台:    ${colors.blue}http://localhost:5173${colors.reset}

${colors.bright}📱 小程序开发：${colors.reset}
  ${colors.yellow}cd miniprogram && npm run dev:h5${colors.reset}

${colors.bright}⚠️  提示：${colors.reset}
  • 需要在不同的终端窗口运行各个服务
  • 或使用 concurrently 库实现真正的并行启动
  • 按 Ctrl+C 停止服务

${colors.cyan}
═══════════════════════════════════════════════════════════
${colors.reset}
`);

// 监听进程信号
process.on('SIGINT', () => {
  log(colors.yellow, '⚠️  系统', '收到停止信号，正在关闭所有服务...');
  nestapi.kill();
  process.exit(0);
});
