import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { addDocument, searchDocuments, generateRAGResponse, initializeKnowledgeBase } from "./rag-service";
import { trackUsage } from "./db";

export const ragRouter = router({
  // Search knowledge base
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      category: z.string().optional(),
      limit: z.number().default(5),
    }))
    .query(async ({ input }) => {
      try {
        const results = await searchDocuments(input.query, input.category, input.limit);
        return {
          results,
          success: true,
        };
      } catch (error) {
        console.error("Error in search:", error);
        throw error;
      }
    }),

  // Generate RAG-powered response
  generateResponse: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const startTime = Date.now();
      try {
        const response = await generateRAGResponse(input.query, input.category);
        const responseTime = Date.now() - startTime;
        const estimatedTokens = Math.ceil((input.query.length + response.length) / 4);

        return {
          response,
          success: true,
          responseTime,
          tokensUsed: estimatedTokens,
        };
      } catch (error) {
        console.error("Error in generateResponse:", error);
        throw error;
      }
    }),

  // Add document to knowledge base (admin only)
  addDocument: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      category: z.string().optional(),
      source: z.string().optional(),
      language: z.enum(["tamil", "tanglish", "english", "mixed"]).default("tamil"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user is admin (optional - can be enforced)
        await addDocument({
          title: input.title,
          content: input.content,
          category: input.category,
          source: input.source,
          language: input.language,
        });

        return {
          success: true,
          message: "Document added to knowledge base",
        };
      } catch (error) {
        console.error("Error in addDocument:", error);
        throw error;
      }
    }),

  // Initialize knowledge base with sample data
  initialize: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Check if user is admin (optional - can be enforced)
      await initializeKnowledgeBase();

      return {
        success: true,
        message: "Knowledge base initialized",
      };
    } catch (error) {
      console.error("Error in initialize:", error);
      throw error;
    }
  }),
});
