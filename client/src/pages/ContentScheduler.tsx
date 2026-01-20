import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Share2, Trash2, CheckCircle, AlertCircle, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";

/**
 * Content Scheduler Page
 * Schedule content for batch publishing to multiple platforms
 */
export default function ContentScheduler() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    contentType: "video" as const,
    platforms: [] as ("youtube" | "instagram" | "tiktok" | "twitter")[],
    scheduledAt: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
    language: "tamil" as const,
  });

  // Fetch scheduled content
  const { data: scheduledData, isLoading: isLoadingScheduled, refetch } = trpc.scheduling.getScheduled.useQuery({
    limit: 100,
    offset: 0,
  });

  // Schedule content mutation
  const scheduleContentMutation = trpc.scheduling.scheduleContent.useMutation({
    onSuccess: () => {
      toast.success("Content scheduled successfully!");
      setFormData({
        title: "",
        description: "",
        content: "",
        contentType: "video",
        platforms: [],
        scheduledAt: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
        language: "tamil",
      });
      setShowScheduleDialog(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to schedule content: ${error.message}`);
    },
  });

  // Cancel scheduled content mutation
  const cancelMutation = trpc.scheduling.cancelSchedule.useMutation({
    onSuccess: () => {
      toast.success("Content cancelled successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to cancel: ${error.message}`);
    },
  });

  // Get job status mutation
  const getJobStatusMutation = trpc.scheduling.getJobStatus.useQuery(
    { jobId: 0 },
    { enabled: false }
  );

  // Calendar days
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group scheduled content by date
  const contentByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    if (scheduledData?.content) {
      scheduledData.content.forEach((item) => {
        const dateKey = format(new Date(item.scheduledAt), "yyyy-MM-dd");
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(item);
      });
    }
    return grouped;
  }, [scheduledData?.content]);

  const handleSchedule = async () => {
    if (!formData.title || !formData.content || formData.platforms.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    scheduleContentMutation.mutate({
      ...formData,
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
    });
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "published":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "scheduled":
        return <Clock3 className="w-4 h-4 text-blue-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Content Scheduler</h1>
          <p className="text-muted-foreground">Schedule and batch publish content to multiple platforms</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setSelectedDate(addDays(selectedDate, -30))}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Prev
                  </button>
                  <span className="font-semibold">{format(selectedDate, "MMMM yyyy")}</span>
                  <button
                    onClick={() => setSelectedDate(addDays(selectedDate, 30))}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Next →
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day) => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const hasContent = contentByDate[dateKey]?.length > 0;
                    const isSelected = isSameDay(day, selectedDate);

                    return (
                      <button
                        key={dateKey}
                        onClick={() => setSelectedDate(day)}
                        className={`p-2 text-xs rounded ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : hasContent
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Schedule New Content */}
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule New Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule Content</DialogTitle>
                  <DialogDescription>Create and schedule content for multiple platforms</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Content title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Content description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Main content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Content Type */}
                    <div>
                      <Label htmlFor="contentType">Content Type</Label>
                      <Select value={formData.contentType} onValueChange={(value: any) => setFormData({ ...formData, contentType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="post">Post</SelectItem>
                          <SelectItem value="reel">Reel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Language */}
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={formData.language} onValueChange={(value: any) => setFormData({ ...formData, language: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tamil">Tamil</SelectItem>
                          <SelectItem value="tanglish">Tanglish</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Scheduled Date/Time */}
                  <div>
                    <Label htmlFor="scheduledAt">Schedule For *</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    />
                  </div>

                  {/* Platforms */}
                  <div>
                    <Label>Platforms *</Label>
                    <div className="space-y-2 mt-2">
                      {["youtube", "instagram", "tiktok", "twitter"].map((platform) => (
                        <div key={platform} className="flex items-center">
                          <Checkbox
                            id={platform}
                            checked={formData.platforms.includes(platform as any)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ ...formData, platforms: [...formData.platforms, platform as any] });
                              } else {
                                setFormData({
                                  ...formData,
                                  platforms: formData.platforms.filter((p) => p !== platform),
                                });
                              }
                            }}
                          />
                          <Label htmlFor={platform} className="ml-2 capitalize cursor-pointer">
                            {platform}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSchedule} disabled={scheduleContentMutation.isPending}>
                      {scheduleContentMutation.isPending ? "Scheduling..." : "Schedule Content"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Scheduled Content List */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Content</CardTitle>
                <CardDescription>
                  {scheduledData?.content?.length || 0} items scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingScheduled ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : scheduledData?.content?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No scheduled content yet. Create your first schedule!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduledData?.content?.map((item) => (
                      <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(item.status)}
                            <h4 className="font-semibold">{item.title}</h4>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                              {item.contentType}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <div className="flex gap-2 flex-wrap">
                            {(item.platforms as string[] | null)?.map((platform: string) => (
                              <span key={platform} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded capitalize">
                                {platform}
                              </span>
                            )) || []}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Scheduled: {item.scheduledAt ? format(typeof item.scheduledAt === 'string' ? new Date(item.scheduledAt) : (item.scheduledAt || new Date()), "MMM d, yyyy HH:mm") : "Not scheduled"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelMutation.mutate({ contentId: item.id })}
                            disabled={cancelMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
