import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Value } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Heart, Users, Target, Award, Shield, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

const iconOptions = [
    { value: "Heart", label: "Heart", Icon: Heart },
    { value: "Users", label: "Users", Icon: Users },
    { value: "Target", label: "Target", Icon: Target },
    { value: "Award", label: "Award", Icon: Award },
    { value: "Shield", label: "Shield", Icon: Shield },
    { value: "Sparkles", label: "Sparkles", Icon: Sparkles },
];

const ValuesManager = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingValue, setEditingValue] = useState<Value | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        icon: "Heart",
        is_active: true,
    });

    const { data: values, isLoading } = useQuery({
        queryKey: ["values-admin"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("values")
                .select("*")
                .order("display_order", { ascending: true });
            if (error) throw error;
            return data as Value[];
        },
    });

    const addMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const maxOrder = values?.reduce((max, v) => Math.max(max, v.display_order), 0) || 0;
            const { error } = await supabase.from("values").insert({ ...data, display_order: maxOrder + 1 });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["values-admin"] });
            queryClient.invalidateQueries({ queryKey: ["values"] });
            toast({ title: "Value added successfully" });
            handleCloseDialog();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Value> }) => {
            const { error } = await supabase.from("values").update(data).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["values-admin"] });
            queryClient.invalidateQueries({ queryKey: ["values"] });
            toast({ title: "Value updated successfully" });
            handleCloseDialog();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("values").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["values-admin"] });
            queryClient.invalidateQueries({ queryKey: ["values"] });
            toast({ title: "Value deleted successfully" });
        },
    });

    const handleOpenDialog = (value?: Value) => {
        if (value) {
            setEditingValue(value);
            setFormData({ title: value.title, description: value.description, icon: value.icon, is_active: value.is_active });
        } else {
            setEditingValue(null);
            setFormData({ title: "", description: "", icon: "Heart", is_active: true });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingValue(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingValue) {
            updateMutation.mutate({ id: editingValue.id, data: formData });
        } else {
            addMutation.mutate(formData);
        }
    };

    if (isLoading) return <div className="text-center py-8">Loading values...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-foreground">Organization Values</h3>
                    <p className="text-sm text-muted-foreground">Manage values displayed on the About page</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-gradient-hero text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Value
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {values?.map((value) => {
                    const IconComponent = iconOptions.find((opt) => opt.value === value.icon)?.Icon || Heart;
                    return (
                        <Card key={value.id} className="p-6 relative">
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <Switch
                                    checked={value.is_active}
                                    onCheckedChange={() => updateMutation.mutate({ id: value.id, data: { is_active: !value.is_active } })}
                                />
                                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(value)}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    if (confirm("Delete this value?")) deleteMutation.mutate(value.id);
                                }}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <IconComponent className="w-6 h-6 text-primary" />
                            </div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">{value.title}</h4>
                            <p className="text-sm text-muted-foreground">{value.description}</p>
                            {!value.is_active && <span className="text-xs text-muted-foreground mt-2 block">Inactive</span>}
                        </Card>
                    );
                })}
            </div>

            {values?.length === 0 && (
                <div className="text-center py-12 bg-card rounded-xl">
                    <p className="text-muted-foreground">No values yet. Add your first value to get started.</p>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingValue ? "Edit Value" : "Add Value"}</DialogTitle>
                        <DialogDescription>
                            {editingValue ? "Update organization value" : "Add a new organization value"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Compassion, Faith, etc."
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe this value..."
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="icon">Icon *</Label>
                            <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {iconOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            <div className="flex items-center gap-2">
                                                <opt.Icon className="w-4 h-4" />
                                                {opt.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                            <Label htmlFor="is_active">Active</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                            <Button type="submit" className="bg-gradient-hero text-primary-foreground">
                                {editingValue ? "Update" : "Add"} Value
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ValuesManager;
