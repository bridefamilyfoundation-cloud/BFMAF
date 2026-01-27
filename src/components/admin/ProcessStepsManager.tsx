// ProcessStepsManager.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProcessStep } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const ProcessStepsManager = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);
    const [formData, setFormData] = useState({ step_number: 1, title: "", description: "", icon: "CheckCircle" });

    const { data: steps, isLoading } = useQuery({
        queryKey: ["process-steps-admin"],
        queryFn: async () => {
            const { data, error } = await supabase.from("process_steps").select("*").order("display_order");
            if (error) throw error;
            return data as ProcessStep[];
        },
    });

    const addMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const maxOrder = steps?.reduce((max, s) => Math.max(max, s.display_order), 0) || 0;
            const { error } = await supabase.from("process_steps").insert({ ...data, display_order: maxOrder + 1 });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["process-steps-admin"] });
            toast({ title: "Step added successfully" });
            setIsDialogOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<ProcessStep> }) => {
            const { error } = await supabase.from("process_steps").update(data).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["process-steps-admin"] });
            toast({ title: "Step updated successfully" });
            setIsDialogOpen(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("process_steps").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["process-steps-admin"] });
            toast({ title: "Step deleted successfully" });
        },
    });

    if (isLoading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold">Process Steps</h3>
                    <p className="text-sm text-muted-foreground">Manage request process steps</p>
                </div>
                <Button onClick={() => { setEditingStep(null); setFormData({ step_number: (steps?.length || 0) + 1, title: "", description: "", icon: "CheckCircle" }); setIsDialogOpen(true); }} className="bg-gradient-hero text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                </Button>
            </div>

            <div className="space-y-3">
                {steps?.map((step) => (
                    <Card key={step.id} className="p-4 flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0">
                                {step.step_number}
                            </div>
                            <div>
                                <h4 className="font-semibold">{step.title}</h4>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingStep(step); setFormData({ step_number: step.step_number, title: step.title, description: step.description, icon: step.icon }); setIsDialogOpen(true); }}>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(step.id); }}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingStep ? "Edit Step" : "Add Step"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); editingStep ? updateMutation.mutate({ id: editingStep.id, data: formData }) : addMutation.mutate(formData); }} className="space-y-4">
                        <div>
                            <Label>Step Number</Label>
                            <Input type="number" value={formData.step_number} onChange={(e) => setFormData({ ...formData, step_number: parseInt(e.target.value) })} required />
                        </div>
                        <div>
                            <Label>Title</Label>
                            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} required />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-gradient-hero text-primary-foreground">{editingStep ? "Update" : "Add"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProcessStepsManager;
