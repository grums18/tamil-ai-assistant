# YouTube Analytics & Collaboration Features - Setup Guide

## Overview

This document provides comprehensive setup instructions for the YouTube Analytics API integration and Creator Collaboration Tools features added to the Tamil AI Assistant platform.

## Table of Contents

1. [YouTube Analytics Integration](#youtube-analytics-integration)
2. [Creator Collaboration Tools](#creator-collaboration-tools)
3. [API Endpoints](#api-endpoints)
4. [Local Setup](#local-setup)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

---

## YouTube Analytics Integration

### Features

The YouTube Analytics integration provides creators with:

- **Real-time Channel Metrics** - Views, likes, comments, shares, watch time
- **Audience Demographics** - Age groups, gender distribution, geographic location
- **Traffic Source Analysis** - Understanding where viewers come from
- **Top Performing Videos** - Identify best-performing content
- **AI-Powered Recommendations** - Personalized content strategy suggestions
- **Optimal Posting Times** - Data-driven posting schedule recommendations
- **Engagement Rate Calculation** - Track audience interaction levels

### Prerequisites

1. **Google Cloud Project Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the following APIs:
     - YouTube Data API v3
     - YouTube Analytics API

2. **OAuth 2.0 Credentials**
   - Create OAuth 2.0 credentials (Web application)
   - Authorized JavaScript origins: `http://localhost:3000`, `https://yourdomain.com`
   - Authorized redirect URIs: `http://localhost:3000/auth/youtube/callback`, `https://yourdomain.com/auth/youtube/callback`
   - Download credentials JSON file

3. **Environment Variables**
   ```bash
   YOUTUBE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   YOUTUBE_CLIENT_SECRET=your-client-secret
   YOUTUBE_REDIRECT_URI=http://localhost:3000/auth/youtube/callback
   ```

### Implementation Steps

#### Step 1: Store YouTube Credentials

Update `.env.local`:

```bash
# YouTube OAuth
YOUTUBE_CLIENT_ID="your-client-id"
YOUTUBE_CLIENT_SECRET="your-client-secret"
YOUTUBE_REDIRECT_URI="http://localhost:3000/auth/youtube/callback"
```

#### Step 2: Create YouTube OAuth Flow

Create `server/youtube-oauth.ts`:

```typescript
import axios from "axios";

const YOUTUBE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const YOUTUBE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export async function getYouTubeAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.YOUTUBE_CLIENT_ID!,
    redirect_uri: process.env.YOUTUBE_REDIRECT_URI!,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly",
    access_type: "offline",
    prompt: "consent",
  });

  return `${YOUTUBE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string) {
  const response = await axios.post(YOUTUBE_TOKEN_URL, {
    client_id: process.env.YOUTUBE_CLIENT_ID,
    client_secret: process.env.YOUTUBE_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: process.env.YOUTUBE_REDIRECT_URI,
  });

  return response.data;
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await axios.post(YOUTUBE_TOKEN_URL, {
    client_id: process.env.YOUTUBE_CLIENT_ID,
    client_secret: process.env.YOUTUBE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  return response.data;
}
```

#### Step 3: Add YouTube Analytics Endpoints

The `youtubeAnalyticsRouter` provides these endpoints:

```typescript
// Get comprehensive analytics report
POST /api/trpc/youtubeAnalytics.getAnalytics
{
  "channelId": "UC...",
  "accessToken": "ya29..."
}

// Get optimal posting times
GET /api/trpc/youtubeAnalytics.getOptimalPostingTimes
{
  "channelId": "UC..."
}

// Get engagement metrics
GET /api/trpc/youtubeAnalytics.getEngagementMetrics
{
  "channelId": "UC..."
}
```

#### Step 4: Create Analytics Dashboard UI

Create `client/src/pages/YouTubeAnalytics.tsx`:

```typescript
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function YouTubeAnalytics() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = trpc.youtubeAnalytics.getAnalytics.useMutation();

  if (isLoading) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">YouTube Analytics</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Views</div>
          <div className="text-2xl font-bold">{analytics?.data.metrics.views.toLocaleString()}</div>
        </Card>
        {/* More metric cards */}
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">AI Recommendations</h2>
        <div className="space-y-3">
          {analytics?.data.recommendations.map((rec, i) => (
            <div key={i} className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold">{rec.category}</h3>
              <p className="text-sm text-gray-600">{rec.recommendation}</p>
              <div className="text-xs mt-2">
                {rec.actionItems.map((item, j) => (
                  <div key={j}>• {item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

---

## Creator Collaboration Tools

### Features

The collaboration system enables:

- **Shared Projects** - Create team workspaces for content creation
- **Real-time Document Editing** - Multiple creators editing simultaneously
- **Version Control** - Track all changes with full history
- **Comments & Annotations** - Line-by-line feedback on scripts
- **Role-Based Permissions** - Owner, Editor, Viewer, Commenter roles
- **Activity Feed** - See all team member actions
- **Document Locking** - Prevent conflicts during editing
- **Export Options** - Download as PDF, DOCX, or Markdown

### Database Schema

The collaboration system uses these tables:

```sql
-- Collaboration Projects
CREATE TABLE collaboration_projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  creator_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('active', 'archived', 'completed') DEFAULT 'active',
  visibility ENUM('private', 'team', 'public') DEFAULT 'private',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Project Members
CREATE TABLE project_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner', 'editor', 'viewer', 'commenter') DEFAULT 'editor',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  permissions JSON
);

-- Shared Documents
CREATE TABLE shared_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  document_type ENUM('script', 'outline', 'notes', 'brainstorm') NOT NULL,
  content LONGTEXT NOT NULL,
  language ENUM('tamil', 'tanglish', 'mixed') DEFAULT 'tamil',
  current_version INT DEFAULT 1,
  last_edited_by INT,
  last_edited_at TIMESTAMP,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Document Comments
CREATE TABLE document_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  document_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  line_number INT,
  char_offset INT,
  resolved BOOLEAN DEFAULT FALSE,
  replies JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Document Versions
CREATE TABLE document_versions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  document_id INT NOT NULL,
  version INT NOT NULL,
  content LONGTEXT NOT NULL,
  edited_by INT NOT NULL,
  changes_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collaboration Activity Log
CREATE TABLE collaboration_activity (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  activity_type ENUM(...) NOT NULL,
  target_id INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Implementation Steps

#### Step 1: Create Collaboration Project UI

Create `client/src/pages/Collaboration.tsx`:

```typescript
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Collaboration() {
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const createProjectMutation = trpc.collaboration.createProject.useMutation();

  const handleCreateProject = async () => {
    await createProjectMutation.mutateAsync({
      title: projectTitle,
      description: projectDescription,
      visibility: "private",
    });
    setProjectTitle("");
    setProjectDescription("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Collaboration Projects</h1>

      {/* Create Project Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <div className="space-y-4">
          <Input
            placeholder="Project Title"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
          />
          <Textarea
            placeholder="Project Description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
          <Button onClick={handleCreateProject}>Create Project</Button>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project cards */}
      </div>
    </div>
  );
}
```

#### Step 2: Implement Shared Document Editor

Create `client/src/components/SharedDocumentEditor.tsx`:

```typescript
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function SharedDocumentEditor({ documentId }: { documentId: number }) {
  const [content, setContent] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  const updateDocMutation = trpc.collaboration.updateDocument.useMutation();
  const lockMutation = trpc.collaboration.lockDocument.useMutation();
  const unlockMutation = trpc.collaboration.unlockDocument.useMutation();

  const handleSave = async () => {
    await updateDocMutation.mutateAsync({
      documentId,
      content,
      changesSummary: "Updated content",
    });
  };

  const handleLock = async () => {
    await lockMutation.mutateAsync({ documentId });
    setIsLocked(true);
  };

  const handleUnlock = async () => {
    await unlockMutation.mutateAsync({ documentId });
    setIsLocked(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isLocked}>
          Save
        </Button>
        {!isLocked ? (
          <Button onClick={handleLock} variant="outline">
            Lock for Editing
          </Button>
        ) : (
          <Button onClick={handleUnlock} variant="outline">
            Unlock
          </Button>
        )}
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isLocked}
        className="min-h-96"
        placeholder="Start typing..."
      />
    </div>
  );
}
```

#### Step 3: Add Collaboration Routes

Update `client/src/App.tsx`:

```typescript
import YouTubeAnalytics from "./pages/YouTubeAnalytics";
import Collaboration from "./pages/Collaboration";

function Router() {
  return (
    <Switch>
      {/* ... existing routes ... */}
      <Route path="/youtube-analytics" component={YouTubeAnalytics} />
      <Route path="/collaboration" component={Collaboration} />
    </Switch>
  );
}
```

---

## API Endpoints

### YouTube Analytics Endpoints

```
POST /api/trpc/youtubeAnalytics.getAnalytics
  Input: { channelId: string, accessToken: string }
  Output: { metrics, demographics, recommendations, optimalPostingTimes }

GET /api/trpc/youtubeAnalytics.getOptimalPostingTimes
  Input: { channelId: string }
  Output: { optimalTimes: string[], recommendation: string }

GET /api/trpc/youtubeAnalytics.getEngagementMetrics
  Input: { channelId: string }
  Output: { metrics, engagementRate, insights }
```

### Collaboration Endpoints

```
POST /api/trpc/collaboration.createProject
  Input: { title, description?, visibility? }
  Output: { project }

POST /api/trpc/collaboration.addMember
  Input: { projectId, userId, userName, role? }
  Output: { member }

POST /api/trpc/collaboration.createDocument
  Input: { projectId, title, documentType, content?, language? }
  Output: { document }

POST /api/trpc/collaboration.updateDocument
  Input: { documentId, content, changesSummary? }
  Output: { document, version }

POST /api/trpc/collaboration.lockDocument
  Input: { documentId }
  Output: { document, message }

POST /api/trpc/collaboration.unlockDocument
  Input: { documentId }
  Output: { document, message }

POST /api/trpc/collaboration.addComment
  Input: { documentId, content, lineNumber?, charOffset? }
  Output: { comment }

POST /api/trpc/collaboration.replyToComment
  Input: { commentId, content }
  Output: { comment }

POST /api/trpc/collaboration.resolveComment
  Input: { commentId }
  Output: { comment, message }

GET /api/trpc/collaboration.getDocumentHistory
  Input: { documentId }
  Output: { versions }

GET /api/trpc/collaboration.getProjectActivity
  Input: { projectId, limit? }
  Output: { activities }

GET /api/trpc/collaboration.getActiveCollaborators
  Input: { projectId }
  Output: { collaborators }

POST /api/trpc/collaboration.exportProject
  Input: { projectId, format? }
  Output: { filename, content, mimeType }
```

---

## Local Setup

### Step 1: Install Dependencies

```bash
cd tamil-ai-assistant
pnpm install
```

### Step 2: Configure Environment

Create `.env.local`:

```bash
# YouTube OAuth
YOUTUBE_CLIENT_ID="your-client-id"
YOUTUBE_CLIENT_SECRET="your-client-secret"
YOUTUBE_REDIRECT_URI="http://localhost:3000/auth/youtube/callback"

# Database
DATABASE_URL="mysql://root:password@localhost:3306/tamil_ai_assistant"

# Other existing variables...
```

### Step 3: Run Migrations

```bash
pnpm db:push
```

### Step 4: Start Development Server

```bash
pnpm dev
```

### Step 5: Test Features

1. Navigate to `http://localhost:3000/youtube-analytics`
2. Navigate to `http://localhost:3000/collaboration`
3. Create a test project and document
4. Test real-time editing and comments

---

## Deployment

### Production Deployment

1. **Update Environment Variables**
   - Set `YOUTUBE_REDIRECT_URI` to production domain
   - Update all API endpoints

2. **Build for Production**
   ```bash
   pnpm build
   ```

3. **Deploy to Server**
   ```bash
   npm start
   ```

4. **Configure YouTube OAuth**
   - Add production domain to Google Cloud Console
   - Update authorized URIs

---

## Troubleshooting

### Issue: YouTube OAuth Not Working

**Solution:**
1. Verify `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` are correct
2. Check redirect URI matches exactly in Google Cloud Console
3. Ensure YouTube Data API is enabled in Google Cloud Console

### Issue: Real-time Collaboration Not Syncing

**Solution:**
1. Check WebSocket connection in browser console
2. Verify database is storing updates correctly
3. Check for network latency issues

### Issue: Document Locking Conflicts

**Solution:**
1. Implement automatic unlock timeout (15 minutes)
2. Add conflict resolution UI
3. Notify users when document is locked

### Issue: Performance Issues with Large Documents

**Solution:**
1. Implement pagination for document history
2. Use debouncing for auto-save
3. Optimize database queries with indexes

---

## Best Practices

1. **Always lock documents before editing** to prevent conflicts
2. **Use meaningful change summaries** for version tracking
3. **Resolve comments promptly** to keep discussions organized
4. **Export projects regularly** for backup
5. **Monitor activity feed** for team coordination
6. **Set appropriate permissions** for each team member

---

## Support & Resources

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [YouTube Analytics API Documentation](https://developers.google.com/youtube/analytics)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**Last Updated**: January 2026
**Version**: 1.0.0
