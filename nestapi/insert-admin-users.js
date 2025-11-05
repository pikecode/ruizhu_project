const mysql = require('mysql2/promise');

const adminUsers = [
  {
    username: 'admin',
    email: 'admin@ruizhu.com',
    password: '$2a$10$PN6UxdAxMVFJYt2vJyLi7uEMdBnCu4sLmUhox.cNk7Ip6LoS8nM8S',
    nickname: '超级管理员',
    role: 'admin',
    isSuperAdmin: true,
  },
  {
    username: 'manager',
    email: 'manager@ruizhu.com',
    password: '$2a$10$DcsYmwVxtZ5HRjNf0opDpuno3dPIEPvr6Z1byvqo0Az1qO7rITD9a',
    nickname: '商品经理',
    role: 'manager',
    isSuperAdmin: false,
  },
  {
    username: 'operator',
    email: 'operator@ruizhu.com',
    password: '$2a$10$/LzGtd/ws1Gt38xChDj.h.fRbbq.yH.rLS1hY7PC1Gtl4.8xKW6qq',
    nickname: '操作员',
    role: 'operator',
    isSuperAdmin: false,
  },
];

async function insertAdminUsers() {
  let connection;

  try {
    console.log('🔄 正在连接云数据库...\n');

    connection = await mysql.createConnection({
      host: 'gz-cdb-qtjza6az.sql.tencentcdb.com',
      port: 27226,
      user: 'root',
      password: 'Pp123456',
      database: 'mydb',
    });

    console.log('✅ 连接成功\n');

    console.log('📝 开始插入 Admin 用户...\n');

    for (const user of adminUsers) {
      try {
        await connection.query(
          `INSERT INTO admin_users (username, email, password, nickname, role, is_super_admin, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
          [
            user.username,
            user.email,
            user.password,
            user.nickname,
            user.role,
            user.isSuperAdmin ? 1 : 0,
          ]
        );
        console.log(`✅ 创建账户: ${user.username}`);
        console.log(`   昵称: ${user.nickname}`);
        console.log(`   邮箱: ${user.email}`);
        console.log(`   角色: ${user.role}\n`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ 账户 '${user.username}' 已存在，跳过\n`);
        } else {
          throw err;
        }
      }
    }

    // 验证数据
    console.log('3️⃣ 验证插入结果...\n');
    const [users] = await connection.query(
      'SELECT id, username, email, nickname, role, is_super_admin, status FROM admin_users ORDER BY id'
    );

    console.log('================================');
    console.log('✅ Admin 系统用户初始化成功！');
    console.log('================================\n');

    console.log('📋 已创建的测试账户：\n');
    users.forEach((user) => {
      const roleText = user.is_super_admin ? '(超级管理员)' : '';
      console.log(`【${user.nickname}】${roleText}`);
      console.log(`  用户名: ${user.username}`);
      console.log(`  邮箱: ${user.email}`);
      console.log(`  角色: ${user.role}`);
      console.log();
    });

    console.log('================================');
    console.log(`✅ 总共 ${users.length} 个管理员账户\n`);

    console.log('🚀 现在你可以登录 Admin 系统了！');
    console.log('   登录 URL: http://localhost:5175/login\n');

    console.log('📝 默认账户密码：');
    console.log('   admin / admin123456');
    console.log('   manager / manager123456');
    console.log('   operator / operator123456\n');

  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

insertAdminUsers().catch(console.error);
