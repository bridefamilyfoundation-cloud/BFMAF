import { useState } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CauseCard from "@/components/CauseCard";
import { cn } from "@/lib/utils";

const allCauses = [
  {
    id: "1",
    title: "Education for Rural Children",
    description: "Help provide quality education and learning materials to underprivileged children in rural communities.",
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&auto=format&fit=crop",
    raised: 45000,
    goal: 75000,
    category: "Education",
  },
  {
    id: "2",
    title: "Clean Water Initiative",
    description: "Bring clean and safe drinking water to communities facing severe water scarcity.",
    image: "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=800&auto=format&fit=crop",
    raised: 28000,
    goal: 50000,
    category: "Healthcare",
  },
  {
    id: "3",
    title: "Emergency Relief Fund",
    description: "Support families affected by natural disasters with immediate aid and recovery assistance.",
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop",
    raised: 62000,
    goal: 100000,
    category: "Emergency",
  },
  {
    id: "4",
    title: "Healthcare Access Program",
    description: "Provide medical supplies and healthcare access to underserved communities worldwide.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&auto=format&fit=crop",
    raised: 35000,
    goal: 60000,
    category: "Healthcare",
  },
  {
    id: "5",
    title: "Women Empowerment Initiative",
    description: "Support women entrepreneurs with training, resources, and microloans to start businesses.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop",
    raised: 18000,
    goal: 40000,
    category: "Community",
  },
  {
    id: "6",
    title: "Hunger Relief Program",
    description: "Provide nutritious meals to families facing food insecurity and malnutrition.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop",
    raised: 52000,
    goal: 80000,
    category: "Emergency",
  },
];

const categories = ["All", "Education", "Healthcare", "Emergency", "Community"];

const Causes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredCauses = allCauses.filter((cause) => {
    const matchesSearch = cause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cause.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || cause.category === activeCategory;
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
              Explore <span className="text-gradient-primary">Causes</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover meaningful campaigns and find the perfect cause to support. 
              Every contribution makes a lasting impact.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-2xl p-6 shadow-card mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search causes..."
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
              Showing <span className="font-semibold text-foreground">{filteredCauses.length}</span> causes
            </p>
            <Button variant="ghost" size="sm">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Sort
            </Button>
          </div>

          {/* Causes Grid */}
          {filteredCauses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCauses.map((cause) => (
                <CauseCard key={cause.id} {...cause} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-4">No causes found</p>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Causes;
