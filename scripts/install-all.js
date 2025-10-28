#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');
const projects = [
  {
    name: 'Root Project',
    dir: rootDir,
    packageJson: path.join(rootDir, 'package.json'),
  },
  {
    name: 'NestAPI Backend',
    dir: path.join(rootDir, 'nestapi'),
    packageJson: path.join(rootDir, 'nestapi', 'package.json'),
  },
  {
    name: 'MiniProgram Frontend',
    dir: path.join(rootDir, 'miniprogram'),
    packageJson: path.join(rootDir, 'miniprogram', 'package.json'),
  },
  {
    name: 'Admin Dashboard',
    dir: path.join(rootDir, 'admin'),
    packageJson: path.join(rootDir, 'admin', 'package.json'),
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
  magenta: '\x1b[35m',
};

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  const types = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[✓]${colors.reset}`,
    error: `${colors.red}[✗]${colors.reset}`,
    warning: `${colors.yellow}[!]${colors.reset}`,
    installing: `${colors.magenta}[⬇]${colors.reset}`,
  };

  console.log(`${types[type]} ${colors.cyan}${timestamp}${colors.reset} ${message}`);
}

function npmInstall(projectDir, projectName) {
  return new Promise((resolve, reject) => {
    log('installing', `Installing dependencies for ${colors.bright}${projectName}${colors.reset}...`);

    const process = spawn('npm', ['install', '--legacy-peer-deps'], {
      cwd: projectDir,
      stdio: 'inherit',
      shell: true,
    });

    process.on('close', (code) => {
      if (code === 0) {
        log('success', `${projectName} dependencies installed successfully`);
        resolve();
      } else {
        log('error', `Failed to install ${projectName} dependencies (exit code: ${code})`);
        reject(new Error(`npm install failed for ${projectName}`));
      }
    });

    process.on('error', (error) => {
      log('error', `Error installing ${projectName}: ${error.message}`);
      reject(error);
    });
  });
}

async function main() {
  console.clear();

  console.log(`
${colors.bright}${colors.blue}╔═══════════════════════════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.blue}║       📦 Ruizhu Project - Install All Dependencies 📦        ║${colors.reset}
${colors.bright}${colors.blue}╚═══════════════════════════════════════════════════════════════╝${colors.reset}
  `);

  // Check all directories and package.json files exist
  log('info', 'Verifying project structure...');
  let allValid = true;

  for (const project of projects) {
    if (!fs.existsSync(project.dir)) {
      log('error', `Directory not found: ${project.dir}`);
      allValid = false;
    } else if (!fs.existsSync(project.packageJson)) {
      log('error', `package.json not found: ${project.packageJson}`);
      allValid = false;
    } else {
      log('success', `${project.name} verified at ${project.dir}`);
    }
  }

  if (!allValid) {
    log('error', 'Some project directories are missing!');
    process.exit(1);
  }

  console.log('');
  log('info', `Starting installation of ${projects.length} projects...`);
  console.log('');

  // Install dependencies for each project sequentially
  let successCount = 0;
  let failedProjects = [];

  for (const project of projects) {
    console.log(`${colors.bright}${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    try {
      await npmInstall(project.dir, project.name);
      successCount++;
    } catch (error) {
      failedProjects.push(project.name);
      log('error', `Installation failed for ${project.name}`);
    }

    console.log('');
  }

  // Print summary
  console.log(`${colors.bright}${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('');

  if (failedProjects.length === 0) {
    console.log(`${colors.bright}${colors.green}╔═══════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║        ✅ All Dependencies Installed Successfully! ✅         ║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}╚═══════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log('');

    console.log(`${colors.bright}Next Steps:${colors.reset}`);
    console.log(`  ${colors.cyan}1.${colors.reset} Start all services: ${colors.yellow}npm start${colors.reset}`);
    console.log(`  ${colors.cyan}2.${colors.reset} Or start individual services:`);
    console.log(`     - Backend: ${colors.yellow}npm run dev:backend${colors.reset}`);
    console.log(`     - MiniProgram: ${colors.yellow}npm run dev:miniprogram${colors.reset}`);
    console.log(`     - Admin: ${colors.yellow}npm run dev:admin${colors.reset}`);
    console.log('');

    console.log(`${colors.bright}📍 Service URLs:${colors.reset}`);
    console.log(`  ${colors.magenta}•${colors.reset} Backend API: ${colors.yellow}http://localhost:3000${colors.reset}`);
    console.log(`  ${colors.magenta}•${colors.reset} MiniProgram: ${colors.yellow}http://localhost:5173${colors.reset}`);
    console.log(`  ${colors.magenta}•${colors.reset} Admin Dashboard: ${colors.yellow}http://localhost:5174${colors.reset}`);
    console.log('');

    console.log(`${colors.bright}💡 Tips:${colors.reset}`);
    console.log(`  ${colors.cyan}•${colors.reset} Before running services, ensure MySQL is running`);
    console.log(`  ${colors.cyan}•${colors.reset} Run database setup: ${colors.yellow}npm run setup:database${colors.reset}`);
    console.log(`  ${colors.cyan}•${colors.reset} Check node_modules size: ${colors.yellow}du -sh ./*/node_modules${colors.reset}`);
    console.log('');

    process.exit(0);
  } else {
    console.log(`${colors.bright}${colors.red}╔═══════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║              ❌ Installation Completed with Errors ❌           ║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}╚═══════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log('');

    console.log(`${colors.bright}Summary:${colors.reset}`);
    console.log(`  ${colors.green}✓ Successful: ${successCount}${colors.reset}`);
    console.log(`  ${colors.red}✗ Failed: ${failedProjects.length}${colors.reset}`);
    console.log('');

    if (failedProjects.length > 0) {
      console.log(`${colors.bright}Failed Projects:${colors.reset}`);
      failedProjects.forEach((name) => {
        console.log(`  ${colors.red}•${colors.reset} ${name}`);
      });
      console.log('');

      console.log(`${colors.bright}Troubleshooting:${colors.reset}`);
      console.log(`  ${colors.cyan}1.${colors.reset} Check your internet connection`);
      console.log(`  ${colors.cyan}2.${colors.reset} Try clearing npm cache: ${colors.yellow}npm cache clean --force${colors.reset}`);
      console.log(`  ${colors.cyan}3.${colors.reset} Delete node_modules and retry: ${colors.yellow}rm -rf ./*/node_modules${colors.reset}`);
      console.log(`  ${colors.cyan}4.${colors.reset} Check npm registry: ${colors.yellow}npm config get registry${colors.reset}`);
      console.log('');
    }

    process.exit(1);
  }
}

main().catch((error) => {
  log('error', error.message);
  process.exit(1);
});
