import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, index, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with creator profile fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Creator profiles with personalization settings
 */
export const creatorProfiles = mysqlTable("creator_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  channelName: varchar("channel_name", { length: 255 }),
  channelDescription: text("channel_description"),
  channelUrl: varchar("channel_url", { length: 512 }),
  contentCategory: varchar("content_category", { length: 100 }),
  preferredLanguage: mysqlEnum("preferred_language", ["tamil", "tanglish", "mixed"]).default("tamil"),
  voicePreference: varchar("voice_preference", { length: 100 }),
  contentStyle: text("content_style"),
  targetAudience: text("target_audience"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type InsertCreatorProfile = typeof creatorProfiles.$inferInsert;

/**
 * Conversations between users and AI assistant
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }),
  topic: varchar("topic", { length: 255 }),
  language: mysqlEnum("language", ["tamil", "tanglish", "mixed"]).default("tamil"),
  messageCount: int("message_count").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages within conversations
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversation_id").notNull(),
  userId: int("user_id").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  language: mysqlEnum("language", ["tamil", "tanglish", "english", "mixed"]).default("tamil"),
  audioUrl: varchar("audio_url", { length: 512 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  conversationIdIdx: index("conversation_id_idx").on(table.conversationId),
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Generated content (scripts, thumbnails, SEO, etc.)
 */
export const generatedContent = mysqlTable("generated_content", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  conversationId: int("conversation_id"),
  contentType: mysqlEnum("content_type", ["script", "thumbnail_ideas", "seo_title", "seo_description", "trend_insight"]).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  content: text("content").notNull(),
  language: mysqlEnum("language", ["tamil", "tanglish", "mixed"]).default("tamil"),
  quality: decimal("quality", { precision: 3, scale: 2 }),
  fileUrl: varchar("file_url", { length: 512 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  contentTypeIdx: index("content_type_idx").on(table.contentType),
}));

export type GeneratedContent = typeof generatedContent.$inferSelect;
export type InsertGeneratedContent = typeof generatedContent.$inferInsert;

/**
 * RAG Knowledge base documents
 */
export const ragDocuments = mysqlTable("rag_documents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  language: mysqlEnum("language", ["tamil", "tanglish", "english", "mixed"]).default("tamil"),
  source: varchar("source", { length: 255 }),
  category: varchar("category", { length: 100 }),
  embedding: json("embedding"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIdx: index("category_idx").on(table.category),
}));

export type RAGDocument = typeof ragDocuments.$inferSelect;
export type InsertRAGDocument = typeof ragDocuments.$inferInsert;

/**
 * Trend data from YouTube and social media
 */
export const trends = mysqlTable("trends", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  viewCount: int("view_count"),
  engagementScore: decimal("engagement_score", { precision: 8, scale: 2 }),
  language: mysqlEnum("language", ["tamil", "tanglish", "mixed"]).default("tamil"),
  source: varchar("source", { length: 100 }),
  sourceUrl: varchar("source_url", { length: 512 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
}, (table) => ({
  categoryIdx: index("category_idx").on(table.category),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type Trend = typeof trends.$inferSelect;
export type InsertTrend = typeof trends.$inferInsert;

/**
 * User audio recordings and uploads
 */
export const audioRecordings = mysqlTable("audio_recordings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  conversationId: int("conversation_id"),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: varchar("file_url", { length: 512 }).notNull(),
  fileSize: int("file_size"),
  duration: decimal("duration", { precision: 8, scale: 2 }),
  language: mysqlEnum("language", ["tamil", "tanglish", "english", "mixed"]).default("tamil"),
  transcription: text("transcription"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type AudioRecording = typeof audioRecordings.$inferSelect;
export type InsertAudioRecording = typeof audioRecordings.$inferInsert;

/**
 * System usage analytics
 */
export const usageAnalytics = mysqlTable("usage_analytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  featureName: varchar("feature_name", { length: 100 }).notNull(),
  usageCount: int("usage_count").default(1),
  totalTokensUsed: int("total_tokens_used").default(0),
  averageResponseTime: decimal("average_response_time", { precision: 10, scale: 2 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  featureNameIdx: index("feature_name_idx").on(table.featureName),
}));

export type UsageAnalytics = typeof usageAnalytics.$inferSelect;
export type InsertUsageAnalytics = typeof usageAnalytics.$inferInsert;

/**
 * Scheduled content for batch publishing
 */
export const scheduledContent = mysqlTable("scheduled_content", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  contentId: int("content_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  contentType: mysqlEnum("content_type", ["video", "short", "post", "reel"]).notNull(),
  language: mysqlEnum("language", ["tamil", "tanglish", "mixed"]).default("tamil"),
  platforms: json("platforms"), // ["youtube", "instagram", "tiktok", "twitter"]
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "failed", "cancelled"]).default("draft"),
  videoUrl: varchar("video_url", { length: 512 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
  tags: json("tags"),
  hashtags: json("hashtags"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("published_at"),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
  scheduledAtIdx: index("scheduled_at_idx").on(table.scheduledAt),
}));

export type ScheduledContent = typeof scheduledContent.$inferSelect;
export type InsertScheduledContent = typeof scheduledContent.$inferInsert;

/**
 * Publishing jobs and execution history
 */
export const publishingJobs = mysqlTable("publishing_jobs", {
  id: int("id").autoincrement().primaryKey(),
  scheduledContentId: int("scheduled_content_id").notNull(),
  userId: int("user_id").notNull(),
  platform: mysqlEnum("platform", ["youtube", "instagram", "tiktok", "twitter"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "success", "failed", "retrying"]).default("pending"),
  platformJobId: varchar("platform_job_id", { length: 255 }),
  platformUrl: varchar("platform_url", { length: 512 }),
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0),
  maxRetries: int("max_retries").default(3),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  scheduledContentIdIdx: index("scheduled_content_id_idx").on(table.scheduledContentId),
  userIdIdx: index("user_id_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
  platformIdx: index("platform_idx").on(table.platform),
}));

export type PublishingJob = typeof publishingJobs.$inferSelect;
export type InsertPublishingJob = typeof publishingJobs.$inferInsert;

/**
 * Social media credentials and integrations
 */
export const socialMediaIntegrations = mysqlTable("social_media_integrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  youtubeAccessToken: text("youtube_access_token"),
  youtubeRefreshToken: text("youtube_refresh_token"),
  youtubeChannelId: varchar("youtube_channel_id", { length: 255 }),
  instagramAccessToken: text("instagram_access_token"),
  instagramBusinessAccountId: varchar("instagram_business_account_id", { length: 255 }),
  tiktokAccessToken: text("tiktok_access_token"),
  tiktokUserId: varchar("tiktok_user_id", { length: 255 }),
  twitterAccessToken: text("twitter_access_token"),
  twitterAccessTokenSecret: text("twitter_access_token_secret"),
  twitterUserId: varchar("twitter_user_id", { length: 255 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type SocialMediaIntegration = typeof socialMediaIntegrations.$inferSelect;
export type InsertSocialMediaIntegration = typeof socialMediaIntegrations.$inferInsert;

/**
 * YouTube Analytics and metrics
 */
export const youtubeAnalytics = mysqlTable("youtube_analytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  channelId: varchar("channel_id", { length: 255 }).notNull(),
  videoId: varchar("video_id", { length: 255 }),
  views: int("views").default(0),
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  watchTime: int("watch_time").default(0), // in minutes
  averageViewDuration: decimal("average_view_duration", { precision: 5, scale: 2 }).default("0"),
  clickThroughRate: decimal("click_through_rate", { precision: 5, scale: 2 }).default("0"),
  subscribers: int("subscribers").default(0),
  subscriberGrowth: int("subscriber_growth").default(0),
  audienceDemographics: json("audience_demographics"), // {age: {}, gender: {}, country: {}}
  trafficSources: json("traffic_sources"), // {youtube_search: 0, browse: 0, external: 0}
  topVideos: json("top_videos"), // [{videoId, title, views}]
  metricsDate: timestamp("metrics_date").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  channelIdIdx: index("channel_id_idx").on(table.channelId),
  metricsDateIdx: index("metrics_date_idx").on(table.metricsDate),
}));

export type YouTubeAnalytics = typeof youtubeAnalytics.$inferSelect;
export type InsertYouTubeAnalytics = typeof youtubeAnalytics.$inferInsert;

/**
 * Collaboration projects and workspaces
 */
export const collaborationProjects = mysqlTable("collaboration_projects", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creator_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "archived", "completed"]).default("active"),
  visibility: mysqlEnum("visibility", ["private", "team", "public"]).default("private"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  creatorIdIdx: index("creator_id_idx").on(table.creatorId),
  statusIdx: index("status_idx").on(table.status),
}));

export type CollaborationProject = typeof collaborationProjects.$inferSelect;
export type InsertCollaborationProject = typeof collaborationProjects.$inferInsert;

/**
 * Project members and permissions
 */
export const projectMembers = mysqlTable("project_members", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull(),
  userId: int("user_id").notNull(),
  role: mysqlEnum("role", ["owner", "editor", "viewer", "commenter"]).default("editor"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  permissions: json("permissions"), // {edit: true, comment: true, invite: false}
  metadata: json("metadata"),
}, (table) => ({
  projectIdIdx: index("project_id_idx").on(table.projectId),
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = typeof projectMembers.$inferInsert;

/**
 * Shared documents and scripts
 */
export const sharedDocuments = mysqlTable("shared_documents", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  documentType: mysqlEnum("document_type", ["script", "outline", "notes", "brainstorm"]).notNull(),
  content: text("content").notNull(),
  language: mysqlEnum("language", ["tamil", "tanglish", "mixed"]).default("tamil"),
  currentVersion: int("current_version").default(1),
  lastEditedBy: int("last_edited_by"),
  lastEditedAt: timestamp("last_edited_at"),
  isLocked: boolean("is_locked").default(false),
  lockedBy: int("locked_by"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  projectIdIdx: index("project_id_idx").on(table.projectId),
  documentTypeIdx: index("document_type_idx").on(table.documentType),
}));

export type SharedDocument = typeof sharedDocuments.$inferSelect;
export type InsertSharedDocument = typeof sharedDocuments.$inferInsert;

/**
 * Document versions for history tracking
 */
export const documentVersions = mysqlTable("document_versions", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("document_id").notNull(),
  version: int("version").notNull(),
  content: text("content").notNull(),
  editedBy: int("edited_by").notNull(),
  changesSummary: text("changes_summary"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  documentIdIdx: index("document_id_idx").on(table.documentId),
  versionIdx: index("version_idx").on(table.version),
}));

export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = typeof documentVersions.$inferInsert;

/**
 * Comments and annotations on documents
 */
export const documentComments = mysqlTable("document_comments", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("document_id").notNull(),
  userId: int("user_id").notNull(),
  content: text("content").notNull(),
  lineNumber: int("line_number"),
  charOffset: int("char_offset"),
  resolved: boolean("resolved").default(false),
  resolvedBy: int("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  replies: json("replies"), // [{userId, content, createdAt}]
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  documentIdIdx: index("document_id_idx").on(table.documentId),
  userIdIdx: index("user_id_idx").on(table.userId),
  resolvedIdx: index("resolved_idx").on(table.resolved),
}));

export type DocumentComment = typeof documentComments.$inferSelect;
export type InsertDocumentComment = typeof documentComments.$inferInsert;

/**
 * Collaboration activity log
 */
export const collaborationActivity = mysqlTable("collaboration_activity", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull(),
  userId: int("user_id").notNull(),
  activityType: mysqlEnum("activity_type", [
    "document_created",
    "document_edited",
    "document_deleted",
    "comment_added",
    "comment_resolved",
    "member_joined",
    "member_left",
    "member_role_changed",
    "document_locked",
    "document_unlocked"
  ]).notNull(),
  targetId: int("target_id"), // document_id or member_id
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("project_id_idx").on(table.projectId),
  userIdIdx: index("user_id_idx").on(table.userId),
  activityTypeIdx: index("activity_type_idx").on(table.activityType),
}));

export type CollaborationActivity = typeof collaborationActivity.$inferSelect;
export type InsertCollaborationActivity = typeof collaborationActivity.$inferInsert;

/**
 * Tamil Literature Content - Thirukkural, Stories, and Educational Materials
 */
export const literatureContent = mysqlTable("literature_content", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  contentType: mysqlEnum("content_type", ["kural", "story", "poem", "essay", "lesson"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // "thirukkural", "silappathikaram", "sangam", etc.
  tamilText: text("tamil_text").notNull(),
  englishTranslation: text("english_translation").notNull(),
  tanglishTransliteration: text("tanglish_transliteration"),
  meaning: text("meaning"), // Detailed explanation
  culturalContext: text("cultural_context"), // Historical and cultural significance
  author: varchar("author", { length: 255 }),
  period: varchar("period", { length: 100 }), // Historical period
  audioUrl: varchar("audio_url", { length: 512 }), // TTS audio file URL
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner"),
  tags: json("tags"), // ["virtue", "love", "wealth", etc.]
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIdx: index("category_idx").on(table.category),
  contentTypeIdx: index("content_type_idx").on(table.contentType),
  difficultyIdx: index("difficulty_idx").on(table.difficulty),
}));

export type LiteratureContent = typeof literatureContent.$inferSelect;
export type InsertLiteratureContent = typeof literatureContent.$inferInsert;

/**
 * Learning Paths - Structured curriculum for Tamil literature
 */
export const learningPaths = mysqlTable("learning_paths", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).notNull(),
  duration: varchar("duration", { length: 100 }), // "4 weeks", "8 weeks", etc.
  targetAudience: varchar("target_audience", { length: 255 }), // "English speakers", "Diaspora kids", "Deep learners"
  contentIds: json("content_ids"), // Array of literature_content IDs
  learningObjectives: json("learning_objectives"), // Array of objectives
  assessmentType: mysqlEnum("assessment_type", ["quiz", "essay", "project", "discussion"]),
  certificateEligible: boolean("certificate_eligible").default(true),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  levelIdx: index("level_idx").on(table.level),
}));

