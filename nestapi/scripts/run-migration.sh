#!/bin/bash

# 数据库迁移脚本 - 合并 ProductStats 到 products 表
# 用法: bash scripts/run-migration.sh

set -e

echo "════════════════════════════════════════════════"
echo "  数据库迁移: 合并 ProductStats 到 products 表"
echo "════════════════════════════════════════════════"
echo ""

# 从环境变量读取数据库配置
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-}
DB_NAME=${DB_NAME:-}

# 验证必需的环境变量
if [ -z "$DB_NAME" ]; then
  echo "❌ 错误: 缺少 DB_NAME 环境变量"
  echo ""
  echo "请设置以下环境变量:"
  echo "  export DB_HOST=<数据库主机>"
  echo "  export DB_PORT=<数据库端口>"
  echo "  export DB_USER=<数据库用户名>"
  echo "  export DB_PASSWORD=<数据库密码>"
  echo "  export DB_NAME=<数据库名>"
  echo ""
  exit 1
fi

echo "数据库连接信息:"
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  用户: $DB_USER"
echo "  数据库: $DB_NAME"
echo ""

# 执行迁移脚本
echo "执行迁移脚本..."
echo ""

mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$(dirname "$0")/../src/database/migrations/004-merge-stats-into-products.sql"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 迁移成功完成！"
  echo ""
  echo "已执行的操作:"
  echo "  1. ✓ 向 products 表添加 7 个统计字段"
  echo "  2. ✓ 从 product_stats 表迁移数据到 products 表"
  echo "  3. ✓ 删除 product_stats 表"
  echo "  4. ✓ 添加优化索引"
  echo ""
else
  echo ""
  echo "❌ 迁移失败！"
  echo "请检查数据库连接信息和权限"
  echo ""
  exit 1
fi
