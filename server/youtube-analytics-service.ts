import { invokeLLM } from "./_core/llm";
import { trackUsage } from "./db";

/**
 * YouTube Analytics Service
 * Integrates with YouTube Data API to fetch channel metrics and provide recommendations
 */

export interface YouTubeMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime: number;
  averageViewDuration: number;
  clickThroughRate: number;
  subscribers: number;
  subscriberGrowth: number;
}

export interface AudienceDemographics {
  age: Record<string, number>;
  gender: Record<string, number>;
  country: Record<string, number>;
  topCountries: string[];
}

export interface TrafficSource {
  youtube_search: number;
  browse: number;
  external: number;
  direct: number;
  playlist: number;
  other: number;
}

export interface VideoPerformance {
  videoId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  watchTime: number;
  averageViewDuration: number;
}

export interface AnalyticsRecommendation {
  category: string;
  recommendation: string;
  impact: "high" | "medium" | "low";
  actionItems: string[];
  estimatedImpact: string;
}

/**
 * Fetch YouTube channel metrics
 * In production, this would call YouTube Data API v3
 */
export async function fetchYouTubeMetrics(
  channelId: string,
  accessToken: string
): Promise<YouTubeMetrics> {
  try {
    // Simulate YouTube API call
    // In production: call https://www.googleapis.com/youtube/v3/channels
    // with parameters: part=statistics,snippet
    // headers: Authorization: Bearer {accessToken}

    const metrics: YouTubeMetrics = {
      views: Math.floor(Math.random() * 1000000),
      likes: Math.floor(Math.random() * 50000),
      comments: Math.floor(Math.random() * 10000),
      shares: Math.floor(Math.random() * 5000),
      watchTime: Math.floor(Math.random() * 100000),
      averageViewDuration: Math.random() * 10,
      clickThroughRate: Math.random() * 5,
      subscribers: Math.floor(Math.random() * 500000),
      subscriberGrowth: Math.floor(Math.random() * 10000),
    };

    return metrics;
  } catch (error) {
    console.error("[YouTube Analytics] Failed to fetch metrics:", error);
    throw new Error("Failed to fetch YouTube metrics");
  }
}

/**
 * Fetch audience demographics
 */
export async function fetchAudienceDemographics(
  channelId: string,
  accessToken: string
): Promise<AudienceDemographics> {
  try {
    // In production: call YouTube Analytics API
    // Endpoint: https://youtubeanalytics.googleapis.com/v2/reports
    // Metrics: audiencePercentageByAgeGroup, audiencePercentageByGender, audiencePercentageByCountry

    const demographics: AudienceDemographics = {
      age: {
        "13-17": 15,
        "18-24": 25,
        "25-34": 30,
        "35-44": 20,
        "45-54": 7,
        "55+": 3,
      },
      gender: {
        male: 65,
        female: 35,
      },
      country: {
        "IN": 45,
        "US": 20,
        "GB": 10,
        "CA": 8,
        "AU": 7,
        "Other": 10,
      },
      topCountries: ["IN", "US", "GB", "CA", "AU"],
    };

    return demographics;
  } catch (error) {
    console.error("[YouTube Analytics] Failed to fetch demographics:", error);
    throw new Error("Failed to fetch audience demographics");
  }
}

/**
 * Fetch traffic sources
 */
export async function fetchTrafficSources(
  channelId: string,
  accessToken: string
): Promise<TrafficSource> {
  try {
    // In production: call YouTube Analytics API
    // Metrics: trafficSourceType

    const trafficSources: TrafficSource = {
      youtube_search: 35,
      browse: 25,
      external: 20,
      direct: 12,
      playlist: 5,
      other: 3,
    };

    return trafficSources;
  } catch (error) {
    console.error("[YouTube Analytics] Failed to fetch traffic sources:", error);
    throw new Error("Failed to fetch traffic sources");
  }
}

/**
 * Fetch top performing videos
 */
export async function fetchTopVideos(
  channelId: string,
  accessToken: string,
  limit: number = 10
): Promise<VideoPerformance[]> {
  try {
    // In production: call YouTube Data API v3
    // Endpoint: https://www.googleapis.com/youtube/v3/search
    // with forChannelId={channelId}, order=viewCount

    const topVideos: VideoPerformance[] = Array.from({ length: limit }, (_, i) => ({
      videoId: `video_${i + 1}`,
      title: `Popular Video ${i + 1}`,
      views: Math.floor(Math.random() * 100000) + 10000,
      likes: Math.floor(Math.random() * 5000),
      comments: Math.floor(Math.random() * 1000),
      watchTime: Math.floor(Math.random() * 50000),
      averageViewDuration: Math.random() * 10,
    }));

    return topVideos.sort((a, b) => b.views - a.views);
  } catch (error) {
    console.error("[YouTube Analytics] Failed to fetch top videos:", error);
    throw new Error("Failed to fetch top videos");
  }
}

/**
 * Generate personalized recommendations based on analytics
 */
