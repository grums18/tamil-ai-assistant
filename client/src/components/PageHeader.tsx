import { ArrowLeft, Home } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
}

export default function PageHeader({
  title,
  description,
  showBackButton = true,
}: PageHeaderProps) {
  const [location, setLocation] = useLocation();

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="mb-6 border-b border-slate-800 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/")}
            className="bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            <Home className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      {description && <p className="text-slate-400">{description}</p>}
    </div>
  );
}
