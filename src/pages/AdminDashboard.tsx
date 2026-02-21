import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Users as UsersIcon } from "lucide-react";
import SiteSettingsEditor from "@/components/admin/SiteSettingsEditor";
import HeroSectionEditor from "@/components/admin/HeroSectionEditor";
import ContentManagement from "@/components/admin/ContentManagement";
import MessagesManager from "@/components/admin/MessagesManager";
import AidRequestsManager from "@/components/admin/AidRequestsManager";

interface DashboardStats {
  totalDonations: number;
  activeVolunteers: number;
  unreadMessages: number;
  donationChange: number;
  totalCases: number;
  activeCases: number;
  pendingRequests: number;
}

interface RecentActivity {
  type: string;
  icon: string;
  color: string;
  title: string;
  description: string;
  time: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  role: string;
  is_approved: boolean;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "messages" | "aid-requests" | "site-update" | "content">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0,
    activeVolunteers: 0,
    unreadMessages: 0,
    donationChange: 0,
    totalCases: 0,
    activeCases: 0,
    pendingRequests: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const checkAdminAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }

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

    await fetchDashboardStats();
    await fetchRecentActivity();
    setLoading(false);
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch verified donations
      const { data: donations } = await supabase
        .from("donations")
        .select("amount, created_at")
        .in("status", ["completed", "success"]);

      const totalDonations = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      // Calculate donation change (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentDonations = donations?.filter(d => new Date(d.created_at) >= thirtyDaysAgo) || [];
      const previousDonations = donations?.filter(d => {
        const date = new Date(d.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }) || [];

      const recentTotal = recentDonations.reduce((sum, d) => sum + Number(d.amount), 0);
      const previousTotal = previousDonations.reduce((sum, d) => sum + Number(d.amount), 0);
      const donationChange = previousTotal > 0 ? Math.round(((recentTotal - previousTotal) / previousTotal) * 100) : 0;

      // Fetch volunteers (users with role 'user')
      const { count: volunteerCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "user")
        .eq("is_approved", true);

      // Fetch unread messages
      const { count: unreadCount } = await supabase
        .from("contact_submissions")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      // Fetch cases
      const { data: cases } = await supabase
        .from("aid_requests")
        .select("status");

      const totalCases = cases?.length || 0;
      const activeCases = cases?.filter(c => c.status === "active").length || 0;

      // Fetch pending aid requests
      const { count: pendingCount } = await supabase
        .from("aid_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setStats({
        totalDonations,
        activeVolunteers: volunteerCount || 0,
        unreadMessages: unreadCount || 0,
        donationChange,
        totalCases,
        activeCases,
        pendingRequests: pendingCount || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Fetch recent donations
      const { data: donations } = await supabase
        .from("donations")
        .select("donor_name, amount, created_at")
        .in("status", ["completed", "success"])
        .order("created_at", { ascending: false })
        .limit(2);

      donations?.forEach(d => {
        activities.push({
          type: "donation",
          icon: "payments",
          color: "green",
          title: "New donation received",
          description: `₦${Number(d.amount).toLocaleString()} from ${d.donor_name || 'Anonymous'}`,
          time: formatTimeAgo(d.created_at),
        });
      });

      // Fetch recent aid requests
      const { data: requests } = await supabase
        .from("aid_requests")
        .select("contact_name, category, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      requests?.forEach(r => {
        activities.push({
          type: "request",
          icon: "person_add",
          color: "primary",
          title: "New aid request",
          description: `${r.contact_name} (${r.category})`,
          time: formatTimeAgo(r.created_at),
        });
      });

      // Fetch recent messages
      const { data: messages } = await supabase
        .from("contact_submissions")
        .select("name, subject, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      messages?.forEach(m => {
        activities.push({
          type: "message",
          icon: "email",
          color: "primary",
          title: "New message received",
          description: `From ${m.name} - "${m.subject || 'General Inquiry'}"`,
          time: formatTimeAgo(m.created_at),
        });
      });

      // Sort by time
      activities.sort((a, b) => {
        const timeA = parseTimeAgo(a.time);
        const timeB = parseTimeAgo(b.time);
        return timeA - timeB;
      });

      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const parseTimeAgo = (timeStr: string): number => {
    if (timeStr === "Just now") return 0;
    const match = timeStr.match(/(\d+)\s+(mins?|hours?|days?)/);
    if (!match) return 999999;
    const value = parseInt(match[1]);
    const unit = match[2];
    if (unit.startsWith("min")) return value;
    if (unit.startsWith("hour")) return value * 60;
    if (unit.startsWith("day")) return value * 1440;
    return 999999;
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for all users
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Create a map of user_id to role
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      // Combine profiles with roles
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        role: roleMap.get(profile.user_id) || "user"
      })) || [];

      setUsers(usersWithRoles as UserProfile[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-background-dark border-r border-primary/10 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-icons text-white text-lg">volunteer_activism</span>
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">NGO Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === "dashboard"
              ? "bg-primary/10 text-primary"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
          >
            <span className="material-icons text-xl">dashboard</span>
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === "users"
              ? "bg-primary/10 text-primary font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
          >
            <span className="material-icons text-xl">people</span>
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === "messages"
              ? "bg-primary/10 text-primary font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
          >
            <span className="material-icons text-xl">forum</span>
            <span>Messages</span>
            {stats.unreadMessages > 0 && (
              <span className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{stats.unreadMessages}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("aid-requests")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === "aid-requests"
              ? "bg-primary/10 text-primary font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
          >
            <span className="material-icons text-xl">help_outline</span>
            <span>Aid Requests</span>
            {stats.pendingRequests > 0 && (
              <span className="ml-auto bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{stats.pendingRequests}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("site-update")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === "site-update"
              ? "bg-primary/10 text-primary font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
          >
            <span className="material-icons text-xl">edit_note</span>
            <span>Site Update</span>
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === "content"
              ? "bg-primary/10 text-primary font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
          >
            <span className="material-icons text-xl">article</span>
            <span>Content</span>
          </button>
        </nav>
        <div className="p-4 border-t border-primary/10">
          <div className="bg-primary/5 rounded-xl p-4 mb-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">All systems online</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/5 sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="relative w-96">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
              placeholder="Search for donations, users, cases..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-primary transition-colors">
              <span className="material-icons">notifications</span>
              {(stats.unreadMessages > 0 || stats.pendingRequests > 0) && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
              )}
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">Admin User</p>
                <p className="text-xs text-slate-500 mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
                <p className="text-slate-500 text-sm mt-1">Welcome back. Here's what's happening with your NGO today.</p>
              </div>

              {/* Primary Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Donations */}
                <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-primary/5 shadow-sm hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                      <span className="material-icons text-white">payments</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stats.donationChange >= 0 ? 'text-green-600 bg-green-50 dark:bg-green-500/10' : 'text-red-600 bg-red-50 dark:bg-red-500/10'}`}>
                      {stats.donationChange >= 0 ? '+' : ''}{stats.donationChange}%
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Donations</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    ₦{stats.totalDonations.toLocaleString()}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">vs last 30 days</p>
                </div>

                {/* Active Volunteers */}
                <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-primary/5 shadow-sm hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                      <span className="material-icons text-white">groups</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">Active</span>
                  </div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Volunteers</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeVolunteers}</h3>
                  <p className="text-xs text-slate-400 mt-2">Approved users</p>
                </div>

                {/* Unread Messages */}
                <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-primary/5 shadow-sm hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                      <span className="material-icons text-white">email</span>
                    </div>
                    {stats.unreadMessages > 0 && (
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Unread Messages</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.unreadMessages}</h3>
                  <p className="text-xs text-slate-400 mt-2">Needs attention</p>
                </div>

                {/* Active Cases */}
                <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-primary/5 shadow-sm hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                      <span className="material-icons text-white">favorite</span>
                    </div>
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-lg">
                      {stats.activeCases}/{stats.totalCases}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Active Cases</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeCases}</h3>
                  <p className="text-xs text-slate-400 mt-2">Currently fundraising</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => setActiveTab("users")}
                  className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-between group cursor-pointer w-full"
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold opacity-90">Manage Users</p>
                    <p className="text-2xl font-bold mt-1">{stats.activeVolunteers} Users</p>
                  </div>
                  <span className="material-icons text-4xl opacity-20 group-hover:opacity-30 transition-opacity">people</span>
                </button>
                <button
                  onClick={() => setActiveTab("messages")}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-between group cursor-pointer w-full"
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold opacity-90">Check Messages</p>
                    <p className="text-2xl font-bold mt-1">{stats.unreadMessages} Unread</p>
                  </div>
                  <span className="material-icons text-4xl opacity-20 group-hover:opacity-30 transition-opacity">forum</span>
                </button>
                <button
                  onClick={() => setActiveTab("site-update")}
                  className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg shadow-green-500/20 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-between group cursor-pointer w-full"
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold opacity-90">Update Site</p>
                    <p className="text-2xl font-bold mt-1">Manage Content</p>
                  </div>
                  <span className="material-icons text-4xl opacity-20 group-hover:opacity-30 transition-opacity">edit_note</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Donation Trends Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-background-dark p-8 rounded-2xl border border-primary/5 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">Donation Trends</h4>
                      <p className="text-xs text-slate-500 mt-1">Monthly breakdown of contributions</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-100 transition-colors">
                        <span className="material-icons text-sm mr-1 align-middle">download</span>
                        Export
                      </button>
                      <select className="px-4 py-1.5 text-xs font-semibold bg-primary/5 text-primary border-none rounded-lg focus:ring-0 cursor-pointer">
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                      </select>
                    </div>
                  </div>
                  {/* Chart Visualization */}
                  <div className="relative h-64 w-full">
                    <div className="absolute inset-0 flex items-end justify-between gap-2 px-4 pb-2">
                      <div className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t-lg h-[40%] hover:h-[45%] transition-all cursor-pointer"></div>
                      <div className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t-lg h-[60%] hover:h-[65%] transition-all cursor-pointer"></div>
                      <div className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t-lg h-[45%] hover:h-[50%] transition-all cursor-pointer"></div>
                      <div className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t-lg h-[80%] hover:h-[85%] transition-all cursor-pointer"></div>
                      <div className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t-lg h-[70%] hover:h-[75%] transition-all cursor-pointer"></div>
                      <div className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t-lg h-[95%] hover:h-[100%] transition-all cursor-pointer shadow-lg shadow-primary/30"></div>
                    </div>
                    {/* X Axis labels */}
                    <div className="absolute -bottom-6 w-full flex justify-between px-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                    </div>
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between -z-10 opacity-10">
                      <div className="w-full h-px bg-slate-300 dark:bg-slate-700"></div>
                      <div className="w-full h-px bg-slate-300 dark:bg-slate-700"></div>
                      <div className="w-full h-px bg-slate-300 dark:bg-slate-700"></div>
                      <div className="w-full h-px bg-slate-300 dark:bg-slate-700"></div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-background-dark p-8 rounded-2xl border border-primary/5 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h4>
                    <button
                      onClick={() => navigate("/admin")}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-6">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <div key={index} className="flex gap-4">
                          <div className={`w-10 h-10 ${activity.color === 'green' ? 'bg-green-50 dark:bg-green-500/10' : 'bg-primary/10'} rounded-full flex items-center justify-center shrink-0`}>
                            <span className={`material-icons ${activity.color === 'green' ? 'text-green-500' : 'text-primary'} text-lg`}>{activity.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{activity.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{activity.description}</p>
                            <span className="text-[10px] text-slate-400 font-medium">{activity.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <span className="material-icons text-slate-300 dark:text-slate-700 text-4xl mb-2">history</span>
                        <p className="text-sm text-slate-500">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="mt-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 flex items-center justify-between border border-primary/10">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center">
                    <span className="material-icons text-primary text-3xl">help_outline</span>
                  </div>
                  <div>
                    <h5 className="text-lg font-bold text-slate-900 dark:text-white">Need help with the platform?</h5>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Our technical support team is available 24/7 for NGO staff.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Documentation
                  </button>
                  <button className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Contact Support
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h2>
                <p className="text-slate-500 text-sm mt-1">Manage organization members, roles, and access levels.</p>
              </div>

              {/* Search and Add User */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1">
                  <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                    placeholder="Search by name or email..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => toast({ title: "Feature Coming Soon", description: "Add new user functionality will be available soon." })}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm shadow-primary/20"
                >
                  <span className="material-icons-outlined text-lg">person_add</span>
                  Add New User
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-primary text-white">
                  All Users ({users.length})
                </button>
                <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50 transition-colors">
                  Volunteers ({users.filter(u => u.role === "user").length})
                </button>
                <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50 transition-colors">
                  Admins ({users.filter(u => u.role === "admin").length})
                </button>
                <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50 transition-colors">
                  Pending ({users.filter(u => !u.is_approved).length})
                </button>
              </div>

              {/* Table Container */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Name</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Role</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Join Date</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users
                      .filter(user => {
                        const searchLower = searchQuery.toLowerCase();
                        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
                        const email = (user.email || "").toLowerCase();
                        return fullName.includes(searchLower) || email.includes(searchLower);
                      })
                      .slice(0, 10)
                      .map((user) => {
                        const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U";
                        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";

                        return (
                          <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{fullName}</p>
                                  <p className="text-xs text-slate-500">{user.email || "No email"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                                {user.role === "user" ? "Volunteer" : user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {user.is_approved ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {new Date(user.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => toast({ title: "User Details", description: `Viewing details for ${fullName}` })}
                                className="text-primary hover:bg-primary/5 px-3 py-1.5 rounded text-sm font-semibold transition-colors inline-flex items-center gap-1"
                              >
                                Manage
                                <span className="material-icons-outlined text-sm">expand_more</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                          <p className="text-muted-foreground">No users found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {users.length > 10 && (
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Showing <span className="font-bold">1 to 10</span> of <span className="font-bold">{users.length}</span> users
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary transition-colors disabled:opacity-50" disabled>
                        <span className="material-icons-outlined text-lg">chevron_left</span>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">1</button>
                      <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary/50 transition-colors">
                        <span className="material-icons-outlined text-lg">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Help Footer */}
              <div className="mt-8 flex items-center justify-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <button onClick={() => toast({ title: "Feature Coming Soon", description: "Bulk import functionality will be available soon." })} className="hover:text-primary transition-colors cursor-pointer">
                  Bulk Import Users
                </button>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <button onClick={() => toast({ title: "Feature Coming Soon", description: "Export functionality will be available soon." })} className="hover:text-primary transition-colors cursor-pointer">
                  Export to CSV
                </button>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <button onClick={() => toast({ title: "Permissions Guide", description: "Admin: Full access. User: Basic access." })} className="hover:text-primary transition-colors cursor-pointer">
                  Permissions Guide
                </button>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <MessagesManager />
          )}

          {/* Aid Requests Tab */}
          {activeTab === "aid-requests" && (
            <AidRequestsManager />
          )}

          {/* Site Update Tab */}
          {activeTab === "site-update" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Site Content Updates</h2>
                  <p className="text-slate-500 text-sm mt-1">Manage your website content and settings - changes save to database</p>
                </div>
                <button
                  onClick={() => window.open("/", "_blank")}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <span className="material-icons-outlined text-sm">visibility</span>
                  View Live Site
                </button>
              </div>

              {/* Functional Editors */}
              <div className="space-y-6">
                <SiteSettingsEditor />
                <HeroSectionEditor />
              </div>
            </div>
          )}

          {/* Content Management Tab */}
          {activeTab === "content" && (
            <ContentManagement />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
