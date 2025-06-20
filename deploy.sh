#!/bin/bash

# OneGateway Website Deployment Script for aaPanel
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 Starting OneGateway Website Deployment..."

# Configuration
PROJECT_NAME="onegateway-website"
DOMAIN="onegateway.in"
PROJECT_PATH="/www/wwwroot/$DOMAIN"
NODE_VERSION="18"
PORT="3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. Consider using a non-root user for security."
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js $NODE_VERSION first."
    exit 1
fi

# Check Node.js version
NODE_CURRENT_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_CURRENT_VERSION" -lt "18" ]; then
    print_warning "Node.js version is $NODE_CURRENT_VERSION. Recommended version is 18 or higher."
fi

# Create project directory if it doesn't exist
if [ ! -d "$PROJECT_PATH" ]; then
    print_status "Creating project directory: $PROJECT_PATH"
    mkdir -p "$PROJECT_PATH"
    mkdir -p "$PROJECT_PATH/logs"
fi

# Navigate to project directory
cd "$PROJECT_PATH"

print_status "Current directory: $(pwd)"

# Install dependencies
print_status "Installing dependencies..."
if [ -f "package-lock.json" ]; then
    npm ci --production=false
else
    npm install
fi

# Build the project
print_status "Building the project..."
npm run build:production

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Build failed! dist directory not found."
    exit 1
fi

print_success "Build completed successfully!"

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2 globally..."
    npm install -g pm2
fi

# Stop existing PM2 process if running
if pm2 list | grep -q "$PROJECT_NAME"; then
    print_status "Stopping existing PM2 process..."
    pm2 stop "$PROJECT_NAME"
    pm2 delete "$PROJECT_NAME"
fi

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

print_success "Deployment completed successfully!"
print_status "Application is running on port $PORT"
print_status "You can check the status with: pm2 status"
print_status "View logs with: pm2 logs $PROJECT_NAME"

# Display final information
echo ""
echo "=================================================="
echo "🎉 OneGateway Website Deployed Successfully!"
echo "=================================================="
echo "Domain: https://$DOMAIN"
echo "Port: $PORT"
echo "Project Path: $PROJECT_PATH"
echo "PM2 Process: $PROJECT_NAME"
echo ""
echo "Useful Commands:"
echo "- Check status: pm2 status"
echo "- View logs: pm2 logs $PROJECT_NAME"
echo "- Restart: pm2 restart $PROJECT_NAME"
echo "- Stop: pm2 stop $PROJECT_NAME"
echo "=================================================="