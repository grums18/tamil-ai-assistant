# Content Scheduling & Batch Publishing Guide

## Overview

The Content Scheduler feature enables Tamil YouTube creators to schedule content for batch publishing across multiple platforms (YouTube, Instagram, TikTok, Twitter/X). This automation streamlines content distribution and helps creators maintain consistent posting schedules.

## Features

### 1. Calendar-Based Scheduling
- Visual calendar interface showing scheduled content
- Easy date selection for scheduling
- Overview of all upcoming publications
- Quick access to scheduled content details

### 2. Multi-Platform Publishing
Publish content simultaneously to:
- **YouTube** - Full video uploads with metadata
- **Instagram** - Reels and carousel posts
- **TikTok** - Short-form video content
- **Twitter/X** - Text posts with media

### 3. Content Types
- **Video** - Full-length YouTube videos (10+ minutes)
- **Short** - Short-form content (under 1 minute)
- **Post** - Text-based posts with images
- **Reel** - Instagram/TikTok reels (15-60 seconds)

### 4. Language Support
- Tamil - Native Tamil content
- Tanglish - Tamil written in English
- Mixed - Combination of Tamil and English

## Database Schema

### Scheduled Content Table
Stores all scheduled content with metadata:
```sql
CREATE TABLE scheduled_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  content_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  content_type ENUM('video', 'short', 'post', 'reel'),
  language ENUM('tamil', 'tanglish', 'mixed'),
  platforms JSON,  -- ["youtube", "instagram", "tiktok", "twitter"]
  scheduled_at TIMESTAMP NOT NULL,
  status ENUM('draft', 'scheduled', 'published', 'failed', 'cancelled'),
  video_url VARCHAR(512),
  thumbnail_url VARCHAR(512),
  tags JSON,
  hashtags JSON,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  INDEX (user_id),
  INDEX (status),
  INDEX (scheduled_at)
);
```

### Publishing Jobs Table
Tracks individual platform publishing attempts:
```sql
CREATE TABLE publishing_jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  scheduled_content_id INT NOT NULL,
  user_id INT NOT NULL,
  platform ENUM('youtube', 'instagram', 'tiktok', 'twitter'),
  status ENUM('pending', 'processing', 'success', 'failed', 'retrying'),
  platform_job_id VARCHAR(255),
  platform_url VARCHAR(512),
  error_message TEXT,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  INDEX (scheduled_content_id),
  INDEX (user_id),
  INDEX (status),
  INDEX (platform)
);
```

### Social Media Integrations Table
Stores API credentials for connected platforms:
```sql
CREATE TABLE social_media_integrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  youtube_access_token TEXT,
  youtube_refresh_token TEXT,
  youtube_channel_id VARCHAR(255),
  instagram_access_token TEXT,
  instagram_business_account_id VARCHAR(255),
  tiktok_access_token TEXT,
  tiktok_user_id VARCHAR(255),
  twitter_access_token TEXT,
  twitter_access_token_secret TEXT,
  twitter_user_id VARCHAR(255),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (user_id)
);
```

## API Endpoints

### Schedule Content
```typescript
POST /api/trpc/scheduling.scheduleContent

Request:
{
  title: string,
  description?: string,
  content: string,
  contentType: "video" | "short" | "post" | "reel",
  platforms: ("youtube" | "instagram" | "tiktok" | "twitter")[],
  scheduledAt: ISO 8601 datetime,
  language?: "tamil" | "tanglish" | "mixed",
  videoUrl?: string,
  thumbnailUrl?: string,
  tags?: string[],
  hashtags?: string[]
}

Response:
{
  success: boolean,
  contentId: number,
  jobs: {
    jobId: number,
    platform: string,
    status: "pending" | "success" | "failed",
    platformUrl?: string,
    errorMessage?: string
  }[]
}
```

### Get Scheduled Content
```typescript
GET /api/trpc/scheduling.getScheduled?limit=50&offset=0

Response:
{
  success: boolean,
  content: ScheduledContent[]
}
```

### Cancel Scheduled Content
```typescript
POST /api/trpc/scheduling.cancelSchedule

Request:
{
  contentId: number
}

Response:
{
  success: boolean,
  message: string
}
```

### Get Job Status
```typescript
GET /api/trpc/scheduling.getJobStatus?jobId=123

Response:
{
  success: boolean,
  job: PublishingJob
}
```

### Process Pending Jobs (Admin Only)
```typescript
POST /api/trpc/scheduling.processPendingJobs

Response:
{
  success: boolean,
  processed: number
}
```

## Frontend Usage

### ContentScheduler Component
Access the scheduler at `/scheduler` route:

```tsx
import ContentScheduler from "@/pages/ContentScheduler";

// The component provides:
// - Calendar view of scheduled content
// - Dialog to create new schedules
// - List of all scheduled content
// - Status tracking for publishing jobs
// - Ability to cancel scheduled content
```

### Features
1. **Calendar Navigation** - Browse months and select dates
2. **Schedule Dialog** - Create new scheduled content with all metadata
3. **Platform Selection** - Choose which platforms to publish to
4. **Status Tracking** - See real-time status of publishing jobs
5. **Content Management** - Cancel or modify scheduled content

## Service Architecture

### Scheduling Service (`scheduling-service.ts`)
Handles core scheduling logic:

