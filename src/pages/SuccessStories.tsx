import { useState, useEffect } from "react";
import { Heart, Calendar, MapPin, ArrowRight, Quote, Sparkles, Users, Target, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingBackground from "@/components/FloatingBackground";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

interface SuccessStory {
  id: string;
  title: string;
  patient_name: string;
  condition: string;
  treatment: string;
  location: string | null;
  status: string;
  story_content: string;
  featured_quote: string | null;
  image_url: string | null;
  is_featured: boolean;
}

interface TreatmentUpdate {
  id: string;
  update_date: string;
  title: string;
  description: string;
  sort_order: number;
}

interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_role: string;
}

// Default fallback data
const defaultTimeline = [
  {
    date: "November 1-3, 2024",
    title: "The Call to Action",
    description: "After the National Youth Retreat, Bro Joseph Bala's absence due to a spinal condition causing paralysis of both legs sparked the vision. Discussions in Bro Emperor's office led to the decision to render assistance.",
  },
  {
    date: "November 2024",
    title: "Foundation Vision Born",
    description: "Pastor Ebere Isaac supported the idea. Pastor Lily Udeh suggested making it a Bride of Christ Family affair. The idea of registering a foundation was born.",
  },
  {
    date: "December 2024",
    title: "Board Formation & Registration",
    description: "Bro Moses Ayuba, Bro Joseph Adesida, Bro Joseph Anzaku, and Bro Luke A Ekka bought into the vision. Contributions began while the company registration process was ongoing.",
  },
  {
    date: "Early 2025",
    title: "Treatment Decision",
    description: "Hospital in Kaduna suggested surgery costing ₦4.5M with 50% chance (may get better or worse). After meetings, the board decided on alternative/Chinese care in Jos.",
  },
  {
    date: "March 24, 2025",
    title: "Treatment Begins in Jos",
    description: "Bro Joseph Bala, his father, and Pastor accepted the offer. Bro Joseph arrived in Jos and began receiving Acupressure, Hydrotherapy, special diet, and other treatments.",
  },
  {
    date: "Ongoing",
    title: "Progress & Recovery",
    description: "Through prayers, dedicated care, and the support of the Bride of Christ family, Bro Joseph continues his recovery journey. We thank God for the progress so far.",
  },
];

const defaultTestimonials = [
  {
    quote: "When I heard about the foundation and how the brethren were coming together to help me, I couldn't hold back my tears. The body of Christ truly cares.",
    author: "Bro Joseph Bala",
    role: "First BFMAF Beneficiary",
  },
  {
    quote: "Making it the Bride of Christ Family affair was the right decision. When believers who have compassion come together, miracles happen.",
    author: "Pastor Lily Udeh",
    role: "Spiritual Advisor",
  },
  {
    quote: "We want to thank God for the progress so far. The support and prompt response from everyone when the need arises has been overwhelming.",
    author: "Bro Ezekiel Ekka",
    role: "BFMAF Chairman",
  },
];

