import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageSection } from "@/types/content";

export const usePageSections = (page: string) => {
    return useQuery({
        queryKey: ["page-sections", page],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("page_sections")
                .select("*")
                .eq("page", page);

            if (error) throw error;

            // Convert array to object for easy access by section_key
            const sections: Record<string, string> = {};
            data?.forEach((section: PageSection) => {
                sections[section.section_key] = section.content;
            });

            return sections;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
