/**
 * Admin 用户初始化脚本
 * 用于创建测试 Admin 账户
 *
 * 使用方式：
 * ts-node src/database/scripts/init-admin-users.ts
 *
 * 该脚本会创建以下测试账户：
 * 1. 超级管理员账户 (admin)
 * 2. 经理账户 (manager)
 * 3. 操作员账户 (operator)
 */

import * as bcryptjs from 'bcryptjs';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// 加载 .env 文件
dotenv.config();

interface AdminUserData {
  username: string;
  email: string;
  password: string;
  nickname: string;
  role: 'admin' | 'manager' | 'operator';
  isSuperAdmin: boolean;
}

// 默认测试账户
const DEFAULT_ADMIN_USERS: AdminUserData[] = [
  {
    username: 'admin',
    email: 'admin@ruizhu.com',
    password: 'admin123456',
    nickname: '超级管理员',
    role: 'admin',
    isSuperAdmin: true,
  },
  {
    username: 'manager',
    email: 'manager@ruizhu.com',
    password: 'manager123456',
    nickname: '商品经理',
    role: 'manager',
    isSuperAdmin: false,
  },
  {
    username: 'operator',
    email: 'operator@ruizhu.com',
    password: 'operator123456',
    nickname: '操作员',
    role: 'operator',
    isSuperAdmin: false,
  },
];

async function initAdminUsers() {
  let connection;

  try {
    // 获取数据库配置
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || '3306');
    const dbUser = process.env.DB_USERNAME || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'mydb';

    console.log('🔄 正在连接数据库...');
    console.log(`   Host: ${dbHost}:${dbPort}`);
    console.log(`   Database: ${dbName}`);

    // 创建连接
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      multipleStatements: true,
    });

    console.log('✅ 数据库连接成功\n');

    // 检查表是否存在
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'admin_users'",
    );

    if (tables.length === 0) {
      throw new Error(
        '❌ admin_users 表不存在，请先运行数据库迁移：\n   npm run typeorm migration:run',
      );
    }

    console.log('📋 开始创建测试账户...\n');

    // 清空现有账户（可选，默认注释）
    // await connection.query('DELETE FROM admin_users');

    // 创建账户
    for (const userData of DEFAULT_ADMIN_USERS) {
      // 检查是否已存在
      const [existingUsers] = await connection.query(
        'SELECT id FROM admin_users WHERE username = ?',
        [userData.username],
      );

      if (existingUsers.length > 0) {
        console.log(`⚠️  账户 '${userData.username}' 已存在，跳过`);
        continue;
      }

      // 密码加密
      const hashedPassword = await bcryptjs.hash(userData.password, 10);

      // 插入数据
      await connection.query(
        `INSERT INTO admin_users (username, email, password, nickname, role, is_super_admin, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [
          userData.username,
          userData.email,
          hashedPassword,
          userData.nickname,
          userData.role,
          userData.isSuperAdmin ? 1 : 0,
        ],
      );

      console.log(`✅ 创建账户成功: ${userData.username}`);
      console.log(`   邮箱: ${userData.email}`);
      console.log(`   原始密码: ${userData.password}`);
      console.log(`   角色: ${userData.role}`);
      console.log();
    }

    console.log('================================');
    console.log('✅ Admin 用户初始化完成！');
    console.log('================================\n');

    console.log('📝 测试账户信息：\n');
    DEFAULT_ADMIN_USERS.forEach((user) => {
      console.log(`【${user.nickname}】`);
      console.log(`  用户名: ${user.username}`);
      console.log(`  密码: ${user.password}`);
      console.log(`  邮箱: ${user.email}`);
      console.log(`  角色: ${user.role}`);
      console.log();
    });

    console.log('🚀 现在你可以使用上述账户登录 Admin 系统了！');
    console.log('   登录 URL: http://localhost:5175/login');
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

// 运行脚本
initAdminUsers().catch(console.error);