const SuccessStories = () => {
  const [loading, setLoading] = useState(true);
  const [featuredStory, setFeaturedStory] = useState<SuccessStory | null>(null);
  const [timeline, setTimeline] = useState<{ date: string; title: string; description: string }[]>(defaultTimeline);
  const [testimonials, setTestimonials] = useState<{ quote: string; author: string; role: string }[]>(
    defaultTestimonials.map(t => ({ quote: t.quote, author: t.author, role: t.role }))
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch featured story (most recent published and featured)
      const { data: stories } = await supabase
        .from("success_stories")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1);

      if (stories && stories.length > 0) {
        setFeaturedStory(stories[0]);
        
        // Fetch timeline for this story
        const { data: updates } = await supabase
          .from("treatment_updates")
          .select("*")
          .eq("story_id", stories[0].id)
          .order("sort_order");
        
        if (updates && updates.length > 0) {
          setTimeline(updates.map(u => ({
            date: u.update_date,
            title: u.title,
            description: u.description,
          })));
        }
      }

      // Fetch published testimonials
      const { data: testimonialData } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_published", true)
        .order("sort_order")
        .limit(6);

      if (testimonialData && testimonialData.length > 0) {
        setTestimonials(testimonialData.map(t => ({
          quote: t.quote,
          author: t.author_name,
          role: t.author_role,
        })));
      }
    } catch (error) {
      console.error("Error fetching success stories:", error);
    }
    setLoading(false);
  };

  // Use featured story data or defaults
  const storyData = featuredStory || {
    patient_name: "Bro Joseph Bala",
    condition: "Spinal Condition (Paralysis of both legs)",
    treatment: "Acupressure, Hydrotherapy & Special Diet",
    location: "Kaduna → Jos, Nigeria",
    status: "ongoing",
    story_content: `After the National Youth Retreat of 1st - 3rd November 2024, while in Bro Emperor's office feasting on the results of the meeting, we were struck by the regrettable absence of a young gifted singer and musician, Bro Joseph Bala, who was absent due to a spinal condition that led to paralysis of his two legs.

We discussed extensively how we could render assistance. The idea was related to our Pastor who supported and encouraged us. Pastor Lily was consulted, and she suggested making it the Bride of Christ Family affair which will involve believers who have compassion. The idea of having a foundation registered was born.

The vision was shared with Bro Moses Ayuba, Bro Joseph Adesida, Bro Joseph Anzaku, and Bro Luke A Ekka. They all bought the idea and started making contributions while the company registration process was on.

Meanwhile in Kaduna, the hospital Bro Joseph Bala was attending suggested surgery that would cost ₦4.5 million with a 50% chance — he may get better or worse. After series of meetings we concluded to go for alternative/Chinese care. A place in Jos was spotted.

Bro Joseph Bala, his father and Pastor were consulted. They all accepted the offer. The journey began. On the 24th March 2025, Bro Joseph Bala arrived in Jos. He has been on Acupressure, Hydrotherapy, special diet and other holistic treatments.

His story is not just about one man's healing — it's about the power of the Bride of Christ coming together as a family to bear one another's burdens, just as Scripture commands.`,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Success Stories - Our First Case"
        description="Read about Bro Joseph Bala's journey - the founding case that inspired BFMAF. See how the Bride of Christ family came together to provide hope and healing."
        url="https://bfmaf.lovable.app/success-stories"
      />
      <FloatingBackground />
      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <section 
          className="relative py-12 sm:py-20 px-4 pt-24 sm:pt-32"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
          <div className="container mx-auto max-w-4xl relative z-10">
            <Breadcrumbs />
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Our Founding Story
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                Success <span className="text-gradient-primary">Stories</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-2 max-w-2xl mx-auto">
                Stories of hope, healing, and the power of the Bride of Christ coming together 
                to support believers in their time of need.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Featured Case */}
            <section className="py-12 sm:py-20 px-4">
              <div className="container mx-auto max-w-5xl">
                <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-[2rem] p-8 sm:p-12 border border-primary/10 desktop-shadow">
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="lg:w-1/3">
                      <div className="bg-primary/10 rounded-[2rem] p-8 text-center">
                        {featuredStory?.image_url ? (
                          <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary/20">
                            <img 
                              src={featuredStory.image_url} 
                              alt={storyData.patient_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-primary/20 rounded-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12 text-primary"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg></div>';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-12 h-12 text-primary" />
                          </div>
                        )}
                        <h3 className="text-xl font-bold text-foreground mb-1">{storyData.patient_name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">Our First Case</p>
                        <div className="flex items-center justify-center gap-2 text-xs text-primary">
                          <MapPin className="w-3 h-3" />
                          <span>{storyData.location}</span>
                        </div>
                      </div>
                      <div className="mt-6 space-y-3">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl desktop-shadow border border-slate-100 dark:border-slate-700">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Condition</p>
                          <p className="text-sm font-medium text-foreground">{storyData.condition}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl desktop-shadow border border-slate-100 dark:border-slate-700">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Treatment</p>
                          <p className="text-sm font-medium text-foreground">{storyData.treatment}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl desktop-shadow border border-slate-100 dark:border-slate-700">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                          <p className="text-sm font-medium text-primary capitalize">
                            {storyData.status === "ongoing" ? "Ongoing Recovery ✓" : storyData.status === "completed" ? "Completed ✓" : storyData.status}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:w-2/3">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-primary" />
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">The Case That Started It All</h2>
                      </div>
                      <div className="space-y-4 text-muted-foreground leading-relaxed">
                        {storyData.story_content.split('\n\n').map((paragraph, index) => (
                          <p key={index} className={paragraph.startsWith('His story') ? "text-foreground font-medium italic border-l-4 border-primary pl-4" : ""}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Treatment Timeline */}
            <section className="py-12 sm:py-16 px-4 bg-secondary/30">
              <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-10">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Calendar className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Treatment Journey</h2>
                  </div>
                  <p className="text-muted-foreground">Follow the timeline of treatment and recovery</p>
                </div>
                
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 transform sm:-translate-x-1/2" />
                  
                  {timeline.map((item, index) => (
                    <div 
                      key={index} 
                      className={`relative flex items-start gap-4 sm:gap-8 mb-8 ${
                        index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                      }`}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-4 sm:left-1/2 w-3 h-3 bg-primary rounded-full transform -translate-x-1/2 mt-6 ring-4 ring-background" />
                      
                      {/* Content */}
                      <div className={`ml-10 sm:ml-0 sm:w-1/2 ${index % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12'}`}>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] desktop-shadow border border-slate-100 dark:border-slate-700">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">{item.date}</span>
                          <h3 className="text-lg font-bold text-foreground mt-1 mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="py-12 sm:py-20 px-4">
              <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-10">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Quote className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Words of Gratitude</h2>
                  </div>
                  <p className="text-muted-foreground">Hear from those touched by this journey</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {testimonials.slice(0, 3).map((testimonial, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] desktop-shadow border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                      <Quote className="w-8 h-8 text-primary/30 mb-4" />
                      <p className="text-muted-foreground italic mb-6 text-sm leading-relaxed">
                        "{testimonial.quote}"
                      </p>
                      <div className="border-t border-border pt-4">
                        <p className="font-semibold text-foreground">{testimonial.author}</p>
                        <p className="text-xs text-primary">{testimonial.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Impact Stats */}
            <section className="py-12 sm:py-16 px-4 bg-gradient-to-r from-primary/10 via-background to-accent/10">
              <div className="container mx-auto max-w-4xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">1</div>
                    <div className="text-sm text-muted-foreground">Case Supported</div>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">6</div>
                    <div className="text-sm text-muted-foreground">Board Members</div>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">100%</div>
                    <div className="text-sm text-muted-foreground">Commitment</div>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">∞</div>
                    <div className="text-sm text-muted-foreground">Faith</div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-20 px-4">
              <div className="container mx-auto max-w-3xl text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Users className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Be Part of the Next Story</h2>
                </div>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Your support can help write more success stories. Whether through prayers, visits, 
                  or financial assistance, you can make a difference in a believer's life.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-gradient-hero text-primary-foreground">
                    <Link to="/donate">
                      <Heart className="w-5 h-5" />
                      Support a Case
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/cases">
                      View Active Cases <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SuccessStories;
