import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Users, Zap, Award } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { trpc } from "@/lib/trpc";

export default function TamilLiterature() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("thirukkural");
  const [selectedKural, setSelectedKural] = useState<number | null>(null);

  // Sample Thirukkural data
  const kurals = [
    {
      id: 1,
      number: "1.1",
      tamil: "அகர முதல எழுத्तु लगु",
      english: "The letter 'A' is the first of letters",
      meaning: "The letter 'A' is the first and foremost of all letters, as it is the beginning of all sounds.",
      category: "Virtue",
    },
    {
      id: 2,
      number: "1.2",
      tamil: "ஆதி பகவன் முதற்றே உலகு",
      english: "The world exists because of the Supreme Being",
      meaning: "The entire world exists and functions because of the Supreme Being's will.",
      category: "Virtue",
    },
    {
      id: 3,
      number: "1.3",
      tamil: "முதல்வன் முதற்றே உலகு முதல்",
      english: "The Supreme Being is the cause of the world",
      meaning: "The Supreme Being is the primary cause and foundation of the entire universe.",
      category: "Virtue",
    },
  ];

  const stories = [
    {
      id: 1,
      title: "Silappathikaram",
      author: "Ilango Adigal",
      period: "5th Century CE",
      description: "The tale of Kannagi and her devoted husband Kovalan, a classic of Tamil literature.",
      chapters: 30,
    },
    {
      id: 2,
      title: "Manimegalai",
      author: "Seethalai Muthianur",
      period: "6th Century CE",
      description: "The story of a Buddhist princess and her spiritual journey.",
      chapters: 30,
    },
    {
      id: 3,
      title: "Purananuru",
      author: "Various Sangam Poets",
      period: "1st-3rd Century CE",
      description: "Collection of 400 poems praising Tamil kings and their virtues.",
      chapters: 400,
    },
  ];

  const learningPaths = [
    {
      id: 1,
      name: "Beginner Path",
      description: "Perfect for those new to Tamil literature",
      duration: "4 weeks",
      level: "Beginner",
      topics: ["Tamil Alphabet", "Basic Kurals", "Simple Stories"],
    },
    {
      id: 2,
      name: "Intermediate Path",
      description: "For learners with basic Tamil knowledge",
      duration: "8 weeks",
      level: "Intermediate",
      topics: ["Advanced Kurals", "Sangam Literature", "Poetry Analysis"],
    },
    {
      id: 3,
      name: "Advanced Path",
      description: "For serious literature enthusiasts",
      duration: "12 weeks",
      level: "Advanced",
      topics: ["Classical Works", "Literary Criticism", "Comparative Studies"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto p-4 py-8">
        <PageHeader
          title="Tamil Heritage Learning"
          description="Learn Tamil literature, Thirukkural, and cultural heritage"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="thirukkural" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Thirukkural</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger value="paths" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Learning Paths</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
          </TabsList>

          {/* Thirukkural Tab */}
          <TabsContent value="thirukkural">
            <div className="space-y-4">
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle>Thirukkural - The Sacred Couplets</CardTitle>
                  <CardDescription className="text-slate-400">
                    1330 couplets of wisdom covering virtue, wealth, and love
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4">
                {kurals.map((kural) => (
                  <Card
                    key={kural.id}
                    className="border-slate-700 bg-slate-800 cursor-pointer hover:bg-slate-700 transition"
                    onClick={() => setSelectedKural(selectedKural === kural.id ? null : kural.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{kural.number}</CardTitle>
                          <p className="text-sm text-slate-400 mt-1">{kural.tamil}</p>
                          <p className="text-sm text-blue-400 mt-2">{kural.english}</p>
                        </div>
                        <Badge variant="outline">{kural.category}</Badge>
                      </div>
                    </CardHeader>
                    {selectedKural === kural.id && (
                      <CardContent>
                        <div className="bg-slate-700 p-4 rounded-lg">
                          <p className="text-sm text-slate-300">
                            <strong>Meaning:</strong> {kural.meaning}
                          </p>
                          <div className="mt-4 flex gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => toast.success("Audio playing...")}
                            >
                              🔊 Listen
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-600">
                              📝 Save
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Stories Tab */}
          <TabsContent value="stories">
            <div className="space-y-4">
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle>Tamil Literary Classics</CardTitle>
                  <CardDescription className="text-slate-400">
                    Explore timeless stories from Tamil literature
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {stories.map((story) => (
                  <Card key={story.id} className="border-slate-700 bg-slate-800">
                    <CardHeader>
                      <CardTitle className="text-lg">{story.title}</CardTitle>
                      <CardDescription className="text-slate-400">
                        by {story.author} • {story.period}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-300">{story.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">{story.chapters} chapters</span>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Start Reading
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths">
            <div className="space-y-4">
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle>Personalized Learning Paths</CardTitle>
                  <CardDescription className="text-slate-400">
                    Choose your learning journey based on your level
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                {learningPaths.map((path) => (
                  <Card key={path.id} className="border-slate-700 bg-slate-800">
                    <CardHeader>
                      <CardTitle className="text-lg">{path.name}</CardTitle>
                      <CardDescription className="text-slate-400">{path.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Duration:</span>
                          <span className="text-blue-400">{path.duration}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Level:</span>
                          <Badge variant="outline">{path.level}</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-2">Topics:</p>
                        <div className="flex flex-wrap gap-2">
                          {path.topics.map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Path</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>Your Learning Progress</CardTitle>
                <CardDescription className="text-slate-400">Track your learning journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Thirukkural Progress</span>
                      <span className="text-sm text-blue-400">45/1330</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "3%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Stories Read</span>
                      <span className="text-sm text-blue-400">1/3</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "33%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Learning Path</span>
                      <span className="text-sm text-blue-400">Week 2/4</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: "50%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-sm text-slate-300">
                    <strong>Streak:</strong> 7 days 🔥
                  </p>
                  <p className="text-sm text-slate-300 mt-2">
                    <strong>Points Earned:</strong> 450 ⭐
                  </p>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Continue Learning
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
