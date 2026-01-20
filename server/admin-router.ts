import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getSystemStats,
  getUserStats,
  getContentStats,
  getUsageByFeature,
  getRecentActivity,
} from "./admin-service";
import { getUserById } from "./db";

// Admin-only middleware
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await getUserById(ctx.user.id);
  if (user?.role !== "admin") {
    throw new Error("Admin access required");
  }
  return next({ ctx });
});

export const adminRouter = router({
  // Get system statistics
  getSystemStats: adminProcedure.query(async () => {
    try {
      const stats = await getSystemStats();
      return {
        ...stats,
        success: true,
      };
    } catch (error) {
      console.error("Error in getSystemStats:", error);
      throw error;
    }
  }),

  // Get top users by usage
  getTopUsers: adminProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      try {
        const users = await getUserStats(input.limit);
        return {
          users,
          success: true,
        };
      } catch (error) {
        console.error("Error in getTopUsers:", error);
        throw error;
      }
    }),

  // Get content generation statistics
  getContentStats: adminProcedure.query(async () => {
    try {
      const stats = await getContentStats();
      return {
        stats,
        success: true,
      };
    } catch (error) {
      console.error("Error in getContentStats:", error);
      throw error;
    }
  }),

  // Get usage by feature
  getUsageByFeature: adminProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      try {
        const usage = await getUsageByFeature(input.limit);
        return {
          usage,
          success: true,
        };
      } catch (error) {
        console.error("Error in getUsageByFeature:", error);
        throw error;
      }
    }),

  // Get recent activity
  getRecentActivity: adminProcedure
    .input(z.object({
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      try {
        const activity = await getRecentActivity(input.limit);
        return {
          activity,
          success: true,
        };
      } catch (error) {
        console.error("Error in getRecentActivity:", error);
        throw error;
      }
    }),
});
