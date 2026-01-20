import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, MessageSquare, Zap, TrendingUp, Activity, Loader2 } from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: systemStats, isLoading: statsLoading } = trpc.admin.getSystemStats.useQuery();
  const { data: topUsers, isLoading: usersLoading } = trpc.admin.getTopUsers.useQuery({ limit: 5 });
  const { data: contentStats, isLoading: contentLoading } = trpc.admin.getContentStats.useQuery();
  const { data: usageByFeature, isLoading: usageLoading } = trpc.admin.getUsageByFeature.useQuery({ limit: 10 });
  const { data: recentActivity, isLoading: activityLoading } = trpc.admin.getRecentActivity.useQuery({ limit: 20 });

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <Card className="border-red-600 bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-400">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto p-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">System monitoring and analytics</p>
        </div>

        {/* System Stats */}
        {statsLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.totalUsers || 0}</div>
                <p className="text-xs text-slate-400 mt-1">Active creators</p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.totalConversations || 0}</div>
                <p className="text-xs text-slate-400 mt-1">Total chat sessions</p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Generated</CardTitle>
                <Zap className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.totalContentGenerated || 0}</div>
                <p className="text-xs text-slate-400 mt-1">Scripts, thumbnails, SEO</p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Tokens/User</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.averageTokensPerUser.toFixed(0) || 0}</div>
                <p className="text-xs text-slate-400 mt-1">Average usage</p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Activity className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.averageResponseTime.toFixed(0) || 0}ms</div>
                <p className="text-xs text-slate-400 mt-1">System performance</p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.activeUsers || 0}</div>
                <p className="text-xs text-slate-400 mt-1">Last 30 days</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Content Stats Chart */}
          {contentLoading ? (
            <Card className="border-slate-700 bg-slate-800 flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin" />
            </Card>
          ) : (
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>Content Generation by Type</CardTitle>
                <CardDescription className="text-slate-400">Distribution of generated content</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contentStats?.stats || []}
                      dataKey="count"
                      nameKey="contentType"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {contentStats?.stats?.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Usage by Feature Chart */}
          {usageLoading ? (
            <Card className="border-slate-700 bg-slate-800 flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin" />
            </Card>
          ) : (
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>Usage by Feature</CardTitle>
                <CardDescription className="text-slate-400">Top features by request count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageByFeature?.usage || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="featureName" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top Users */}
        {usersLoading ? (
          <Card className="border-slate-700 bg-slate-800 flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </Card>
        ) : (
          <Card className="border-slate-700 bg-slate-800 mb-8">
            <CardHeader>
              <CardTitle>Top Users by Usage</CardTitle>
              <CardDescription className="text-slate-400">Most active creators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topUsers?.users?.map((user, idx) => (
                  <div key={user.userId} className="flex items-center justify-between bg-slate-700 p-4 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{idx + 1}. {user.userName}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{user.totalTokensUsed.toLocaleString()} tokens</p>
                      <p className="text-sm text-slate-400">{user.totalRequests} requests</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {activityLoading ? (
          <Card className="border-slate-700 bg-slate-800 flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </Card>
        ) : (
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="text-slate-400">Latest system operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentActivity?.activity?.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between bg-slate-700 p-3 rounded text-sm">
                    <div>
                      <p className="font-medium">{activity.featureName}</p>
                      <p className="text-slate-400">User #{activity.userId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{activity.totalTokensUsed} tokens</p>
                      <p className="text-slate-400">{activity.averageResponseTime.toFixed(0)}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
