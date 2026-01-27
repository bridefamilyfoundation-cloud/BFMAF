import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SubmissionRequirement } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const SubmissionRequirementsManager = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingReq, setEditingReq] = useState<SubmissionRequirement | null>(null);
    const [formData, setFormData] = useState({ title: "", description: "", icon: "FileText" });

    const { data: requirements, isLoading } = useQuery({
        queryKey: ["submission-requirements-admin"],
        queryFn: async () => {
            const { data, error } = await supabase.from("submission_requirements").select("*").order("display_order");
            if (error) throw error;
            return data as SubmissionRequirement[];
        },
    });

    const addMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const maxOrder = requirements?.reduce((max, r) => Math.max(max, r.display_order), 0) || 0;
            const { error } = await supabase.from("submission_requirements").insert({ ...data, display_order: maxOrder + 1 });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["submission-requirements-admin"] });
            toast({ title: "Requirement added successfully" });
            setIsDialogOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<SubmissionRequirement> }) => {
            const { error } = await supabase.from("submission_requirements").update(data).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["submission-requirements-admin"] });
            toast({ title: "Requirement updated successfully" });
            setIsDialogOpen(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("submission_requirements").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["submission-requirements-admin"] });
            toast({ title: "Requirement deleted successfully" });
        },
    });

    if (isLoading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold">Submission Requirements</h3>
                    <p className="text-sm text-muted-foreground">Manage what to submit for aid requests</p>
                </div>
                <Button onClick={() => { setEditingReq(null); setFormData({ title: "", description: "", icon: "FileText" }); setIsDialogOpen(true); }} className="bg-gradient-hero text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Requirement
                </Button>
            </div>

            <div className="space-y-3">
                {requirements?.map((req, index) => (
                    <Card key={req.id} className="p-4 flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0">
                                {index + 1}
                            </div>
                            <div>
                                <h4 className="font-semibold">{req.title}</h4>
                                <p className="text-sm text-muted-foreground">{req.description}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingReq(req); setFormData({ title: req.title, description: req.description, icon: req.icon }); setIsDialogOpen(true); }}>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(req.id); }}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingReq ? "Edit Requirement" : "Add Requirement"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); editingReq ? updateMutation.mutate({ id: editingReq.id, data: formData }) : addMutation.mutate(formData); }} className="space-y-4">
                        <div>
                            <Label>Title</Label>
                            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} required />
                        </div>
                        <div>
                            <Label>Icon</Label>
                            <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="Camera, FileText, etc." required />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-gradient-hero text-primary-foreground">{editingReq ? "Update" : "Add"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SubmissionRequirementsManager;
