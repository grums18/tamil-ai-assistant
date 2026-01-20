import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Eye, MessageCircle, Clock, Lightbulb } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

/**
 * YouTube Analytics Dashboard
 * Displays channel metrics, audience demographics, and content recommendations
 */
export default function YouTubeAnalytics() {
  const { user, isAuthenticated } = useAuth();
  const [channelId, setChannelId] = useState("UCxxxxxxxxxxxxxx");
  const [activeTab, setActiveTab] = useState<"metrics" | "demographics" | "recommendations" | "performance">("metrics");

  const metricsQuery = trpc.youtube.getChannelMetrics.useQuery(
    { channelId },
    { enabled: !!channelId }
  );

  const videosQuery = trpc.youtube.getVideoMetrics.useQuery(
    { channelId, limit: 10 },
    { enabled: !!channelId }
  );

  const demographicsQuery = trpc.youtube.getAudienceDemographics.useQuery(
    { channelId },
    { enabled: !!channelId }
  );

  const postingTimesQuery = trpc.youtube.getOptimalPostingTimes.useQuery(
    { channelId },
    { enabled: !!channelId }
  );

  const recommendationsQuery = trpc.youtube.getContentRecommendations.useQuery(
    { channelId },
    { enabled: !!channelId }
  );

  const performanceQuery = trpc.youtube.analyzeChannelPerformance.useQuery(
    { channelId },
    { enabled: !!channelId }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-xl text-slate-400">Please log in to view YouTube Analytics.</p>
        </div>
      </div>
    );
  }

  const metrics = metricsQuery.data?.data;
  const demographics = demographicsQuery.data?.data;
  const recommendations = recommendationsQuery.data?.data;
  const performance = performanceQuery.data?.data;
  const postingTimes = postingTimesQuery.data?.data;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">YouTube Analytics</h1>
          <p className="text-slate-400">
            Analyze your channel performance and get AI-powered content recommendations
          </p>
        </div>

        {/* Channel ID Input */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="Enter YouTube Channel ID (e.g., UCxxxxxxxxxxxxxx)"
              className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-indigo-500 outline-none"
            />
            <Button
              onClick={() => metricsQuery.refetch()}
              disabled={metricsQuery.isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {metricsQuery.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load Analytics"
              )}
            </Button>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-800">
          {["metrics", "demographics", "recommendations", "performance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Metrics Tab */}
        {activeTab === "metrics" && (
          <div className="space-y-6">
            {metricsQuery.isLoading ? (
              <Card className="bg-slate-900 border-slate-800 p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              </Card>
            ) : metrics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Subscribers</p>
                      <p className="text-2xl font-bold text-white">
                        {(metrics.subscriberCount / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-indigo-400" />
                  </div>
                </Card>

                <Card className="bg-slate-900 border-slate-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Views</p>
                      <p className="text-2xl font-bold text-white">
                        {(metrics.viewCount / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-green-400" />
                  </div>
                </Card>

                <Card className="bg-slate-900 border-slate-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Videos</p>
                      <p className="text-2xl font-bold text-white">{metrics.videoCount}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                </Card>

                <Card className="bg-slate-900 border-slate-800 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Avg Views/Video</p>
                      <p className="text-2xl font-bold text-white">
                        {(metrics.viewCount / metrics.videoCount / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <MessageCircle className="w-8 h-8 text-orange-400" />
                  </div>
                </Card>
              </div>
            ) : null}

            {/* Top Videos */}
            {videosQuery.data?.data && Array.isArray(videosQuery.data.data) && videosQuery.data.data.length > 0 && (
              <Card className="bg-slate-900 border-slate-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Top Performing Videos</h2>
                <div className="space-y-3">
                  {videosQuery.data?.data?.slice(0, 5).map((video: any) => (
                    <div key={video.videoId} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-white font-medium">{video.title}</h3>
                        <span className="text-indigo-400 text-sm">
                          {(video.engagementRate * 100).toFixed(2)}% engagement
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-slate-400">
                        <span>{video.views.toLocaleString()} views</span>
                        <span>{video.likes.toLocaleString()} likes</span>
                        <span>{video.comments.toLocaleString()} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Demographics Tab */}
        {activeTab === "demographics" && (
          <div className="space-y-6">
            {demographicsQuery.isLoading ? (
              <Card className="bg-slate-900 border-slate-800 p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              </Card>
            ) : demographics ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Age Groups */}
                  <Card className="bg-slate-900 border-slate-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Age Distribution</h3>
                    <div className="space-y-3">
                      {Object.entries(demographics.ageGroups).map(([age, percent]) => (
                        <div key={age}>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-300">{age}</span>
                            <span className="text-indigo-400">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Gender Distribution */}
                  <Card className="bg-slate-900 border-slate-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Gender Distribution</h3>
                    <div className="space-y-3">
                      <div>
                      <div className="flex justify-between mb-1">
                            <span className="text-slate-300">Male</span>
                            <span className="text-blue-400">{demographics?.ageGroups?.['18-24'] || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${demographics?.ageGroups?.['18-24'] || 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-300">Female</span>
                          <span className="text-pink-400">{demographics?.ageGroups?.['25-34'] || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-pink-500 h-2 rounded-full"
                            style={{ width: `${demographics?.ageGroups?.['25-34'] || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Top Countries */}
                <Card className="bg-slate-900 border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
                  <div className="space-y-3">
                    {Object.entries(demographics?.ageGroups || {})
                      .sort(([, a]: any, [, b]: any) => (b as number) - (a as number))
                      .map(([country, percent]: any) => (
                        <div key={country}>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-300">{country}</span>
                            <span className="text-green-400">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              </>
            ) : null}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && (
          <div className="space-y-6">
            {recommendationsQuery.isLoading ? (
              <Card className="bg-slate-900 border-slate-800 p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              </Card>
            ) : recommendations && Array.isArray(recommendations) && recommendations.length > 0 ? (
              <div className="space-y-4">
                {(recommendations as any[]).map((rec: any, idx: number) => (
                  <Card key={idx} className="bg-slate-900 border-slate-800 p-6">
                    <div className="flex gap-4">
                      <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{rec.title}</h3>
                        <p className="text-slate-300 mb-3">{rec.reason}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                            Target: {rec.targetAudience}
                          </span>
                          <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-1 rounded">
                            Expected Engagement: {(rec.expectedEngagement * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rec.suggestedKeywords.map((keyword: string) => (
                            <span
                              key={keyword}
                              className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                            >
                              #{keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : null}

            {/* Optimal Posting Times */}
            {postingTimes && Array.isArray(postingTimes) && (
              <Card className="bg-slate-900 border-slate-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Optimal Posting Times
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
                  {(postingTimes as any[]).map((time: any) => (
                    <div key={time.dayOfWeek} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                      <p className="text-sm font-medium text-white">{time.dayOfWeek}</p>
                      <p className="text-lg font-bold text-indigo-400">{time.hour}:00</p>
                      <p className="text-xs text-slate-400">{time.recommendedContent}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <div className="space-y-6">
            {performanceQuery.isLoading ? (
              <Card className="bg-slate-900 border-slate-800 p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              </Card>
            ) : performance ? (
              <>
                {/* Overall Score */}
                <Card className="bg-slate-900 border-slate-800 p-6">
                  <div className="text-center">
                    <p className="text-slate-400 mb-2">Channel Performance Score</p>
                    <div className="text-6xl font-bold text-indigo-400 mb-2">{performance?.overallScore}</div>
                    <div className="w-full bg-slate-800 rounded-full h-4">
                      <div
                        className="bg-indigo-500 h-4 rounded-full"
                        style={{ width: `${performance?.overallScore}%` }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Strengths */}
                <Card className="bg-slate-900 border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Strengths</h3>
                  <div className="space-y-2">
                    {(performance?.strengths || []).map((strength: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-green-400">
                        <span className="text-lg">✓</span>
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Opportunities */}
                <Card className="bg-slate-900 border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Opportunities</h3>
                  <div className="space-y-2">
                    {(performance?.opportunities || []).map((opp: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-yellow-400">
                        <span className="text-lg">→</span>
                        <span>{opp}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recommendations */}
                <Card className="bg-slate-900 border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Action Items</h3>
                  <div className="space-y-2">
                    {(performance?.recommendations || []).map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                        <span className="text-slate-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
