import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Loader2, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CaseCard from "@/components/CaseCard";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

const categories = ["All", "General", "Surgery", "Chronic Illness", "Emergency", "Medication", "Treatment"];

interface CaseItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  raised_amount: number;
  goal_amount: number;
  category: string;
  source: "cause" | "aid_request";
}

const Cases = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch active causes
  const { data: causes = [], isLoading: causesLoading } = useQuery({
    queryKey: ["causes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("causes")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((c): CaseItem => ({
        id: c.id,
        title: c.title,
        description: c.description,
        image_url: c.image_url,
        raised_amount: Number(c.raised_amount),
        goal_amount: Number(c.goal_amount),
        category: c.category,
        source: "cause",
      }));
    },
  });

  // Fetch approved aid requests that haven't been converted to causes yet
  const { data: aidRequests = [], isLoading: aidLoading } = useQuery({
    queryKey: ["approved-aid-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aid_requests")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((r): CaseItem => ({
        id: r.id,
        title: r.title,
        description: r.description,
        image_url: r.image_urls?.[0] || null,
        raised_amount: 0,
        goal_amount: Number(r.goal_amount),
        category: r.category,
        source: "aid_request",
      }));
    },
  });

  const isLoading = causesLoading || aidLoading;
  
  // Combine and filter cases
  const allCases = [...causes, ...aidRequests];
  
  const filteredCases = allCases.filter((caseItem) => {
    const matchesSearch =
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (caseItem.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = activeCategory === "All" || caseItem.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingBackground />
      <Navbar />

      {/* Hero Section with Background */}
      <section 
        className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 px-4"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
        <div className="container mx-auto relative z-10">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-3 sm:mb-4">
              Explore <span className="text-gradient-primary">Cases</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 px-2">
              Discover meaningful campaigns and find the perfect case to support.
              Every contribution makes a lasting impact.
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/get-help")}
              className="gap-2"
            >
              <HandHeart className="w-5 h-5" />
              Get Help
            </Button>
          </div>
        </div>
      </section>

      <div className="pb-16 sm:pb-20 px-4">
        <div className="container mx-auto">
          {/* Filters */}
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-card mb-6 sm:mb-8">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-11 sm:h-12"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "hero" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category)}
                    className="shrink-0 text-xs sm:text-sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredCases.length}</span> cases
            </p>
            <Button variant="ghost" size="sm">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Sort
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {!isLoading && allCases.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-4">No cases available</p>
              <p className="text-muted-foreground">Check back later for new cases</p>
            </div>
          )}

          {/* Cases Grid */}
          {!isLoading && filteredCases.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredCases.map((caseItem) => (
                <CaseCard
                  key={`${caseItem.source}-${caseItem.id}`}
                  id={caseItem.id}
                  title={caseItem.title}
                  description={caseItem.description || ""}
                  image={caseItem.image_url || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format&fit=crop"}
                  raised={caseItem.raised_amount}
                  goal={caseItem.goal_amount}
                  category={caseItem.category}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && allCases.length > 0 && filteredCases.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-4">No cases found</p>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cases;
