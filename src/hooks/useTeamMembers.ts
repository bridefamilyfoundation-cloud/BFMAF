import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/content";

export const useTeamMembers = () => {
    return useQuery({
        queryKey: ["team-members"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("team_members")
                .select("*")
                .eq("is_active", true)
                .order("display_order", { ascending: true });

            if (error) throw error;
            return data as TeamMember[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
