import { useQuery } from "@tantml:react-query";
import { supabase } from "@/integrations/supabase/client";
import { HowWeHelpItem } from "@/types/content";

export const useHowWeHelpItems = () => {
    return useQuery({
        queryKey: ["how-we-help-items"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("how_we_help_items")
                .select("*")
                .eq("is_active", true)
                .order("display_order", { ascending: true });

            if (error) throw error;
            return data as HowWeHelpItem[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
