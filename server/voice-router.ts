import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { transcribeVoiceInput, getUserAudioRecordings, processVoiceCommand } from "./voice-service";

export const voiceRouter = router({
  // Transcribe audio file
  transcribe: protectedProcedure
    .input(z.object({
      audioUrl: z.string().url(),
      language: z.enum(["tamil", "tanglish", "english", "mixed"]).default("tamil"),
      fileName: z.string().optional(),
      conversationId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await transcribeVoiceInput(
          ctx.user.id,
          input.audioUrl,
          input.language,
          input.fileName,
          input.conversationId
        );

        return {
          ...result,
          success: true,
        };
      } catch (error) {
        console.error("Error in transcribe:", error);
        throw error;
      }
    }),

  // Get audio recordings history
  getRecordings: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await getUserAudioRecordings(ctx.user.id, input.limit, input.offset);
      } catch (error) {
        console.error("Error in getRecordings:", error);
        throw error;
      }
    }),

  // Process voice command
  processCommand: protectedProcedure
    .input(z.object({
      transcribedText: z.string(),
      commandType: z.enum(["chat", "generate", "search"]).default("chat"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await processVoiceCommand(
          ctx.user.id,
          input.transcribedText,
          input.commandType
        );

        return {
          ...result,
          success: true,
        };
      } catch (error) {
        console.error("Error in processCommand:", error);
        throw error;
      }
    }),
});
