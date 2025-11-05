require('dotenv').config();
const path = require('path');

module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [path.join(__dirname, 'src/entities/**/*.entity.ts')],
  migrations: [path.join(__dirname, 'src/database/migrations/*.ts')],
  cli: {
    migrationsDir: 'src/database/migrations',
  },
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
};
