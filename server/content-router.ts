import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { generateScript, generateThumbnailIdeas, generateSEOOptimization, analyzeTrends, generateAllContent } from "./content-generator";
import { getGeneratedContent, trackUsage } from "./db";

export const contentRouter = router({
  // Generate script
  generateScript: protectedProcedure
    .input(z.object({
      topic: z.string().min(1),
      language: z.enum(["tamil", "tanglish", "mixed"]).default("tamil"),
    }))
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      try {
        const script = await generateScript(ctx.user.id, input.topic, input.language);
        const responseTime = Date.now() - startTime;
        const estimatedTokens = Math.ceil(script.length / 4);
        await trackUsage(ctx.user.id, "script_generation", estimatedTokens, responseTime);

        return {
          script,
          success: true,
        };
      } catch (error) {
        console.error("Error in generateScript:", error);
        throw error;
      }
    }),

  // Generate thumbnail ideas
  generateThumbnailIdeas: protectedProcedure
    .input(z.object({
      topic: z.string().min(1),
      language: z.enum(["tamil", "tanglish", "mixed"]).default("tamil"),
    }))
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      try {
        const ideas = await generateThumbnailIdeas(ctx.user.id, input.topic, input.language);
        const responseTime = Date.now() - startTime;
        const estimatedTokens = Math.ceil(ideas.length / 4);
        await trackUsage(ctx.user.id, "thumbnail_generation", estimatedTokens, responseTime);

        return {
          ideas,
          success: true,
        };
      } catch (error) {
        console.error("Error in generateThumbnailIdeas:", error);
        throw error;
      }
    }),

  // Generate SEO optimization
  generateSEO: protectedProcedure
    .input(z.object({
      topic: z.string().min(1),
      language: z.enum(["tamil", "tanglish", "mixed"]).default("tamil"),
    }))
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      try {
        const seoContent = await generateSEOOptimization(ctx.user.id, input.topic, input.language);
        const responseTime = Date.now() - startTime;
        const estimatedTokens = Math.ceil(seoContent.length / 4);
        await trackUsage(ctx.user.id, "seo_generation", estimatedTokens, responseTime);

        return {
          seoContent,
          success: true,
        };
      } catch (error) {
        console.error("Error in generateSEO:", error);
        throw error;
      }
    }),

  // Analyze trends
  analyzeTrends: protectedProcedure
    .input(z.object({
      topic: z.string().min(1),
      language: z.enum(["tamil", "tanglish", "mixed"]).default("tamil"),
    }))
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      try {
        const analysis = await analyzeTrends(ctx.user.id, input.topic, input.language);
        const responseTime = Date.now() - startTime;
        const estimatedTokens = Math.ceil(analysis.length / 4);
        await trackUsage(ctx.user.id, "trend_analysis", estimatedTokens, responseTime);

        return {
          analysis,
          success: true,
        };
      } catch (error) {
        console.error("Error in analyzeTrends:", error);
        throw error;
      }
    }),

  // Generate all content at once
  generateAll: protectedProcedure
    .input(z.object({
      topic: z.string().min(1),
      language: z.enum(["tamil", "tanglish", "mixed"]).default("tamil"),
    }))
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      try {
        const result = await generateAllContent(ctx.user.id, input.topic, input.language);
        const responseTime = Date.now() - startTime;
        const totalTokens = Math.ceil(
          (result.script.length + result.thumbnailIdeas.length + result.seoOptimization.length + result.trendAnalysis.length) / 4
        );
        await trackUsage(ctx.user.id, "content_generation_all", totalTokens, responseTime);

        return {
          ...result,
          success: true,
        };
      } catch (error) {
        console.error("Error in generateAll:", error);
        throw error;
      }
    }),

  // Get generated content history
  getHistory: protectedProcedure
    .input(z.object({
      contentType: z.enum(["script", "thumbnail_ideas", "seo_title", "seo_description", "trend_insight"]).optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await getGeneratedContent(ctx.user.id, input.contentType, input.limit, input.offset);
      } catch (error) {
        console.error("Error in getHistory:", error);
        throw error;
      }
    }),
});
