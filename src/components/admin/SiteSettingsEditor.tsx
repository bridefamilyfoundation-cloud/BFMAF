import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SiteSettingData {
  id: string;
  key: string;
  value: any;
  updated_at: string;
}

const SiteSettingsEditor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    organization_name: "",
    tagline: "",
    description: "",
    address: "",
    phone1: "",
    phone2: "",
    email: "",
    scripture_reference: "",
    scripture_text: "",
    show_live_stats: true,
    funds_to_program: 100,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");
      if (error) throw error;
      return data as SiteSettingData[];
    },
  });

  useEffect(() => {
    if (settings) {
      const newFormData = { ...formData };
      settings.forEach((setting) => {
        if (setting.key in newFormData) {
          const key = setting.key as keyof typeof formData;
          // Handle type conversion from JSONB
          if (typeof formData[key] === 'boolean') {
            (newFormData as any)[key] = Boolean(setting.value);
          } else if (typeof formData[key] === 'number') {
            (newFormData as any)[key] = Number(setting.value);
          } else {
            (newFormData as any)[key] = String(setting.value);
          }
        }
      });
      setFormData(newFormData);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (updates: typeof formData) => {
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
      queryClient.invalidateQueries({ queryKey: ["site-settings-admin"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({
        title: "Settings Saved",
        description: "Site settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

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
          <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-lg">
            <span className="material-icons-outlined">info</span>
          </span>
          <h3 className="text-lg font-semibold">General Information</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organization_name">Organization Name</Label>
              <Input
                id="organization_name"
                value={formData.organization_name}
                onChange={(e) =>
                  setFormData({ ...formData, organization_name: e.target.value })
                }
                placeholder="BFMAF Foundation"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                placeholder="BFMAF"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              placeholder="A platform borne out of compassion..."
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="phone1">Primary Phone</Label>
              <Input
                id="phone1"
                value={formData.phone1}
                onChange={(e) =>
                  setFormData({ ...formData, phone1: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="phone2">Secondary Phone</Label>
              <Input
                id="phone2"
                value={formData.phone2}
                onChange={(e) =>
                  setFormData({ ...formData, phone2: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scripture_reference">Scripture Reference</Label>
              <Input
                id="scripture_reference"
                value={formData.scripture_reference}
                onChange={(e) =>
                  setFormData({ ...formData, scripture_reference: e.target.value })
                }
                placeholder="1 Corinthians 12:26"
              />
            </div>
            <div>
              <Label htmlFor="funds_to_program">Funds to Program (%)</Label>
              <Input
                id="funds_to_program"
                type="number"
                min="0"
                max="100"
                value={formData.funds_to_program}
                onChange={(e) =>
                  setFormData({ ...formData, funds_to_program: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="scripture_text">Scripture Text</Label>
            <Textarea
              id="scripture_text"
              value={formData.scripture_text}
              onChange={(e) =>
                setFormData({ ...formData, scripture_text: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show_live_stats"
              checked={formData.show_live_stats}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_live_stats: checked })
              }
            />
            <Label htmlFor="show_live_stats">Show Live Statistics on Homepage</Label>
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
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default SiteSettingsEditor;
