import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FAQ } from "@/types/content";

export const useFAQs = (category?: string) => {
    return useQuery({
        queryKey: ["faqs", category],
        queryFn: async () => {
            let query = supabase
                .from("faqs")
                .select("*")
                .eq("is_active", true)
                .order("display_order", { ascending: true });

            if (category) {
                query = query.eq("category", category);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as FAQ[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
