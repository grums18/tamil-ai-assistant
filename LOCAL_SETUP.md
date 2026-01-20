# Tamil AI Assistant - Local Setup & Compilation Guide

## Overview

This guide provides step-by-step instructions to set up and run the Tamil AI Assistant project locally on your machine. The project is a full-stack TypeScript application with React frontend and Express backend.

## System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or pnpm 8.0.0+)
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB for dependencies and build artifacts

### Recommended Setup
- **Node.js**: 20.x LTS or 22.x
- **pnpm**: 10.x (faster than npm)
- **Git**: For version control
- **VS Code**: For development

## Prerequisites Installation

### 1. Install Node.js

#### Windows
1. Download from https://nodejs.org/
2. Choose LTS version (18.x or 20.x)
3. Run installer and follow prompts
4. Verify installation:
```bash
node --version
npm --version
```

#### macOS
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install pnpm (Optional but Recommended)

```bash
npm install -g pnpm
pnpm --version
```

### 3. Install Git

#### Windows
Download from https://git-scm.com/

#### macOS
```bash
brew install git
```

#### Linux
```bash
sudo apt-get install git
```

## Project Setup Steps

### Step 1: Extract Project

```bash
# Extract the zip file
unzip tamil-ai-assistant-source.zip

# Navigate to project directory
cd tamil-ai-assistant
```

### Step 2: Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# OR using npm
npm install
```

**Expected output**: Should complete without errors. First install may take 5-10 minutes.

### Step 3: Environment Configuration

Create a `.env.local` file in the project root:

```bash
# Database Configuration
DATABASE_URL="mysql://user:password@localhost:3306/tamil_ai_assistant"

# JWT Secret (generate a random string)
JWT_SECRET="your-random-secret-key-here-min-32-chars"

# OAuth Configuration (from Manus)
VITE_APP_ID="your-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# API Keys
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="your-api-key"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"

# Owner Information
OWNER_OPEN_ID="your-owner-id"
OWNER_NAME="Your Name"

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"

# Application Title
VITE_APP_TITLE="Tamil AI Assistant"
VITE_APP_LOGO="/logo.png"
```

### Step 4: Database Setup

#### Option A: Using MySQL Locally

```bash
# Install MySQL
# Windows: Download from https://dev.mysql.com/downloads/mysql/
# macOS: brew install mysql
# Linux: sudo apt-get install mysql-server

# Start MySQL service
# Windows: Services > MySQL80 > Start
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# Create database
mysql -u root -p
> CREATE DATABASE tamil_ai_assistant;
> EXIT;

# Update DATABASE_URL in .env.local
DATABASE_URL="mysql://root:password@localhost:3306/tamil_ai_assistant"
```

#### Option B: Using Docker

```bash
# Install Docker from https://www.docker.com/

# Run MySQL in Docker
docker run --name mysql-tamil \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=tamil_ai_assistant \
  -p 3306:3306 \
  -d mysql:8.0

# Update DATABASE_URL in .env.local
DATABASE_URL="mysql://root:password@localhost:3306/tamil_ai_assistant"
```

### Step 5: Run Database Migrations

```bash
# Generate and apply migrations
pnpm db:push

# Or using npm
npm run db:push
```

**Expected output**: 
```
✓ Database migrations applied successfully
✓ Schema synchronized
```

### Step 6: Build the Project

```bash
# TypeScript compilation check
pnpm check

# Build for production
pnpm build

# Or using npm
npm run build
```

**Expected output**: Should complete without errors and create `dist/` directory.

### Step 7: Start Development Server

```bash
# Start development server with hot reload
pnpm dev

# Or using npm
npm run dev
```

**Expected output**:
```
Server running on http://localhost:3000/
Vite client ready at http://localhost:3000/
```

### Step 8: Access the Application

1. Open browser and navigate to: `http://localhost:3000`
2. You should see the Tamil AI Assistant landing page
3. Click "Sign In" to authenticate
4. Start using the platform!

## Common Issues & Troubleshooting

### Issue: Node version mismatch
```bash
# Check your Node version
node --version

# Should be 18.0.0 or higher
# If not, install correct version using nvm (Node Version Manager)

# macOS/Linux:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Issue: pnpm not found
```bash
# Install pnpm globally
npm install -g pnpm