export async function generateAnalyticsRecommendations(
  userId: number,
  channelId: string,
  metrics: YouTubeMetrics,
  demographics: AudienceDemographics,
  trafficSources: TrafficSource,
  topVideos: VideoPerformance[]
): Promise<AnalyticsRecommendation[]> {
  try {
    const analysisPrompt = `
You are a YouTube content strategy expert. Analyze the following channel analytics and provide specific, actionable recommendations for a Tamil content creator.

Channel Metrics:
- Total Views: ${metrics.views}
- Likes: ${metrics.likes}
- Comments: ${metrics.comments}
- Watch Time: ${metrics.watchTime} hours
- Average View Duration: ${metrics.averageViewDuration.toFixed(2)} minutes
- Subscribers: ${metrics.subscribers}
- Subscriber Growth: ${metrics.subscriberGrowth}

Audience Demographics:
- Top Age Group: ${Object.entries(demographics.age).sort(([, a], [, b]) => b - a)[0]?.[0] || "Unknown"}
- Gender Split: ${demographics.gender.male}% male, ${demographics.gender.female}% female
- Top Countries: ${demographics.topCountries.join(", ")}

Traffic Sources:
- YouTube Search: ${trafficSources.youtube_search}%
- Browse: ${trafficSources.browse}%
- External: ${trafficSources.external}%

Top Performing Videos:
${topVideos.slice(0, 3).map((v, i) => `${i + 1}. "${v.title}" - ${v.views} views`).join("\n")}

Provide 5 specific recommendations in Tamil context:
1. Content strategy recommendation
2. Upload frequency recommendation
3. Audience engagement recommendation
4. Collaboration opportunity
5. Monetization opportunity

Format as JSON array with objects containing: category, recommendation, impact (high/medium/low), actionItems (array), estimatedImpact (string).
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a YouTube analytics expert providing recommendations for Tamil creators. Respond with valid JSON only.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recommendations",
          strict: true,
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                recommendation: { type: "string" },
                impact: { type: "string", enum: ["high", "medium", "low"] },
                actionItems: {
                  type: "array",
                  items: { type: "string" },
                },
                estimatedImpact: { type: "string" },
              },
              required: ["category", "recommendation", "impact", "actionItems", "estimatedImpact"],
            },
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from LLM");

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const recommendations = JSON.parse(contentStr) as AnalyticsRecommendation[];

    // Track usage
    await trackUsage(userId, "youtube_analytics", response.usage?.total_tokens || 0, 0);

    return recommendations;
  } catch (error) {
    console.error("[YouTube Analytics] Failed to generate recommendations:", error);
    throw new Error("Failed to generate recommendations");
  }
}

/**
 * Get comprehensive analytics report
 */
export async function getAnalyticsReport(
  userId: number,
  channelId: string,
  accessToken: string
) {
  try {
    // Fetch all analytics data in parallel
    const [metrics, demographics, trafficSources, topVideos] = await Promise.all([
      fetchYouTubeMetrics(channelId, accessToken),
      fetchAudienceDemographics(channelId, accessToken),
      fetchTrafficSources(channelId, accessToken),
      fetchTopVideos(channelId, accessToken),
    ]);

    // Generate recommendations
    const recommendations = await generateAnalyticsRecommendations(
      userId,
      channelId,
      metrics,
      demographics,
      trafficSources,
      topVideos
    );

    return {
      metrics,
      demographics,
      trafficSources,
      topVideos,
      recommendations,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("[YouTube Analytics] Failed to get analytics report:", error);
    throw new Error("Failed to generate analytics report");
  }
}

/**
 * Calculate engagement rate
 */
export function calculateEngagementRate(metrics: YouTubeMetrics): number {
  const totalEngagement = metrics.likes + metrics.comments + metrics.shares;
  if (metrics.views === 0) return 0;
  return (totalEngagement / metrics.views) * 100;
}

/**
 * Calculate growth metrics
 */
export function calculateGrowthMetrics(
  currentMetrics: YouTubeMetrics,
  previousMetrics: YouTubeMetrics
) {
  return {
    viewsGrowth: ((currentMetrics.views - previousMetrics.views) / previousMetrics.views) * 100,
    subscriberGrowth: ((currentMetrics.subscribers - previousMetrics.subscribers) / previousMetrics.subscribers) * 100,
    engagementGrowth:
      ((calculateEngagementRate(currentMetrics) - calculateEngagementRate(previousMetrics)) /
        calculateEngagementRate(previousMetrics)) *
      100,
  };
}

/**
 * Get optimal posting times based on audience timezone
 */
export function getOptimalPostingTimes(demographics: AudienceDemographics): string[] {
  // Based on audience location, suggest optimal posting times
  const optimalTimes: Record<string, string[]> = {
    IN: ["08:00", "14:00", "20:00"], // India Standard Time
    US: ["18:00", "21:00"], // US Eastern
    GB: ["19:00", "22:00"], // UK Time
    AU: ["09:00", "15:00"], // Australia Eastern
  };

  const times = new Set<string>();
  demographics.topCountries.forEach((country) => {
    const countryTimes = optimalTimes[country] || [];
    countryTimes.forEach((time) => times.add(time));
  });

  return Array.from(times).sort();
}
