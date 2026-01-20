import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { generateChatResponse, createNewConversation, getUserConversationHistory, getConversationMessages } from "./chat";
import { addMessage, trackUsage } from "./db";

export const chatRouter = router({
  // Start a new conversation
  startConversation: protectedProcedure
    .input(z.object({
      initialMessage: z.string().optional(),
      language: z.enum(["tamil", "tanglish", "mixed"]).default("tamil"),
    }))
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      try {
        const { conversationId, title } = await createNewConversation(
          ctx.user.id,
          input.initialMessage,
          input.language
        );

        // Store initial user message if provided
        if (input.initialMessage) {
          await addMessage(conversationId, ctx.user.id, "user", input.initialMessage, input.language);
        }

        const responseTime = Date.now() - startTime;
        await trackUsage(ctx.user.id, "chat_start", 0, responseTime);

        return {
          conversationId,
          title,
          success: true,
        };
      } catch (error) {
        console.error("Error starting conversation:", error);
        throw error;
      }
    }),

  // Send message and get response
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      message: z.string(),
      language: z.enum(["tamil", "tanglish", "english", "mixed"]).default("tamil"),
    }))
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      try {
        // Store user message
        await addMessage(input.conversationId, ctx.user.id, "user", input.message, input.language);

        // Generate AI response
        const response = await generateChatResponse(
          ctx.user.id,
          input.conversationId,
          input.message,
          input.language
        );

        const responseTime = Date.now() - startTime;
        // Estimate tokens (rough approximation: 1 token per 4 characters)
        const estimatedTokens = Math.ceil((input.message.length + response.length) / 4);
        await trackUsage(ctx.user.id, "chat_message", estimatedTokens, responseTime);

        return {
          response,
          success: true,
        };
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    }),

  // Get conversation history
  getConversations: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await getUserConversationHistory(ctx.user.id, input.limit, input.offset);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }
    }),

  // Get messages from a conversation
  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      limit: z.number().default(100),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await getConversationMessages(input.conversationId, input.limit, input.offset);
      } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
    }),

  // Search conversations
  searchConversations: protectedProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const conversations = await getUserConversationHistory(ctx.user.id, 100);
        // Simple text search in conversation titles
        return conversations.filter(conv =>
          conv.title?.toLowerCase().includes(input.query.toLowerCase()) ||
          conv.topic?.toLowerCase().includes(input.query.toLowerCase())
        ).slice(0, input.limit);
      } catch (error) {
        console.error("Error searching conversations:", error);
        throw error;
      }
    }),
});
