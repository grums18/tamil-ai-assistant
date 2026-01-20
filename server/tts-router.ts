import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { generateSpeech, generateScriptAudio, generateContentAudio, getAvailableVoices, generateBulkAudio } from "./tts-service";
import { trackUsage } from "./db";

export const ttsRouter = router({
  // Generate speech from text
  generateSpeech: protectedProcedure
    .input(z.object({
      text: z.string().min(1).max(5000),
      language: z.enum(["tamil", "tanglish", "english", "mixed"]).default("tamil"),
      voiceId: z.string().default("tamil-female"),
      speed: z.number().min(0.5).max(2.0).default(1.0),
      pitch: z.number().min(0.5).max(2.0).default(1.0),
    }))
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      try {
        const result = await generateSpeech({
          text: input.text,
          language: input.language,
          voiceId: input.voiceId,
          speed: input.speed,
          pitch: input.pitch,
        });

        const responseTime = Date.now() - startTime;
        const estimatedTokens = Math.ceil(input.text.length / 4);
        await trackUsage(ctx.user.id, "tts_generation", estimatedTokens, responseTime);

        return {
          ...result,
          success: true,
        };
      } catch (error) {
        console.error("Error in generateSpeech:", error);
        throw error;
      }
    }),

  // Generate audio from script
  generateScriptAudio: protectedProcedure
    .input(z.object({
      scriptContent: z.string().min(1),
      voiceId: z.string().default("tamil-female"),
      speed: z.number().min(0.5).max(2.0).default(1.0),
    }))
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      try {
        const result = await generateScriptAudio(input.scriptContent, input.voiceId, input.speed);

        const responseTime = Date.now() - startTime;
        const estimatedTokens = Math.ceil(input.scriptContent.length / 4);
        await trackUsage(ctx.user.id, "script_audio_generation", estimatedTokens, responseTime);

        return {
          ...result,
          success: true,
        };
      } catch (error) {
        console.error("Error in generateScriptAudio:", error);
        throw error;
      }
    }),

  // Generate audio from content
  generateContentAudio: protectedProcedure
    .input(z.object({
      content: z.string().min(1),
      contentType: z.enum(["script", "description", "thumbnail", "seo"]).default("script"),
      voiceId: z.string().default("tamil-female"),
    }))
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      try {
        const result = await generateContentAudio(input.content, input.contentType, input.voiceId);

        const responseTime = Date.now() - startTime;
        const estimatedTokens = Math.ceil(input.content.length / 4);
        await trackUsage(ctx.user.id, "content_audio_generation", estimatedTokens, responseTime);

        return {
          ...result,
          success: true,
        };
      } catch (error) {
        console.error("Error in generateContentAudio:", error);
        throw error;
      }
    }),

  // Get available voices
  getVoices: protectedProcedure.query(async () => {
    try {
      const voices = getAvailableVoices();
      return {
        voices,
        success: true,
      };
    } catch (error) {
      console.error("Error in getVoices:", error);
      throw error;
    }
  }),

  // Generate multiple audio files
  generateBulk: protectedProcedure
    .input(z.object({
      contents: z.array(z.object({
        text: z.string().min(1),
        voiceId: z.string().optional(),
        speed: z.number().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      try {
        const results = await generateBulkAudio(input.contents);

        const responseTime = Date.now() - startTime;
        const totalTokens = Math.ceil(
          input.contents.reduce((sum, c) => sum + c.text.length, 0) / 4
        );
        await trackUsage(ctx.user.id, "bulk_audio_generation", totalTokens, responseTime);

        return {
          results,
          success: true,
        };
      } catch (error) {
        console.error("Error in generateBulk:", error);
        throw error;
      }
    }),
});
