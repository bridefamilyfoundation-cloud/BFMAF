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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
    setLoading(false);
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
        value: `$${totalDonations.toLocaleString()}`,
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
        title: "Active Campaigns",
        value: activeCampaigns.toString(),
        change: `+${activeCampaigns}`,
        trend: "up",
        icon: Heart,
        color: "success",
      },
      {
        title: "Avg. Donation",
        value: `$${avgDonation}`,
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

  const filteredDonations = recentDonations.filter(
    (d) =>
      d.donor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.campaign.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  { id: "donations", icon: DollarSign, label: "Donations" },
                  { id: "campaigns", icon: Heart, label: "Campaigns" },
                  { id: "users", icon: Users, label: "Users" },
                  { id: "settings", icon: Settings, label: "Settings" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card rounded-2xl p-6 shadow-card">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-foreground">Dashboard</h1>
                  <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                      3
                    </span>
                  </Button>
                  <Button variant="hero">
                    <Plus className="w-4 h-4" />
                    New Campaign
                  </Button>
                </div>
              </div>

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
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Campaign</th>
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
                              <td className="py-4 px-2 font-semibold text-primary">${donation.amount}</td>
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

                {/* Campaign Progress */}
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-serif font-semibold text-foreground">Campaigns</h2>
                    <Button variant="ghost" size="sm">
                      View All
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {campaigns.length > 0 ? (
                      campaigns.map((campaign) => {
                        const progress = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;
                        return (
                          <div key={campaign.id} className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-foreground text-sm line-clamp-1">{campaign.name}</p>
                                <p className="text-xs text-muted-foreground">{campaign.donors} donors</p>
                              </div>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-medium",
                                  campaign.status === "active"
                                    ? "bg-success/10 text-success"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {campaign.status}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="flex justify-between text-xs">
                              <span className="text-primary font-medium">${campaign.raised.toLocaleString()}</span>
                              <span className="text-muted-foreground">${campaign.goal.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No campaigns yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;