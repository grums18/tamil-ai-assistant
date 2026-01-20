# Tamil AI Assistant - Comprehensive Platform for Content Creators

A sophisticated AI-powered platform designed specifically for Tamil YouTube content creators, providing intelligent chat interfaces, content generation, voice capabilities, and advanced analytics.

## 🎯 Key Features

### 1. **Intelligent Chat Interface**
- Natural conversation in Tamil, Tanglish (Tamil-English code-switching), or mixed languages
- Qwen2.5 LLM integration for contextual responses
- Conversation history and management
- Search and filter conversations
- Real-time message streaming

### 2. **Content Generation Suite**
- **Script Generation**: Create 10-minute video narratives with structured format (intro, main content, conclusion, outro)
- **Thumbnail Ideas**: Generate 50 catchy, clickable text ideas with emojis
- **SEO Optimization**: Generate optimized titles, descriptions, tags, and hashtags for YouTube
- **Trend Analysis**: Analyze trending topics with relevance scoring and audience insights
- **Batch Generation**: Generate all content types simultaneously

### 3. **Voice Interface**
- **Speech-to-Text (ASR)**: Whisper API integration for accurate Tamil speech recognition
- **Hands-Free Input**: Record and transcribe Tamil audio directly
- **Voice Commands**: Parse voice input to trigger content generation
- **Recording Management**: Store and retrieve audio recordings
- **Language Detection**: Automatic detection of Tamil, Tanglish, English, or Mixed

### 4. **Text-to-Speech (TTS)**
- **Tamil Voice Synthesis**: Generate natural-sounding Tamil audio
- **Multiple Voices**: Female, Male, and Child voice options
- **Customization**: Adjustable speed (0.5x to 2.0x) and pitch
- **Content-Aware**: Different profiles for different content types
- **Batch Processing**: Generate multiple audio files simultaneously

### 5. **RAG Knowledge Base**
- **Vector Search**: Semantic search with FAISS embeddings
- **Grounded Responses**: LLM responses backed by knowledge base sources
- **Document Management**: Add and manage documents
- **Category Filtering**: Search by content category
- **Source Attribution**: Cite sources in generated responses

### 6. **Creator Profiles**
- **Personalization**: Save language preferences, voice preferences, content style
- **Channel Information**: Store YouTube channel details and metadata
- **Target Audience**: Define and track target audience segments
- **Content Style**: Customize AI responses to match creator's style
- **Profile Management**: Easy editing and updating of preferences

### 7. **Admin Dashboard**
- **System Monitoring**: Real-time system health and performance metrics
- **User Analytics**: Track top creators and their usage patterns
- **Content Analytics**: Analyze generated content by type and quality
- **Feature Usage**: Monitor which features are most popular
- **Activity Tracking**: Real-time feed of system operations
- **Visual Analytics**: Charts and graphs for data visualization

### 8. **Secure File Storage**
- **S3 Integration**: Secure cloud storage for uploads and generated content
- **Organized Structure**: Files organized by type, user, and content category
- **Unique Identifiers**: Nano IDs prevent file collisions
- **Multiple File Types**: Support for audio, images, text, and datasets
- **Presigned URLs**: Secure download links without exposing credentials

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui
- **Backend**: Node.js, Express 4, tRPC 11
- **Database**: MySQL/TiDB with Drizzle ORM
- **LLM**: Qwen2.5 (via Manus Forge API)
- **Storage**: S3-compatible (via Manus Forge API)
- **AI/ML**: Whisper (ASR), Indic-TTS (TTS), FAISS (Vector Search)

### Database Schema
- **users**: User authentication and profiles
- **creatorProfiles**: Creator-specific settings and preferences
- **conversations**: Chat session management
- **messages**: Chat message storage with language tracking
- **generatedContent**: Scripts, thumbnails, SEO, and trend content
- **ragDocuments**: Knowledge base with embeddings
- **trends**: Trend data and analytics
- **audioRecordings**: User audio uploads and transcriptions
- **usageAnalytics**: System usage tracking and metrics

## 🚀 Getting Started

### Prerequisites
- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL 8.0+ or TiDB compatible database
- Manus platform account

### Installation

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
   # Create .env file with required variables
   DATABASE_URL=mysql://user:password@host:3306/tamil_ai_assistant
   JWT_SECRET=your-secret-key
   BUILT_IN_FORGE_API_KEY=your-api-key
   # ... (see DEPLOYMENT.md for full list)
   ```

4. **Initialize database**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to access the application.

## 📖 Usage Guide

### For Content Creators

1. **Create Profile**
   - Set up your creator profile with channel information
   - Choose language preferences (Tamil, Tanglish, Mixed)
   - Define target audience and content style

2. **Chat with AI**
   - Navigate to Chat page
   - Start conversations in your preferred language
   - Get contextual advice for content creation
   - Search through conversation history

3. **Generate Content**
   - Go to Content Generator
   - Enter topic or keyword
   - Generate scripts, thumbnails, SEO optimization, or trends
   - Copy or download generated content

4. **Use Voice Input**
   - Click Voice Input page
   - Record audio in Tamil or Tanglish
   - Get instant transcription
   - Process voice commands for content generation

5. **Listen to Generated Content**
   - Use TTS player to hear scripts read aloud
   - Adjust voice and speed preferences
   - Download audio for further editing

### For Administrators

1. **Access Admin Dashboard**
   - Navigate to `/admin` (admin-only access)
   - View system statistics and metrics
   - Monitor user activity and feature usage
   - Analyze content generation patterns

2. **Monitor System Health**
   - Check total users and active creators
   - Review average response times
   - Track token usage and API performance
   - Monitor recent system activities

3. **Manage Datasets**
   - Upload training datasets
   - Manage knowledge base documents
   - Track dataset usage and performance

## 🔧 API Reference

All API endpoints are accessible via tRPC at `/api/trpc/`

### Chat API
```typescript
// Start new conversation
trpc.chat.startConversation.mutate({
  title: "Content Ideas",
  initialMessage: "Help me create Tamil content"
})

