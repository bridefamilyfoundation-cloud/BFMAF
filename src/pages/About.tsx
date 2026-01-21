import { Heart, Users, Target, Award, ArrowRight, BookOpen, Phone, HandHeart } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingBackground from "@/components/FloatingBackground";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import heroBg from "@/assets/hero-bg.jpg";

const values = [
  {
    icon: Heart,
    title: "Compassion",
    description: "Reaching out with love to believers facing overwhelming medical conditions.",
  },
  {
    icon: Users,
    title: "Family",
    description: "The Bride of Christ is one family - when one member suffers, we all suffer together.",
  },
  {
    icon: Target,
    title: "Support",
    description: "Providing prayers, visits, calls, and financial/medical assistance.",
  },
  {
    icon: Award,
    title: "Faith",
    description: "Grounded in Biblical principles and the love of Christ for His Church.",
  },
];

const howWeHelp = [
  {
    icon: BookOpen,
    title: "Prayers",
    description: "We intercede for our brothers and sisters in their time of need, lifting them up before the Lord.",
  },
  {
    icon: Users,
    title: "Visits",
    description: "Where and when possible, we visit to show love, support, and the presence of the body of Christ.",
  },
  {
    icon: Phone,
    title: "Calls to Encourage",
    description: "Reaching out to admonish and encourage during difficult times, reminding them they are not alone.",
  },
  {
    icon: HandHeart,
    title: "Financial & Medical Assistance",
    description: "Providing tangible support for medical expenses when conditions are beyond the local church to handle.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="About Us"
        description="Learn about BFMAF - A faith-based platform providing prayer, support, and financial aid to Christians facing overwhelming medical conditions."
        url="https://bfmaf.lovable.app/about"
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
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
              About <span className="text-gradient-primary">BFMAF</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-6 italic px-2">
              "And whether one member suffer, all the members suffer with it, or one member be honored, all the members rejoice with it."
            </p>
            <p className="text-sm text-primary mb-6 sm:mb-8">— 1 Corinthians 12:26</p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-2">
              Bride Family Medical Aid Foundation (BFMAF) is a platform borne out of compassion 
              to reach out to the severely traumatized believers, brothers and sisters who are 
              in despair due to prolonged or acute conditions that is overwhelming to the 
              individual, family and local church — conditions beyond the local church to handle. 
              Hence the need for the Bride of Christ as a Family to reach out for assistance!
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 sm:py-16 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">Our Mission</h2>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  To be a bridge of compassion connecting the body of Christ worldwide, ensuring 
                  that no believer faces overwhelming medical conditions alone. We believe that 
                  as the Bride of Christ, we are called to bear one another's burdens.
                </p>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                  Our mission is to identify, verify, and support believers who are facing 
                  medical emergencies and prolonged conditions that exceed the capacity of 
                  their local church to address.
                </p>
                <Button asChild className="bg-gradient-hero text-primary-foreground">
                  <Link to="/get-help">
                    Request Assistance <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative order-1 md:order-2">
                <img
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop"
                  alt="Community helping"
                  className="rounded-xl sm:rounded-2xl shadow-card-hover w-full"
                />
                <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-card p-4 sm:p-6 rounded-xl shadow-card">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">BFMAF</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Bride Family Medical Aid</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How We Help Section */}
        <section className="py-12 sm:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-3 sm:mb-4">How We Help</h2>
            <p className="text-muted-foreground text-center mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base px-2">
              Such assistance could come in the following ways:
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
              {howWeHelp.map((item, index) => (
                <div
                  key={index}
                  className="bg-card p-4 sm:p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow text-center"
                >
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <item.icon className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 sm:py-20 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8 sm:mb-12">Our Values</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-card p-4 sm:p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow text-center"
                >
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <value.icon className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-foreground text-center mb-4">What to Submit</h2>
            <p className="text-muted-foreground text-center mb-12">
              Individuals that need such assistance will submit the following:
            </p>
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-xl shadow-card flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Photographs</h3>
                  <p className="text-muted-foreground">Clear photographs of the patient and their current condition</p>
                </div>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-card flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Medical History</h3>
                  <p className="text-muted-foreground">Complete medical history from onset to the current status of the condition</p>
                </div>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-card flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Financial Implication</h3>
                  <p className="text-muted-foreground">Detailed breakdown of the financial implications of the medical management</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-16 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Location</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Divine Love Christian Assembly Jos
            </p>
            <p className="text-muted-foreground mb-8">
              Longwa Phase II Behind Millennium Hotel Jos
            </p>
            <div className="bg-card p-8 rounded-xl shadow-card inline-block">
              <p className="text-foreground font-semibold mb-2">For more information or enquiry:</p>
              <p className="text-primary text-lg">
                <a href="tel:07032128927" className="hover:underline">07032128927</a>
                {" or "}
                <a href="tel:08036638890" className="hover:underline">08036638890</a>
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Need Assistance?</h2>
            <p className="text-muted-foreground mb-8">
              If you or someone you know is facing an overwhelming medical condition, 
              the Bride of Christ family is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-hero text-primary-foreground">
                <Link to="/get-help">
                  <HandHeart className="w-5 h-5" />
                  Request Help
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;