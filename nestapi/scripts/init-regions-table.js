const mysql = require('mysql2/promise');
require('dotenv').config();

async function initRegionsTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // 创建 provinces 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`provinces\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`code\` varchar(50) NOT NULL UNIQUE,
        \`name\` varchar(100) NOT NULL,
        \`sort_order\` int DEFAULT 0,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_provinces_code\` (\`code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ 创建 provinces 表');

    // 创建 cities 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`cities\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`code\` varchar(50) NOT NULL UNIQUE,
        \`name\` varchar(100) NOT NULL,
        \`province_id\` int NOT NULL,
        \`sort_order\` int DEFAULT 0,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_cities_code\` (\`code\`),
        KEY \`IDX_cities_province_id\` (\`province_id\`),
        CONSTRAINT \`FK_cities_province_id\` FOREIGN KEY (\`province_id\`) REFERENCES \`provinces\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ 创建 cities 表');

    // 创建 districts 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`districts\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`code\` varchar(50) NOT NULL UNIQUE,
        \`name\` varchar(100) NOT NULL,
        \`city_id\` int NOT NULL,
        \`sort_order\` int DEFAULT 0,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_districts_code\` (\`code\`),
        KEY \`IDX_districts_city_id\` (\`city_id\`),
        CONSTRAINT \`FK_districts_city_id\` FOREIGN KEY (\`city_id\`) REFERENCES \`cities\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ 创建 districts 表');

    console.log('✅ 地区表初始化完成');
  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('⚠️  表已存在，跳过创建');
    } else {
      console.error('❌ 初始化失败:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

initRegionsTables().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
