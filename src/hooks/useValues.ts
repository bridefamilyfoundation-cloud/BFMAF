import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Value } from "@/types/content";

export const useValues = () => {
    return useQuery({
        queryKey: ["values"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("values")
                .select("*")
                .eq("is_active", true)
                .order("display_order", { ascending: true });

            if (error) throw error;
            return data as Value[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