# Or use npm instead
npm install
npm run dev
```

### Issue: Database connection failed
```bash
# Verify MySQL is running
# Check DATABASE_URL in .env.local
# Ensure database exists:
mysql -u root -p -e "SHOW DATABASES;"

# If database doesn't exist:
mysql -u root -p -e "CREATE DATABASE tamil_ai_assistant;"
```

### Issue: Port 3000 already in use
```bash
# Find process using port 3000
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -i :3000

# Kill the process or use different port
PORT=3001 pnpm dev
```

### Issue: Build fails with TypeScript errors
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm check

# If still failing, check for syntax errors
pnpm format  # Auto-format code
```

### Issue: Dependencies installation fails
```bash
# Clear npm cache
pnpm store prune
# or
npm cache clean --force

# Reinstall
pnpm install
```

## Project Structure

```
tamil-ai-assistant/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities and helpers
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── public/            # Static assets
│   └── index.html         # HTML template
├── server/                # Express backend
│   ├── routers.ts         # tRPC routes
│   ├── db.ts              # Database helpers
│   ├── chat.ts            # Chat service
│   ├── content-generator.ts
│   ├── voice-service.ts
│   ├── rag-service.ts
│   ├── tts-service.ts
│   ├── scheduling-service.ts
│   └── _core/             # Framework core
├── drizzle/               # Database schema
│   └── schema.ts          # Table definitions
├── shared/                # Shared types
├── storage/               # S3 storage helpers
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite config
└── vitest.config.ts       # Test config
```

## Available Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm check            # TypeScript type checking
pnpm format           # Format code with Prettier

# Building
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:push          # Apply migrations
pnpm db:generate      # Generate migrations

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode

# Linting
pnpm lint             # Run linter (if configured)
```

## Development Workflow

### 1. Making Changes

```bash
# Edit files in client/src/ or server/
# Changes auto-reload in development mode
```

### 2. Adding Database Tables

```bash
# Edit drizzle/schema.ts
# Add new table definition

# Apply migration
pnpm db:push

# Update server/db.ts with helper functions
```

### 3. Adding New Features

```bash
# 1. Create service file: server/feature-service.ts
# 2. Create router file: server/feature-router.ts
# 3. Add router to server/routers.ts
# 4. Create UI component: client/src/pages/Feature.tsx
# 5. Add route to client/src/App.tsx
# 6. Test in browser at http://localhost:3000
```

### 4. Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/chat.test.ts

# Watch mode for development
pnpm test:watch
```

## Performance Optimization

### Development Tips
1. Use pnpm for faster installs
2. Keep node_modules clean: `pnpm prune`
3. Use TypeScript strict mode for better errors
4. Enable source maps for debugging

### Build Optimization
1. Run `pnpm build` to check bundle size
2. Use dynamic imports for large components
3. Optimize images before adding to public/
4. Remove unused dependencies: `pnpm remove package-name`

## Deployment Preparation

### Before Deploying

```bash
# 1. Run all tests
pnpm test

# 2. Type check
pnpm check

# 3. Build production bundle
pnpm build

# 4. Test production build locally
pnpm start

# 5. Check for console errors
# 6. Verify all features work
```

### Environment Variables for Production

```bash
NODE_ENV=production
DATABASE_URL="production-database-url"
JWT_SECRET="production-secret-key"
# ... other production values
```

## Getting Help

### Resources
- **Documentation**: See README.md, ARCHITECTURE.md, DEPLOYMENT.md
- **Issues**: Check GitHub issues or project documentation
- **Community**: Tamil AI Assistant community forums

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* pnpm dev

# Check dev server logs
# Look for errors in terminal output
```

## Next Steps

1. **Explore the codebase**: Start with `client/src/App.tsx`
2. **Try the features**: Chat, Script Generator, Voice Input
3. **Customize branding**: Update VITE_APP_TITLE and logo
4. **Add your API keys**: Configure external services
5. **Deploy**: Follow DEPLOYMENT.md for production setup

## Support

For issues or questions:
1. Check LOCAL_SETUP.md (this file)
2. Review README.md for feature overview
3. Check ARCHITECTURE.md for system design
4. Look at DEPLOYMENT.md for production setup
5. Review code comments and documentation

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Node Version**: 18.0.0+
**pnpm Version**: 8.0.0+
