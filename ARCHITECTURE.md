# Tamil AI Assistant - Architecture Documentation

## System Overview

The Tamil AI Assistant is a full-stack web application built with modern technologies, designed to provide comprehensive AI-powered content creation tools for Tamil YouTube creators.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Chat UI      │  │ Content Gen  │  │ Voice Input  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ TTS Player   │  │ Admin Panel  │  │ Profile Mgmt │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                    tRPC API Gateway
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Server Layer (Node.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Chat Router  │  │ Content      │  │ Voice Router │      │
│  │              │  │ Router       │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ TTS Router   │  │ RAG Router   │  │ Admin Router │      │
│  │              │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Storage      │  │ Auth Service │                        │
│  │ Router       │  │              │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌──────▼──────┐  ┌───────▼────────┐
│   Database     │  │  LLM API    │  │  Storage (S3)  │
│  (MySQL/TiDB)  │  │ (Qwen2.5)   │  │  (Manus Forge) │
└────────────────┘  └─────────────┘  └────────────────┘
        │                  │                  │
┌───────▼────────┐  ┌──────▼──────┐  ┌───────▼────────┐
│ Schema:        │  │ Whisper API │  │ Audio Files    │
│ - Users        │  │ (ASR)       │  │ Generated      │
│ - Profiles     │  │             │  │ Content        │
│ - Chats        │  │ Indic-TTS   │  │ Datasets       │
│ - Content      │  │ (TTS)       │  │                │
│ - Analytics    │  │             │  │                │
│ - RAG Docs     │  │ FAISS       │  │                │
│ - Trends       │  │ (Embeddings)│  │                │
└────────────────┘  └─────────────┘  └────────────────┘
```

## Component Architecture

### Frontend Architecture

```
App.tsx (Root)
├── ThemeProvider (Dark theme)
├── TooltipProvider
├── Router
│   ├── Home (Landing/Dashboard)
│   ├── CreatorProfile (User settings)
│   ├── Chat (Conversation interface)
│   ├── ContentGenerator (Script, thumbnails, SEO)
│   ├── VoiceInput (Audio recording & transcription)
│   ├── AdminDashboard (System monitoring)
│   └── NotFound (404 page)
└── Toaster (Notifications)
```

### Backend Architecture

```
Server (Express + tRPC)
├── Authentication
│   ├── OAuth 2.0 (Manus)
│   ├── Session Management
│   └── Role-based Access Control
├── Routers
│   ├── Chat Router
│   │   ├── startConversation
│   │   ├── sendMessage
│   │   ├── getConversations
│   │   ├── getMessages
│   │   └── searchConversations
│   ├── Content Router
│   │   ├── generateScript
│   │   ├── generateThumbnailIdeas
│   │   ├── generateSEO
│   │   ├── analyzeTrends
│   │   └── generateAll
│   ├── Voice Router
│   │   ├── transcribe
│   │   ├── getRecordings
│   │   └── processCommand
│   ├── TTS Router
│   │   ├── generateSpeech
│   │   ├── generateScriptAudio
│   │   ├── getVoices
│   │   └── generateBulk
│   ├── RAG Router
│   │   ├── search
│   │   ├── generateResponse
│   │   ├── addDocument
│   │   └── initialize
│   ├── Admin Router
│   │   ├── getSystemStats
│   │   ├── getTopUsers
│   │   ├── getContentStats
│   │   ├── getUsageByFeature
│   │   └── getRecentActivity
│   ├── Storage Router
│   │   ├── uploadAudio
│   │   ├── uploadContent
│   │   ├── uploadProfileImage
│   │   ├── uploadDataset
│   │   ├── getDownloadUrl
│   │   └── generateKey
│   └── Creator Router
│       ├── getProfile
│       └── updateProfile
└── Services
    ├── Chat Service
    ├── Content Generator
    ├── Voice Service
    ├── TTS Service
    ├── RAG Service
    ├── Admin Service
    └── Storage Service
```

## Data Flow

### Chat Flow
```
User Input
    │
    ▼
Chat Component
    │
    ▼
tRPC: chat.sendMessage
    │
    ▼
Chat Service
    │
    ├─► Get Conversation History
    │
    ├─► Prepare System Prompt
    │
    ├─► Call LLM (Qwen2.5)
    │
    ├─► Store Message & Response
    │
    └─► Track Usage Analytics
    │
    ▼
Response to Client
    │
    ▼
Display in Chat UI
```

### Content Generation Flow
```
User Input (Topic)
    │
    ▼
ContentGenerator Component
    │
    ├─► Script Generation
    │   ├─► LLM Call
    │   ├─► Store in DB
    │   └─► Upload to S3
    │
    ├─► Thumbnail Ideas
    │   ├─► LLM Call
    │   ├─► Store in DB
    │   └─► Upload to S3
    │
    ├─► SEO Optimization
    │   ├─► LLM Call
    │   ├─► Store in DB
    │   └─► Upload to S3
    │
    └─► Trend Analysis
        ├─► RAG Search
        ├─► LLM Call
        ├─► Store in DB
        └─► Upload to S3
    │
    ▼
Display Results to User
```

### Voice Input Flow
```
User Records Audio
    │
    ▼
Audio Blob (Browser)
    │
    ▼
Convert to Base64
    │
    ▼
tRPC: voice.transcribe
    │
    ▼
Upload to S3
    │
    ▼
Call Whisper API (ASR)
    │
    ▼
Store Transcription
    │
    ▼
Process Voice Command (Optional)
    │
    ├─► Extract Intent
    │
    └─► Trigger Content Generation
    │
    ▼
Return Transcription & Results
```

### RAG Flow
```
User Query
    │
    ▼
Generate Query Embedding
    │
    ▼
Search Knowledge Base (FAISS)
    │
    ▼
Retrieve Top K Documents
    │
    ▼
Prepare Context
    │
    ▼
Call LLM with Context
    │
    ▼
Generate Response with Sources
    │
    ▼
Return to User
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  lastSignedIn TIMESTAMP DEFAULT NOW()
);
```

### Creator Profiles Table
```sql
CREATE TABLE creator_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  channel_name VARCHAR(255),
  channel_description TEXT,
  channel_url VARCHAR(512),
  content_category VARCHAR(100),
  preferred_language ENUM('tamil', 'tanglish', 'mixed') DEFAULT 'tamil',
  voice_preference VARCHAR(100),
  content_style TEXT,
  target_audience TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255),
  language ENUM('tamil', 'tanglish', 'mixed') DEFAULT 'tamil',
  messageCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  language ENUM('tamil', 'tanglish', 'mixed'),
  audioUrl VARCHAR(512),
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Generated Content Table
```sql
CREATE TABLE generated_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  conversation_id INT,
  content_type ENUM('script', 'thumbnail_ideas', 'seo_title', 'seo_description', 'trend_insight'),
  topic VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  language ENUM('tamil', 'tanglish', 'mixed') DEFAULT 'tamil',
  quality DECIMAL(3,2),
  file_url VARCHAR(512),
  metadata JSON,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
```