```typescript
// Schedule content for batch publishing
scheduleContent(userId, request)

// Get user's scheduled content
getUserScheduledContent(userId, limit, offset)

// Process pending publishing jobs
processPendingJobs()

// Process a single job
processPublishingJob(jobId)

// Publish to specific platforms
publishToYouTube(integration, content)
publishToInstagram(integration, content)
publishToTikTok(integration, content)
publishToTwitter(integration, content)

// Cancel scheduled content
cancelScheduledContent(contentId, userId)

// Get job status
getJobStatus(jobId)
```

### Database Helpers (`db.ts`)
```typescript
// Create scheduled content
createScheduledContent(userId, title, description, content, contentType, platforms, scheduledAt, language)

// Get scheduled content
getScheduledContent(userId, limit, offset)

// Update scheduled content
updateScheduledContent(contentId, updates)

// Create publishing job
createPublishingJob(scheduledContentId, userId, platform)

// Get pending jobs
getPendingJobs(limit)

// Update publishing job
updatePublishingJob(jobId, updates)

// Get social media integration
getSocialMediaIntegration(userId)

// Update social media integration
updateSocialMediaIntegration(userId, updates)
```

## Workflow

### 1. User Creates Schedule
1. Navigate to `/scheduler`
2. Click "Schedule New Content"
3. Fill in content details (title, description, content)
4. Select content type (video, short, post, reel)
5. Choose target platforms
6. Select scheduled date/time
7. Click "Schedule Content"

### 2. System Creates Jobs
- Creates `scheduled_content` record with status "scheduled"
- Creates `publishing_job` records for each platform with status "pending"
- Stores metadata and platform-specific information

### 3. Background Processing
- Admin or scheduler calls `processPendingJobs()`
- System processes each pending job sequentially
- Updates job status based on platform API responses
- Implements retry logic (up to 3 retries by default)

### 4. Publishing
- For each platform, calls appropriate publish function
- Handles platform-specific requirements and formats
- Stores platform job IDs and URLs
- Updates job status to "success" or "failed"

### 5. Tracking
- User can view scheduled content in calendar
- See publishing status for each job
- Access platform URLs for published content
- Cancel scheduled content if needed

## Integration with Existing Features

### Content Generation
- Generated scripts, thumbnails, and SEO content can be scheduled
- Use generated content as input for scheduling
- Automatic metadata extraction from generated content

### Creator Profiles
- Creator language preferences used for scheduling
- Voice preferences applied to TTS for audio content
- Content style influences platform-specific formatting

### RAG Knowledge Base
- Scheduling recommendations based on trend data
- Optimal posting times from knowledge base
- Platform-specific best practices

## Error Handling

### Retry Logic
- Failed jobs automatically retry up to 3 times
- Configurable retry count per job
- Exponential backoff between retries
- Error messages stored for debugging

### Validation
- Required fields validation
- Platform availability checks
- Date/time validation
- Content format validation per platform

### Status Tracking
- Draft: Content created but not scheduled
- Scheduled: Waiting for processing
- Processing: Currently publishing
- Success: Published to platform
- Failed: Publishing failed after retries
- Cancelled: User cancelled the schedule
- Retrying: Attempting to republish

## Configuration

### Environment Variables
```
SCHEDULING_MAX_RETRIES=3
SCHEDULING_BATCH_SIZE=100
SCHEDULING_PROCESS_INTERVAL=300000  # 5 minutes
```

### Platform Limits
- **YouTube**: 15 uploads per day per account
- **Instagram**: No official limit, but 1-2 per day recommended
- **TikTok**: 1 upload per day limit
- **Twitter**: 300 posts per 15 minutes

## Security Considerations

### Credential Storage
- API tokens encrypted in database
- Refresh tokens stored securely
- Access tokens rotated regularly
- Credentials never logged or exposed

### User Authorization
- Only users can schedule their own content
- Admin-only access to process jobs
- Content ownership verified before publishing

### Rate Limiting
- Respect platform API rate limits
- Implement exponential backoff
- Queue management to prevent overload

## Future Enhancements

1. **Advanced Scheduling**
   - Recurring schedules (daily, weekly, monthly)
   - Optimal posting time recommendations
   - A/B testing different posting times

2. **Content Analytics**
   - Track performance of scheduled content
   - Engagement metrics per platform
   - Audience insights and demographics

3. **AI-Powered Optimization**
   - Auto-generate platform-specific captions
   - Optimal hashtag suggestions
   - Thumbnail generation per platform

4. **Collaboration**
   - Team scheduling and approval workflows
   - Content calendar sharing
   - Collaborative editing

5. **Advanced Integrations**
   - Shopify product links
   - Affiliate link tracking
   - UTM parameter generation

## Troubleshooting

### Content Not Publishing
1. Check social media credentials are valid
2. Verify platform API access tokens haven't expired
3. Check job status in `publishing_jobs` table
4. Review error messages for platform-specific issues

### Scheduled Time Passed
1. Check system time is correct
2. Verify timezone settings
3. Check if background job processor is running
4. Review `processPendingJobs` logs

### Platform-Specific Issues
- **YouTube**: Check channel permissions, video format
- **Instagram**: Verify business account status
- **TikTok**: Check account age and verification
- **Twitter**: Verify API access level

## Support & Documentation

For more information:
- See README.md for platform overview
- Check ARCHITECTURE.md for system design
- Review API documentation in code comments
- Contact support for platform-specific issues
