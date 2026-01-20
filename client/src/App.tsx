import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import YouTubeAnalytics from "@/pages/YouTubeAnalytics";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CreatorProfile from "./pages/CreatorProfile";
import Chat from "./pages/Chat";
import ContentGenerator from "./pages/ContentGenerator";
import VoiceInput from "./pages/VoiceInput";
import AdminDashboard from "./pages/AdminDashboard";
import ChatEnhanced from "./pages/ChatEnhanced";
import ContentScheduler from "./pages/ContentScheduler";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/youtube-analytics"} component={YouTubeAnalytics} />
      <Route path={"/profile"} component={CreatorProfile} />
      <Route path={"/chat"} component={Chat} />
      <Route path={"/chat-enhanced"} component={ChatEnhanced} />
      <Route path={"/script-generator"} component={ContentGenerator} />
      <Route path={"/voice-input"} component={VoiceInput} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/scheduler"} component={ContentScheduler} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
