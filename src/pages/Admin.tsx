import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Heart,
  DollarSign,
  TrendingUp,
  MoreVertical,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Bell,
  ChevronDown,
  HandHeart,
  Check,
  X,
  Eye,
  Clock,
  AlertCircle,
  Loader2,
  Save,
  Mail,
  Phone,
  MapPin,
  Shield,
  UserCheck,
  UserX,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import NewCaseDialog from "@/components/admin/NewCaseDialog";

interface StatsCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  color: string;
}

interface RecentDonation {
  id: string;
  donor: string;
  email: string;
  amount: number;
  campaign: string;
  date: string;
  avatar: string;
}

interface Campaign {
  id: string;
  name: string;
  raised: number;
  goal: number;
  donors: number;
  status: string;
}

interface AidRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  goal_amount: number;
  urgency: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  location: string | null;
  image_urls: string[];
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  role: string;
  is_approved: boolean;
  approved_at: string | null;
}

interface SiteSettings {
  organization_name: string;
  tagline: string;
  description: string;
  address: string;
  phone1: string;
  phone2: string;
  email: string;
  scripture_reference: string;
  scripture_text: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statsCards, setStatsCards] = useState<StatsCard[]>([]);
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Aid Requests state
  const [aidRequests, setAidRequests] = useState<AidRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AidRequest | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processingRequest, setProcessingRequest] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [approvingUser, setApprovingUser] = useState(false);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  // Settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    organization_name: "Bride Family Medical Aid Foundation",
    tagline: "BFMAF",
    description: "A platform borne out of compassion to reach out to severely traumatized believers.",
    address: "Divine Love Christian Assembly Jos, Longwa Phase II Behind Millennium Hotel Jos",
    phone1: "07032128927",
    phone2: "08036638890",
    email: "info@bfmaf.org",
    scripture_reference: "1 Corinthians 12:26",
    scripture_text: "And whether one member suffer, all the members suffer with it, or one member be honored, all the members rejoice with it.",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    await fetchDashboardData();
    await fetchAidRequests();
    await fetchUsers();
    await fetchSiteSettings();
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return;
    }

    // Get roles for each user
    const { data: roles } = await supabase.from("user_roles").select("*");

    const usersWithRoles = (profiles || []).map((profile) => {
      const userRole = roles?.find((r) => r.user_id === profile.user_id);
      return {
        ...profile,
        role: userRole?.role || "user",
        is_approved: profile.is_approved ?? false,
        approved_at: profile.approved_at ?? null,
      };
    });

    setUsers(usersWithRoles);
    setPendingUsersCount(usersWithRoles.filter((u) => !u.is_approved).length);
  };

  const handleApproveUser = async (userId: string) => {
    setApprovingUser(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("profiles")
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq("user_id", userId);

      if (error) throw error;

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user?.id,
        action: "user_approved",
        details: { approved_user_id: userId },
      });

      toast({
        title: "User Approved",
        description: "The member has been approved successfully.",
      });

      await fetchUsers();
      setShowUserDialog(false);
    } catch (error: any) {
      console.error("Error approving user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve user",
        variant: "destructive",
      });
    } finally {
      setApprovingUser(false);
    }
  };

  const handleRevokeApproval = async (userId: string) => {
    setApprovingUser(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_approved: false,
          approved_at: null,
          approved_by: null,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Approval Revoked",
        description: "The member's approval has been revoked.",
      });

      await fetchUsers();
      setShowUserDialog(false);
    } catch (error: any) {
      console.error("Error revoking approval:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to revoke approval",
        variant: "destructive",
      });
    } finally {
      setApprovingUser(false);
    }
  };

  const fetchSiteSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (error) {
      console.error("Error fetching site settings:", error);
      return;
    }

    if (data) {
      const settings: Partial<SiteSettings> = {};
      data.forEach((item) => {
        if (item.key && item.value) {
          (settings as any)[item.key] = item.value;
        }
      });
      setSiteSettings((prev) => ({ ...prev, ...settings }));
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const settingsToSave = Object.entries(siteSettings);
      
      for (const [key, value] of settingsToSave) {
        await supabase
          .from("site_settings")
          .upsert({ key, value, updated_by: user?.id }, { onConflict: "key" });
      }

      toast({
        title: "Settings Saved",
        description: "Website settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    setUpdatingRole(true);
    try {
      if (newRole === "user") {
        // Remove admin/moderator role
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId);
      } else {
        // Delete existing role first, then insert new one
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId);
        
        await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole as "admin" | "moderator" | "user" });
      }

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}.`,
      });

      await fetchUsers();
      setShowUserDialog(false);
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(false);
    }
  };

  const fetchAidRequests = async () => {
    const { data, error } = await supabase
      .from("aid_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching aid requests:", error);
      return;
    }

    setAidRequests(data || []);
    setPendingCount(data?.filter(r => r.status === "pending").length || 0);
  };

  const fetchDashboardData = async () => {
    // Fetch donations for stats
    const { data: donations } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch causes/campaigns
    const { data: causes } = await supabase
      .from("causes")
      .select("*")
      .order("created_at", { ascending: false });

    // Calculate stats
    const totalDonations = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
    const uniqueDonors = new Set(donations?.map(d => d.user_id || d.donor_email).filter(Boolean)).size;
    const activeCampaigns = causes?.filter(c => c.is_active).length || 0;
    const avgDonation = donations?.length ? Math.round(totalDonations / donations.length) : 0;

    setStatsCards([
      {
        title: "Total Donations",
        value: `₦${totalDonations.toLocaleString()}`,
        change: "+12.5%",
        trend: "up",
        icon: DollarSign,
        color: "primary",
      },
      {
        title: "Active Donors",
        value: uniqueDonors.toLocaleString(),
        change: "+8.2%",
        trend: "up",
        icon: Users,
        color: "accent",
      },
      {
        title: "Active Cases",
        value: activeCampaigns.toString(),
        change: `+${activeCampaigns}`,
        trend: "up",
        icon: Heart,
        color: "success",
      },
      {
        title: "Avg. Donation",
        value: `₦${avgDonation}`,
        change: "-2.1%",
        trend: "down",
        icon: TrendingUp,
        color: "warm",
      },
    ]);

    // Format recent donations
    if (donations) {
      const formattedDonations = await Promise.all(
        donations.slice(0, 10).map(async (donation) => {
          let donorName = "Anonymous";
          let donorEmail = donation.donor_email || "";
          
          if (donation.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("first_name, last_name, email")
              .eq("user_id", donation.user_id)
              .maybeSingle();
            
            if (profile) {
              donorName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User";
              donorEmail = profile.email || "";
            }
          } else if (donation.donor_name) {
            donorName = donation.donor_name;
          }

          let campaignName = "General Donation";
          if (donation.cause_id) {
            const cause = causes?.find(c => c.id === donation.cause_id);
            if (cause) campaignName = cause.title;
          }

          const date = new Date(donation.created_at);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffMins = Math.round(diffMs / 60000);
          const diffHours = Math.round(diffMs / 3600000);
          let dateStr = `${diffMins} min ago`;
          if (diffMins > 60) dateStr = `${diffHours} hours ago`;
          if (diffHours > 24) dateStr = date.toLocaleDateString();

          return {
            id: donation.id,
            donor: donorName,
            email: donorEmail,
            amount: Number(donation.amount),
            campaign: campaignName,
            date: dateStr,
            avatar: donorName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase(),
          };
        })
      );
      setRecentDonations(formattedDonations);
    }

    // Format campaigns
    if (causes) {
      const formattedCampaigns = await Promise.all(
        causes.map(async (cause) => {
          const { count } = await supabase
            .from("donations")
            .select("*", { count: "exact", head: true })
            .eq("cause_id", cause.id);

          return {
            id: cause.id,
            name: cause.title,
            raised: Number(cause.raised_amount),
            goal: Number(cause.goal_amount),
            donors: count || 0,
            status: cause.is_active ? "active" : "completed",
          };
        })
      );
      setCampaigns(formattedCampaigns);
    }
  };

  const handleViewRequest = (request: AidRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || "");
    setShowRequestDialog(true);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    setProcessingRequest(true);

    try {
      // Create a new case in causes table
      const { error: causeError } = await supabase.from("causes").insert({
        title: selectedRequest.title,
        description: selectedRequest.description,
        category: selectedRequest.category,
        goal_amount: selectedRequest.goal_amount,
        raised_amount: 0,
        image_url: selectedRequest.image_urls?.[0] || null,
        is_active: true,
      });

      if (causeError) throw causeError;

      // Update aid request status
      const { error: updateError } = await supabase
        .from("aid_requests")
        .update({
          status: "approved",
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      if (updateError) throw updateError;

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("activity_log").insert({
        user_id: user?.id,
        action: "aid_request_approved",
        details: { request_id: selectedRequest.id, title: selectedRequest.title },
      });

      toast({
        title: "Request Approved",
        description: "The aid request has been approved and a new case has been created.",
      });

      setShowRequestDialog(false);
      await fetchAidRequests();
      await fetchDashboardData();
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    if (!adminNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide a reason for rejection in the admin notes.",
        variant: "destructive",
      });
      return;
    }

    setProcessingRequest(true);

    try {
      const { error } = await supabase
        .from("aid_requests")
        .update({
          status: "rejected",
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("activity_log").insert({
        user_id: user?.id,
        action: "aid_request_rejected",
        details: { request_id: selectedRequest.id, title: selectedRequest.title },
      });

      toast({
        title: "Request Rejected",
        description: "The aid request has been rejected.",
      });

      setShowRequestDialog(false);
      await fetchAidRequests();
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(false);
    }
  };

  const filteredDonations = recentDonations.filter(
    (d) =>
      d.donor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.campaign.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = aidRequests.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contact_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20"><Check className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20"><X className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <FloatingBackground />
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingBackground />
      <Navbar />

      <div className="pt-24 pb-10 px-4">
        <div className="container mx-auto">
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside
              className={cn(
                "hidden lg:flex flex-col bg-card rounded-2xl shadow-card p-4 transition-all duration-300",
                sidebarOpen ? "w-64" : "w-20"
              )}
            >
              <div className="flex items-center gap-3 px-4 py-3 mb-4">
                <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
                </div>
                {sidebarOpen && (
                  <span className="font-serif font-semibold text-foreground">Admin Panel</span>
                )}
              </div>

              <nav className="flex-1 space-y-1">
                {[
                  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
                  { id: "aid-requests", icon: HandHeart, label: "Aid Requests", badge: pendingCount },
                  { id: "donations", icon: DollarSign, label: "Donations" },
                  { id: "campaigns", icon: Heart, label: "Cases" },
                  { id: "users", icon: Users, label: "Users", badge: pendingUsersCount },
                  { id: "settings", icon: Settings, label: "Settings" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative",
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                    {item.badge && item.badge > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card rounded-2xl p-6 shadow-card">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-foreground">
                    {activeTab === "dashboard" && "Dashboard"}
                    {activeTab === "aid-requests" && "Aid Requests"}
                    {activeTab === "donations" && "Donations"}
                    {activeTab === "campaigns" && "Cases Management"}
                    {activeTab === "users" && "Users"}
                    {activeTab === "settings" && "Settings"}
                  </h1>
                  <p className="text-muted-foreground">
                    {activeTab === "dashboard" && "Welcome back! Here's what's happening."}
                    {activeTab === "aid-requests" && `Review and manage aid requests. ${pendingCount} pending.`}
                    {activeTab === "donations" && "View and manage all donations."}
                    {activeTab === "campaigns" && `Manage all ${campaigns.length} cases.`}
                    {activeTab === "users" && `Manage ${users.length} users. ${pendingUsersCount} pending approval.`}
                    {activeTab === "settings" && "Configure website settings."}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative"
                    onClick={() => setActiveTab("aid-requests")}
                  >
                    <Bell className="w-5 h-5" />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                        {pendingCount}
                      </span>
                    )}
                  </Button>
                  <NewCaseDialog onCaseCreated={() => fetchDashboardData()} />
                </div>
              </div>

              {activeTab === "dashboard" && (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat) => (
                      <div key={stat.title} className="bg-card rounded-2xl p-6 shadow-card group hover:shadow-card-hover transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                              stat.color === "primary" && "bg-primary/10",
                              stat.color === "accent" && "bg-accent/10",
                              stat.color === "success" && "bg-success/10",
                              stat.color === "warm" && "bg-warm/10"
                            )}
                          >
                            <stat.icon
                              className={cn(
                                "w-6 h-6",
                                stat.color === "primary" && "text-primary",
                                stat.color === "accent" && "text-accent",
                                stat.color === "success" && "text-success",
                                stat.color === "warm" && "text-warm"
                              )}
                            />
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-1 text-sm font-medium",
                              stat.trend === "up" ? "text-success" : "text-destructive"
                            )}
                          >
                            {stat.trend === "up" ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                            {stat.change}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-2xl font-serif font-bold text-foreground">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Content Grid */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Recent Donations */}
                    <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-card">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-serif font-semibold text-foreground">Recent Donations</h2>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Search..."
                              className="pl-9 w-48"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                          <Button variant="outline" size="icon">
                            <Filter className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Donor</th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Case</th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Amount</th>
                              <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Time</th>
                              <th className="py-3 px-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDonations.length > 0 ? (
                              filteredDonations.map((donation) => (
                                <tr key={donation.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                                  <td className="py-4 px-2">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-sm">
                                        {donation.avatar}
                                      </div>
                                      <div>
                                        <p className="font-medium text-foreground">{donation.donor}</p>
                                        <p className="text-sm text-muted-foreground">{donation.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-2 text-sm text-muted-foreground">{donation.campaign}</td>
                                  <td className="py-4 px-2 font-semibold text-primary">₦{donation.amount}</td>
                                  <td className="py-4 px-2 text-sm text-muted-foreground">{donation.date}</td>
                                  <td className="py-4 px-2">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreVertical className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem>Send Receipt</DropdownMenuItem>
                                        <DropdownMenuItem>Contact Donor</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                  No donations found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Quick Cases Overview */}
                    <div className="bg-card rounded-2xl p-6 shadow-card">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-serif font-semibold text-foreground">Active Cases</h2>
                          <p className="text-sm text-muted-foreground">{campaigns.filter(c => c.status === "active").length} active cases</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab("campaigns")}
                          className="gap-1.5"
                        >
                          View All Cases
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {campaigns.length > 0 ? (
                          campaigns.slice(0, 5).map((campaign) => {
                            const progress = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;
                            return (
                              <div key={campaign.id} className="p-4 bg-secondary/50 rounded-xl border border-border/50">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                  <h4 className="font-semibold text-foreground text-base truncate flex-1">{campaign.name}</h4>
                                  <Badge
                                    variant={campaign.status === "active" ? "default" : "secondary"}
                                    className={cn(
                                      "shrink-0 text-xs",
                                      campaign.status === "active" ? "bg-success text-success-foreground" : ""
                                    )}
                                  >
                                    {campaign.status === "active" ? "Active" : "Completed"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{campaign.donors} donors</p>
                                <Progress value={progress} className="h-2.5 mb-2" />
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-primary font-bold">₦{campaign.raised.toLocaleString()}</span>
                                  <span className="text-muted-foreground font-medium">of ₦{campaign.goal.toLocaleString()}</span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8">
                            <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">No cases yet.</p>
                            <p className="text-sm text-muted-foreground mt-1">Create your first case to get started.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Cases/Campaigns Tab */}
              {activeTab === "campaigns" && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-serif font-semibold text-foreground">All Cases</h2>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search cases..."
                          className="pl-9 w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <NewCaseDialog onCaseCreated={() => fetchDashboardData()} />
                    </div>
                  </div>

                  {campaigns.length === 0 ? (
                    <div className="text-center py-16">
                      <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No cases yet</h3>
                      <p className="text-muted-foreground mb-6">Create your first case to start receiving donations.</p>
                      <NewCaseDialog onCaseCreated={() => fetchDashboardData()} />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {campaigns
                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((campaign) => {
                          const progress = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;
                          return (
                            <div 
                              key={campaign.id} 
                              className="p-6 border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                      <h3 className="font-semibold text-foreground text-lg">{campaign.name}</h3>
                                      <p className="text-sm text-muted-foreground">{campaign.donors} donors</p>
                                    </div>
                                    <Badge
                                      variant={campaign.status === "active" ? "default" : "secondary"}
                                      className={cn(
                                        "shrink-0",
                                        campaign.status === "active" ? "bg-success" : ""
                                      )}
                                    >
                                      {campaign.status === "active" ? "Active" : "Completed"}
                                    </Badge>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Progress</span>
                                      <span className="font-medium text-foreground">{Math.round(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-3" />
                                    <div className="flex justify-between text-sm">
                                      <span className="text-primary font-semibold">₦{campaign.raised.toLocaleString()} raised</span>
                                      <span className="text-muted-foreground">Goal: ₦{campaign.goal.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`/cases/${campaign.id}`, "_blank")}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>Edit Case</DropdownMenuItem>
                                      <DropdownMenuItem>View Donations</DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive">
                                        {campaign.status === "active" ? "Deactivate" : "Reactivate"}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "aid-requests" && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-serif font-semibold text-foreground">Aid Requests</h2>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search requests..."
                          className="pl-9 w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Request</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Category</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Urgency</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Amount</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Status</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Date</th>
                          <th className="py-3 px-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.length > 0 ? (
                          filteredRequests.map((request) => (
                            <tr key={request.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                              <td className="py-4 px-2">
                                <div>
                                  <p className="font-medium text-foreground line-clamp-1">{request.title}</p>
                                  <p className="text-sm text-muted-foreground">{request.contact_name}</p>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <Badge variant="outline">{request.category}</Badge>
                              </td>
                              <td className="py-4 px-2">
                                {getUrgencyBadge(request.urgency)}
                              </td>
                              <td className="py-4 px-2 font-semibold text-primary">
                                ₦{Number(request.goal_amount).toLocaleString()}
                              </td>
                              <td className="py-4 px-2">
                                {getStatusBadge(request.status)}
                              </td>
                              <td className="py-4 px-2 text-sm text-muted-foreground">
                                {new Date(request.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-4 px-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewRequest(request)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Review
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-muted-foreground">
                              No aid requests found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-serif font-semibold text-foreground">Users</h2>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-9 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">User</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Contact</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Location</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Status</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Role</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Joined</th>
                          <th className="py-3 px-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter(
                            (u) =>
                              u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              u.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((user) => (
                            <tr key={user.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-sm">
                                    {(user.first_name?.[0] || "") + (user.last_name?.[0] || "") || "U"}
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {user.first_name || user.last_name
                                        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                                        : "No Name"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className="text-sm">
                                  {user.phone ? (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                      <Phone className="w-3 h-3" /> {user.phone}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className="text-sm">
                                  {user.address ? (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                      <MapPin className="w-3 h-3" /> {user.address}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                {user.is_approved ? (
                                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                    <UserCheck className="w-3 h-3 mr-1" />
                                    Approved
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </td>
                              <td className="py-4 px-2">
                                <Badge
                                  variant={user.role === "admin" ? "default" : "outline"}
                                  className={cn(
                                    user.role === "admin" && "bg-primary",
                                    user.role === "moderator" && "bg-accent text-accent-foreground"
                                  )}
                                >
                                  <Shield className="w-3 h-3 mr-1" />
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="py-4 px-2 text-sm text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-2">
                                  {!user.is_approved && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleApproveUser(user.user_id)}
                                      disabled={approvingUser}
                                    >
                                      <UserCheck className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowUserDialog(true);
                                    }}
                                  >
                                    <UserCog className="w-4 h-4 mr-1" />
                                    Manage
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-muted-foreground">
                              No users found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div className="bg-card rounded-2xl p-6 shadow-card">
                    <h2 className="text-xl font-serif font-semibold text-foreground mb-6">Website Settings</h2>
                    
                    <div className="space-y-6">
                      {/* Organization Info */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-foreground border-b border-border pb-2">Organization Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="org_name">Organization Name</Label>
                            <Input
                              id="org_name"
                              value={siteSettings.organization_name}
                              onChange={(e) =>
                                setSiteSettings({ ...siteSettings, organization_name: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tagline">Short Name / Tagline</Label>
                            <Input
                              id="tagline"
                              value={siteSettings.tagline}
                              onChange={(e) =>
                                setSiteSettings({ ...siteSettings, tagline: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={siteSettings.description}
                            onChange={(e) =>
                              setSiteSettings({ ...siteSettings, description: e.target.value })
                            }
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-foreground border-b border-border pb-2">Contact Information</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={siteSettings.address}
                            onChange={(e) =>
                              setSiteSettings({ ...siteSettings, address: e.target.value })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone1">Phone Number 1</Label>
                            <Input
                              id="phone1"
                              value={siteSettings.phone1}
                              onChange={(e) =>
                                setSiteSettings({ ...siteSettings, phone1: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone2">Phone Number 2</Label>
                            <Input
                              id="phone2"
                              value={siteSettings.phone2}
                              onChange={(e) =>
                                setSiteSettings({ ...siteSettings, phone2: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={siteSettings.email}
                              onChange={(e) =>
                                setSiteSettings({ ...siteSettings, email: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Scripture */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-foreground border-b border-border pb-2">Scripture Reference</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="scripture_ref">Scripture Reference</Label>
                          <Input
                            id="scripture_ref"
                            placeholder="e.g., 1 Corinthians 12:26"
                            value={siteSettings.scripture_reference}
                            onChange={(e) =>
                              setSiteSettings({ ...siteSettings, scripture_reference: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="scripture_text">Scripture Text</Label>
                          <Textarea
                            id="scripture_text"
                            value={siteSettings.scripture_text}
                            onChange={(e) =>
                              setSiteSettings({ ...siteSettings, scripture_text: e.target.value })
                            }
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="pt-4 border-t border-border">
                        <Button
                          variant="hero"
                          onClick={handleSaveSettings}
                          disabled={savingSettings}
                        >
                          {savingSettings ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Settings
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* User Role Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>
              {selectedUser?.first_name || selectedUser?.last_name
                ? `${selectedUser?.first_name || ""} ${selectedUser?.last_name || ""}`.trim()
                : selectedUser?.email || "User"}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedUser.email || "No email"}</span>
                </div>
                {selectedUser.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedUser.phone}</span>
                  </div>
                )}
                {selectedUser.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedUser.address}</span>
                  </div>
                )}
              </div>

              {/* Approval Status */}
              <div className="space-y-2">
                <Label>Member Status</Label>
                <div className="flex items-center gap-3">
                  {selectedUser.is_approved ? (
                    <>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Approved
                      </Badge>
                      {selectedUser.approved_at && (
                        <span className="text-xs text-muted-foreground">
                          on {new Date(selectedUser.approved_at).toLocaleDateString()}
                        </span>
                      )}
                    </>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Approval
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>User Role</Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 w-full sm:w-auto">
              {!selectedUser?.is_approved ? (
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                  onClick={() => selectedUser && handleApproveUser(selectedUser.user_id)}
                  disabled={approvingUser}
                >
                  {approvingUser ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserCheck className="w-4 h-4 mr-2" />
                  )}
                  Approve Member
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 flex-1 sm:flex-none"
                  onClick={() => selectedUser && handleRevokeApproval(selectedUser.user_id)}
                  disabled={approvingUser}
                >
                  {approvingUser ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserX className="w-4 h-4 mr-2" />
                  )}
                  Revoke Approval
                </Button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setShowUserDialog(false)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={() => selectedUser && handleUpdateUserRole(selectedUser.user_id, selectedUser.role)}
                disabled={updatingRole}
                className="flex-1 sm:flex-none"
              >
                {updatingRole ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Role
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Aid Request Review Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">{selectedRequest?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              Submitted by {selectedRequest?.contact_name} • {selectedRequest?.contact_email}
              {selectedRequest?.contact_phone && ` • ${selectedRequest.contact_phone}`}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Status and Urgency */}
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedRequest.status)}
                {getUrgencyBadge(selectedRequest.urgency)}
                <Badge variant="outline">{selectedRequest.category}</Badge>
                {selectedRequest.location && (
                  <span className="text-sm text-muted-foreground">📍 {selectedRequest.location}</span>
                )}
              </div>

              {/* Amount */}
              <div className="bg-primary/5 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Amount Requested</p>
                <p className="text-3xl font-bold text-primary">₦{Number(selectedRequest.goal_amount).toLocaleString()}</p>
              </div>

              {/* Photos */}
              {selectedRequest.image_urls && selectedRequest.image_urls.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Photographs</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedRequest.image_urls.map((url, index) => (
                      <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={url}
                          alt={`Photo ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Full Description</h3>
                <div className="bg-secondary/30 rounded-xl p-4 whitespace-pre-wrap text-sm">
                  {selectedRequest.description}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Admin Notes</h3>
                <Textarea
                  placeholder="Add notes about this request (required for rejection)..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  disabled={selectedRequest.status !== "pending"}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Close
            </Button>
            {selectedRequest?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleRejectRequest}
                  disabled={processingRequest}
                >
                  {processingRequest ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  variant="hero"
                  onClick={handleApproveRequest}
                  disabled={processingRequest}
                >
                  {processingRequest ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Approve & Create Case
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;