import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Zap, Mic, TrendingUp, Settings, LogOut, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

interface DashboardProps {
  onNavigate?: (path: string) => void;
}

export function TamilAIDashboard({ onNavigate }: DashboardProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const features = [
    {
      title: "Chat with AI",
      description: "Natural conversation in Tamil and Tanglish",
      icon: MessageCircle,
      path: "/chat",
      color: "bg-blue-500",
    },
    {
      title: "Script Generator",
      description: "Create 10-minute video scripts",
      icon: Zap,
      path: "/script-generator",
      color: "bg-purple-500",
    },
    {
      title: "Voice Input",
      description: "Tamil speech-to-text with Whisper",
      icon: Mic,
      path: "/voice-input",
      color: "bg-green-500",
    },
    {
      title: "Trends & Insights",
      description: "Real-time YouTube trends",
      icon: TrendingUp,
      path: "/trends",
      color: "bg-orange-500",
    },
    {
      title: "Tamil Literature",
      description: "Learn Tamil heritage & Thirukkural",
      icon: BookOpen,
      path: "/literature",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">த</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Tamil AI Assistant</h1>
              <p className="text-xs text-slate-400">For Content Creators</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name?.split(" ")[0]}!</h2>
          <p className="text-slate-400">Your AI-powered content creation assistant for Tamil YouTube creators</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.path} href={feature.path}>
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-slate-700 bg-slate-800 hover:bg-slate-700">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-2`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-slate-400">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full border-slate-600 hover:bg-slate-700">
                      Open
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm font-medium">Total Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-xs text-slate-400 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm font-medium">Content Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-xs text-slate-400 mt-1">Scripts & ideas</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm font-medium">Voice Inputs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-xs text-slate-400 mt-1">Transcribed</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm font-medium">Literature Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-xs text-slate-400 mt-1">Kurals learned</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
