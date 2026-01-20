import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, creatorProfiles, InsertCreatorProfile, conversations, messages, generatedContent, ragDocuments, trends, audioRecordings, usageAnalytics, literatureContent, learningPaths, userLearningProgress, literatureAssessments, userAssessmentResults, learningCertificates } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Re-export types for convenience
export type { User, InsertUser, CreatorProfile, InsertCreatorProfile, Conversation, InsertConversation, Message, InsertMessage, GeneratedContent, InsertGeneratedContent, RAGDocument, InsertRAGDocument, Trend, InsertTrend, AudioRecording, InsertAudioRecording, UsageAnalytics, InsertUsageAnalytics, LiteratureContent, InsertLiteratureContent, LearningPath, InsertLearningPath, UserLearningProgress, InsertUserLearningProgress, LiteratureAssessment, InsertLiteratureAssessment, UserAssessmentResult, InsertUserAssessmentResult, LearningCertificate, InsertLearningCertificate } from "../drizzle/schema";

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Creator Profile Helpers
export async function getOrCreateCreatorProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];
  
  await db.insert(creatorProfiles).values({ userId });
  const created = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId)).limit(1);
  return created[0];
}

export async function updateCreatorProfile(userId: number, data: Partial<InsertCreatorProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Record<string, unknown> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) updateData[key] = value;
  });
  
  await db.update(creatorProfiles).set(updateData).where(eq(creatorProfiles.userId, userId));
  return getOrCreateCreatorProfile(userId);
}

// Conversation Helpers
export async function createConversation(userId: number, title?: string, topic?: string, language: "tamil" | "tanglish" | "mixed" = "tamil") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(conversations).values({ userId, title, topic, language });
  
  const createdConversations = await db.select().from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.createdAt))
    .limit(1);
  
  if (!createdConversations || createdConversations.length === 0) {
    throw new Error("Failed to retrieve created conversation");
  }
  
  return createdConversations[0];
}

export async function getConversations(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(conversations).where(eq(conversations.userId, userId)).limit(limit).offset(offset);
}

export async function getConversationById(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  return result[0];
}

// Message Helpers
export async function addMessage(conversationId: number, userId: number, role: "user" | "assistant", content: string, language: "tamil" | "tanglish" | "english" | "mixed" = "tamil", audioUrl?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.insert(messages).values({
      conversationId,
      userId,
      role,
      content,
      language,
      audioUrl: audioUrl || null,
      metadata: null,
    });
    
    // Update message count
    const conv = await getConversationById(conversationId);
    if (conv) {
      await db.update(conversations).set({ messageCount: (conv.messageCount || 0) + 1 }).where(eq(conversations.id, conversationId));
    }
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
}

export async function getMessages(conversationId: number, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt).limit(limit).offset(offset);
}

// Generated Content Helpers
export async function saveGeneratedContent(userId: number, contentType: string, topic: string, content: string, language: "tamil" | "tanglish" | "mixed" = "tamil", conversationId?: number, fileUrl?: string, quality?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(generatedContent).values({ userId, contentType: contentType as any, topic, content, language, conversationId, fileUrl, quality: quality ? quality.toString() : undefined });
  return result;
}

export async function getGeneratedContent(userId: number, contentType?: string, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { and } = await import("drizzle-orm");
  const conditions = [eq(generatedContent.userId, userId)];
  if (contentType) {
    conditions.push(eq(generatedContent.contentType, contentType as any));
  }
  return db.select().from(generatedContent).where(and(...conditions)).limit(limit).offset(offset);
}

// RAG Document Helpers
export async function addRAGDocument(title: string, content: string, language: "tamil" | "tanglish" | "english" | "mixed" = "tamil", source?: string, category?: string, embedding?: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(ragDocuments).values({ title, content, language, source, category, embedding });
  return result;
}

export async function searchRAGDocuments(category?: string, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (category) {
    return db.select().from(ragDocuments).where(eq(ragDocuments.category, category)).limit(limit);
  }
  return db.select().from(ragDocuments).limit(limit);
}

// Trend Helpers
export async function addTrend(title: string, description: string, category: string, language: "tamil" | "tanglish" | "mixed" = "tamil", source?: string, sourceUrl?: string, viewCount?: number, engagementScore?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(trends).values({ title, description, category, language, source, sourceUrl, viewCount, engagementScore: engagementScore ? engagementScore.toString() : undefined });
  return result;
}

export async function getTrends(category?: string, limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (category) {
    return db.select().from(trends).where(eq(trends.category, category)).orderBy(trends.createdAt).limit(limit);
  }
  return db.select().from(trends).orderBy(trends.createdAt).limit(limit);
}

