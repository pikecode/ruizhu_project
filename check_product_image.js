const mysql = require('mysql2/promise');

async function checkProductImage() {
  const connection = await mysql.createConnection({
    host: 'bj-cynosdb-grnnz5xv.sql.tencentcdb.com',
    port: 3306,
    user: 'root',
    password: 'Qwe123456',
    database: 'ruizhu'
  });

  try {
    // 查询产品69的信息
    const [products] = await connection.execute(
      'SELECT id, name, cover_image_url FROM products WHERE id = 69'
    );
    console.log('Product 69:', products);

    // 查询产品69的图片
    const [images] = await connection.execute(
      'SELECT id, product_id, image_url, image_type FROM product_images WHERE product_id = 69'
    );
    console.log('Product 69 Images:', images);
  } finally {
    await connection.end();
  }
}

checkProductImage().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
