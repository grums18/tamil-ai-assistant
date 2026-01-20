import {
  createScheduledContent,
  getScheduledContent,
  updateScheduledContent,
  createPublishingJob,
  getPendingJobs,
  updatePublishingJob,
  getSocialMediaIntegration,
} from "./db";
import { invokeLLM } from "./_core/llm";

/**
 * Scheduling Service
 * Handles batch content scheduling and automated publishing
 */

interface ScheduleContentRequest {
  title: string;
  description?: string;
  content: string;
  contentType: "video" | "short" | "post" | "reel";
  platforms: ("youtube" | "instagram" | "tiktok" | "twitter")[];
  scheduledAt: Date;
  language?: "tamil" | "tanglish" | "mixed";
  videoUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  hashtags?: string[];
}

interface PublishingResult {
  jobId: number;
  platform: string;
  status: "success" | "failed" | "pending";
  platformUrl?: string;
  errorMessage?: string;
}

/**
 * Schedule content for batch publishing
 */
export async function scheduleContent(
  userId: number,
  request: ScheduleContentRequest
): Promise<{ contentId: number; jobs: PublishingResult[] }> {
  try {
    // Create scheduled content record
  const scheduled = await createScheduledContent(
    userId,
    request.title,
    request.description || "",
    request.content,
    request.contentType,
    request.platforms,
    request.scheduledAt,
    request.language || "tamil"
  );

    // Update with additional metadata
    await updateScheduledContent(scheduled.id, {
      videoUrl: request.videoUrl,
      thumbnailUrl: request.thumbnailUrl,
      tags: JSON.stringify(request.tags || []),
      hashtags: JSON.stringify(request.hashtags || []),
      status: "scheduled",
    });

    // Create publishing jobs for each platform
    const jobs: PublishingResult[] = [];
    for (const platform of request.platforms) {
      try {
        const job = await createPublishingJob(scheduled.id, userId, platform as any);
        jobs.push({
          jobId: job.id,
          platform,
          status: "pending",
        });
      } catch (error) {
        console.error(`Error creating job for ${platform}:`, error);
        jobs.push({
          jobId: 0,
          platform,
          status: "failed",
          errorMessage: `Failed to create job: ${error}`,
        });
      }
    }

    return { contentId: scheduled.id, jobs };
  } catch (error) {
    console.error("Error scheduling content:", error);
    throw error;
  }
}

/**
 * Get user's scheduled content
 */
export async function getUserScheduledContent(
  userId: number,
  limit: number = 50,
  offset: number = 0
) {
  return getScheduledContent(userId, limit, offset);
}

/**
 * Process pending publishing jobs
 * This should be called by a background job scheduler
 */
export async function processPendingJobs() {
  try {
    const jobs = await getPendingJobs(100);

    for (const job of jobs) {
      await processPublishingJob(job.id);
    }

    return { processed: jobs.length };
  } catch (error) {
    console.error("Error processing pending jobs:", error);
    throw error;
  }
}

/**
 * Process a single publishing job
 */
export async function processPublishingJob(jobId: number) {
  try {
    await updatePublishingJob(jobId, { status: "processing" });

    // Get job details
    const db = await (await import("./db")).getDb();
    if (!db) throw new Error("Database not available");

    const { publishingJobs } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const jobRows = await db.select().from(publishingJobs).where(eq(publishingJobs.id, jobId)).limit(1);
    const job = jobRows[0];

    if (!job) throw new Error("Job not found");

    // Get scheduled content
    const { scheduledContent } = await import("../drizzle/schema");
    const contentRows = await db
      .select()
      .from(scheduledContent)
      .where(eq(scheduledContent.id, job.scheduledContentId))
      .limit(1);
    const content = contentRows[0];

    if (!content) throw new Error("Scheduled content not found");

    // Get social media credentials
    const integration = await getSocialMediaIntegration(job.userId);
    if (!integration) throw new Error("Social media integration not found");

    // Publish based on platform
    let result: any;
    switch (job.platform) {
      case "youtube":
        result = await publishToYouTube(integration, content);
        break;
      case "instagram":
        result = await publishToInstagram(integration, content);
        break;
      case "tiktok":
        result = await publishToTikTok(integration, content);
        break;
      case "twitter":
        result = await publishToTwitter(integration, content);
        break;
      default:
        throw new Error(`Unknown platform: ${job.platform}`);
    }

    // Update job with success
    await updatePublishingJob(jobId, {
      status: "success",
      platformJobId: result.jobId,
      platformUrl: result.url,
      completedAt: new Date(),
    });

    return { success: true, result };
  } catch (error) {
    console.error(`Error processing job ${jobId}:`, error);

    // Update job with failure
    const errorMessage = error instanceof Error ? error.message : String(error);
    const db = await (await import("./db")).getDb();
    if (db) {
      const { publishingJobs } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const jobRows = await db.select().from(publishingJobs).where(eq(publishingJobs.id, jobId)).limit(1);
      const job = jobRows[0];

      if (job && (job.retryCount || 0) < (job.maxRetries || 3)) {
        // Retry
        await updatePublishingJob(jobId, {
          status: "retrying",
          retryCount: ((job.retryCount as any) || 0) + 1,
          errorMessage,
        });
      } else if (job) {
        // Final failure
        await updatePublishingJob(jobId, {
          status: "failed",
          errorMessage,
          completedAt: new Date(),
        });
      }
    }

    throw error;
  }
}

