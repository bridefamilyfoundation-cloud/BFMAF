import { useState, useEffect } from "react";
import { ArrowRight, Heart, Users, Globe, TrendingUp, Shield, Sparkles, HandHeart, Phone, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCounter from "@/components/StatCounter";
import CaseCard from "@/components/CaseCard";
import { supabase } from "@/integrations/supabase/client";

interface Cause {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  raised_amount: number;
  goal_amount: number;
  category: string;
}

interface SiteStats {
  totalRaised: number;
  totalDonors: number;
  casesHelped: number;
  fundsToProgram: number;
}

const Index = () => {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [stats, setStats] = useState<SiteStats>({
    totalRaised: 0,
    totalDonors: 0,
    casesHelped: 0,
    fundsToProgram: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch featured causes (limit to 3)
      const { data: causesData, error: causesError } = await supabase
        .from("causes")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (causesError) throw causesError;
      setCauses(causesData || []);

      // Fetch total raised and donor count from donations
      const { data: donationsData, error: donationsError } = await supabase
        .from("donations")
        .select("amount, user_id, donor_email");

      if (!donationsError && donationsData) {
        const totalRaised = donationsData.reduce((sum, d) => sum + Number(d.amount), 0);
        // Count unique donors (by user_id or donor_email)
        const uniqueDonors = new Set(
          donationsData.map(d => d.user_id || d.donor_email).filter(Boolean)
        );
        setStats(prev => ({
          ...prev,
          totalRaised,
          totalDonors: uniqueDonors.size,
        }));
      }

      // Count total cases helped
      const { count: casesCount } = await supabase
        .from("causes")
        .select("*", { count: "exact", head: true });

      if (casesCount) {
        setStats(prev => ({ ...prev, casesHelped: casesCount }));
      }

      // Fetch site settings for additional stats
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("key, value");

      if (settingsData) {
        settingsData.forEach(setting => {
          if (setting.key === "funds_to_program" && setting.value) {
            setStats(prev => ({ ...prev, fundsToProgram: Number(setting.value) }));
          }
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                1 Corinthians 12:26
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 animate-slide-up">
              Bride Family{" "}
              <span className="text-gradient-primary">Medical Aid</span>{" "}
              Foundation
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto animate-slide-up delay-100 italic">
              "And whether one member suffer, all the members suffer with it, or one member be honored, all the members rejoice with it."
            </p>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up delay-100">
              A platform borne out of compassion to reach out to severely traumatized believers 
              in despair due to overwhelming medical conditions beyond the local church to handle.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
              <Link to="/get-help">
                <Button variant="hero" size="xl">
                  <HandHeart className="w-5 h-5" />
                  Request Assistance
                </Button>
              </Link>
              <Link to="/cases">
                <Button variant="outline" size="xl">
                  View Cases
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCounter
              end={stats.totalRaised}
              prefix="₦"
              suffix="+"
              label="Funds Raised"
              icon={<TrendingUp className="w-6 h-6 text-primary-foreground" />}
            />
            <StatCounter
              end={stats.totalDonors}
              suffix="+"
              label="Donors"
              icon={<Users className="w-6 h-6 text-primary-foreground" />}
            />
            <StatCounter
              end={stats.casesHelped}
              suffix="+"
              label="Cases Helped"
              icon={<Heart className="w-6 h-6 text-primary-foreground" />}
            />
            <StatCounter
              end={stats.fundsToProgram}
              suffix="%"
              label="Funds to Cases"
              icon={<Shield className="w-6 h-6 text-primary-foreground" />}
            />
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-20 px-4 relative z-10 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              How We <span className="text-gradient-primary">Help</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The Bride of Christ as a Family reaches out for assistance in the following ways:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "Prayers", description: "Interceding for our brothers and sisters in their time of need" },
              { icon: Users, title: "Visits", description: "Where and when possible, we visit to show love and support" },
              { icon: Phone, title: "Calls", description: "Reaching out to admonish and encourage during difficult times" },
              { icon: Heart, title: "Financial & Medical Aid", description: "Providing tangible assistance for medical expenses" },
            ].map((item, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cases */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Current <span className="text-gradient-primary">Cases</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These are believers who need our support. Every donation, no matter 
              the size, brings us closer to helping them.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading cases...</p>
            </div>
          ) : causes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {causes.map((cause) => (
                <CaseCard
                  key={cause.id}
                  id={cause.id}
                  title={cause.title}
                  description={cause.description || ""}
                  image={cause.image_url || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format&fit=crop"}
                  raised={Number(cause.raised_amount)}
                  goal={Number(cause.goal_amount)}
                  category={cause.category}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active cases at the moment.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/cases">
              <Button variant="outline" size="lg">
                View All Cases
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="bg-gradient-hero rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySC0ydi0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            
            <div className="relative z-10">
              <HandHeart className="w-16 h-16 text-primary-foreground/80 mx-auto mb-6 animate-pulse" />
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-foreground mb-6">
                Need Medical Assistance?
              </h2>
              <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
                If you or someone you know is facing overwhelming medical conditions, 
                the Bride of Christ family is here to help. Submit your request today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/get-help">
                  <Button variant="accent" size="xl">
                    <HandHeart className="w-5 h-5" />
                    Request Help
                  </Button>
                </Link>
                <Link to="/donate">
                  <Button variant="outline" size="xl" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Heart className="w-5 h-5" />
                    Donate Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Need Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              What to <span className="text-gradient-primary">Submit</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Individuals that need assistance should submit the following:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Photographs",
                description: "Clear photographs of the patient and their current condition.",
              },
              {
                step: "02",
                title: "Medical History",
                description: "Complete medical history from onset to the current status of the condition.",
              },
              {
                step: "03",
                title: "Financial Implication",
                description: "Detailed breakdown of the financial implications of the medical management.",
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative group"
              >
                <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 h-full">
                  <span className="text-6xl font-serif font-bold text-primary/10 group-hover:text-primary/20 transition-colors duration-300">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-serif font-semibold text-foreground mt-4 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/get-help">
              <Button variant="hero" size="lg">
                <HandHeart className="w-5 h-5" />
                Submit Your Request
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;