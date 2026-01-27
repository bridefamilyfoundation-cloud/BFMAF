import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SubmissionRequirement } from "@/types/content";

export const useSubmissionRequirements = () => {
    return useQuery({
        queryKey: ["submission-requirements"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("submission_requirements")
                .select("*")
                .eq("is_active", true)
                .order("display_order", { ascending: true });

            if (error) throw error;
            return data as SubmissionRequirement[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
