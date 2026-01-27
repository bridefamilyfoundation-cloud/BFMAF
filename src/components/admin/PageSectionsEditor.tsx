import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageSection } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const pages = [
    { value: "home", label: "Homepage" },
    { value: "about", label: "About Page" },
    { value: "how-it-works", label: "How It Works" },
];

const PageSectionsEditor = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPage, setSelectedPage] = useState("home");
    const [editedSections, setEditedSections] = useState<Record<string, string>>({});

    const { data: sections, isLoading } = useQuery({
        queryKey: ["page-sections-admin", selectedPage],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("page_sections")
                .select("*")
                .eq("page", selectedPage);
            if (error) throw error;
            return data as PageSection[];
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, content }: { id: string; content: string }) => {
            const { error } = await supabase
                .from("page_sections")
                .update({ content, updated_by: (await supabase.auth.getUser()).data.user?.id })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["page-sections-admin"] });
            queryClient.invalidateQueries({ queryKey: ["page-sections"] });
            toast({ title: "Section updated successfully" });
            setEditedSections({});
        },
    });

    const handleSave = (section: PageSection) => {
        const newContent = editedSections[section.id] || section.content;
        updateMutation.mutate({ id: section.id, content: newContent });
    };

    const handleSaveAll = () => {
        sections?.forEach((section) => {
            if (editedSections[section.id]) {
                updateMutation.mutate({ id: section.id, content: editedSections[section.id] });
            }
        });
    };

    const formatSectionKey = (key: string) => {
        return key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    if (isLoading) return <div className="text-center py-8">Loading page sections...</div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-foreground">Page Sections</h3>
                    <p className="text-sm text-muted-foreground">
                        Edit text content for different pages
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedPage} onValueChange={setSelectedPage}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pages.map((page) => (
                                <SelectItem key={page.value} value={page.value}>
                                    {page.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {Object.keys(editedSections).length > 0 && (
                        <Button onClick={handleSaveAll} className="bg-gradient-hero text-primary-foreground">
                            <Save className="w-4 h-4 mr-2" />
                            Save All Changes
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {sections?.map((section) => (
                    <Card key={section.id} className="p-6">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                <Label className="text-base font-semibold">
                                    {formatSectionKey(section.section_key)}
                                </Label>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => handleSave(section)}
                                disabled={!editedSections[section.id]}
                                className="bg-gradient-hero text-primary-foreground"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </Button>
                        </div>
                        <Textarea
                            value={editedSections[section.id] ?? section.content}
                            onChange={(e) =>
                                setEditedSections({ ...editedSections, [section.id]: e.target.value })
                            }
                            rows={4}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Last updated: {new Date(section.updated_at).toLocaleString()}
                        </p>
                    </Card>
                ))}
            </div>

            {sections?.length === 0 && (
                <div className="text-center py-12 bg-card rounded-xl">
                    <p className="text-muted-foreground">
                        No sections found for this page. Run the migration to seed initial data.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PageSectionsEditor;
