import { useState, useEffect } from "react";
import { Calendar, Heart, User, Filter, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingBackground from "@/components/FloatingBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  id: string;
  action: string;
  details: unknown;
  created_at: string;
  user_id: string | null;
}

const Activity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "donation":
        return <Heart className="h-5 w-5 text-primary" />;
      case "profile_update":
        return <User className="h-5 w-5 text-accent" />;
      default:
        return <Calendar className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "donation":
        return "bg-primary/10 text-primary";
      case "profile_update":
        return "bg-accent/10 text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
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

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.action
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "all" || activity.action.toLowerCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  // Mock data for demo
  const mockActivities = [
    {
      id: "1",
      action: "donation",
      details: { amount: 100, cause: "Education Fund" },
      created_at: new Date().toISOString(),
      user_id: "user1",
    },
    {
      id: "2",
      action: "profile_update",
      details: { field: "avatar" },
      created_at: new Date(Date.now() - 86400000).toISOString(),
      user_id: "user1",
    },
    {
      id: "3",
      action: "donation",
      details: { amount: 50, cause: "Healthcare Initiative" },
      created_at: new Date(Date.now() - 172800000).toISOString(),
      user_id: "user1",
    },
    {
      id: "4",
      action: "login",
      details: null,
      created_at: new Date(Date.now() - 259200000).toISOString(),
      user_id: "user1",
    },
  ];

  const displayActivities =
    activities.length > 0 ? filteredActivities : mockActivities;

  return (
    <div className="min-h-screen bg-background">
      <FloatingBackground />
      <Navbar />

      <main className="relative z-10">
        {/* Header */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
              Your <span className="text-gradient-primary">Activity</span>
            </h1>
            <p className="text-lg text-muted-foreground text-center mb-8">
              Track your donations, profile updates, and engagement history.
            </p>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["all", "donation", "profile_update"].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className={filterType === type ? "bg-primary" : ""}
                  >
                    {type === "all"
                      ? "All"
                      : type === "donation"
                      ? "Donations"
                      : "Profile"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Activity List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading activities...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-card p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getActionColor(activity.action)}>
                          {activity.action.replace("_", " ")}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(activity.created_at)}
                        </span>
                      </div>
                      {activity.details && typeof activity.details === "object" && (
                        <p className="text-foreground">
                          {activity.action === "donation" ? (
                            <>
                              Donated{" "}
                              <span className="font-semibold text-primary">
                                ${String((activity.details as Record<string, unknown>).amount)}
                              </span>{" "}
                              to{" "}
                              <span className="font-medium">
                                {(activity.details as Record<string, unknown>).cause as string}
                              </span>
                            </>
                          ) : activity.action === "profile_update" ? (
                            <>
                              Updated{" "}
                              <span className="font-medium">
                                {(activity.details as Record<string, unknown>).field as string}
                              </span>
                            </>
                          ) : (
                            JSON.stringify(activity.details)
                          )}
                        </p>
                      )}
                      {!activity.details && (
                        <p className="text-muted-foreground">
                          Activity recorded
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {displayActivities.length === 0 && (
                  <div className="text-center py-12 bg-card rounded-xl">
                    <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Activities Found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery || filterType !== "all"
                        ? "Try adjusting your search or filters."
                        : "Your activity history will appear here."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Activity;
