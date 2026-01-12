import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, Users, Calendar, Target, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: caseData, isLoading, error } = useQuery({
    queryKey: ["case", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("causes")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch donor count for this case
  const { data: donorCount = 0 } = useQuery({
    queryKey: ["case-donors", id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("donations")
        .select("*", { count: "exact", head: true })
        .eq("cause_id", id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative">
        <FloatingBackground />
        <Navbar />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-background relative">
        <FloatingBackground />
        <Navbar />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Case Not Found</h1>
            <p className="text-muted-foreground mb-8">The case you're looking for doesn't exist.</p>
            <Link to="/cases">
              <Button variant="hero">
                <ArrowLeft className="w-4 h-4" />
                Back to Cases
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const raised = Number(caseData.raised_amount);
  const goal = Number(caseData.goal_amount);
  const progress = goal > 0 ? (raised / goal) * 100 : 0;

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingBackground />
      <Navbar />

      <div className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4">
        <div className="container mx-auto">
          {/* Back Button */}
          <Link
            to="/cases"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 sm:mb-8 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cases
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Hero Image */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden">
                <img
                  src={caseData.image_url || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format&fit=crop"}
                  alt={caseData.title}
                  className="w-full h-[250px] sm:h-[350px] lg:h-[400px] object-cover"
                />
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                  <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold rounded-full backdrop-blur-sm">
                    {caseData.category}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 sm:mb-4">
                  {caseData.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {donorCount} donors
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Started {new Date(caseData.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-card">
                <h2 className="text-lg sm:text-xl font-serif font-semibold text-foreground mb-3 sm:mb-4">About This Case</h2>
                <div className="prose prose-muted max-w-none">
                  {caseData.description ? (
                    caseData.description.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="text-muted-foreground mb-3 sm:mb-4 whitespace-pre-line text-sm sm:text-base">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm sm:text-base">No description available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Donation Card */}
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card lg:sticky lg:top-28">
                <div className="mb-4 sm:mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl sm:text-3xl font-bold text-primary">₦{raised.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm">of ₦{goal.toLocaleString()}</span>
                  </div>
                  <Progress value={progress} className="h-2.5 sm:h-3 mb-3 sm:mb-4" />
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-foreground">{donorCount}</div>
                      <div className="text-xs text-muted-foreground">Donors</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-foreground">{Math.round(progress)}%</div>
                      <div className="text-xs text-muted-foreground">Funded</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Link to={`/donate?case=${caseData.id}`} className="block">
                    <Button variant="hero" size="lg" className="w-full text-sm sm:text-base">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                      Donate Now
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="w-full text-sm sm:text-base">
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Share This Case
                  </Button>
                </div>
              </div>

              {/* Goal Info */}
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Funding Goal</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">₦{goal.toLocaleString()} needed</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Every donation, no matter the size, brings us closer to our goal and helps transform lives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CaseDetail;
