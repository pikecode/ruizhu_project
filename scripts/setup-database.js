#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  const types = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[SUCCESS]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
    warning: `${colors.yellow}[WARNING]${colors.reset}`,
  };

  console.log(`${types[type]} ${timestamp} - ${message}`);
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function promptPassword(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      // Clear the password from output
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

async function testMySQLConnection(config) {
  try {
    const connection = await mysql.createConnection(config);
    await connection.end();
    return true;
  } catch (error) {
    return false;
  }
}

async function createDatabase(config) {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    log('success', `Database '${config.database}' created/verified`);

    await connection.end();
    return true;
  } catch (error) {
    log('error', `Failed to create database: ${error.message}`);
    return false;
  }
}

async function initializeDatabase(config) {
  try {
    const connection = await mysql.createConnection(config);

    // Read SQL file
    const sqlFile = path.join(__dirname, 'init-database.sql');
    if (!fs.existsSync(sqlFile)) {
      log('error', `SQL file not found: ${sqlFile}`);
      return false;
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists') && !error.message.includes('IGNORE')) {
          log('warning', `Skipped: ${error.message}`);
        }
      }
    }

    log('success', 'Database tables initialized successfully');

    await connection.end();
    return true;
  } catch (error) {
    log('error', `Failed to initialize database: ${error.message}`);
    return false;
  }
}

async function updateEnvFile(envPath, config) {
  try {
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or add database configuration
    const dbConfig = `DB_HOST=${config.host}
DB_PORT=${config.port}
DB_USER=${config.user}
DB_PASSWORD=${config.password}
DB_NAME=${config.database}`;

    // Replace or add to env file
    let lines = envContent.split('\n');
    const dbKeys = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    lines = lines.filter((line) => !dbKeys.some((key) => line.startsWith(key)));

    if (lines[lines.length - 1] !== '') {
      lines.push('');
    }

    lines.push(dbConfig);

    const updatedContent = lines.join('\n');
    fs.writeFileSync(envPath, updatedContent, 'utf8');

    log('success', `Updated ${envPath} with database configuration`);
    return true;
  } catch (error) {
    log('error', `Failed to update .env file: ${error.message}`);
    return false;
  }
}

async function main() {
  console.clear();

  console.log(`
${colors.bright}${colors.blue}╔═══════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.blue}║     Ruizhu Database Setup - Automatic Configuration           ║${colors.reset}
${colors.bright}${colors.blue}╚═══════════════════════════════════════════════════════════════╝${colors.reset}
  `);

  // Get database configuration
  log('info', 'Please provide your MySQL connection details');
  console.log('');

  const host = await promptUser('MySQL Host [localhost]: ') || 'localhost';
  const port = await promptUser('MySQL Port [3306]: ') || '3306';
  const user = await promptUser('MySQL Username [root]: ') || 'root';
  const password = await promptPassword('MySQL Password (press Enter if no password): ');
  const database = await promptUser('Database Name [ruizhu]: ') || 'ruizhu';

  const config = {
    host,
    port: parseInt(port),
    user,
    password,
    database,
  };

  console.log('');
  log('info', 'Testing MySQL connection...');

  // Test connection
  const canConnect = await testMySQLConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password || undefined,
  });

  if (!canConnect) {
    log('error', 'Failed to connect to MySQL');
    log('error', 'Please check your MySQL server is running and credentials are correct');
    process.exit(1);
  }

  log('success', 'MySQL connection successful');
  console.log('');

  // Create database
  log('info', 'Creating database...');
  const dbCreated = await createDatabase(config);

  if (!dbCreated) {
    process.exit(1);
  }

  console.log('');

  // Initialize tables
  log('info', 'Initializing database tables...');
  const dbInit = await initializeDatabase(config);

  if (!dbInit) {
    process.exit(1);
  }

  console.log('');

  // Update .env file
  const projectRoot = path.join(__dirname, '..');
  const envPath = path.join(projectRoot, 'nestapi', '.env');

  log('info', 'Updating .env configuration...');
  const envUpdated = await updateEnvFile(envPath, config);

  if (!envUpdated) {
    log('warning', `Please manually update ${envPath} with the following:
DB_HOST=${config.host}
DB_PORT=${config.port}
DB_USER=${config.user}
DB_PASSWORD=${config.password}
DB_NAME=${config.database}`);
  }

  console.log('');
  console.log(`${colors.bright}${colors.green}╔═══════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.green}║           Database Setup Complete ✅                          ║${colors.reset}`);
  console.log(`${colors.bright}${colors.green}╚═══════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');

  console.log(`${colors.bright}Configuration Summary:${colors.reset}`);
  console.log(`  Host:     ${config.host}`);
  console.log(`  Port:     ${config.port}`);
  console.log(`  Username: ${config.user}`);
  console.log(`  Database: ${config.database}`);
  console.log('');

  console.log(`${colors.bright}Next Steps:${colors.reset}`);
  console.log('  1. The backend .env file has been updated');
  console.log('  2. Start the backend: cd nestapi && npm run start:dev');
  console.log('  3. Or run all services: cd .. && ./start.sh');
  console.log('');

  process.exit(0);
}

main().catch((error) => {
  log('error', error.message);
  process.exit(1);
});
