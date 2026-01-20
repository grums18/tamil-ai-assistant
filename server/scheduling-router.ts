import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  scheduleContent,
  getUserScheduledContent,
  cancelScheduledContent,
  getJobStatus,
  processPendingJobs,
} from "./scheduling-service";
import { trackUsage } from "./db";

/**
 * Scheduling Router
 * tRPC procedures for batch content scheduling
 */

export const schedulingRouter = router({
  /**
   * Schedule content for batch publishing
   */
  scheduleContent: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        content: z.string().min(1),
        contentType: z.enum(["video", "short", "post", "reel"]),
        platforms: z.array(z.enum(["youtube", "instagram", "tiktok", "twitter"])).min(1),
        scheduledAt: z.string().datetime(),
        language: z.enum(["tamil", "tanglish", "mixed"]).optional(),
        videoUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        tags: z.array(z.string()).optional(),
        hashtags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      try {
        const result = await scheduleContent(ctx.user!.id, {
          ...input,
          scheduledAt: new Date(input.scheduledAt),
        });

        await trackUsage(ctx.user!.id, "scheduling.schedule_content", 0, (Date.now() - startTime) / 1000);

        return {
          success: true,
          contentId: result.contentId,
          jobs: result.jobs,
        };
      } catch (error) {
        console.error("[Scheduling] Error scheduling content:", error);
        throw error;
      }
    }),

  /**
   * Get user's scheduled content
   */
  getScheduled: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const content = await getUserScheduledContent(ctx.user!.id, input.limit, input.offset);

        return {
          success: true,
          content: content.map((c) => ({
            ...c,
            platforms: typeof c.platforms === "string" ? JSON.parse(c.platforms) : c.platforms,
            tags: typeof c.tags === "string" ? JSON.parse(c.tags) : c.tags,
            hashtags: typeof c.hashtags === "string" ? JSON.parse(c.hashtags) : c.hashtags,
          })),
        };
      } catch (error) {
        console.error("[Scheduling] Error fetching scheduled content:", error);
        throw error;
      }
    }),

  /**
   * Cancel scheduled content
   */
  cancelSchedule: protectedProcedure
    .input(
      z.object({
        contentId: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await cancelScheduledContent(input.contentId, ctx.user!.id);

        await trackUsage(ctx.user!.id, "scheduling.cancel", 0, 0.1);

        return result;
      } catch (error) {
        console.error("[Scheduling] Error cancelling content:", error);
        throw error;
      }
    }),

  /**
   * Get publishing job status
   */
  getJobStatus: protectedProcedure
    .input(
      z.object({
        jobId: z.number().int().positive(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const job = await getJobStatus(input.jobId);

        return {
          success: true,
          job: {
            ...job,
            metadata: typeof job.metadata === "string" ? JSON.parse(job.metadata) : job.metadata,
          },
        };
      } catch (error) {
        console.error("[Scheduling] Error getting job status:", error);
        throw error;
      }
    }),

  /**
   * Process pending jobs (admin only)
   */
  processPendingJobs: protectedProcedure.mutation(async ({ ctx }) => {
    // Check if user is admin
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    try {
      const result = await processPendingJobs();

      await trackUsage(ctx.user!.id, "scheduling.process_jobs", 0, 0.1);

      return {
        success: true,
        processed: result.processed,
      };
    } catch (error) {
      console.error("[Scheduling] Error processing pending jobs:", error);
      throw error;
    }
  }),
});
