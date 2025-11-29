import * as fs from 'fs';
import * as path from 'path';
import * as mysql from 'mysql2/promise';

async function executeRegionsSQL() {
  console.log('🚀 开始执行省市区数据SQL导入...\n');

  // 读取.env配置
  const dbConfig = {
    host: process.env.DB_HOST || 'gz-cdb-qtjza6az.sql.tencentcdb.com',
    port: parseInt(process.env.DB_PORT || '27226'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Pp123456',
    database: process.env.DB_NAME || 'mydb',
    multipleStatements: true, // 允许执行多条SQL语句
  };

  console.log('═══════════════════════════════════════════════════');
  console.log('  数据库连接配置');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  主机: ${dbConfig.host}`);
  console.log(`  端口: ${dbConfig.port}`);
  console.log(`  用户: ${dbConfig.user}`);
  console.log(`  数据库: ${dbConfig.database}`);
  console.log('═══════════════════════════════════════════════════\n');

  let connection;

  try {
    // 连接数据库
    console.log('🔌 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../../data/china-regions.sql');
    console.log('📖 读取SQL文件:', sqlPath);

    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    console.log('✅ SQL文件读取成功\n');

    // 执行SQL
    console.log('📥 开始执行SQL语句...\n');
    const startTime = Date.now();

    await connection.query(sqlContent);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 数据导入完成！');
    console.log('='.repeat(60));
    console.log(`⏱️  执行时间: ${duration} 秒`);
    console.log('='.repeat(60) + '\n');

    // 验证导入结果
    console.log('🔍 验证导入结果...\n');

    const [provinces] = await connection.query('SELECT COUNT(*) as count FROM provinces');
    const [cities] = await connection.query('SELECT COUNT(*) as count FROM cities');
    const [districts] = await connection.query('SELECT COUNT(*) as count FROM districts');

    console.log('📊 数据统计:');
    console.log(`   - 省级行政区: ${(provinces as any)[0].count} 个`);
    console.log(`   - 地级行政区: ${(cities as any)[0].count} 个`);
    console.log(`   - 县级行政区: ${(districts as any)[0].count} 个`);
    console.log(`   - 总计: ${(provinces as any)[0].count + (cities as any)[0].count + (districts as any)[0].count} 条记录\n`);

  } catch (error) {
    console.error('❌ 导入失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

// 执行导入
executeRegionsSQL()
  .then(() => {
    console.log('\n✅ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 脚本执行失败:', error);
    process.exit(1);
  });
