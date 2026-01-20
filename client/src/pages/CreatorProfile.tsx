import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CreatorProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading: profileLoading } = trpc.creator.getProfile.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.creator.getStats.useQuery();
  const updateProfileMutation = trpc.creator.updateProfile.useMutation();

  const [formData, setFormData] = useState({
    channelName: profile?.channelName || "",
    channelDescription: profile?.channelDescription || "",
    channelUrl: profile?.channelUrl || "",
    contentCategory: profile?.contentCategory || "",
    preferredLanguage: profile?.preferredLanguage || "tamil",
    voicePreference: profile?.voicePreference || "",
    contentStyle: profile?.contentStyle || "",
    targetAudience: profile?.targetAudience || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  if (profileLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle>Creator Profile</CardTitle>
            <CardDescription>Manage your creator information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Name</Label>
                <p className="text-lg font-medium">{user?.name}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="text-lg font-medium">{user?.email}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Member Since</Label>
                <p className="text-lg font-medium">
                  {stats?.memberSince ? new Date(stats.memberSince).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Account Status</Label>
                <p className="text-lg font-medium text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channel Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Channel Information</CardTitle>
              <CardDescription>Your YouTube channel and content details</CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="channelName">Channel Name</Label>
                  <Input
                    id="channelName"
                    name="channelName"
                    value={formData.channelName}
                    onChange={handleInputChange}
                    placeholder="Your YouTube channel name"
                  />
                </div>

                <div>
                  <Label htmlFor="channelUrl">Channel URL</Label>
                  <Input
                    id="channelUrl"
                    name="channelUrl"
                    value={formData.channelUrl}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/@yourhandle"
                  />
                </div>

                <div>
                  <Label htmlFor="channelDescription">Channel Description</Label>
                  <Textarea
                    id="channelDescription"
                    name="channelDescription"
                    value={formData.channelDescription}
                    onChange={handleInputChange}
                    placeholder="Describe your channel"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="contentCategory">Content Category</Label>
                  <Input
                    id="contentCategory"
                    name="contentCategory"
                    value={formData.contentCategory}
                    onChange={handleInputChange}
                    placeholder="e.g., Comedy, Education, Music"
                  />
                </div>

                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    placeholder="Describe your target audience"
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Channel Name</Label>
                  <p>{profile?.channelName || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Channel URL</Label>
                  <p>{profile?.channelUrl || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p>{profile?.channelDescription || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Content Category</Label>
                  <p>{profile?.contentCategory || "Not set"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Language & Voice Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Language & Voice Preferences</CardTitle>
            <CardDescription>Configure your preferred language and voice settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preferredLanguage">Preferred Language</Label>
                  <Select value={formData.preferredLanguage} onValueChange={(value) => handleSelectChange("preferredLanguage", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tamil">Tamil</SelectItem>
                      <SelectItem value="tanglish">Tanglish (Tamil + English)</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="voicePreference">Voice Preference</Label>
                  <Input
                    id="voicePreference"
                    name="voicePreference"
                    value={formData.voicePreference}
                    onChange={handleInputChange}
                    placeholder="e.g., Female, Male, Natural"
                  />
                </div>

                <div>
                  <Label htmlFor="contentStyle">Content Style</Label>
                  <Textarea
                    id="contentStyle"
                    name="contentStyle"
                    value={formData.contentStyle}
                    onChange={handleInputChange}
                    placeholder="Describe your preferred content style (tone, format, etc.)"
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Preferred Language</Label>
                  <p className="capitalize">{profile?.preferredLanguage || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Voice Preference</Label>
                  <p>{profile?.voicePreference || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Content Style</Label>
                  <p>{profile?.contentStyle || "Not set"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
