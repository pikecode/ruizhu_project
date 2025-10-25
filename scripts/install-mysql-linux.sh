#!/bin/bash

# Ruizhu MySQL Installation Script for Linux
# Supports: Ubuntu, Debian, CentOS, RHEL, Fedora

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
  print_error "This script must be run as root (use sudo)"
  exit 1
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         MySQL Installation for Ruizhu Project (Linux)        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Detect OS
print_info "Detecting Linux distribution..."
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
  VERSION=$VERSION_ID
else
  print_error "Cannot detect Linux distribution"
  exit 1
fi

print_success "Detected: $OS $VERSION"
echo ""

# Check if MySQL is already installed
print_info "Checking if MySQL is already installed..."
if command -v mysql &> /dev/null; then
  print_warning "MySQL is already installed"
  mysql --version
  read -p "Do you want to continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
fi

echo ""

# Install based on distribution
case "$OS" in
  ubuntu|debian)
    print_info "Installing MySQL on Debian/Ubuntu..."
    apt-get update
    print_info "Installing MySQL server..."
    apt-get install -y mysql-server
    ;;
  centos|rhel|fedora)
    print_info "Installing MySQL on CentOS/RHEL/Fedora..."
    yum install -y mysql-server
    ;;
  *)
    print_error "Unsupported Linux distribution: $OS"
    exit 1
    ;;
esac

if [ $? -eq 0 ]; then
  print_success "MySQL installed successfully"
  mysql --version
else
  print_error "Failed to install MySQL"
  exit 1
fi

echo ""

# Start MySQL service
print_info "Starting MySQL service..."
systemctl start mysql

# Wait a moment for service to start
sleep 2

# Check if service started
if systemctl is-active --quiet mysql; then
  print_success "MySQL service started successfully"
else
  print_warning "MySQL service may not be running"
  systemctl status mysql
fi

echo ""

# Enable MySQL on boot
print_info "Enabling MySQL to start on boot..."
systemctl enable mysql
print_success "MySQL will start automatically on boot"

echo ""

# Run secure installation
print_info "Running MySQL secure installation..."
echo ""
print_warning "You will be prompted to:"
echo "  1. Enter root password (press Enter if no password set)"
echo "  2. Set a new root password (recommended)"
echo "  3. Remove anonymous users"
echo "  4. Disable root remote login"
echo "  5. Remove test database"
echo ""
read -p "Press Enter to continue..."

mysql_secure_installation

echo ""

# Test connection
print_info "Testing MySQL connection..."
if mysql -u root -p -e "SELECT VERSION();" 2>/dev/null > /dev/null; then
  print_success "MySQL connection successful"
else
  print_warning "Could not test connection. This may be normal if password is set."
fi

echo ""

# Create Ruizhu database
print_info "Creating Ruizhu database..."
read -s -p "Enter MySQL root password (press Enter if empty): " PASSWORD
echo ""

if [ -z "$PASSWORD" ]; then
  mysql -u root -e "CREATE DATABASE IF NOT EXISTS ruizhu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  mysql -u root -e "SHOW DATABASES;" | grep ruizhu
else
  mysql -u root -p"$PASSWORD" -e "CREATE DATABASE IF NOT EXISTS ruizhu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  mysql -u root -p"$PASSWORD" -e "SHOW DATABASES;" | grep ruizhu
fi

if [ $? -eq 0 ]; then
  print_success "Ruizhu database created successfully"
else
  print_error "Failed to create database"
  exit 1
fi

echo ""

# Display configuration
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              MySQL Installation Complete ✅                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}MySQL Configuration:${NC}"
echo "  Host: localhost"
echo "  Port: 3306"
echo "  Username: root"
echo "  Database: ruizhu"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  Start MySQL:    sudo systemctl start mysql"
echo "  Stop MySQL:     sudo systemctl stop mysql"
echo "  Restart MySQL:  sudo systemctl restart mysql"
echo "  Check status:   sudo systemctl status mysql"
echo "  Connect:        mysql -u root -p"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Update nestapi/.env with database credentials"
echo "  2. Run: npm install && npm run start:dev (in nestapi directory)"
echo "  3. Run: ./start.sh (in project root to start all services)"
echo ""
print_success "MySQL setup complete!"
