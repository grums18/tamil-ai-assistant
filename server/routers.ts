import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getOrCreateCreatorProfile, updateCreatorProfile, getUserById } from "./db";
import { chatRouter } from "./chat-router";
import { contentRouter } from "./content-router";
import { voiceRouter } from "./voice-router";
import { ragRouter } from "./rag-router";
import { ttsRouter } from "./tts-router";
import { adminRouter } from "./admin-router";
import { storageRouter } from "./storage-router";
import { schedulingRouter } from "./scheduling-router";
import { youtubeAnalyticsRouter, collaborationRouter } from "./youtube-collaboration-router";
import { youtubeRouter } from "./youtube-router";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Chat Router
  chat: chatRouter,

  // Content Generation Router
  content: contentRouter,

  // Voice Input Router
  voice: voiceRouter,

  // RAG Knowledge Base Router
  rag: ragRouter,

  // Text-to-Speech Router
  tts: ttsRouter,

  // Admin Dashboard Router
  admin: adminRouter,

  // Storage Router
  storage: storageRouter,

  // Scheduling Router
  scheduling: schedulingRouter,

  // YouTube Analytics Router
  youtube: youtubeRouter,

  // YouTube Analytics Router (Legacy)
  youtubeAnalytics: youtubeAnalyticsRouter,

  // Collaboration Router
  collaboration: collaborationRouter,

  // Creator Profile Router
  creator: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return getOrCreateCreatorProfile(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        channelName: z.string().optional(),
        channelDescription: z.string().optional(),
        channelUrl: z.string().optional(),
        contentCategory: z.string().optional(),
        preferredLanguage: z.enum(["tamil", "tanglish", "mixed"]).optional(),
        voicePreference: z.string().optional(),
        contentStyle: z.string().optional(),
        targetAudience: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return updateCreatorProfile(ctx.user.id, input);
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      const profile = await getOrCreateCreatorProfile(ctx.user.id);
      return {
        user,
        profile,
        memberSince: user?.createdAt,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
