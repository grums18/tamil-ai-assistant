# Tamil AI Assistant - Deployment Guide

## Overview

The Tamil AI Assistant is a comprehensive AI-powered platform for Tamil YouTube content creators. It provides chat interfaces, content generation tools, voice input/output, and advanced analytics.

## System Architecture

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack React Query + tRPC
- **Components**: shadcn/ui

### Backend
- **Runtime**: Node.js with Express 4
- **API**: tRPC 11 for type-safe RPC
- **Database**: MySQL/TiDB with Drizzle ORM
- **LLM**: Qwen2.5 (via Manus Forge API)
- **Storage**: S3-compatible (via Manus Forge API)

### AI/ML Components
- **Chat & Content Generation**: Qwen2.5 LLM
- **Speech-to-Text**: Whisper API (ASR)
- **Text-to-Speech**: Indic-TTS / Coqui TTS
- **Vector Search**: FAISS embeddings
- **RAG**: Knowledge base with semantic search

## Prerequisites

- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL 8.0+ or TiDB compatible database
- Manus platform account with API access

## Environment Variables

```bash
# Database
DATABASE_URL=mysql://user:password@host:3306/tamil_ai_assistant

# Authentication
JWT_SECRET=your-secret-key
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth

# Manus API
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge

# Application
VITE_APP_TITLE=Tamil AI Assistant
VITE_APP_LOGO=/logo.svg
VITE_APP_ID=your-app-id

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# Owner Info
OWNER_NAME=Admin
OWNER_OPEN_ID=admin-open-id
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tamil-ai-assistant
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database**
   ```bash
   pnpm db:push
   ```

5. **Build the project**
   ```bash
   pnpm build
   ```

## Development

### Start development server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Run tests
```bash
pnpm test
```

### Type checking
```bash
pnpm check
```

### Format code
```bash
pnpm format
```

## Production Deployment

### Build for production
```bash
pnpm build
```

### Start production server
```bash
pnpm start
```

### Docker deployment
```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start server
CMD ["pnpm", "start"]
```

## Database Schema

### Core Tables
- **users**: User authentication and profile
- **creatorProfiles**: Creator-specific settings
- **conversations**: Chat session management
- **messages**: Chat message storage
- **generatedContent**: Generated scripts, thumbnails, SEO content
- **ragDocuments**: Knowledge base with embeddings
- **trends**: Trend data and analytics
- **audioRecordings**: User audio uploads
- **usageAnalytics**: System usage tracking

## API Endpoints

### Chat
- `POST /api/trpc/chat.startConversation` - Start new conversation
- `POST /api/trpc/chat.sendMessage` - Send message and get response
- `GET /api/trpc/chat.getConversations` - Get conversation history
- `GET /api/trpc/chat.getMessages` - Get messages from conversation
- `POST /api/trpc/chat.searchConversations` - Search conversations

### Content Generation
- `POST /api/trpc/content.generateScript` - Generate video script
- `POST /api/trpc/content.generateThumbnailIdeas` - Generate thumbnail ideas
- `POST /api/trpc/content.generateSEO` - Generate SEO optimization
- `POST /api/trpc/content.analyzeTrends` - Analyze trends
- `POST /api/trpc/content.generateAll` - Generate all content

### Voice
- `POST /api/trpc/voice.transcribe` - Transcribe audio
- `GET /api/trpc/voice.getRecordings` - Get recording history
- `POST /api/trpc/voice.processCommand` - Process voice command

### Text-to-Speech
- `POST /api/trpc/tts.generateSpeech` - Generate speech
- `POST /api/trpc/tts.generateScriptAudio` - Generate script audio
- `GET /api/trpc/tts.getVoices` - Get available voices

### RAG
- `GET /api/trpc/rag.search` - Search knowledge base
- `POST /api/trpc/rag.generateResponse` - Generate RAG response
- `POST /api/trpc/rag.addDocument` - Add document to knowledge base

### Storage
- `POST /api/trpc/storage.uploadAudio` - Upload audio file
- `POST /api/trpc/storage.uploadContent` - Upload generated content
- `POST /api/trpc/storage.uploadProfileImage` - Upload profile image

### Admin
- `GET /api/trpc/admin.getSystemStats` - Get system statistics
- `GET /api/trpc/admin.getTopUsers` - Get top users
- `GET /api/trpc/admin.getContentStats` - Get content statistics
- `GET /api/trpc/admin.getUsageByFeature` - Get feature usage

## Performance Optimization

### Caching
- Database query results cached via React Query
- LLM responses cached for identical queries
- Audio files cached in browser storage

### Optimization Tips
- Use pagination for large result sets
- Batch content generation requests
- Enable compression for API responses
- Use CDN for static assets

## Security Considerations

1. **Authentication**: OAuth 2.0 via Manus platform
2. **Authorization**: Role-based access control (user/admin)
3. **Data Protection**: Encrypted database connections
4. **File Storage**: Secure S3 access with presigned URLs
5. **API Security**: tRPC with type-safe contracts
6. **Input Validation**: Zod schema validation on all inputs

## Monitoring

### Logs
- Server logs: `.manus-logs/devserver.log`
- Browser console: `.manus-logs/browserConsole.log`
- Network requests: `.manus-logs/networkRequests.log`
- Session replay: `.manus-logs/sessionReplay.log`

### Metrics to Monitor
- User growth and retention
- Content generation volume
- Average response times
- Error rates
- Feature adoption
- Storage usage

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
mysql -h <host> -u <user> -p <database>

# Check migration status
pnpm db:push --verbose
```

### API Errors
- Check environment variables are set correctly
- Verify Manus API credentials
- Check network connectivity
- Review error logs in `.manus-logs/`

### Performance Issues
- Monitor database query performance
- Check LLM API response times
- Verify storage bandwidth
- Review browser network tab

## Scaling

### Horizontal Scaling
- Use load balancer for multiple server instances
- Share database across instances
- Use Redis for session management
- Implement rate limiting

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database indexes
- Implement caching layer
- Use connection pooling

## Backup & Recovery

### Database Backup
```bash
# Backup database
mysqldump -h <host> -u <user> -p <database> > backup.sql

# Restore database
mysql -h <host> -u <user> -p <database> < backup.sql
```

### File Storage Backup
- S3 provides automatic replication
- Enable versioning for important files
- Regular backup to external storage

## Support & Maintenance

- Monitor system logs regularly
- Update dependencies monthly
- Review security patches
- Optimize database indexes quarterly
- Conduct performance audits
- Gather user feedback for improvements

## License

This project is proprietary and confidential.
