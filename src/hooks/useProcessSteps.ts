import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProcessStep } from "@/types/content";

export const useProcessSteps = (page: string = "how-it-works") => {
    return useQuery({
        queryKey: ["process-steps", page],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("process_steps")
                .select("*")
                .eq("page", page)
                .eq("is_active", true)
                .order("display_order", { ascending: true });

            if (error) throw error;
            return data as ProcessStep[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
