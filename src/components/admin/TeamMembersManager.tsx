import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/content";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const TeamMembersManager = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        bio: "",
        image_url: "",
        is_active: true,
    });

    // Fetch all team members (including inactive for admin view)
    const { data: members, isLoading } = useQuery({
        queryKey: ["team-members-admin"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("team_members")
                .select("*")
                .order("display_order", { ascending: true });

            if (error) throw error;
            return data as TeamMember[];
        },
    });

    // Add member mutation
    const addMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const maxOrder = members?.reduce((max, m) => Math.max(max, m.display_order), 0) || 0;

            const { error } = await supabase.from("team_members").insert({
                ...data,
                display_order: maxOrder + 1,
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members-admin"] });
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
            toast({ title: "Team member added successfully" });
            handleCloseDialog();
        },
        onError: (error) => {
            toast({ title: "Error adding team member", description: error.message, variant: "destructive" });
        },
    });

    // Update member mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<TeamMember> }) => {
            const { error } = await supabase
                .from("team_members")
                .update(data)
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members-admin"] });
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
            toast({ title: "Team member updated successfully" });
            handleCloseDialog();
        },
        onError: (error) => {
            toast({ title: "Error updating team member", description: error.message, variant: "destructive" });
        },
    });

    // Delete member mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("team_members").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team-members-admin"] });
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
            toast({ title: "Team member deleted successfully" });
        },
        onError: (error) => {
            toast({ title: "Error deleting team member", description: error.message, variant: "destructive" });
        },
    });

    const handleOpenDialog = (member?: TeamMember) => {
        if (member) {
            setEditingMember(member);
            setFormData({
                name: member.name,
                role: member.role,
                bio: member.bio || "",
                image_url: member.image_url || "",
                is_active: member.is_active,
            });
        } else {
            setEditingMember(null);
            setFormData({
                name: "",
                role: "",
                bio: "",
                image_url: "",
                is_active: true,
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingMember(null);
        setFormData({
            name: "",
            role: "",
            bio: "",
            image_url: "",
            is_active: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingMember) {
            updateMutation.mutate({ id: editingMember.id, data: formData });
        } else {
            addMutation.mutate(formData);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this team member?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleToggleActive = (member: TeamMember) => {
        updateMutation.mutate({
            id: member.id,
            data: { is_active: !member.is_active },
        });
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading team members...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-foreground">Team Members</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage board members and team displayed on the About page
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-gradient-hero text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                </Button>
            </div>

            <div className="bg-card rounded-xl shadow-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members?.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                                </TableCell>
                                <TableCell className="font-medium">{member.name}</TableCell>
                                <TableCell>{member.role}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={member.is_active}
                                            onCheckedChange={() => handleToggleActive(member)}
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {member.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenDialog(member)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(member.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {members?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No team members yet. Add your first member to get started.
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMember ? "Edit Team Member" : "Add Team Member"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingMember
                                ? "Update team member information"
                                : "Add a new team member to the About page"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Bro John Doe"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="role">Role *</Label>
                            <Input
                                id="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                placeholder="Chairman, Secretary, Trustee, etc."
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="bio">Bio (Optional)</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Brief description about the team member..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="image_url">Image URL (Optional)</Label>
                            <Input
                                id="image_url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                type="url"
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
                                {editingMember ? "Update" : "Add"} Member
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TeamMembersManager;
