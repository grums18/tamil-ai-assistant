# Tamil AI Assistant - Complete Local Setup Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Database Configuration](#database-configuration)
4. [Environment Setup](#environment-setup)
5. [YouTube Analytics Integration](#youtube-analytics-integration)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **Node.js**: v18.0.0 or higher
- **npm/pnpm**: v8.0.0 or higher (pnpm recommended)
- **MySQL/MariaDB**: v8.0 or higher (or use TiDB)
- **RAM**: 4GB minimum
- **Disk Space**: 2GB for dependencies and project files

### Recommended Setup
- **Node.js**: v20.x LTS
- **pnpm**: v10.x
- **MySQL**: v8.0.33+
- **RAM**: 8GB+
- **Disk Space**: 5GB+

---

## Installation Steps

### Step 1: Extract Project Files

```bash
# Extract the zip file
unzip tamil-ai-assistant-complete.zip
cd tamil-ai-assistant
```

### Step 2: Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# OR using npm
npm install

# OR using yarn
yarn install
```

**Note**: This may take 5-10 minutes depending on your internet connection.

### Step 3: Verify Installation

```bash
# Check Node.js version
node --version  # Should be v18.0.0 or higher

# Check pnpm version
pnpm --version  # Should be v8.0.0 or higher

# Verify TypeScript compilation
pnpm check
```

---

## Database Configuration

### Step 1: Create MySQL Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE tamil_ai_assistant;
CREATE USER 'tamil_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON tamil_ai_assistant.* TO 'tamil_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2: Configure Database Connection

Create a `.env` file in the project root:

```bash
# Database Configuration
DATABASE_URL="mysql://tamil_user:secure_password_here@localhost:3306/tamil_ai_assistant"

# JWT Secret (generate a random string)
JWT_SECRET="your-random-jwt-secret-key-min-32-chars"

# OAuth Configuration (from Manus)
VITE_APP_ID="your-manus-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im/oauth"

# API Keys
BUILT_IN_FORGE_API_KEY="your-forge-api-key"
BUILT_IN_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-forge-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"

# Owner Information
OWNER_NAME="Admin"
OWNER_OPEN_ID="your-open-id"

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"

# App Configuration
VITE_APP_TITLE="Tamil AI Assistant"
VITE_APP_LOGO="https://your-logo-url.png"
```

### Step 3: Run Database Migrations

```bash
# Push database schema
pnpm db:push

# Verify tables were created
mysql -u tamil_user -p tamil_ai_assistant -e "SHOW TABLES;"
```

---

## Environment Setup

### YouTube Analytics Integration

To enable YouTube Analytics features, you need YouTube API credentials:

#### Get YouTube API Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Create a new project: "Tamil AI Assistant"

2. **Enable YouTube Data API v3**
   - In the API library, search for "YouTube Data API v3"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/oauth/callback`
     - `http://localhost:3000/auth/youtube/callback`
     - `https://yourdomain.com/api/oauth/callback`

4. **Download Credentials**
   - Download the JSON file
   - Save as `youtube-credentials.json` in project root

5. **Add to .env**
```bash
YOUTUBE_API_KEY="your-youtube-api-key"
YOUTUBE_CLIENT_ID="your-client-id"
YOUTUBE_CLIENT_SECRET="your-client-secret"
YOUTUBE_REDIRECT_URI="http://localhost:3000/api/oauth/callback"
```

### Whisper API Setup (Voice-to-Text)

The platform uses Whisper API for Tamil speech recognition:

```bash
# Already configured through Manus platform
# No additional setup needed if using Manus Forge API
```

### TTS Setup (Text-to-Speech)

Tamil text-to-speech is pre-configured:

```bash
# Voice options available:
# - Tamil Female
# - Tamil Male
# - Tamil Child
# - Tanglish variants
# No additional setup required
```

---

## Running the Application

### Development Mode

```bash
# Start development server
pnpm dev

# Server will start at: http://localhost:3000
# Vite HMR will enable hot module replacement

# In another terminal, watch for TypeScript errors
pnpm check --watch
```

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Server will run on port 3000
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test server/chat.test.ts
```

---

## Accessing the Application

### Default URLs

| Feature | URL |
|---------|-----|
| Home Page | http://localhost:3000 |
| Chat Interface | http://localhost:3000/chat |
| Enhanced Chat | http://localhost:3000/chat-enhanced |
| Voice Input | http://localhost:3000/voice-input |
| Script Generator | http://localhost:3000/script-generator |
| YouTube Analytics | http://localhost:3000/youtube-analytics |
| Admin Dashboard | http://localhost:3000/admin |
| Content Scheduler | http://localhost:3000/scheduler |
| Creator Profile | http://localhost:3000/profile |

### First Login

1. Navigate to http://localhost:3000
2. Click "Login with Manus"
3. Authenticate with your Manus account
4. Creator profile will be auto-created
5. Start using the platform!

---

## YouTube Analytics Features

### Channel Metrics
- Subscriber count
- Total views
- Video count
- Average views per video
- Engagement rates

### Audience Demographics
- Age distribution
- Gender distribution
- Top countries
- Viewing patterns

### Content Recommendations
- Trending topics in your niche
- Optimal posting times
- Recommended content types
- Keyword suggestions

### Performance Analysis
- Channel performance score
- Strengths identification
- Improvement opportunities
- Action items

### How to Use

1. **Go to YouTube Analytics Page**
   - Navigate to: http://localhost:3000/youtube-analytics

2. **Connect Your Channel**
   - Enter your YouTube Channel ID
   - Format: `UCxxxxxxxxxxxxxx`
   - Click "Load Analytics"

3. **View Metrics**
   - Switch between tabs: Metrics, Demographics, Recommendations, Performance
   - Analyze your channel data
   - Get AI-powered insights

4. **Get Recommendations**
   - View optimal posting times by day
   - See suggested content types
   - Get keyword recommendations
   - Understand audience preferences

---

## Project Structure

```
tamil-ai-assistant/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities and hooks
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── _core/            # Core infrastructure
│   ├── routers.ts        # tRPC route definitions
│   ├── db.ts             # Database helpers
│   └── [services].ts     # Feature services
├── drizzle/              # Database schema
│   ├── schema.ts         # Table definitions
│   └── migrations/       # Migration files
├── shared/               # Shared types
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
└── README.md             # Documentation
```

---

## Environment Variables Reference

### Required Variables
```bash
DATABASE_URL              # MySQL connection string
JWT_SECRET               # Session signing secret
VITE_APP_ID              # Manus OAuth app ID
```

### Optional Variables
```bash
YOUTUBE_API_KEY          # YouTube Data API key
YOUTUBE_CLIENT_ID        # YouTube OAuth client ID
YOUTUBE_CLIENT_SECRET    # YouTube OAuth secret
NODE_ENV                 # development | production
PORT                     # Server port (default: 3000)
```

---

## Troubleshooting

### Issue: Database Connection Failed

**Solution:**
```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT 1;"

# Check DATABASE_URL format
# Should be: mysql://user:password@host:port/database

# Verify credentials
mysql -u tamil_user -p tamil_ai_assistant -e "SHOW TABLES;"
```

### Issue: Port 3000 Already in Use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 pnpm dev
```

### Issue: Dependencies Installation Fails

**Solution:**
```bash
# Clear pnpm cache
pnpm store prune

# Clear node_modules
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

### Issue: TypeScript Compilation Errors

**Solution:**
```bash
# Check TypeScript version
pnpm list typescript

# Rebuild TypeScript
pnpm check

# Clear cache and rebuild
rm -rf dist .next
pnpm build
```

### Issue: OAuth Login Not Working

**Solution:**
1. Verify VITE_APP_ID is correct
2. Check OAUTH_SERVER_URL is accessible
3. Ensure redirect URI matches in Manus settings
4. Clear browser cookies and try again

### Issue: YouTube Analytics Not Loading

**Solution:**
```bash
# Verify YouTube API key
echo $YOUTUBE_API_KEY

# Check if channel ID is valid
# Format should be: UCxxxxxxxxxxxxxx (starts with UC)

# Check browser console for errors
# Open DevTools (F12) → Console tab

# Verify API quotas in Google Cloud Console
```

### Issue: Voice Input Not Working

**Solution:**
```bash
# Verify microphone permissions
# Chrome: Settings → Privacy → Microphone

# Check browser console for errors
# Try a different browser

# Verify Whisper API is accessible
curl https://api.manus.im/v1/audio/transcriptions
```

---

## Performance Optimization

### Development Mode
```bash
# Enable faster compilation
pnpm dev

# TypeScript will compile on-demand
# Hot Module Replacement (HMR) enabled
```

### Production Mode
```bash
# Build optimized bundle
pnpm build

# Start production server
pnpm start

# Use process manager for stability
pm2 start "pnpm start" --name "tamil-ai"
```

### Database Optimization
```bash
# Add indexes for frequently queried fields
# Already included in schema.ts

# Monitor query performance
EXPLAIN SELECT * FROM conversations WHERE user_id = 1;
```

---

## Deployment

### Local Deployment
```bash
# Build production bundle
pnpm build

# Start server
pnpm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t tamil-ai-assistant .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e JWT_SECRET="..." \
  tamil-ai-assistant
```

### Cloud Deployment
See `DEPLOYMENT.md` for detailed cloud deployment instructions.

---

## Support & Resources

- **Documentation**: See README.md, ARCHITECTURE.md, DATA_CURATION.md
- **Issues**: Check troubleshooting section above
- **API Reference**: See server/routers.ts for all available endpoints
- **Database Schema**: See drizzle/schema.ts for table definitions

---

## Next Steps

1. ✅ Install and run locally
2. ✅ Connect YouTube channel for analytics
3. ✅ Create creator profile
4. ✅ Try chat interface
5. ✅ Generate scripts and content
6. ✅ Use voice input for hands-free interaction
7. ✅ Schedule content for posting
8. ✅ Monitor performance in admin dashboard

---

**Happy coding! 🎉**
