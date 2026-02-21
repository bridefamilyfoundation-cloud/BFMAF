import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Trash2, 
  Loader2, 
  Search,
  FileText,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  User
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AidRequest {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  category: string;
  goal_amount: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  location: string | null;
  urgency: string;
  image_urls: string[];
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

const AidRequestsManager = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<AidRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AidRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "decline" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "declined">("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("aid_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error("Error fetching aid requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch aid requests",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleApproveDecline = async () => {
    if (!selectedRequest || !actionType) return;

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("aid_requests")
        .update({
          status: actionType === "approve" ? "approved" : "declined",
          admin_notes: adminNotes || null,
          reviewed_by: user?.id || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: actionType === "approve" ? "Request Approved" : "Request Declined",
        description: `The aid request has been ${actionType === "approve" ? "approved" : "declined"} successfully.`,
      });

      // TODO: Send notification email to requester
      // This would typically integrate with an email service
      console.log(`Notification should be sent to: ${selectedRequest.contact_email}`);
      console.log(`Status: ${actionType === "approve" ? "Approved" : "Declined"}`);

      setShowActionDialog(false);
      setShowDetailDialog(false);
      setAdminNotes("");
      setActionType(null);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setProcessing(false);
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this aid request?")) return;

    try {
      const { error } = await supabase
        .from("aid_requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      toast({ title: "Aid request deleted successfully" });
      fetchRequests();
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(null);
        setShowDetailDialog(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "declined":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-500/10 text-red-600";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600";
      case "low":
        return "bg-blue-500/10 text-blue-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || request.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const declinedCount = requests.filter((r) => r.status === "declined").length;

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
          <h2 className="text-3xl font-bold text-foreground">Aid Requests</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage aid requests from the community
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
            {pendingCount} Pending
          </Badge>
          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
            {approvedCount} Approved
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
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
            All ({requests.length})
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("pending")}
          >
            Pending ({pendingCount})
          </Button>
          <Button
            variant={filterStatus === "approved" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("approved")}
          >
            Approved ({approvedCount})
          </Button>
          <Button
            variant={filterStatus === "declined" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("declined")}
          >
            Declined ({declinedCount})
          </Button>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">No aid requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-card rounded-xl border p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-foreground">
                          {request.title}
                        </h3>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                        <Badge variant="secondary" className={getUrgencyColor(request.urgency)}>
                          {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {request.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>{request.contact_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatCurrency(request.goal_amount)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{request.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(request.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailDialog(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  {request.status === "pending" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionType("approve");
                          setShowActionDialog(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionType("decline");
                          setShowActionDialog(true);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(request.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.title}</DialogTitle>
            <DialogDescription>
              Aid request details and contact information
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </Badge>
                <Badge variant="secondary" className={getUrgencyColor(selectedRequest.urgency)}>
                  {selectedRequest.urgency.charAt(0).toUpperCase() + selectedRequest.urgency.slice(1)} Priority
                </Badge>
                <Badge variant="outline">{selectedRequest.category}</Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Contact Name</label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-foreground">{selectedRequest.contact_name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-foreground">{selectedRequest.contact_email}</p>
                    </div>
                  </div>
                  {selectedRequest.contact_phone && (
                    <div>
                      <label className="text-sm font-semibold text-foreground">Phone</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-foreground">{selectedRequest.contact_phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedRequest.location && (
                    <div>
                      <label className="text-sm font-semibold text-foreground">Location</label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-foreground">{selectedRequest.location}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Goal Amount</label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(selectedRequest.goal_amount)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Submitted</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-foreground">{formatDate(selectedRequest.created_at)}</p>
                    </div>
                  </div>
                  {selectedRequest.reviewed_at && (
                    <div>
                      <label className="text-sm font-semibold text-foreground">Reviewed</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-foreground">{formatDate(selectedRequest.reviewed_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground">Description</label>
                <div className="bg-secondary/30 rounded-lg p-4 mt-2">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {selectedRequest.description}
                  </p>
                </div>
              </div>

              {selectedRequest.admin_notes && (
                <div>
                  <label className="text-sm font-semibold text-foreground">Admin Notes</label>
                  <div className="bg-primary/5 rounded-lg p-4 mt-2 border border-primary/20">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {selectedRequest.admin_notes}
                    </p>
                  </div>
                </div>
              )}

              {selectedRequest.image_urls && selectedRequest.image_urls.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Images</label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedRequest.image_urls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Request image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
            {selectedRequest?.status === "pending" && (
              <>
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setActionType("approve");
                    setShowDetailDialog(false);
                    setShowActionDialog(true);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setActionType("decline");
                    setShowDetailDialog(false);
                    setShowActionDialog(true);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Decline"} Aid Request
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This request will be published on the Cases page and the requester will be notified via email."
                : "The requester will be notified that their request was declined."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Admin Notes {actionType === "decline" && "(Required)"}
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  actionType === "approve"
                    ? "Add any internal notes (optional)..."
                    : "Provide a reason for declining this request..."
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApproveDecline}
              disabled={processing || (actionType === "decline" && !adminNotes.trim())}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
              variant={actionType === "approve" ? "default" : "destructive"}
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {actionType === "approve" ? "Approve Request" : "Decline Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AidRequestsManager;
