import { getDb } from "./db";
import { users, usageAnalytics, conversations, generatedContent } from "../drizzle/schema";
import { count, sum, avg, desc, eq } from "drizzle-orm";

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalConversations: number;
  totalContentGenerated: number;
  averageTokensPerUser: number;
  averageResponseTime: number;
}

export interface UserStats {
  userId: number;
  userName: string;
  email: string;
  totalTokensUsed: number;
  totalRequests: number;
  averageResponseTime: number;
  lastActive: Date;
}

export interface ContentStats {
  contentType: string;
  count: number;
  averageQuality: number;
}

export async function getSystemStats(): Promise<SystemStats> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get total users
    const totalUsersResult = await db
      .select({ count: count() })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get active users (simplified)
    const activeUsersResult = await db
      .select({ count: count() })
      .from(users);
    const activeUsers = activeUsersResult[0]?.count || 0;

    // Get total conversations
    const totalConversationsResult = await db
      .select({ count: count() })
      .from(conversations);
    const totalConversations = totalConversationsResult[0]?.count || 0;

    // Get total content generated
    const totalContentResult = await db
      .select({ count: count() })
      .from(generatedContent);
    const totalContentGenerated = totalContentResult[0]?.count || 0;

    // Get average tokens per user
    const avgTokensResult = await db
      .select({ avg: avg(usageAnalytics.totalTokensUsed) })
      .from(usageAnalytics);
    const averageTokensPerUser = avgTokensResult[0]?.avg ? Number(avgTokensResult[0].avg) : 0;

    // Get average response time
    const avgResponseTimeResult = await db
      .select({ avg: avg(usageAnalytics.averageResponseTime) })
      .from(usageAnalytics);
    const averageResponseTime = avgResponseTimeResult[0]?.avg ? Number(avgResponseTimeResult[0].avg) : 0;

    return {
      totalUsers,
      activeUsers,
      totalConversations,
      totalContentGenerated,
      averageTokensPerUser,
      averageResponseTime,
    };
  } catch (error) {
    console.error("Error getting system stats:", error);
    throw error;
  }
}

export async function getUserStats(limit: number = 10): Promise<UserStats[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get top users by token usage
    const userStatsResult = await db
      .select({
        userId: users.id,
        userName: users.name,
        email: users.email,
        totalTokensUsed: sum(usageAnalytics.totalTokensUsed),
        totalRequests: count(),
        averageResponseTime: avg(usageAnalytics.averageResponseTime),
        lastActive: users.lastSignedIn,
      })
      .from(usageAnalytics)
      .leftJoin(users, () => eq(usageAnalytics.userId, users.id))
      .groupBy(users.id)
      .orderBy(desc(sum(usageAnalytics.totalTokensUsed)))
      .limit(limit);

    return userStatsResult.map((stat: any) => ({
      userId: stat.userId,
      userName: stat.userName || "Unknown",
      email: stat.email || "N/A",
      totalTokensUsed: stat.totalTokensUsed ? Number(stat.totalTokensUsed) : 0,
      totalRequests: stat.totalRequests || 0,
      averageResponseTime: stat.averageResponseTime ? Number(stat.averageResponseTime) : 0,
      lastActive: stat.lastActive || new Date(),
    }));
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw error;
  }
}

export async function getContentStats(): Promise<ContentStats[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get content generation stats by type
    const contentStatsResult = await db
      .select({
        contentType: generatedContent.contentType,
        count: count(),
        averageQuality: avg(generatedContent.quality),
      })
      .from(generatedContent)
      .groupBy(generatedContent.contentType)
      .orderBy(desc(count()));

    return contentStatsResult.map((stat: any) => ({
      contentType: stat.contentType,
      count: stat.count || 0,
      averageQuality: stat.averageQuality ? Number(stat.averageQuality) : 0,
    }));
  } catch (error) {
    console.error("Error getting content stats:", error);
    throw error;
  }
}

export async function getUsageByFeature(limit: number = 10): Promise<Array<{
  featureName: string;
  count: number;
  totalTokens: number;
  averageResponseTime: number;
}>> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get usage stats by feature
    const usageResult = await db
      .select({
        featureName: usageAnalytics.featureName,
        count: count(),
        totalTokens: sum(usageAnalytics.totalTokensUsed),
        averageResponseTime: avg(usageAnalytics.averageResponseTime),
      })
      .from(usageAnalytics)
      .groupBy(usageAnalytics.featureName)
      .orderBy(desc(count()))
      .limit(limit);

    return usageResult.map((stat: any) => ({
      featureName: stat.featureName,
      count: stat.count || 0,
      totalTokens: stat.totalTokens ? Number(stat.totalTokens) : 0,
      averageResponseTime: stat.averageResponseTime ? Number(stat.averageResponseTime) : 0,
    }));
  } catch (error) {
    console.error("Error getting usage by feature:", error);
    throw error;
  }
}

export async function getRecentActivity(limit: number = 20): Promise<Array<{
  id: number;
  userId: number;
  featureName: string;
  totalTokensUsed: number;
  averageResponseTime: number;
  createdAt: Date;
}>> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get recent activity
    const activityResult = await db
      .select({
        id: usageAnalytics.id,
        userId: usageAnalytics.userId,
        featureName: usageAnalytics.featureName,
        totalTokensUsed: usageAnalytics.totalTokensUsed,
        averageResponseTime: usageAnalytics.averageResponseTime,
        createdAt: usageAnalytics.createdAt,
      })
      .from(usageAnalytics)
      .orderBy(desc(usageAnalytics.createdAt))
      .limit(limit);

    return activityResult.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      featureName: row.featureName,
      totalTokensUsed: row.totalTokensUsed || 0,
      averageResponseTime: row.averageResponseTime ? Number(row.averageResponseTime) : 0,
      createdAt: row.createdAt,
    }));
  } catch (error) {
    console.error("Error getting recent activity:", error);
    throw error;
  }
}
