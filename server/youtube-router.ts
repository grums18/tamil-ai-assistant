import { protectedProcedure, router } from "./_core/trpc";
import {
  getChannelMetrics,
  getVideoMetrics,
  getAudienceDemographics,
  getOptimalPostingTimes,
  generateContentRecommendations,
  analyzeChannelPerformance,
} from "./youtube-analytics";
import { trackUsage } from "./db";
import { z } from "zod";

export const youtubeRouter = router({
  /**
   * Get channel metrics
   */
  getChannelMetrics: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const metrics = await getChannelMetrics(input.channelId);

        await trackUsage(ctx.user.id, "youtube_analytics", 1, 0);

        return {
          success: true,
          data: metrics,
        };
      } catch (error) {
        console.error("Error fetching channel metrics:", error);
        throw new Error("Failed to fetch channel metrics");
      }
    }),

  /**
   * Get video metrics
   */
  getVideoMetrics: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const videos = await getVideoMetrics(input.channelId, input.limit);

        await trackUsage(ctx.user.id, "youtube_analytics", input.limit, 0);

        return {
          success: true,
          data: videos,
        };
      } catch (error) {
        console.error("Error fetching video metrics:", error);
        throw new Error("Failed to fetch video metrics");
      }
    }),

  /**
   * Get audience demographics
   */
  getAudienceDemographics: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const demographics = await getAudienceDemographics(input.channelId);

        await trackUsage(ctx.user.id, "youtube_analytics", 1, 0);

        return {
          success: true,
          data: demographics,
        };
      } catch (error) {
        console.error("Error fetching audience demographics:", error);
        throw new Error("Failed to fetch audience demographics");
      }
    }),

  /**
   * Get optimal posting times
   */
  getOptimalPostingTimes: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const times = await getOptimalPostingTimes(input.channelId);

        await trackUsage(ctx.user.id, "youtube_analytics", 1, 0);

        return {
          success: true,
          data: times,
        };
      } catch (error) {
        console.error("Error fetching optimal posting times:", error);
        throw new Error("Failed to fetch optimal posting times");
      }
    }),

  /**
   * Get content recommendations
   */
  getContentRecommendations: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const metrics = await getChannelMetrics(input.channelId);
        const demographics = await getAudienceDemographics(input.channelId);
        const videos = await getVideoMetrics(input.channelId, 10);

        const recommendations = await generateContentRecommendations(
          input.channelId,
          metrics,
          demographics,
          videos
        );

        await trackUsage(ctx.user.id, "youtube_analytics", 1, 500);

        return {
          success: true,
          data: recommendations,
        };
      } catch (error) {
        console.error("Error generating content recommendations:", error);
        throw new Error("Failed to generate content recommendations");
      }
    }),

  /**
   * Analyze channel performance
   */
  analyzeChannelPerformance: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const analysis = await analyzeChannelPerformance(input.channelId);

        await trackUsage(ctx.user.id, "youtube_analytics", 1, 300);

        return {
          success: true,
          data: analysis,
        };
      } catch (error) {
        console.error("Error analyzing channel performance:", error);
        throw new Error("Failed to analyze channel performance");
      }
    }),
});