// Audio Recording Helpers
export async function saveAudioRecording(userId: number, fileName: string, fileUrl: string, language: "tamil" | "tanglish" | "english" | "mixed" = "tamil", conversationId?: number, duration?: number, fileSize?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(audioRecordings).values({ userId, fileName, fileUrl, language, conversationId, duration: duration ? duration.toString() : undefined, fileSize });
  return result;
}

export async function getAudioRecordings(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(audioRecordings).where(eq(audioRecordings.userId, userId)).limit(limit).offset(offset);
}

// Usage Analytics Helpers
export async function trackUsage(userId: number, featureName: string, tokensUsed = 0, responseTime = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { and } = await import("drizzle-orm");
  const existing = await db.select().from(usageAnalytics).where(and(eq(usageAnalytics.userId, userId), eq(usageAnalytics.featureName, featureName))).limit(1);
  
  if (existing.length > 0) {
    const current = existing[0];
    const newCount = (current.usageCount || 0) + 1;
    const newTokens = (current.totalTokensUsed || 0) + tokensUsed;
    const avgTime = ((parseFloat(current.averageResponseTime as any) || 0) * (current.usageCount || 1) + responseTime) / newCount;
    
    await db.update(usageAnalytics).set({ usageCount: newCount, totalTokensUsed: newTokens, averageResponseTime: avgTime.toString() }).where(and(eq(usageAnalytics.userId, userId), eq(usageAnalytics.featureName, featureName)));
  } else {
    await db.insert(usageAnalytics).values({ userId, featureName, usageCount: 1, totalTokensUsed: tokensUsed, averageResponseTime: responseTime.toString() });
  }
}

export async function getUserAnalytics(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(usageAnalytics).where(eq(usageAnalytics.userId, userId));
}


/**
 * Scheduling & Publishing Functions
 */

import { ScheduledContent, InsertScheduledContent, PublishingJob, InsertPublishingJob, SocialMediaIntegration, InsertSocialMediaIntegration, scheduledContent, publishingJobs, socialMediaIntegrations } from "../drizzle/schema";
import { asc } from "drizzle-orm";

export async function createScheduledContent(
  userId: number,
  title: string,
  description: string,
  content: string,
  contentType: "video" | "short" | "post" | "reel",
  platforms: string[],
  scheduledAt: Date,
  language: "tamil" | "tanglish" | "mixed" = "tamil"
): Promise<ScheduledContent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scheduledContent).values({
    userId,
    title,
    description,
    content,
    contentType,
    platforms: JSON.stringify(platforms),
    scheduledAt,
    language,
    status: "draft",
  });

  const contentId = (result as any).insertId;
  const rows = await db.select().from(scheduledContent).where(eq(scheduledContent.id, contentId)).limit(1);
  return rows[0] as ScheduledContent;
}

export async function getScheduledContent(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<ScheduledContent[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(scheduledContent)
    .where(eq(scheduledContent.userId, userId))
    .orderBy(desc(scheduledContent.scheduledAt))
    .limit(limit)
    .offset(offset);
}

export async function updateScheduledContent(
  contentId: number,
  updates: Partial<InsertScheduledContent>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(scheduledContent).set(updates).where(eq(scheduledContent.id, contentId));
}

export async function createPublishingJob(
  scheduledContentId: number,
  userId: number,
  platform: "youtube" | "instagram" | "tiktok" | "twitter"
): Promise<PublishingJob> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(publishingJobs).values({
    scheduledContentId,
    userId,
    platform,
    status: "pending",
  });

  const jobId = (result as any).insertId;
  const rows = await db.select().from(publishingJobs).where(eq(publishingJobs.id, jobId)).limit(1);
  return rows[0] as PublishingJob;
}

export async function getPendingJobs(
  limit: number = 100
): Promise<PublishingJob[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(publishingJobs)
    .where(eq(publishingJobs.status, "pending"))
    .orderBy(asc(publishingJobs.createdAt))
    .limit(limit);
}

export async function updatePublishingJob(
  jobId: number,
  updates: Partial<InsertPublishingJob>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(publishingJobs).set(updates).where(eq(publishingJobs.id, jobId));
}

export async function getSocialMediaIntegration(
  userId: number
): Promise<SocialMediaIntegration | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const rows = await db
    .select()
    .from(socialMediaIntegrations)
    .where(eq(socialMediaIntegrations.userId, userId))
    .limit(1);

  return rows[0];
}

export async function updateSocialMediaIntegration(
  userId: number,
  updates: Partial<InsertSocialMediaIntegration>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getSocialMediaIntegration(userId);
  if (existing) {
    await db
      .update(socialMediaIntegrations)
      .set(updates)
      .where(eq(socialMediaIntegrations.userId, userId));
  } else {
    await db.insert(socialMediaIntegrations).values({
      userId,
      ...updates,
    });
  }
}
