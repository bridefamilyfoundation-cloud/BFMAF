import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Calendar,
  Quote,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SuccessStory {
  id: string;
  title: string;
  patient_name: string;
  condition: string;
  treatment: string;
  location: string | null;
  status: string;
  story_content: string;
  featured_quote: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

interface TreatmentUpdate {
  id: string;
  story_id: string;
  update_date: string;
  title: string;
  description: string;
  sort_order: number;
}

interface Testimonial {
  id: string;
  story_id: string | null;
  quote: string;
  author_name: string;
  author_role: string;
  is_published: boolean;
  sort_order: number;
}

const SuccessStoriesManager = () => {
  const { toast } = useToast();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Story dialog state
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [storyForm, setStoryForm] = useState({
    title: "",
    patient_name: "",
    condition: "",
    treatment: "",
    location: "",
    status: "ongoing",
    story_content: "",
    featured_quote: "",
    is_featured: false,
    is_published: false,
  });

  // Timeline dialog state
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);
  const [selectedStoryForTimeline, setSelectedStoryForTimeline] = useState<SuccessStory | null>(null);
  const [timelineUpdates, setTimelineUpdates] = useState<TreatmentUpdate[]>([]);
  const [newUpdate, setNewUpdate] = useState({ update_date: "", title: "", description: "" });

  // Testimonial dialog state
  const [showTestimonialDialog, setShowTestimonialDialog] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    quote: "",
    author_name: "",
    author_role: "",
    story_id: "",
    is_published: true,
  });

  const [expandedStory, setExpandedStory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [storiesRes, testimonialsRes] = await Promise.all([
        supabase.from("success_stories").select("*").order("created_at", { ascending: false }),
        supabase.from("testimonials").select("*").order("sort_order"),
      ]);

      if (storiesRes.data) setStories(storiesRes.data);
      if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const handleSaveStory = async () => {
    setSaving(true);
    try {
      const data = {
        ...storyForm,
        featured_quote: storyForm.featured_quote || null,
        location: storyForm.location || null,
      };

      if (editingStory) {
        const { error } = await supabase
          .from("success_stories")
          .update(data)
          .eq("id", editingStory.id);
        if (error) throw error;
        toast({ title: "Story updated successfully" });
      } else {
        const { error } = await supabase.from("success_stories").insert(data);
        if (error) throw error;
        toast({ title: "Story created successfully" });
      }

      setShowStoryDialog(false);
      resetStoryForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Error saving story", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story? This will also delete all related timeline updates.")) return;
    
    try {
      const { error } = await supabase.from("success_stories").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Story deleted successfully" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error deleting story", description: error.message, variant: "destructive" });
    }
  };

  const handleTogglePublish = async (story: SuccessStory) => {
    try {
      const { error } = await supabase
        .from("success_stories")
        .update({ is_published: !story.is_published })
        .eq("id", story.id);
      if (error) throw error;
      toast({ title: story.is_published ? "Story unpublished" : "Story published" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error updating story", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleFeatured = async (story: SuccessStory) => {
    try {
      const { error } = await supabase
        .from("success_stories")
        .update({ is_featured: !story.is_featured })
        .eq("id", story.id);
      if (error) throw error;
      toast({ title: story.is_featured ? "Removed from featured" : "Marked as featured" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error updating story", description: error.message, variant: "destructive" });
    }
  };

  const openTimelineDialog = async (story: SuccessStory) => {
    setSelectedStoryForTimeline(story);
    const { data } = await supabase
      .from("treatment_updates")
      .select("*")
      .eq("story_id", story.id)
      .order("sort_order");
    setTimelineUpdates(data || []);
    setShowTimelineDialog(true);
  };

  const handleAddTimelineUpdate = async () => {
    if (!selectedStoryForTimeline || !newUpdate.update_date || !newUpdate.title || !newUpdate.description) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.from("treatment_updates").insert({
        story_id: selectedStoryForTimeline.id,
        ...newUpdate,
        sort_order: timelineUpdates.length,
      });
      if (error) throw error;
      toast({ title: "Timeline update added" });
      setNewUpdate({ update_date: "", title: "", description: "" });
      const { data } = await supabase
        .from("treatment_updates")
        .select("*")
        .eq("story_id", selectedStoryForTimeline.id)
        .order("sort_order");
      setTimelineUpdates(data || []);
    } catch (error: any) {
      toast({ title: "Error adding update", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDeleteTimelineUpdate = async (id: string) => {
    try {
      const { error } = await supabase.from("treatment_updates").delete().eq("id", id);
      if (error) throw error;
      setTimelineUpdates(prev => prev.filter(u => u.id !== id));
      toast({ title: "Timeline update deleted" });
    } catch (error: any) {
      toast({ title: "Error deleting update", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveTestimonial = async () => {
    setSaving(true);
    try {
      const data = {
        ...testimonialForm,
        story_id: testimonialForm.story_id || null,
        sort_order: editingTestimonial ? editingTestimonial.sort_order : testimonials.length,
      };

      if (editingTestimonial) {
        const { error } = await supabase
          .from("testimonials")
          .update(data)
          .eq("id", editingTestimonial.id);
        if (error) throw error;
        toast({ title: "Testimonial updated" });
      } else {
        const { error } = await supabase.from("testimonials").insert(data);
        if (error) throw error;
        toast({ title: "Testimonial added" });
      }

      setShowTestimonialDialog(false);
      resetTestimonialForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Error saving testimonial", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Testimonial deleted" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error deleting testimonial", description: error.message, variant: "destructive" });
    }
  };

  const resetStoryForm = () => {
    setEditingStory(null);
    setStoryForm({
      title: "",
      patient_name: "",
      condition: "",
      treatment: "",
      location: "",
      status: "ongoing",
      story_content: "",
      featured_quote: "",
      is_featured: false,
      is_published: false,
    });
  };

  const resetTestimonialForm = () => {
    setEditingTestimonial(null);
    setTestimonialForm({
      quote: "",
      author_name: "",
      author_role: "",
      story_id: "",
      is_published: true,
    });
  };

  const openEditStory = (story: SuccessStory) => {
    setEditingStory(story);
    setStoryForm({
      title: story.title,
      patient_name: story.patient_name,
      condition: story.condition,
      treatment: story.treatment,
      location: story.location || "",
      status: story.status,
      story_content: story.story_content,
      featured_quote: story.featured_quote || "",
      is_featured: story.is_featured,
      is_published: story.is_published,
    });
    setShowStoryDialog(true);
  };

  const openEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setTestimonialForm({
      quote: testimonial.quote,
      author_name: testimonial.author_name,
      author_role: testimonial.author_role,
      story_id: testimonial.story_id || "",
      is_published: testimonial.is_published,
    });
    setShowTestimonialDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success Stories Section */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-serif font-semibold text-foreground">Success Stories</h2>
          </div>
          <Button onClick={() => { resetStoryForm(); setShowStoryDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Story
          </Button>
        </div>

        {stories.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No success stories yet. Add your first story!</p>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <div key={story.id} className="border border-border rounded-xl overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50"
                  onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{story.title}</span>
                        {story.is_featured && (
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                            <Star className="w-3 h-3 mr-1" /> Featured
                          </Badge>
                        )}
                        {story.is_published ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600">Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{story.patient_name} • {story.condition}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {expandedStory === story.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
                
                {expandedStory === story.id && (
                  <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Treatment:</span>
                        <p className="font-medium text-foreground">{story.treatment}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-medium text-foreground">{story.location || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p className="font-medium text-foreground capitalize">{story.status}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium text-foreground">{new Date(story.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Story Content:</span>
                      <p className="text-foreground text-sm mt-1 line-clamp-3">{story.story_content}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => openEditStory(story)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openTimelineDialog(story)}>
                        <Calendar className="w-4 h-4 mr-1" /> Timeline
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleTogglePublish(story)}>
                        {story.is_published ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                        {story.is_published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleToggleFeatured(story)}>
                        <Star className={`w-4 h-4 mr-1 ${story.is_featured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                        {story.is_featured ? "Unfeature" : "Feature"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteStory(story.id)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Testimonials Section */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Quote className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-serif font-semibold text-foreground">Testimonials</h2>
          </div>
          <Button onClick={() => { resetTestimonialForm(); setShowTestimonialDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Testimonial
          </Button>
        </div>

        {testimonials.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No testimonials yet. Add your first testimonial!</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell className="max-w-xs truncate">"{testimonial.quote}"</TableCell>
                  <TableCell>{testimonial.author_name}</TableCell>
                  <TableCell>{testimonial.author_role}</TableCell>
                  <TableCell>
                    {testimonial.is_published ? (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600">Published</Badge>
                    ) : (
                      <Badge variant="outline">Hidden</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditTestimonial(testimonial)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteTestimonial(testimonial.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
          </Table>
        )}
      </div>

      {/* Story Dialog */}
      <Dialog open={showStoryDialog} onOpenChange={setShowStoryDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStory ? "Edit Story" : "Add New Story"}</DialogTitle>
            <DialogDescription>
              {editingStory ? "Update the success story details." : "Create a new success story to showcase on the website."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  placeholder="e.g., Our First Case"
                />
              </div>
              <div>
                <Label htmlFor="patient_name">Patient Name</Label>
                <Input
                  id="patient_name"
                  value={storyForm.patient_name}
                  onChange={(e) => setStoryForm({ ...storyForm, patient_name: e.target.value })}
                  placeholder="e.g., Bro Joseph Bala"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="condition">Medical Condition</Label>
                <Input
                  id="condition"
                  value={storyForm.condition}
                  onChange={(e) => setStoryForm({ ...storyForm, condition: e.target.value })}
                  placeholder="e.g., Spinal Condition"
                />
              </div>
              <div>
                <Label htmlFor="treatment">Treatment</Label>
                <Input
                  id="treatment"
                  value={storyForm.treatment}
                  onChange={(e) => setStoryForm({ ...storyForm, treatment: e.target.value })}
                  placeholder="e.g., Acupressure, Hydrotherapy"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={storyForm.location}
                  onChange={(e) => setStoryForm({ ...storyForm, location: e.target.value })}
                  placeholder="e.g., Kaduna → Jos, Nigeria"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={storyForm.status} onValueChange={(v) => setStoryForm({ ...storyForm, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing Recovery</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_treatment">In Treatment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="story_content">Story Content</Label>
              <Textarea
                id="story_content"
                value={storyForm.story_content}
                onChange={(e) => setStoryForm({ ...storyForm, story_content: e.target.value })}
                placeholder="Tell the full story of this case..."
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="featured_quote">Featured Quote (Optional)</Label>
              <Textarea
                id="featured_quote"
                value={storyForm.featured_quote}
                onChange={(e) => setStoryForm({ ...storyForm, featured_quote: e.target.value })}
                placeholder="A memorable quote from this story..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveStory} disabled={saving || !storyForm.title || !storyForm.patient_name || !storyForm.story_content}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingStory ? "Save Changes" : "Create Story"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timeline Dialog */}
      <Dialog open={showTimelineDialog} onOpenChange={setShowTimelineDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Treatment Timeline</DialogTitle>
            <DialogDescription>
              Manage timeline updates for {selectedStoryForTimeline?.patient_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Existing updates */}
            {timelineUpdates.length > 0 && (
              <div className="space-y-2">
                {timelineUpdates.map((update, index) => (
                  <div key={update.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary">{update.update_date}</span>
                        <span className="font-medium text-foreground">{update.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{update.description}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteTimelineUpdate(update.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new update */}
            <div className="border-t border-border pt-4">
              <h4 className="font-medium text-foreground mb-3">Add New Update</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="update_date">Date</Label>
                  <Input
                    id="update_date"
                    value={newUpdate.update_date}
                    onChange={(e) => setNewUpdate({ ...newUpdate, update_date: e.target.value })}
                    placeholder="e.g., March 2025"
                  />
                </div>
                <div>
                  <Label htmlFor="update_title">Title</Label>
                  <Input
                    id="update_title"
                    value={newUpdate.title}
                    onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                    placeholder="e.g., Treatment Begins"
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label htmlFor="update_description">Description</Label>
                <Textarea
                  id="update_description"
                  value={newUpdate.description}
                  onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                  placeholder="Describe what happened..."
                  rows={3}
                />
              </div>
              <Button 
                className="mt-3" 
                onClick={handleAddTimelineUpdate}
                disabled={saving || !newUpdate.update_date || !newUpdate.title || !newUpdate.description}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Update
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimelineDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Testimonial Dialog */}
      <Dialog open={showTestimonialDialog} onOpenChange={setShowTestimonialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
            <DialogDescription>
              {editingTestimonial ? "Update testimonial details." : "Add a new testimonial to display on the website."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quote">Quote</Label>
              <Textarea
                id="quote"
                value={testimonialForm.quote}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                placeholder="What did they say..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author_name">Author Name</Label>
                <Input
                  id="author_name"
                  value={testimonialForm.author_name}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, author_name: e.target.value })}
                  placeholder="e.g., Bro Ezekiel Ekka"
                />
              </div>
              <div>
                <Label htmlFor="author_role">Author Role</Label>
                <Input
                  id="author_role"
                  value={testimonialForm.author_role}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, author_role: e.target.value })}
                  placeholder="e.g., BFMAF Chairman"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="story_id">Link to Story (Optional)</Label>
              <Select 
                value={testimonialForm.story_id} 
                onValueChange={(v) => setTestimonialForm({ ...testimonialForm, story_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a story (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No story linked</SelectItem>
                  {stories.map((story) => (
                    <SelectItem key={story.id} value={story.id}>{story.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestimonialDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveTestimonial} 
              disabled={saving || !testimonialForm.quote || !testimonialForm.author_name || !testimonialForm.author_role}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingTestimonial ? "Save Changes" : "Add Testimonial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuccessStoriesManager;
