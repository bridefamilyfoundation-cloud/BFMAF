import { ArrowRight, Heart, Users, Globe, TrendingUp, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCounter from "@/components/StatCounter";
import CaseCard from "@/components/CaseCard";

const causes = [
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
];

const Index = () => {
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
                Join 50,000+ donors making a difference
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 animate-slide-up">
              Transform Lives Through{" "}
              <span className="text-gradient-primary">Compassion</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up delay-100">
              Every contribution creates ripples of hope. Join our community of changemakers 
              and help build a brighter future for those in need.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
              <Link to="/donate">
                <Button variant="hero" size="xl">
                  Start Giving Today
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/cases">
                <Button variant="outline" size="xl">
                  Explore Cases
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
              end={2500000}
              prefix="$"
              suffix="+"
              label="Funds Raised"
              icon={<TrendingUp className="w-6 h-6 text-primary-foreground" />}
            />
            <StatCounter
              end={15000}
              suffix="+"
              label="Donors Worldwide"
              icon={<Users className="w-6 h-6 text-primary-foreground" />}
            />
            <StatCounter
              end={45}
              suffix="+"
              label="Countries Reached"
              icon={<Globe className="w-6 h-6 text-primary-foreground" />}
            />
            <StatCounter
              end={98}
              suffix="%"
              label="Funds to Causes"
              icon={<Shield className="w-6 h-6 text-primary-foreground" />}
            />
          </div>
        </div>
      </section>

      {/* Featured Cases */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Featured <span className="text-gradient-primary">Cases</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover ongoing campaigns that need your support. Every donation, no matter 
              the size, brings us closer to our goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {causes.map((cause) => (
              <CaseCard key={cause.id} {...cause} />
            ))}
          </div>

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
              <Heart className="w-16 h-16 text-primary-foreground/80 mx-auto mb-6 animate-pulse" />
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-foreground mb-6">
                Ready to Make a Difference?
              </h2>
              <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
                Your generosity can change lives. Start your journey of giving today and 
                become part of our global community of hope.
              </p>
              <Link to="/donate">
                <Button variant="accent" size="xl">
                  <Heart className="w-5 h-5" />
                  Donate Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              How It <span className="text-gradient-primary">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Making an impact is simple. Follow these steps to start your giving journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose a Case",
                description: "Browse through verified campaigns and find cases that resonate with your values.",
              },
              {
                step: "02",
                title: "Make a Donation",
                description: "Securely contribute any amount. Every dollar goes directly to making an impact.",
              },
              {
                step: "03",
                title: "Track Your Impact",
                description: "Receive updates on how your donation is changing lives and communities.",
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