export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = typeof learningPaths.$inferInsert;

/**
 * User Learning Progress - Track user progress through literature learning
 */
export const userLearningProgress = mysqlTable("user_learning_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  learningPathId: int("learning_path_id").notNull(),
  contentId: int("content_id").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "reviewed"]).default("not_started"),
  score: decimal("score", { precision: 5, scale: 2 }), // Quiz/assessment score
  timeSpent: int("time_spent").default(0), // in seconds
  notes: text("notes"), // User's personal notes
  bookmarked: boolean("bookmarked").default(false),
  completedAt: timestamp("completed_at"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  learningPathIdIdx: index("learning_path_id_idx").on(table.learningPathId),
  contentIdIdx: index("content_id_idx").on(table.contentId),
  statusIdx: index("status_idx").on(table.status),
}));

export type UserLearningProgress = typeof userLearningProgress.$inferSelect;
export type InsertUserLearningProgress = typeof userLearningProgress.$inferInsert;

/**
 * Literature Assessments - Quizzes and evaluations
 */
export const literatureAssessments = mysqlTable("literature_assessments", {
  id: int("id").autoincrement().primaryKey(),
  learningPathId: int("learning_path_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assessmentType: mysqlEnum("assessment_type", ["quiz", "essay", "project", "discussion"]).notNull(),
  questions: json("questions"), // Array of question objects
  passingScore: decimal("passing_score", { precision: 5, scale: 2 }).default("70"),
  timeLimit: int("time_limit"), // in minutes
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  learningPathIdIdx: index("learning_path_id_idx").on(table.learningPathId),
}));