/**
 * Publish to YouTube
 */
async function publishToYouTube(integration: any, content: any) {
  try {
    // In production, use YouTube API
    // For now, return mock response
    console.log("Publishing to YouTube:", content.title);

    // Validate credentials
    if (!integration.youtubeAccessToken) {
      throw new Error("YouTube credentials not configured");
    }

    // Mock YouTube API call
    return {
      jobId: `yt-${Date.now()}`,
      url: `https://youtube.com/watch?v=${Date.now()}`,
      platform: "youtube",
    };
  } catch (error) {
    console.error("YouTube publishing error:", error);
    throw error;
  }
}

/**
 * Publish to Instagram
 */
async function publishToInstagram(integration: any, content: any) {
  try {
    console.log("Publishing to Instagram:", content.title);

    if (!integration.instagramAccessToken) {
      throw new Error("Instagram credentials not configured");
    }

    // Mock Instagram API call
    return {
      jobId: `ig-${Date.now()}`,
      url: `https://instagram.com/p/${Date.now()}`,
      platform: "instagram",
    };
  } catch (error) {
    console.error("Instagram publishing error:", error);
    throw error;
  }
}

/**
 * Publish to TikTok
 */
async function publishToTikTok(integration: any, content: any) {
  try {
    console.log("Publishing to TikTok:", content.title);

    if (!integration.tiktokAccessToken) {
      throw new Error("TikTok credentials not configured");
    }

    // Mock TikTok API call
    return {
      jobId: `tt-${Date.now()}`,
      url: `https://tiktok.com/@user/video/${Date.now()}`,
      platform: "tiktok",
    };
  } catch (error) {
    console.error("TikTok publishing error:", error);
    throw error;
  }
}

/**
 * Publish to Twitter/X
 */
async function publishToTwitter(integration: any, content: any) {
  try {
    console.log("Publishing to Twitter:", content.title);

    if (!integration.twitterAccessToken) {
      throw new Error("Twitter credentials not configured");
    }

    // Mock Twitter API call
    return {
      jobId: `tw-${Date.now()}`,
      url: `https://twitter.com/user/status/${Date.now()}`,
      platform: "twitter",
    };
  } catch (error) {
    console.error("Twitter publishing error:", error);
    throw error;
  }
}

/**
 * Cancel scheduled content
 */
export async function cancelScheduledContent(contentId: number, userId: number) {
  try {
    // Verify ownership
    const content = await getScheduledContent(userId, 1000, 0);
    const item = content.find((c) => c.id === contentId);

    if (!item) {
      throw new Error("Content not found or unauthorized");
    }

    // Update status to cancelled
    await updateScheduledContent(contentId, { status: "cancelled" });

    return { success: true, message: "Content cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling content:", error);
    throw error;
  }
}

/**
 * Get publishing job status
 */
export async function getJobStatus(jobId: number) {
  try {
    const db = await (await import("./db")).getDb();
    if (!db) throw new Error("Database not available");

    const { publishingJobs } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const rows = await db.select().from(publishingJobs).where(eq(publishingJobs.id, jobId)).limit(1);

    if (!rows[0]) throw new Error("Job not found");

    return rows[0];
  } catch (error) {
    console.error("Error getting job status:", error);
    throw error;
  }
}
