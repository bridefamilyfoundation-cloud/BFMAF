import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Save, Loader2, Upload } from "lucide-react";

interface HeroSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_link: string;
  hero_background_image: string;
}

const HeroSectionEditor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<HeroSettings>({
    hero_title: "Supporting Medical Needs, Transforming Lives",
    hero_subtitle: "Join us in making healthcare accessible to everyone",
    hero_cta_text: "Get Help Now",
    hero_cta_link: "/get-help",
    hero_background_image: "",
  });
  const [uploading, setUploading] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["hero-settings-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", [
          "hero_title",
          "hero_subtitle",
          "hero_cta_text",
          "hero_cta_link",
          "hero_background_image",
        ]);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      const newFormData = { ...formData };
      settings.forEach((setting) => {
        if (setting.key in newFormData) {
          // All hero settings are strings, so convert from JSONB
          (newFormData as any)[setting.key] = String(setting.value || '');
        }
      });
      setFormData(newFormData);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (updates: HeroSettings) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const promises = Object.entries(updates).map(([key, value]) => {
        // Store the actual value directly - Supabase client handles JSONB conversion
        return supabase
          .from("site_settings")
          .upsert(
            { 
              key, 
              value: value, // Let Supabase handle the JSONB conversion
              updated_by: user?.id 
            },
            { onConflict: "key" }
          );
      });

      const results = await Promise.all(promises);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-settings-admin"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({
        title: "Hero Section Updated",
        description: "Changes have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, GIF, and WebP images are allowed",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = `hero-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("aid-request-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("aid-request-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, hero_background_image: publicUrl });
      
      toast({
        title: "Image Uploaded",
        description: "Background image uploaded successfully. Don't forget to save!",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg">
            <span className="material-icons-outlined">web</span>
          </span>
          <h3 className="text-lg font-semibold">Hero Section</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="hero_background_image">Background Image</Label>
            <div className="mt-2 space-y-3">
              {formData.hero_background_image && (
                <div className="w-full h-48 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img
                    src={formData.hero_background_image}
                    alt="Hero background"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-3">
                <Input
                  id="hero_background_image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("hero_background_image")?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  Max 10MB • JPEG, PNG, GIF, WebP
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="hero_title">Main Heading</Label>
            <Input
              id="hero_title"
              value={formData.hero_title}
              onChange={(e) =>
                setFormData({ ...formData, hero_title: e.target.value })
              }
              placeholder="Supporting Medical Needs, Transforming Lives"
            />
          </div>

          <div>
            <Label htmlFor="hero_subtitle">Subtitle</Label>
            <Textarea
              id="hero_subtitle"
              value={formData.hero_subtitle}
              onChange={(e) =>
                setFormData({ ...formData, hero_subtitle: e.target.value })
              }
              rows={2}
              placeholder="Join us in making healthcare accessible to everyone"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hero_cta_text">Call to Action Button Text</Label>
              <Input
                id="hero_cta_text"
                value={formData.hero_cta_text}
                onChange={(e) =>
                  setFormData({ ...formData, hero_cta_text: e.target.value })
                }
                placeholder="Get Help Now"
              />
            </div>
            <div>
              <Label htmlFor="hero_cta_link">Button Link</Label>
              <Input
                id="hero_cta_link"
                value={formData.hero_cta_link}
                onChange={(e) =>
                  setFormData({ ...formData, hero_cta_link: e.target.value })
                }
                placeholder="/get-help"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-primary hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Hero Section
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default HeroSectionEditor;
