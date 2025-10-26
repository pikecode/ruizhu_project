#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directories
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NESTAPI_DIR="$SCRIPT_DIR/nestapi"
MINIPROGRAM_DIR="$SCRIPT_DIR/miniprogram"
ADMIN_DIR="$SCRIPT_DIR/admin"

# Function to print colored output
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

# Function to check if directory exists
check_dir() {
  if [ ! -d "$1" ]; then
    print_error "Directory not found: $1"
    exit 1
  fi
}

# Function to check if node_modules exists
check_dependencies() {
  local dir=$1
  local name=$2

  if [ ! -d "$dir/node_modules" ]; then
    print_warning "$name dependencies not installed. Run 'npm install' in $dir"
    read -p "Do you want to install dependencies now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      print_info "Installing dependencies for $name..."
      cd "$dir" && npm install
      if [ $? -eq 0 ]; then
        print_success "$name dependencies installed"
      else
        print_error "Failed to install $name dependencies"
        exit 1
      fi
    else
      print_error "$name dependencies not installed. Please run 'npm install' in $dir"
      exit 1
    fi
  fi
}

# Check all directories
print_info "Checking project directories..."
check_dir "$NESTAPI_DIR"
check_dir "$MINIPROGRAM_DIR"
check_dir "$ADMIN_DIR"
print_success "All project directories found"

# Check dependencies
print_info "Checking dependencies..."
check_dependencies "$NESTAPI_DIR" "NestAPI"
check_dependencies "$MINIPROGRAM_DIR" "MiniProgram"
check_dependencies "$ADMIN_DIR" "Admin"
print_success "All dependencies ready"

# Clear screen
clear

# Print startup banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║          🚀 Ruizhu E-Commerce Platform - Dev Server 🚀        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to start a service
start_service() {
  local name=$1
  local dir=$2
  local port=$3
  local cmd=$4

  print_info "Starting $name on port $port..."

  # Start in background with logs
  cd "$dir"
  eval "$cmd" > "/tmp/${name}.log" 2>&1 &

  local pid=$!
  sleep 2

  if ps -p $pid > /dev/null; then
    print_success "$name started successfully (PID: $pid)"
    echo -e "${YELLOW}  📍 URL: $5${NC}"
  else
    print_error "$name failed to start"
    cat "/tmp/${name}.log"
    exit 1
  fi
}

# Start all services
print_info "Starting all services..."
echo ""

# Start NestAPI Backend (Port 3000)
start_service "NestAPI Backend" "$NESTAPI_DIR" "3000" "npm run start:dev" "http://localhost:3000"

# Start Mini Program (Port 5173)
start_service "Mini Program (UniApp)" "$MINIPROGRAM_DIR" "5173" "npm run dev:h5" "http://localhost:5173"

# Start Admin Dashboard (Port 5174 - adjusted port)
start_service "Admin Dashboard" "$ADMIN_DIR" "5174" "npm run dev" "http://localhost:5173"

# Print summary
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  ✅ All Services Started ✅                     ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Available Services:${NC}"
echo -e "  ${YELLOW}🔷 Backend API${NC}         → http://localhost:3000"
echo -e "     API Documentation: http://localhost:3000/api"
echo ""
echo -e "  ${YELLOW}📱 Mini Program${NC}        → http://localhost:5173"
echo -e "     Platform: H5 (Web) - For development and testing"
echo ""
echo -e "  ${YELLOW}⚙️  Admin Dashboard${NC}     → http://localhost:5173"
echo -e "     Management Panel: http://localhost:5173"
echo ""
echo -e "${BLUE}Log Files:${NC}"
echo -e "  ${YELLOW}NestAPI Backend${NC}  → /tmp/NestAPI\ Backend.log"
echo -e "  ${YELLOW}Mini Program${NC}     → /tmp/Mini\ Program\ \(UniApp\).log"
echo -e "  ${YELLOW}Admin Dashboard${NC}  → /tmp/Admin\ Dashboard.log"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "  • Press Ctrl+C to stop all services"
echo -e "  • Check logs: tail -f /tmp/<service>.log"
echo -e "  • Database: Make sure MySQL is running on port 3306"
echo ""

# Handle cleanup on exit
cleanup() {
  echo ""
  print_warning "Stopping all services..."
  pkill -f "npm run start:dev"
  pkill -f "npm run dev"
  print_success "All services stopped"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
