import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HowWeHelpItem } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const HowWeHelpManager = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<HowWeHelpItem | null>(null);
    const [formData, setFormData] = useState({ title: "", description: "", icon: "Heart", color: "bg-primary/10 text-primary" });

    const { data: items, isLoading } = useQuery({
        queryKey: ["how-we-help-admin"],
        queryFn: async () => {
            const { data, error } = await supabase.from("how_we_help_items").select("*").order("display_order");
            if (error) throw error;
            return data as HowWeHelpItem[];
        },
    });

    const addMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const maxOrder = items?.reduce((max, i) => Math.max(max, i.display_order), 0) || 0;
            const { error } = await supabase.from("how_we_help_items").insert({ ...data, display_order: maxOrder + 1 });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["how-we-help-admin"] });
            toast({ title: "Item added successfully" });
            setIsDialogOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<HowWeHelpItem> }) => {
            const { error } = await supabase.from("how_we_help_items").update(data).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["how-we-help-admin"] });
            toast({ title: "Item updated successfully" });
            setIsDialogOpen(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("how_we_help_items").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["how-we-help-admin"] });
            toast({ title: "Item deleted successfully" });
        },
    });

    if (isLoading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold">How We Help</h3>
                    <p className="text-sm text-muted-foreground">Manage help methods</p>
                </div>
                <Button onClick={() => { setEditingItem(null); setFormData({ title: "", description: "", icon: "Heart", color: "bg-primary/10 text-primary" }); setIsDialogOpen(true); }} className="bg-gradient-hero text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items?.map((item) => (
                    <Card key={item.id} className="p-6">
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold">{item.title}</h4>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setEditingItem(item); setFormData({ title: item.title, description: item.description, icon: item.icon, color: item.color || "" }); setIsDialogOpen(true); }}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(item.id); }}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); editingItem ? updateMutation.mutate({ id: editingItem.id, data: formData }) : addMutation.mutate(formData); }} className="space-y-4">
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
                            <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="Heart, Users, etc." required />
                        </div>
                        <div>
                            <Label>Color Class</Label>
                            <Input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="bg-primary/10 text-primary" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-gradient-hero text-primary-foreground">{editingItem ? "Update" : "Add"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HowWeHelpManager;