// Send message
trpc.chat.sendMessage.mutate({
  conversationId: 1,
  message: "How do I optimize for YouTube?",
  language: "tamil"
})

// Get conversations
trpc.chat.getConversations.useQuery({ limit: 10 })

// Search conversations
trpc.chat.searchConversations.useQuery({ query: "SEO" })
```

### Content Generation API
```typescript
// Generate script
trpc.content.generateScript.mutate({
  topic: "Tamil Film Review",
  language: "tamil"
})

// Generate thumbnail ideas
trpc.content.generateThumbnailIdeas.mutate({
  topic: "Cooking Tutorial"
})

// Generate all content
trpc.content.generateAll.mutate({
  topic: "Travel Vlog",
  language: "tanglish"
})
```

### Voice API
```typescript
// Transcribe audio
trpc.voice.transcribe.mutate({
  audioUrl: "https://...",
  language: "tamil"
})

// Get recordings
trpc.voice.getRecordings.useQuery({ limit: 20 })

// Process voice command
trpc.voice.processCommand.mutate({
  transcription: "Generate a script about cooking"
})
```

### TTS API
```typescript
// Generate speech
trpc.tts.generateSpeech.mutate({
  text: "வணக்கம்",
  voice: "tamil_female",
  speed: 1.0
})

// Get available voices
trpc.tts.getVoices.useQuery()
```

## 📊 Analytics & Monitoring

### Key Metrics
- **User Engagement**: Conversations per user, content generated
- **Feature Usage**: Most used features and operations
- **Performance**: Average response times, token usage
- **Content Quality**: Quality scores and engagement metrics
- **System Health**: Error rates, uptime, resource usage

### Accessing Analytics
- Admin Dashboard: `/admin` (admin-only)
- User Stats: Creator profile page
- Conversation Analytics: Chat page

## 🔐 Security

- **Authentication**: OAuth 2.0 via Manus platform
- **Authorization**: Role-based access control (user/admin)
- **Data Protection**: Encrypted database connections
- **File Storage**: Secure S3 access with presigned URLs
- **Input Validation**: Zod schema validation on all inputs
- **API Security**: tRPC with type-safe contracts

## 🧪 Testing

### Run Tests
```bash
pnpm test
```

### Run Type Checking
```bash
pnpm check
```

### Format Code
```bash
pnpm format
```

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide including:
- Production build and deployment
- Docker containerization
- Environment configuration
- Database setup
- Performance optimization
- Scaling strategies
- Backup and recovery

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Verify connection string
mysql -h <host> -u <user> -p <database>

# Re-run migrations
pnpm db:push
```

**API Errors**
- Check environment variables are set correctly
- Verify Manus API credentials
- Review error logs in `.manus-logs/`

**Performance Issues**
- Monitor database query performance
- Check LLM API response times
- Review browser network tab

## 📝 Project Structure

```
tamil-ai-assistant/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities and helpers
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── routers.ts         # tRPC router definitions
│   ├── db.ts              # Database helpers
│   ├── chat.ts            # Chat service
│   ├── content-generator.ts # Content generation
│   ├── voice-service.ts   # Voice/ASR service
│   ├── tts-service.ts     # Text-to-speech service
│   ├── rag-service.ts     # RAG knowledge base
│   ├── admin-service.ts   # Admin analytics
│   └── storage-service.ts # S3 storage
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

## 🤝 Contributing

This is a proprietary project. For issues or feature requests, please contact the development team.

## 📄 License

This project is proprietary and confidential.

## 🎓 Learning Resources

### Tamil Language Support
- Tamil Unicode: https://en.wikipedia.org/wiki/Tamil_script
- Code-switching (Tanglish): https://en.wikipedia.org/wiki/Tanglish

### AI/ML Technologies
- Qwen2.5 LLM: https://github.com/QwenLM/Qwen2.5
- Whisper ASR: https://github.com/openai/whisper
- FAISS Vector Search: https://github.com/facebookresearch/faiss

### Web Technologies
- React: https://react.dev
- tRPC: https://trpc.io
- Tailwind CSS: https://tailwindcss.com
- Drizzle ORM: https://orm.drizzle.team

## 📞 Support

For technical support or questions, please contact the development team or refer to the DEPLOYMENT.md guide.

---

**Built with ❤️ for Tamil content creators**
