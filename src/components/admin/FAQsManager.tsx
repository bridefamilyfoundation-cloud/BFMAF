import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FAQ } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, MessageSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const categories = ["general", "requests", "donations"];

const FAQsManager = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        category: "general",
        is_active: true,
    });

    // Fetch all FAQs
    const { data: faqs, isLoading } = useQuery({
        queryKey: ["faqs-admin"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("faqs")
                .select("*")
                .order("category", { ascending: true })
                .order("display_order", { ascending: true });

            if (error) throw error;
            return data as FAQ[];
        },
    });

    // Filter FAQs by category
    const filteredFAQs = faqs?.filter(
        (faq) => filterCategory === "all" || faq.category === filterCategory
    );

    // Add FAQ mutation
    const addMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const maxOrder =
                faqs
                    ?.filter((f) => f.category === data.category)
                    .reduce((max, f) => Math.max(max, f.display_order), 0) || 0;

            const { error } = await supabase.from("faqs").insert({
                ...data,
                display_order: maxOrder + 1,
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["faqs-admin"] });
            queryClient.invalidateQueries({ queryKey: ["faqs"] });
            toast({ title: "FAQ added successfully" });
            handleCloseDialog();
        },
        onError: (error) => {
            toast({ title: "Error adding FAQ", description: error.message, variant: "destructive" });
        },
    });

    // Update FAQ mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<FAQ> }) => {
            const { error } = await supabase.from("faqs").update(data).eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["faqs-admin"] });
            queryClient.invalidateQueries({ queryKey: ["faqs"] });
            toast({ title: "FAQ updated successfully" });
            handleCloseDialog();
        },
        onError: (error) => {
            toast({ title: "Error updating FAQ", description: error.message, variant: "destructive" });
        },
    });

    // Delete FAQ mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("faqs").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["faqs-admin"] });
            queryClient.invalidateQueries({ queryKey: ["faqs"] });
            toast({ title: "FAQ deleted successfully" });
        },
        onError: (error) => {
            toast({ title: "Error deleting FAQ", description: error.message, variant: "destructive" });
        },
    });

    const handleOpenDialog = (faq?: FAQ) => {
        if (faq) {
            setEditingFAQ(faq);
            setFormData({
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
                is_active: faq.is_active,
            });
        } else {
            setEditingFAQ(null);
            setFormData({
                question: "",
                answer: "",
                category: "general",
                is_active: true,
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingFAQ(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingFAQ) {
            updateMutation.mutate({ id: editingFAQ.id, data: formData });
        } else {
            addMutation.mutate(formData);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this FAQ?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleToggleActive = (faq: FAQ) => {
        updateMutation.mutate({
            id: faq.id,
            data: { is_active: !faq.is_active },
        });
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading FAQs...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-foreground">FAQs</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage frequently asked questions displayed on How It Works page
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => handleOpenDialog()} className="bg-gradient-hero text-primary-foreground">
                        <Plus className="w-4 h-4 mr-2" />
                        Add FAQ
                    </Button>
                </div>
            </div>

            <div className="bg-card rounded-xl shadow-card p-6">
                {filteredFAQs && filteredFAQs.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {filteredFAQs.map((faq) => (
                            <AccordionItem key={faq.id} value={faq.id}>
                                <div className="flex items-center gap-2">
                                    <AccordionTrigger className="flex-1 hover:no-underline">
                                        <div className="flex items-center gap-3 text-left">
                                            <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                                            <span className="font-medium">{faq.question}</span>
                                            <Badge variant="outline" className="ml-2">
                                                {faq.category}
                                            </Badge>
                                            {!faq.is_active && (
                                                <Badge variant="secondary" className="ml-2">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <div className="flex items-center gap-2 pr-4">
                                        <Switch
                                            checked={faq.is_active}
                                            onCheckedChange={() => handleToggleActive(faq)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenDialog(faq);
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(faq.id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                                <AccordionContent>
                                    <p className="text-muted-foreground pl-7">{faq.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        {filterCategory === "all"
                            ? "No FAQs yet. Add your first FAQ to get started."
                            : `No FAQs in the "${filterCategory}" category.`}
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingFAQ ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
                        <DialogDescription>
                            {editingFAQ ? "Update FAQ information" : "Add a new frequently asked question"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="question">Question *</Label>
                            <Input
                                id="question"
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                placeholder="What is the purpose of BFMAF?"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="answer">Answer *</Label>
                            <Textarea
                                id="answer"
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                placeholder="Provide a detailed answer to the question..."
                                rows={6}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                            <Label htmlFor="is_active">Active (visible on website)</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-hero text-primary-foreground"
                                disabled={addMutation.isPending || updateMutation.isPending}
                            >
                                {editingFAQ ? "Update" : "Add"} FAQ
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FAQsManager;
