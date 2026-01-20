import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Edit2, Trash2, BookOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { trpc } from "@/lib/trpc";

export default function LiteratureAdmin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("content");
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [contentForm, setContentForm] = useState({
    title: "",
    contentType: "kural" as const,
    category: "thirukkural",
    tamilText: "",
    englishTranslation: "",
    meaning: "",
    difficulty: "beginner" as const,
  });

  const [pathForm, setPathForm] = useState({
    title: "",
    level: "beginner" as const,
    duration: "4 weeks",
    targetAudience: "",
  });

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-red-400">Access Denied</CardTitle>
              <CardDescription className="text-slate-400">
                Only administrators can access this page
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto p-4 py-8">
        <PageHeader
          title="Literature Content Admin"
          description="Manage Tamil literature content, learning paths, and assessments"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="paths" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Learning Paths</span>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              <span className="hidden sm:inline">Assessments</span>
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Literature Content</h2>
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </div>

              {showForm && (
                <Card className="border-slate-700 bg-slate-800">
                  <CardHeader>
                    <CardTitle>Add New Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={contentForm.title}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, title: e.target.value })
                          }
                          placeholder="e.g., Thirukkural 1.1"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="contentType">Type</Label>
                        <Select
                          value={contentForm.contentType}
                          onValueChange={(value: any) =>
                            setContentForm({ ...contentForm, contentType: value })
                          }
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kural">Kural</SelectItem>
                            <SelectItem value="story">Story</SelectItem>
                            <SelectItem value="poem">Poem</SelectItem>
                            <SelectItem value="essay">Essay</SelectItem>
                            <SelectItem value="lesson">Lesson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tamilText">Tamil Text</Label>
                      <textarea
                        id="tamilText"
                        value={contentForm.tamilText}
                        onChange={(e) =>
                          setContentForm({ ...contentForm, tamilText: e.target.value })
                        }
                        placeholder="Enter Tamil text..."
                        className="w-full bg-slate-700 border border-slate-600 text-white p-2 rounded"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="englishTranslation">English Translation</Label>
                      <textarea
                        id="englishTranslation"
                        value={contentForm.englishTranslation}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            englishTranslation: e.target.value,
                          })
                        }
                        placeholder="Enter English translation..."
                        className="w-full bg-slate-700 border border-slate-600 text-white p-2 rounded"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="meaning">Meaning & Explanation</Label>
                      <textarea
                        id="meaning"
                        value={contentForm.meaning}
                        onChange={(e) =>
                          setContentForm({ ...contentForm, meaning: e.target.value })
                        }
                        placeholder="Enter detailed meaning..."
                        className="w-full bg-slate-700 border border-slate-600 text-white p-2 rounded"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={contentForm.difficulty}
                          onValueChange={(value: any) =>
                            setContentForm({ ...contentForm, difficulty: value })
                          }
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={contentForm.category}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, category: e.target.value })
                          }
                          placeholder="e.g., thirukkural"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          toast.success("Content added successfully!");
                          setShowForm(false);
                          setContentForm({
                            title: "",
                            contentType: "kural",
                            category: "thirukkural",
                            tamilText: "",
                            englishTranslation: "",
                            meaning: "",
                            difficulty: "beginner",
                          });
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Save Content
                      </Button>
                      <Button
                        onClick={() => setShowForm(false)}
                        variant="outline"
                        className="border-slate-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Content List */}
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <Card key={item} className="border-slate-700 bg-slate-800">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Thirukkural {item}.1</p>
                        <p className="text-sm text-slate-400">
                          Category: Thirukkural | Difficulty: Beginner
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-slate-600">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
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
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Learning Paths</h2>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Path
                </Button>
              </div>

              <div className="grid gap-4">
                {["Beginner Path", "Intermediate Path", "Advanced Path"].map((path) => (
                  <Card key={path} className="border-slate-700 bg-slate-800">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{path}</CardTitle>
                          <CardDescription className="text-slate-400">
                            4 weeks | 15 content items
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-slate-600">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Assessments</h2>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assessment
                </Button>
              </div>

              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle>Beginner Path - Quiz 1</CardTitle>
                  <CardDescription className="text-slate-400">
                    Type: Quiz | Passing Score: 70%
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-300">5 questions | Time limit: 15 minutes</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-900"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
