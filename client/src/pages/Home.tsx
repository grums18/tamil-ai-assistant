import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { TamilAIDashboard } from "@/components/TamilAIDashboard";
import { getLoginUrl } from "@/const";
import { Loader2, ArrowRight, Sparkles, Mic, BookOpen, TrendingUp } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="animate-spin text-white h-8 w-8" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <TamilAIDashboard />;
  }

  // Landing Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">த</span>
            </div>
            <span className="font-bold text-lg">Tamil AI Assistant</span>
          </div>
          <Button onClick={() => window.location.href = getLoginUrl()} className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI-Powered Content Creation for Tamil Creators
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Generate scripts, thumbnails, SEO optimization, and trend insights using advanced AI. 
            Speak in Tamil, get content in Tamil.
          </p>
          <Button 
            onClick={() => window.location.href = getLoginUrl()}
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
            <Sparkles className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="font-bold mb-2">Chat Interface</h3>
            <p className="text-slate-400 text-sm">Natural conversation in Tamil and Tanglish with AI assistant</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
            <BookOpen className="h-8 w-8 text-purple-400 mb-3" />
            <h3 className="font-bold mb-2">Script Generation</h3>
            <p className="text-slate-400 text-sm">Create 10-minute video scripts with structured narratives</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-green-500 transition-colors">
            <Mic className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="font-bold mb-2">Voice Input</h3>
            <p className="text-slate-400 text-sm">Tamil speech-to-text using advanced Whisper ASR</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-orange-500 transition-colors">
            <TrendingUp className="h-8 w-8 text-orange-400 mb-3" />
            <h3 className="font-bold mb-2">Trend Insights</h3>
            <p className="text-slate-400 text-sm">Real-time YouTube and social media trends analysis</p>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-2 text-blue-400">Content Generation</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>✓ 10-minute video scripts in Tamil</li>
                <li>✓ 50 thumbnail text ideas</li>
                <li>✓ SEO-optimized titles and descriptions</li>
                <li>✓ Trend-based content suggestions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-purple-400">Language & Voice</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>✓ Tamil language support</li>
                <li>✓ Tanglish (Tamil + English) code-switching</li>
                <li>✓ Voice input with Whisper ASR</li>
                <li>✓ Text-to-speech output</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-green-400">Knowledge & RAG</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>✓ RAG-powered knowledge base</li>
                <li>✓ Vector search with FAISS</li>
                <li>✓ Grounded responses with sources</li>
                <li>✓ Creator-specific personalization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-orange-400">Creator Tools</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>✓ Conversation history</li>
                <li>✓ Content library management</li>
                <li>✓ Usage analytics</li>
                <li>✓ Admin dashboard</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Content?</h2>
          <p className="text-slate-300 mb-8">Join Tamil creators using AI to scale their content production</p>
          <Button 
            onClick={() => window.location.href = getLoginUrl()}
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8"
          >
            Start Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-slate-400 text-sm">
          <p>Tamil AI Assistant © 2026 | Powered by Qwen2.5 & Advanced NLP</p>
        </div>
      </footer>
    </div>
  );
}
