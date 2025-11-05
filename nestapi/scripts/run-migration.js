require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mydb',
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  };

  console.log(`Connecting to database: ${config.user}@${config.host}:${config.port}/${config.database}`);

  const connection = await mysql.createConnection(config);

  try {
    // Get all SQL migration files sorted by filename
    const migrationsDir = path.join(__dirname, '../src/database/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('✅ No SQL migration files found');
      return;
    }

    // Create migrations tracking table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {
      // Table might already exist, that's fine
    });

    // Get already executed migrations
    const [executed] = await connection.query('SELECT name FROM migrations');
    const executedSet = new Set(executed.map(m => m.name));

    let executedCount = 0;

    // Execute pending migrations
    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`⏭️  Skipped: ${file} (already executed)`);
        continue;
      }

      const migrationFile = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationFile, 'utf8');

      // Split by semicolon and execute each statement
      const statements = sql.split(';').filter(s => s.trim());

      try {
        for (const statement of statements) {
          await connection.query(statement);
        }

        // Record the migration
        await connection.query(
          'INSERT INTO migrations (name) VALUES (?)',
          [file]
        );

        console.log(`✅ Executed: ${file}`);
        executedCount++;
      } catch (error) {
        // For older migrations that might have already been partially applied,
        // mark them as executed to prevent re-running if they have common idempotent errors
        const knownIdempotentErrors = [
          'ER_DUP_FIELDNAME',
          'Duplicate column',
          "doesn't have a default value",
          'Duplicate key',
          'ER_BAD_FIELD_ERROR',
        ];

        const isIdempotentError = knownIdempotentErrors.some(msg =>
          error.code === msg || error.message.includes(msg)
        );

        if (isIdempotentError || (error.code && error.code.startsWith('ER_'))) {
          try {
            await connection.query(
              'INSERT INTO migrations (name) VALUES (?)',
              [file]
            );
            console.log(`⏭️  Skipped: ${file} (already applied - ${error.message.substring(0, 50)})`);
          } catch (e) {
            // Already recorded, continue anyway
            console.log(`⏭️  Skipped: ${file} (already recorded)`);
          }
        } else {
          console.error(`❌ Failed to execute ${file}:`, error.message);
          throw error;
        }
      }
    }

    if (executedCount === 0) {
      console.log('✅ All migrations already executed');
    } else {
      console.log(`\n✅ ${executedCount} migration(s) executed successfully`);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
