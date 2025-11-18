#!/bin/bash

# Simple Task Tracker Deployment Script
# This script handles the complete deployment process for production

set -e  # Exit on any error

echo "🚀 Starting Simple Task Tracker Deployment..."

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check environment variables
print_status "Checking environment variables..."

if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found. Please create it first."
    exit 1
fi

# Load production environment
source .env.production

# Verify required environment variables
required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Environment variable $var is not set in .env.production"
        exit 1
    fi
done

print_success "Environment variables verified"

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false

# Run type checking
print_status "Running TypeScript type check..."
npm run type-check

# Run linting
print_status "Running ESLint..."
npm run lint

# Build the application
print_status "Building for production..."
npm run build:production

# Check if build was successful
if [ ! -d ".next" ]; then
    print_error "Build failed - .next directory not found"
    exit 1
fi

print_success "Build completed successfully"

# Deploy to Vercel (if Vercel CLI is installed)
if command -v vercel &> /dev/null; then
    print_status "Deploying to Vercel..."
    vercel --prod
    print_success "Deployment to Vercel completed"
else
    print_warning "Vercel CLI not found. Please install it with: npm i -g vercel"
    print_status "You can deploy manually by uploading the .next directory"
fi

# Cleanup
print_status "Cleaning up..."
rm -rf .next

print_success "Deployment process completed! 🎉"
print_status "Don't forget to:"
echo "  1. Update your DNS if needed"
echo "  2. Monitor the application in production"
echo "  3. Set up analytics and error tracking"
echo "  4. Test all functionality in production"