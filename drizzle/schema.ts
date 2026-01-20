import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, decimal, index } from "drizzle-orm/mysql-core";
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