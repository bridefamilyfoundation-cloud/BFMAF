import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  organization_name: string;
  tagline: string;
  description: string;
  address: string;
  phone1: string;
  phone2: string;
  email: string;
  scripture_reference: string;
  scripture_text: string;
  show_live_stats: boolean;
  funds_to_program: number;
}

const defaultSettings: SiteSettings = {
  organization_name: "Bride Family Medical Aid Foundation",
  tagline: "BFMAF",
  description: "A platform borne out of compassion to reach out to severely traumatized believers.",
  address: "Divine Love Christian Assembly Jos, Longwa Phase II Behind Millennium Hotel Jos",
  phone1: "07032128927",
  phone2: "08036638890",
  email: "info@bfmaf.org",
  scripture_reference: "1 Corinthians 12:26",
  scripture_text: "And whether one member suffer, all the members suffer with it, or one member be honored, all the members rejoice with it.",
  show_live_stats: true,
  funds_to_program: 100,
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");

      if (error) throw error;

      if (data) {
        const updatedSettings = { ...defaultSettings };
        data.forEach(setting => {
          const key = setting.key as keyof SiteSettings;
          if (key in updatedSettings && setting.value !== null) {
            // Handle boolean conversion
            if (key === 'show_live_stats') {
              updatedSettings[key] = setting.value === true || setting.value === 'true';
            } else if (key === 'funds_to_program') {
              updatedSettings[key] = Number(setting.value);
            } else {
              (updatedSettings as any)[key] = String(setting.value);
            }
          }
        });
        setSettings(updatedSettings);
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch: fetchSettings };
};
