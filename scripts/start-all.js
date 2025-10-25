#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');
const services = [
  {
    name: 'NestAPI Backend',
    dir: path.join(rootDir, 'nestapi'),
    cmd: 'npm',
    args: ['run', 'start:dev'],
    port: 8888,
    url: 'http://localhost:8888',
  },
  {
    name: 'Mini Program (UniApp)',
    dir: path.join(rootDir, 'miniprogram'),
    cmd: 'npm',
    args: ['run', 'dev:h5'],
    port: 5173,
    url: 'http://localhost:5173',
  },
  {
    name: 'Admin Dashboard',
    dir: path.join(rootDir, 'admin'),
    cmd: 'npm',
    args: ['run', 'dev'],
    port: 5174,
    url: 'http://localhost:5174',
  },
];

// ANSI color codes
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

function checkDependencies(dir, serviceName) {
  const nodeModulesPath = path.join(dir, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log('error', `${serviceName} dependencies not installed at ${dir}`);
    log('info', `Please run: cd ${dir} && npm install`);
    return false;
  }
  return true;
}

async function startService(service) {
  return new Promise((resolve) => {
    log('info', `Starting ${service.name} on port ${service.port}...`);

    const process = spawn(service.cmd, service.args, {
      cwd: service.dir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    const serviceLogs = [];

    process.stdout.on('data', (data) => {
      const line = data.toString().trim();
      if (line) {
        serviceLogs.push(line);
        console.log(`  ${colors.cyan}${service.name}${colors.reset}: ${line}`);
      }
    });

    process.stderr.on('data', (data) => {
      const line = data.toString().trim();
      if (line) {
        serviceLogs.push(line);
        console.log(`  ${colors.cyan}${service.name}${colors.reset}: ${line}`);
      }
    });

    process.on('error', (error) => {
      log('error', `${service.name} failed to start: ${error.message}`);
      resolve(false);
    });

    // Give service 3 seconds to start
    setTimeout(() => {
      if (!process.killed) {
        log('success', `${service.name} started successfully (PID: ${process.pid})`);
        resolve(true);
      } else {
        log('error', `${service.name} terminated unexpectedly`);
        resolve(false);
      }
    }, 3000);
  });
}

async function main() {
  console.clear();

  console.log(`
${colors.bright}${colors.blue}╔═══════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.blue}║     🚀 Ruizhu E-Commerce Platform - Multi-Service Startup 🚀   ║${colors.reset}
${colors.bright}${colors.blue}╚═══════════════════════════════════════════════════════════════╝${colors.reset}
  `);

  // Check all directories
  log('info', 'Checking project directories...');
  for (const service of services) {
    if (!fs.existsSync(service.dir)) {
      log('error', `Directory not found: ${service.dir}`);
      process.exit(1);
    }
  }
  log('success', 'All project directories found');
  console.log('');

  // Check dependencies
  log('info', 'Checking dependencies...');
  let allDepsReady = true;
  for (const service of services) {
    if (!checkDependencies(service.dir, service.name)) {
      allDepsReady = false;
    }
  }
  if (!allDepsReady) {
    log('error', 'Some dependencies are missing');
    process.exit(1);
  }
  log('success', 'All dependencies ready');
  console.log('');

  // Start all services
  log('info', 'Starting all services...');
  console.log('');

  const processes = [];
  for (const service of services) {
    const started = await startService(service);
    if (!started) {
      log('error', `Failed to start ${service.name}`);
      process.exit(1);
    }
  }

  // Print summary
  console.log('');
  console.log(`${colors.bright}${colors.green}╔═══════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.green}║               ✅ All Services Started Successfully ✅            ║${colors.reset}`);
  console.log(`${colors.bright}${colors.green}╚═══════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');

  console.log(`${colors.bright}Available Services:${colors.reset}`);
  services.forEach((service) => {
    console.log(`  ${colors.yellow}📍 ${service.name}${colors.reset}`);
    console.log(`     Port: ${service.port}`);
    console.log(`     URL: ${service.url}`);
    console.log('');
  });

  console.log(`${colors.bright}Tips:${colors.reset}`);
  console.log(`  ${colors.cyan}•${colors.reset} Press Ctrl+C to stop all services`);
  console.log(`  ${colors.cyan}•${colors.reset} Ensure MySQL is running on port 3306`);
  console.log(`  ${colors.cyan}•${colors.reset} Check backend API docs at http://localhost:8888/api/v1`);
  console.log('');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('');
    log('warning', 'Shutting down all services...');
    process.exit(0);
  });

  // Keep process alive
  await new Promise(() => {});
}

main().catch((error) => {
  log('error', error.message);
  process.exit(1);
});
