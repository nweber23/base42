#!/bin/bash

# Base42 Cross-Platform Setup Script
# This script handles the initial setup for different operating systems

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "🚀 Base42 Setup Script"
echo "====================="
echo -e "${NC}"

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
fi

echo "🖥️  Detected OS: $OS"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js on different systems
install_nodejs() {
    echo "📦 Installing Node.js..."
    
    case $OS in
        "linux")
            if command_exists apt-get; then
                # Ubuntu/Debian
                curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                sudo apt-get install -y nodejs
            elif command_exists yum; then
                # CentOS/RHEL
                curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
                sudo yum install -y nodejs
            elif command_exists pacman; then
                # Arch Linux
                sudo pacman -S nodejs npm
            else
                echo -e "${YELLOW}⚠️  Please install Node.js 20+ manually${NC}"
            fi
            ;;
        "macos")
            if command_exists brew; then
                brew install node@20
            else
                echo -e "${YELLOW}⚠️  Please install Homebrew first, then run: brew install node@20${NC}"
            fi
            ;;
        "windows")
            echo -e "${YELLOW}⚠️  Please install Node.js 20+ from https://nodejs.org${NC}"
            ;;
    esac
}

# Check Node.js version
echo "🔍 Checking Node.js..."
if command_exists node; then
    NODE_VERSION=$(node --version | sed 's/v//')
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
    
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo -e "${GREEN}✅ Node.js $NODE_VERSION is compatible${NC}"
    else
        echo -e "${RED}❌ Node.js $NODE_VERSION is too old. Need 18+${NC}"
        read -p "Install Node.js 20? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_nodejs
        fi
    fi
else
    echo -e "${RED}❌ Node.js not found${NC}"
    read -p "Install Node.js 20? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_nodejs
    fi
fi

# Check Docker
echo "🔍 Checking Docker..."
if command_exists docker; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
    
    # Check if Docker daemon is running
    if docker info >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker daemon is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Docker daemon is not running. Please start Docker Desktop.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Docker not found${NC}"
    case $OS in
        "linux")
            echo "Install Docker: https://docs.docker.com/engine/install/"
            ;;
        "macos")
            echo "Install Docker Desktop: https://docs.docker.com/docker-for-mac/install/"
            ;;
        "windows")
            echo "Install Docker Desktop: https://docs.docker.com/docker-for-windows/install/"
            ;;
    esac
fi

# Check Docker Compose
echo "🔍 Checking Docker Compose..."
if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker Compose is available${NC}"
else
    echo -e "${YELLOW}⚠️  Docker Compose not found${NC}"
    echo "Please install Docker Compose or update Docker Desktop"
fi

# Create backend .env if it doesn't exist
echo "📝 Setting up environment files..."
if [ ! -f "base42-backend/.env" ]; then
    echo "Creating base42-backend/.env from example..."
    cp base42-backend/.env.example base42-backend/.env
    echo -e "${YELLOW}⚠️  Please edit base42-backend/.env with your 42 API credentials${NC}"
else
    echo -e "${GREEN}✅ Backend .env file exists${NC}"
fi

# Create logs directory for backend
echo "📁 Creating directories..."
mkdir -p base42-backend/logs
mkdir -p base42-backend/init-db

echo -e "${GREEN}✅ Directories created${NC}"

# Install dependencies
echo "📦 Installing dependencies..."

if command_exists node; then
    echo "Installing frontend dependencies..."
    npm install
    
    echo "Installing backend dependencies..."
    cd base42-backend
    npm install
    cd ..
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping npm install - Node.js not available${NC}"
fi

# Set executable permissions on scripts (Unix-like systems only)
if [[ "$OS" != "windows" ]]; then
    echo "🔧 Setting script permissions..."
    chmod +x setup.sh
    # Create and set permissions for other scripts if they exist
    find . -name "*.sh" -type f -exec chmod +x {} \;
    echo -e "${GREEN}✅ Script permissions set${NC}"
fi

echo -e "${BLUE}"
echo "🎉 Setup Complete!"
echo "=================="
echo -e "${NC}"

echo "📋 Next steps:"
echo "1. Edit base42-backend/.env with your 42 API credentials"
echo "2. Get your credentials from: https://profile.intra.42.fr/oauth/applications"
echo "3. Run 'make dev' for development or 'make up' for production"
echo ""
echo "🔧 Available commands:"
echo "  make dev     - Start development environment"
echo "  make up      - Start production environment"
echo "  make health  - Run health check"
echo "  make logs    - View logs"
echo "  make clean   - Clean up Docker resources"
echo ""
echo "❓ Need help? Check README.md or run 'make health' to diagnose issues."