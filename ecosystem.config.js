/**
 * PM2 Ecosystem Configuration
 * 用于在生产环境管理 NestJS 应用
 */

module.exports = {
  apps: [
    {
      // 应用名称
      name: 'ruizhu-backend',

      // 应用入口
      script: './dist/main.js',

      // 应用工作目录
      cwd: '/opt/ruizhu-app/nestapi-dist',

      // 启动模式
      instances: 1,
      exec_mode: 'fork',

      // 环境变量
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // 内存限制
      max_memory_restart: '512M',

      // 自动重启相关
      autorestart: true,
      watch: false,  // 不监听文件变化，避免频繁重启

      // 日志相关
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/pm2/ruizhu-backend-error.log',
      out_file: '/var/log/pm2/ruizhu-backend-out.log',

      // 健康检查
      listen_timeout: 10000,
      kill_timeout: 5000,

      // 额外配置
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