export type LiteratureAssessment = typeof literatureAssessments.$inferSelect;
export type InsertLiteratureAssessment = typeof literatureAssessments.$inferInsert;

/**
 * User Assessment Results - Store assessment submissions and scores
 */
export const userAssessmentResults = mysqlTable("user_assessment_results", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  assessmentId: int("assessment_id").notNull(),
  responses: json("responses"), // User's answers
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  passed: boolean("passed").notNull(),
  feedback: text("feedback"), // AI-generated feedback
  timeSpent: int("time_spent").default(0), // in seconds
  metadata: json("metadata"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  assessmentIdIdx: index("assessment_id_idx").on(table.assessmentId),
}));

export type UserAssessmentResult = typeof userAssessmentResults.$inferSelect;
export type InsertUserAssessmentResult = typeof userAssessmentResults.$inferInsert;

/**
 * Learning Certificates - Track user achievements
 */
export const learningCertificates = mysqlTable("learning_certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  learningPathId: int("learning_path_id").notNull(),
  certificateCode: varchar("certificate_code", { length: 100 }).unique().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date"),
  certificateUrl: varchar("certificate_url", { length: 512 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  learningPathIdIdx: index("learning_path_id_idx").on(table.learningPathId),
}));

export type LearningCertificate = typeof learningCertificates.$inferSelect;
export type InsertLearningCertificate = typeof learningCertificates.$inferInsert;
