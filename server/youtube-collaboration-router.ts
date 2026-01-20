import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getAnalyticsReport,
  calculateEngagementRate,
  getOptimalPostingTimes,
  type YouTubeMetrics,
} from "./youtube-analytics-service";
import {
  createCollaborationProject,
  addProjectMember,
  createSharedDocument,
  updateDocumentContent,
  lockDocument,
  unlockDocument,
  addDocumentComment,
  replyToComment,
  resolveComment,
  getDocumentHistory,
  getProjectActivity,
  getActiveCollaborators,
  exportProjectAsDocument,
  type CollaborationProject,
} from "./collaboration-service";
import { trackUsage } from "./db";

/**
 * YouTube Analytics Router
 */
export const youtubeAnalyticsRouter = router({
  /**
   * Get channel analytics and recommendations
   */
  getAnalytics: protectedProcedure
    .input(
      z.object({
        channelId: z.string().min(1),
        accessToken: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const startTime = Date.now();

        const report = await getAnalyticsReport(ctx.user.id, input.channelId, input.accessToken);

        const responseTime = Date.now() - startTime;
        await trackUsage(ctx.user.id, "youtube_analytics", 0, responseTime);

        return {
          success: true,
          data: report,
          engagementRate: calculateEngagementRate(report.metrics),
          optimalPostingTimes: getOptimalPostingTimes(report.demographics),
        };
      } catch (error) {
        console.error("[YouTube Analytics Router] Error:", error);
        throw new Error("Failed to fetch analytics");
      }
    }),

  /**
   * Get optimal posting times
   */
  getOptimalPostingTimes: protectedProcedure
    .input(
      z.object({
        channelId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // In production, fetch actual audience demographics from database
        const demographics = {
          age: {},
          gender: {},
          country: { IN: 45, US: 20, GB: 10 },
          topCountries: ["IN", "US", "GB"],
        };

        const times = getOptimalPostingTimes(demographics);

        return {
          success: true,
          optimalTimes: times,
          recommendation: `Post your content at these times (in your timezone) to reach maximum audience: ${times.join(", ")}`,
        };
      } catch (error) {
        console.error("[Optimal Times Router] Error:", error);
        throw new Error("Failed to get optimal posting times");
      }
    }),

  /**
   * Get engagement metrics
   */
  getEngagementMetrics: protectedProcedure
    .input(
      z.object({
        channelId: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Mock metrics for demonstration
        const metrics: YouTubeMetrics = {
          views: 150000,
          likes: 5000,
          comments: 800,
          shares: 300,
          watchTime: 45000,
          averageViewDuration: 6.5,
          clickThroughRate: 3.2,
          subscribers: 25000,
          subscriberGrowth: 500,
        };

        const engagementRate = calculateEngagementRate(metrics);

        return {
          success: true,
          metrics,
          engagementRate: engagementRate.toFixed(2),
          insights: {
            highEngagement: engagementRate > 5,
            recommendation:
              engagementRate > 5
                ? "Your engagement rate is excellent! Keep creating similar content."
                : "Try to increase engagement by asking questions and encouraging comments.",
          },
        };
      } catch (error) {
        console.error("[Engagement Metrics Router] Error:", error);
        throw new Error("Failed to get engagement metrics");
      }
    }),
});

/**
 * Collaboration Router
 */
