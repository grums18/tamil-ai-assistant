import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  uploadAudioRecording,
  uploadGeneratedContent,
  uploadProfileImage,
  uploadDatasetFile,
  getDownloadUrl,
  generateStorageKey,
} from "./storage-service";

export const storageRouter = router({
  // Upload audio recording
  uploadAudio: protectedProcedure
    .input(z.object({
      audioBase64: z.string(),
      fileName: z.string(),
      contentType: z.string().default("audio/wav"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Convert base64 to buffer
        const audioBuffer = Buffer.from(input.audioBase64, "base64");

        const result = await uploadAudioRecording(
          ctx.user.id,
          audioBuffer,
          input.fileName,
          input.contentType
        );

        return {
          ...result,
          success: true,
        };
      } catch (error) {
        console.error("Error in uploadAudio:", error);
        throw error;
      }
    }),

  // Upload generated content
  uploadContent: protectedProcedure
    .input(z.object({
      content: z.string(),
      contentType: z.enum(["script", "thumbnail_ideas", "seo_title", "seo_description", "trend_insight"]),
      topic: z.string(),
      language: z.enum(["tamil", "tanglish", "mixed"]).default("tamil"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await uploadGeneratedContent(
          ctx.user.id,
          input.content,
          input.contentType,
          input.topic,
          input.language
        );

        return {
          ...result,
          success: true,
        };
      } catch (error) {
        console.error("Error in uploadContent:", error);
        throw error;
      }
    }),

  // Upload profile image
  uploadProfileImage: protectedProcedure
    .input(z.object({
      imageBase64: z.string(),
      contentType: z.string().default("image/jpeg"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(input.imageBase64, "base64");

        const result = await uploadProfileImage(ctx.user.id, imageBuffer, input.contentType);

        return {
          ...result,
          success: true,
        };
      } catch (error) {
        console.error("Error in uploadProfileImage:", error);
        throw error;
      }
    }),

  // Upload dataset file (admin only)
  uploadDataset: protectedProcedure
    .input(z.object({
      fileBase64: z.string(),
      fileName: z.string(),
      contentType: z.string().default("application/octet-stream"),
      category: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new Error("Admin access required");
        }

        // Convert base64 to buffer
        const fileBuffer = Buffer.from(input.fileBase64, "base64");

        const result = await uploadDatasetFile(input.fileName, fileBuffer, input.contentType, input.category);

        return {
          ...result,
          success: true,
        };
      } catch (error) {
        console.error("Error in uploadDataset:", error);
        throw error;
      }
    }),

  // Get download URL
  getDownloadUrl: protectedProcedure
    .input(z.object({
      storageKey: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const url = await getDownloadUrl(input.storageKey);
        return {
          url,
          success: true,
        };
      } catch (error) {
        console.error("Error in getDownloadUrl:", error);
        throw error;
      }
    }),

  // Generate storage key
  generateKey: protectedProcedure
    .input(z.object({
      fileType: z.string(),
      fileName: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const key = generateStorageKey(ctx.user.id, input.fileType, input.fileName);
        return {
          key,
          success: true,
        };
      } catch (error) {
        console.error("Error in generateKey:", error);
        throw error;
      }
    }),
});
