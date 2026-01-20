import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Copy, Download, BookOpen, Image as ImageIcon, TrendingUp, Settings2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function ContentGenerator() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<"tamil" | "tanglish" | "mixed">("tamil");
  const [activeTab, setActiveTab] = useState("script");

  const generateScriptMutation = trpc.content.generateScript.useMutation();
  const generateThumbnailMutation = trpc.content.generateThumbnailIdeas.useMutation();
  const generateSEOMutation = trpc.content.generateSEO.useMutation();
  const analyzeTrendsMutation = trpc.content.analyzeTrends.useMutation();
  const generateAllMutation = trpc.content.generateAll.useMutation();

  const handleGenerateScript = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    try {
      await generateScriptMutation.mutateAsync({ topic, language });
      toast.success("Script generated successfully!");
    } catch (error) {
      toast.error("Failed to generate script");
      console.error(error);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    try {
      await generateThumbnailMutation.mutateAsync({ topic, language });
      toast.success("Thumbnail ideas generated!");
    } catch (error) {
      toast.error("Failed to generate thumbnail ideas");
      console.error(error);
    }
  };

  const handleGenerateSEO = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    try {
      await generateSEOMutation.mutateAsync({ topic, language });
      toast.success("SEO optimization generated!");
    } catch (error) {
      toast.error("Failed to generate SEO");
      console.error(error);
    }
  };

  const handleAnalyzeTrends = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    try {
      await analyzeTrendsMutation.mutateAsync({ topic, language });
      toast.success("Trend analysis generated!");
    } catch (error) {
      toast.error("Failed to analyze trends");
      console.error(error);
    }
  };

  const handleGenerateAll = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    try {
      await generateAllMutation.mutateAsync({ topic, language });
      toast.success("All content generated successfully!");
    } catch (error) {
      toast.error("Failed to generate content");
      console.error(error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto p-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Content Generator</h1>
          <p className="text-slate-400">Generate scripts, thumbnails, SEO optimization, and trend insights</p>
        </div>

        {/* Input Section */}
        <Card className="mb-8 border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle>Generate Content</CardTitle>
            <CardDescription className="text-slate-400">Enter your video topic to generate content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Video Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to make Tamil YouTube videos..."
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tamil">Tamil</SelectItem>
                    <SelectItem value="tanglish">Tanglish</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleGenerateAll}
                  disabled={generateAllMutation.isPending || !topic.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {generateAllMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate All"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="script" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Script</span>
            </TabsTrigger>
            <TabsTrigger value="thumbnail" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Thumbnails</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trends</span>
            </TabsTrigger>
          </TabsList>

          {/* Script Tab */}
          <TabsContent value="script">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Video Script</CardTitle>
                  <CardDescription className="text-slate-400">10-minute video narrative</CardDescription>
                </div>
                <Button
                  onClick={handleGenerateScript}
                  disabled={generateScriptMutation.isPending || !topic.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {generateScriptMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Script"
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {generateScriptMutation.data?.script ? (
                  <div className="space-y-4">
                    <div className="bg-slate-700 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <Streamdown>{generateScriptMutation.data.script}</Streamdown>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(generateScriptMutation.data.script)}
                        variant="outline"
                        size="sm"
                        className="border-slate-600"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400">Generate a script to see it here</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Thumbnail Tab */}
          <TabsContent value="thumbnail">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Thumbnail Ideas</CardTitle>
                  <CardDescription className="text-slate-400">50 catchy text ideas</CardDescription>
                </div>
                <Button
                  onClick={handleGenerateThumbnail}
                  disabled={generateThumbnailMutation.isPending || !topic.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {generateThumbnailMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Ideas"
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {generateThumbnailMutation.data?.ideas ? (
                  <div className="space-y-4">
                    <div className="bg-slate-700 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <Streamdown>{generateThumbnailMutation.data.ideas}</Streamdown>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(generateThumbnailMutation.data.ideas)}
                        variant="outline"
                        size="sm"
                        className="border-slate-600"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400">Generate thumbnail ideas to see them here</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>SEO Optimization</CardTitle>
                  <CardDescription className="text-slate-400">Title, description, tags, hashtags</CardDescription>
                </div>
                <Button
                  onClick={handleGenerateSEO}
                  disabled={generateSEOMutation.isPending || !topic.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {generateSEOMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate SEO"
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {generateSEOMutation.data?.seoContent ? (
                  <div className="space-y-4">
                    <div className="bg-slate-700 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <Streamdown>{generateSEOMutation.data.seoContent}</Streamdown>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(generateSEOMutation.data.seoContent)}
                        variant="outline"
                        size="sm"
                        className="border-slate-600"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400">Generate SEO optimization to see it here</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Trend Analysis</CardTitle>
                  <CardDescription className="text-slate-400">Relevance, competition, opportunities</CardDescription>
                </div>
                <Button
                  onClick={handleAnalyzeTrends}
                  disabled={analyzeTrendsMutation.isPending || !topic.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {analyzeTrendsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Trends"
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {analyzeTrendsMutation.data?.analysis ? (
                  <div className="space-y-4">
                    <div className="bg-slate-700 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <Streamdown>{analyzeTrendsMutation.data.analysis}</Streamdown>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(analyzeTrendsMutation.data.analysis)}
                        variant="outline"
                        size="sm"
                        className="border-slate-600"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400">Analyze trends to see results here</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
