import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Heart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Calendar,
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

const statsCards = [
  {
    title: "Total Donations",
    value: "$2,548,320",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "primary",
  },
  {
    title: "Active Donors",
    value: "15,234",
    change: "+8.2%",
    trend: "up",
    icon: Users,
    color: "accent",
  },
  {
    title: "Active Campaigns",
    value: "48",
    change: "+3",
    trend: "up",
    icon: Heart,
    color: "success",
  },
  {
    title: "Avg. Donation",
    value: "$167",
    change: "-2.1%",
    trend: "down",
    icon: TrendingUp,
    color: "warm",
  },
];

const recentDonations = [
  { id: 1, donor: "Sarah Johnson", email: "sarah@example.com", amount: 500, campaign: "Education Fund", date: "2 min ago", avatar: "SJ" },
  { id: 2, donor: "Michael Chen", email: "michael@example.com", amount: 250, campaign: "Clean Water", date: "15 min ago", avatar: "MC" },
  { id: 3, donor: "Emily Davis", email: "emily@example.com", amount: 100, campaign: "Emergency Relief", date: "1 hour ago", avatar: "ED" },
  { id: 4, donor: "James Wilson", email: "james@example.com", amount: 1000, campaign: "Healthcare Access", date: "2 hours ago", avatar: "JW" },
  { id: 5, donor: "Anna Brown", email: "anna@example.com", amount: 75, campaign: "Education Fund", date: "3 hours ago", avatar: "AB" },
];

const campaigns = [
  { id: 1, name: "Education for Rural Children", raised: 45000, goal: 75000, donors: 342, status: "active" },
  { id: 2, name: "Clean Water Initiative", raised: 28000, goal: 50000, donors: 187, status: "active" },
  { id: 3, name: "Emergency Relief Fund", raised: 62000, goal: 100000, donors: 512, status: "active" },
  { id: 4, name: "Healthcare Access Program", raised: 35000, goal: 35000, donors: 298, status: "completed" },
];

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

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
                        <Input placeholder="Search..." className="pl-9 w-48" />
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
                        {recentDonations.map((donation) => (
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
                        ))}
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
                    {campaigns.map((campaign) => {
                      const progress = (campaign.raised / campaign.goal) * 100;
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
                    })}
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
