import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, MailOpen, Trash2, Reply, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  admin_response: string | null;
  created_at: string;
}

const MessagesManager = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (messageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ is_read: !currentStatus })
        .eq("id", messageId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Marked as unread" : "Marked as read",
      });
      fetchMessages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const { error } = await supabase
        .from("contact_submissions")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      toast({ title: "Message deleted successfully" });
      fetchMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setSending(true);
    try {
      // Save reply to database
      const { error } = await supabase
        .from("contact_submissions")
        .update({ 
          admin_response: replyText,
          is_read: true 
        })
        .eq("id", selectedMessage.id);

      if (error) throw error;

      toast({
        title: "Reply saved",
        description: "Your response has been saved. You can send it via email separately.",
      });

      setShowReplyDialog(false);
      setReplyText("");
      fetchMessages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setSending(false);
  };

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    
    // Mark as read when viewing
    if (!message.is_read) {
      await handleMarkAsRead(message.id, false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "unread" && !message.is_read) ||
      (filterStatus === "read" && message.is_read);

    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Messages</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and respond to contact form submissions
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {unreadCount} Unread
        </Badge>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All ({messages.length})
          </Button>
          <Button
            variant={filterStatus === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("unread")}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filterStatus === "read" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("read")}
          >
            Read ({messages.length - unreadCount})
          </Button>
        </div>
      </div>

      {/* Messages List */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground">No messages found</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => handleViewMessage(message)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  selectedMessage?.id === message.id
                    ? "bg-primary/5 border-primary"
                    : message.is_read
                    ? "bg-card border-border"
                    : "bg-primary/10 border-primary/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {message.is_read ? (
                      <MailOpen className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    ) : (
                      <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground truncate">
                          {message.name}
                        </p>
                        {!message.is_read && (
                          <Badge variant="secondary" className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {message.subject || "No subject"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {message.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="bg-card rounded-xl border p-6 sticky top-0">
          {selectedMessage ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {selectedMessage.subject || "No subject"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    From: {selectedMessage.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: {selectedMessage.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(selectedMessage.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleMarkAsRead(selectedMessage.id, selectedMessage.is_read)
                    }
                  >
                    {selectedMessage.is_read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(selectedMessage.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Message:</h4>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {selectedMessage.admin_response && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Your Response:</h4>
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {selectedMessage.admin_response}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    setReplyText(selectedMessage.admin_response || "");
                    setShowReplyDialog(true);
                  }}
                  className="flex-1"
                >
                  <Reply className="w-4 h-4 mr-2" />
                  {selectedMessage.admin_response ? "Edit Response" : "Reply"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${selectedMessage.email}`, "_blank")}
                >
                  Send Email
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.name}</DialogTitle>
            <DialogDescription>
              Write your response. This will be saved to the database. You can send it via email separately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Your Response
              </label>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response here..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReply} disabled={sending || !replyText.trim()}>
              {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesManager;
