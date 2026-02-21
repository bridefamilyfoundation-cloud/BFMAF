import { useState, useEffect } from "react";
import { ArrowRight, Heart, Users, Globe, TrendingUp, Shield, Sparkles, HandHeart, Phone, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCounter from "@/components/StatCounter";
import CaseCard from "@/components/CaseCard";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import heroBg from "@/assets/hero-bg.jpg";
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
  const { settings: siteSettings, loading: settingsLoading } = useSiteSettings();
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

      // Fetch total raised and donor count from VERIFIED donations only
      const { data: donationsData, error: donationsError } = await supabase
        .from("donations")
        .select("amount, user_id, donor_email, status")
        .in("status", ["completed", "success"]);

      if (!donationsError && donationsData && donationsData.length > 0) {
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
      } else {
        // No verified donations - set to zero
        setStats(prev => ({
          ...prev,
          totalRaised: 0,
          totalDonors: 0,
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
      <SEO />
      <FloatingBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 overflow-hidden">
        <div className="container mx-auto relative z-10 max-w-7xl">
          <div 
            className="relative min-h-[540px] flex flex-col justify-end overflow-hidden rounded-[2.5rem] p-8 sm:p-12 shadow-2xl"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0) 100%), url(${heroBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute top-8 left-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                <span className="size-2 rounded-full bg-accent animate-pulse"></span>
                Active Relief Program
              </span>
            </div>
            
            <div className="flex flex-col gap-6 max-w-3xl">
              <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Helping Believers <br />
                <span className="text-primary">Overcome</span> <br />
                Medical Crises
              </h1>
              
              <p className="text-white/80 text-lg sm:text-xl font-medium leading-relaxed max-w-[95%]">
                We provide prayer, support, and financial aid to Christians facing overwhelming medical conditions.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 max-w-xl">
                <Link to="/get-help" className="w-full">
                  <Button variant="hero" size="lg" className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/30 active:scale-95 transition-all">
                    <HandHeart className="w-5 h-5" />
                    Request Assistance
                  </Button>
                </Link>
                <Link to="/cases" className="w-full">
                  <Button variant="outline" size="lg" className="w-full h-14 rounded-2xl bg-white text-black text-base font-bold hover:bg-white/90 active:scale-95 transition-all">
                    View Active Cases
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {siteSettings.show_live_stats && (
        <section className="py-16 sm:py-20 px-4 relative z-10">
          <div className="container mx-auto max-w-6xl">
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-[2.5rem] p-10 sm:p-14 border border-gray-200 dark:border-slate-700 shadow-xl">
              <div className="flex flex-col items-center text-center mb-12">
                <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-[0.25em] mb-4">
                  Live Dashboard
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-2">
                  Our Recent Impact
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base">Real-time updates on our mission</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
                {/* Funds Raised */}
                <div className="group">
                  <div className="flex flex-col items-center text-center mb-4">
                    <p className="text-4xl sm:text-5xl font-black text-primary tracking-tight mb-2">
                      ₦{stats.totalRaised.toLocaleString()}+
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Funds Raised
                    </p>
                    <span className="text-xs font-semibold text-foreground px-3 py-1 bg-primary/10 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-[75%] bg-gradient-to-r from-primary to-primary/80 rounded-full progress-bar-glow transition-all duration-500"></div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-2">75% of monthly goal</p>
                </div>

                {/* Donors */}
                <div className="group">
                  <div className="flex flex-col items-center text-center mb-4">
                    <p className="text-4xl sm:text-5xl font-black text-primary tracking-tight mb-2">
                      {stats.totalDonors}+
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Generous Donors
                    </p>
                    <span className="text-xs font-semibold text-foreground px-3 py-1 bg-primary/10 rounded-full">
                      United in Christ
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-gradient-to-r from-primary to-primary/80 rounded-full progress-bar-glow transition-all duration-500"></div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-2">Growing community</p>
                </div>

                {/* Lives Impacted */}
                <div className="group">
                  <div className="flex flex-col items-center text-center mb-4">
                    <p className="text-4xl sm:text-5xl font-black text-accent tracking-tight mb-2">
                      {stats.casesHelped}+
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Lives Impacted
                    </p>
                    <span className="text-xs font-semibold text-accent px-3 py-1 bg-accent/10 rounded-full">
                      {siteSettings.funds_to_program || stats.fundsToProgram}% to Cases
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-[90%] bg-gradient-to-r from-accent to-orange-500 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.4)] transition-all duration-500"></div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-2">Ongoing support</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How We Help Section */}
      <section className="py-12 sm:py-16 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8 sm:mb-10 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Focus Areas
            </h2>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">
              Our Mission
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: BookOpen, title: "Prayers", description: "Interceding for our brothers and sisters in their time of need", color: "bg-blue-50 dark:bg-primary/10 text-primary" },
              { icon: Users, title: "Visits", description: "Where and when possible, we visit to show love and support", color: "bg-green-50 dark:bg-green-500/10 text-green-600" },
              { icon: Phone, title: "Calls", description: "Reaching out to admonish and encourage during difficult times", color: "bg-purple-50 dark:bg-purple-500/10 text-purple-600" },
              { icon: Heart, title: "Financial & Medical Aid", description: "Providing tangible assistance for medical expenses", color: "bg-orange-50 dark:bg-accent/10 text-accent" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className={`size-14 sm:size-16 rounded-2xl ${item.color} flex items-center justify-center mb-3 sm:mb-4`}>
                  <item.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-[10px] sm:text-xs font-extrabold text-center leading-tight uppercase tracking-wide text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-xs text-center line-clamp-2 hidden sm:block">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cases */}
      <section className="py-12 sm:py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-3 sm:mb-4">
              Current <span className="text-gradient-primary">Cases</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
            <div className="text-center py-8 sm:py-12 bg-card rounded-2xl">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <p className="text-muted-foreground">No active cases at the moment.</p>
            </div>
          )}

          <div className="text-center mt-8 sm:mt-12">
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
      <section className="py-12 sm:py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="bg-gradient-hero rounded-2xl sm:rounded-3xl p-6 sm:p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySC0ydi0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            
            <div className="relative z-10">
              <HandHeart className="w-12 h-12 sm:w-16 sm:h-16 text-primary-foreground/80 mx-auto mb-4 sm:mb-6 animate-pulse" />
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-primary-foreground mb-4 sm:mb-6">
                Need Medical Assistance?
              </h2>
              <p className="text-base sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-6 sm:mb-10 px-2">
                If you or someone you know is facing overwhelming medical conditions, 
                the Bride of Christ family is here to help. Submit your request today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                <Link to="/get-help">
                  <Button variant="accent" size="lg" className="w-full sm:w-auto">
                    <HandHeart className="w-5 h-5" />
                    Request Help
                  </Button>
                </Link>
                <Link to="/donate">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20">
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
      <section className="py-12 sm:py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-3 sm:mb-4">
              What to <span className="text-gradient-primary">Submit</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Individuals that need assistance should submit the following:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 h-full">
                  <span className="text-4xl sm:text-6xl font-serif font-bold text-primary/10 group-hover:text-primary/20 transition-colors duration-300">
                    {item.step}
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-foreground mt-2 sm:mt-4 mb-2 sm:mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden sm:block absolute top-1/2 -right-3 lg:-right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 lg:w-8 lg:h-8 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
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