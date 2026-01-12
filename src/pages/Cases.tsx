import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CaseCard from "@/components/CaseCard";
import { supabase } from "@/integrations/supabase/client";

const categories = ["All", "Education", "Healthcare", "Emergency", "Community", "General"];

const Cases = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: cases = [], isLoading, error } = useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("causes")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredCases = cases.filter((caseItem) => {
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

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Explore <span className="text-gradient-primary">Cases</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover meaningful campaigns and find the perfect case to support.
              Every contribution makes a lasting impact.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-2xl p-6 shadow-card mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "hero" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category)}
                    className="shrink-0"
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
          {error && (
            <div className="text-center py-16">
              <p className="text-xl text-destructive mb-4">Failed to load cases</p>
              <p className="text-muted-foreground">Please try again later</p>
            </div>
          )}

          {/* Cases Grid */}
          {!isLoading && !error && filteredCases.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCases.map((caseItem) => (
                <CaseCard
                  key={caseItem.id}
                  id={caseItem.id}
                  title={caseItem.title}
                  description={caseItem.description || ""}
                  image={caseItem.image_url || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format&fit=crop"}
                  raised={Number(caseItem.raised_amount)}
                  goal={Number(caseItem.goal_amount)}
                  category={caseItem.category}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredCases.length === 0 && (
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