## API Communication

### tRPC Protocol
- **Type-safe**: Full TypeScript support for client and server
- **Automatic serialization**: SuperJSON handles Date, Map, Set, etc.
- **Real-time updates**: React Query integration for caching
- **Error handling**: Standardized error responses

### Request/Response Format
```typescript
// Request
{
  "0": {
    "json": {
      "topic": "Tamil Film Review",
      "language": "tamil"
    }
  }
}

// Response
{
  "result": {
    "data": {
      "script": "...",
      "success": true
    }
  }
}
```

## Authentication Flow

```
1. User clicks "Login"
   │
   ▼
2. Redirect to Manus OAuth Portal
   │
   ▼
3. User authenticates
   │
   ▼
4. OAuth callback to /api/oauth/callback
   │
   ▼
5. Exchange code for tokens
   │
   ▼
6. Create/update user in database
   │
   ▼
7. Set session cookie
   │
   ▼
8. Redirect to dashboard
   │
   ▼
9. User authenticated for all tRPC calls
```

## Performance Optimization

### Frontend Optimizations
- **Code splitting**: Route-based lazy loading
- **Image optimization**: Responsive images with lazy loading
- **Caching**: React Query with configurable stale time
- **Memoization**: useMemo for expensive computations
- **Debouncing**: Search and input debouncing

### Backend Optimizations
- **Database indexing**: Indexes on frequently queried fields
- **Query optimization**: Efficient Drizzle ORM queries
- **Response caching**: Cache LLM responses for identical queries
- **Connection pooling**: MySQL connection pool management
- **Batch operations**: Batch processing for bulk operations

### Infrastructure Optimizations
- **CDN**: Static assets served via CDN
- **Compression**: Gzip compression for API responses
- **Load balancing**: Distribute traffic across servers
- **Database replication**: Read replicas for scaling
- **Caching layer**: Redis for session and query caching

## Security Architecture

### Authentication
- OAuth 2.0 with Manus platform
- JWT tokens for session management
- Secure cookie handling with HttpOnly flag
- CSRF protection via SameSite cookies

### Authorization
- Role-based access control (RBAC)
- Admin-only endpoints protected
- User data isolation
- Resource ownership verification

### Data Protection
- Encrypted database connections (SSL/TLS)
- Secure file storage with presigned URLs
- Input validation with Zod schemas
- Output encoding to prevent XSS
- SQL injection prevention via ORM

### API Security
- tRPC type-safe contracts
- Rate limiting on endpoints
- Request validation
- Error message sanitization
- CORS configuration

## Scalability Considerations

### Horizontal Scaling
- Stateless server design
- Session storage in database
- Load balancer for traffic distribution
- Database connection pooling

### Vertical Scaling
- Optimize database queries
- Implement caching strategies
- Reduce API response times
- Optimize memory usage

### Database Scaling
- Read replicas for queries
- Write master for mutations
- Sharding for large datasets
- Archival of old data

## Monitoring & Logging

### Application Logs
- Server logs: `.manus-logs/devserver.log`
- Browser console: `.manus-logs/browserConsole.log`
- Network requests: `.manus-logs/networkRequests.log`
- Session replay: `.manus-logs/sessionReplay.log`

### Metrics
- Request latency
- Error rates
- Token usage
- User engagement
- Feature adoption
- Storage usage

## Deployment Architecture

### Development
- Local development server on port 3000
- Hot module reloading (HMR)
- Source maps for debugging

### Production
- Docker containerization
- Kubernetes orchestration (optional)
- Load balancer
- Database replication
- CDN for static assets
- Monitoring and alerting

## Future Enhancements

1. **Real-time Collaboration**
   - WebSocket support for live editing
   - Collaborative content creation

2. **Advanced Analytics**
   - Predictive analytics for trends
   - Content performance forecasting
   - Audience sentiment analysis

3. **Multi-language Support**
   - Expand to other Indian languages
   - Language-specific optimizations

4. **Mobile Applications**
   - React Native mobile apps
   - Offline support
   - Push notifications

5. **Integration Ecosystem**
   - YouTube API integration
   - Social media scheduling
   - Analytics dashboards

---

For more details, see [DEPLOYMENT.md](./DEPLOYMENT.md) and [README.md](./README.md)