export const collaborationRouter = router({
  /**
   * Create new collaboration project
   */
  createProject: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        visibility: z.enum(["private", "team", "public"]).default("private"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await createCollaborationProject(
          ctx.user.id,
          input.title,
          input.description,
          input.visibility
        );

        await trackUsage(ctx.user.id, "collaboration", 0, 0);

        return {
          success: true,
          project,
        };
      } catch (error) {
        console.error("[Create Project Router] Error:", error);
        throw new Error("Failed to create project");
      }
    }),

  /**
   * Add member to project
   */
  addMember: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        userId: z.number(),
        userName: z.string(),
        role: z.enum(["editor", "viewer", "commenter"]).default("editor"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const member = await addProjectMember(
          input.projectId,
          input.userId,
          input.userName,
          input.role
        );

        await trackUsage(ctx.user.id, "collaboration", 0, 0);

        return {
          success: true,
          member,
        };
      } catch (error) {
        console.error("[Add Member Router] Error:", error);
        throw new Error("Failed to add member");
      }
    }),

  /**
   * Create shared document
   */
  createDocument: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string().min(1).max(255),
        documentType: z.enum(["script", "outline", "notes", "brainstorm"]),
        content: z.string().optional(),
        language: z.enum(["tamil", "tanglish", "mixed"]).default("tamil"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const document = await createSharedDocument(
          input.projectId,
          input.title,
          input.documentType,
          input.content,
          input.language
        );

        await trackUsage(ctx.user.id, "collaboration", 0, 0);

        return {
          success: true,
          document,
        };
      } catch (error) {
        console.error("[Create Document Router] Error:", error);
        throw new Error("Failed to create document");
      }
    }),

  /**
   * Update document content
   */
  updateDocument: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        content: z.string(),
        changesSummary: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await updateDocumentContent(
          input.documentId,
          input.content,
          ctx.user.id,
          input.changesSummary
        );

        await trackUsage(ctx.user.id, "collaboration", 0, 0);

        return {
          success: true,
          ...result,
        };
      } catch (error) {
        console.error("[Update Document Router] Error:", error);
        throw new Error("Failed to update document");
      }
    }),

  /**
   * Lock document for exclusive editing
   */
  lockDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const document = await lockDocument(input.documentId, ctx.user.id);

        await trackUsage(ctx.user.id, "collaboration", 0, 0);

        return {
          success: true,
          document,
          message: "Document locked for editing",
        };
      } catch (error) {
        console.error("[Lock Document Router] Error:", error);
        throw new Error("Failed to lock document");
      }
    }),

  /**
   * Unlock document
   */
  unlockDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const document = await unlockDocument(input.documentId);

        await trackUsage(ctx.user.id, "collaboration", 0, 0);

        return {
          success: true,
          document,
          message: "Document unlocked",
        };
      } catch (error) {
        console.error("[Unlock Document Router] Error:", error);
        throw new Error("Failed to unlock document");
      }
    }),

  /**
   * Add comment to document
   */
  addComment: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        content: z.string().min(1),
        lineNumber: z.number().optional(),
        charOffset: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const comment = await addDocumentComment(
          input.documentId,
          ctx.user.id,
          ctx.user.name || "Anonymous",
          input.content,
          input.lineNumber,
          input.charOffset
        );

        await trackUsage(ctx.user.id, "collaboration", 0, 0);

        return {
          success: true,
          comment,
        };
      } catch (error) {
        console.error("[Add Comment Router] Error:", error);
        throw new Error("Failed to add comment");
      }
    }),

  /**
   * Reply to comment
   */
  replyToComment: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const comment = await replyToComment(
          input.commentId,
          ctx.user.id,
          ctx.user.name || "Anonymous",
          input.content
        );

        await trackUsage(ctx.user.id, "collaboration", 0, 0);

        return {
          success: true,
          comment,
        };
      } catch (error) {
        console.error("[Reply Comment Router] Error:", error);
        throw new Error("Failed to reply to comment");
      }
    }),

  /**
   * Resolve comment
   */
  resolveComment: protectedProcedure
    .input(z.object({ commentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const comment = await resolveComment(input.commentId, ctx.user.id);

        await trackUsage(ctx.user.id, "collaboration", 0, 0);

        return {
          success: true,
          comment,
          message: "Comment resolved",
        };
      } catch (error) {
        console.error("[Resolve Comment Router] Error:", error);
        throw new Error("Failed to resolve comment");
      }
    }),

  /**
   * Get document history
   */
  getDocumentHistory: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const versions = await getDocumentHistory(input.documentId);

        return {
          success: true,
          versions,
        };
      } catch (error) {
        console.error("[Document History Router] Error:", error);
        throw new Error("Failed to get document history");
      }
    }),

  /**
   * Get project activity feed
   */
  getProjectActivity: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const activities = await getProjectActivity(input.projectId, input.limit);

        return {
          success: true,
          activities,
        };
      } catch (error) {
        console.error("[Project Activity Router] Error:", error);
        throw new Error("Failed to get project activity");
      }
    }),

  /**
   * Get active collaborators
   */
  getActiveCollaborators: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const collaborators = await getActiveCollaborators(input.projectId);

        return {
          success: true,
          collaborators,
        };
      } catch (error) {
        console.error("[Active Collaborators Router] Error:", error);
        throw new Error("Failed to get active collaborators");
      }
    }),

  /**
   * Export project as document
   */
  exportProject: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        format: z.enum(["pdf", "docx", "md"]).default("md"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const exported = await exportProjectAsDocument(input.projectId, input.format);

        await trackUsage(ctx.user.id, "collaboration", 0, 0);

        return {
          success: true,
          ...exported,
        };
      } catch (error) {
        console.error("[Export Project Router] Error:", error);
        throw new Error("Failed to export project");
      }
    }),
});
