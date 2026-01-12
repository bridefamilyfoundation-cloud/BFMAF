import { Heart, Users, Target, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingBackground from "@/components/FloatingBackground";
import { Button } from "@/components/ui/button";

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    bio: "Passionate about creating positive change in communities worldwide.",
  },
  {
    name: "Michael Chen",
    role: "Director of Operations",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    bio: "Expert in nonprofit management with 15 years of experience.",
  },
  {
    name: "Emily Rodriguez",
    role: "Community Outreach",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
    bio: "Dedicated to connecting donors with causes that matter.",
  },
  {
    name: "David Thompson",
    role: "Finance Director",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop",
    bio: "Ensuring transparency and accountability in all operations.",
  },
];

const values = [
  {
    icon: Heart,
    title: "Compassion",
    description: "We believe in the power of empathy to transform lives and communities.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Together, we can achieve more than we ever could alone.",
  },
  {
    icon: Target,
    title: "Impact",
    description: "Every donation is directed to create measurable, lasting change.",
  },
  {
    icon: Award,
    title: "Integrity",
    description: "Transparency and accountability guide everything we do.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <FloatingBackground />
      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About <span className="text-gradient-primary">HopeFund</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              HopeFund was founded with a simple mission: to connect generous donors with causes
              that create real, lasting change in the world. Since 2015, we've helped channel
              millions of dollars to communities in need, supporting education, healthcare,
              environmental conservation, and humanitarian relief efforts.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  We strive to make charitable giving accessible, transparent, and impactful. Our
                  platform connects donors with vetted organizations working on the front lines of
                  social change.
                </p>
                <p className="text-muted-foreground mb-6">
                  Every dollar donated through HopeFund is tracked and reported, ensuring that your
                  generosity reaches those who need it most.
                </p>
                <Button asChild className="bg-gradient-hero text-primary-foreground">
                  <Link to="/causes">
                    Explore Our Causes <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop"
                  alt="Community helping"
                  className="rounded-2xl shadow-card-hover"
                />
                <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-card">
                  <div className="text-3xl font-bold text-primary">500K+</div>
                  <div className="text-sm text-muted-foreground">Lives Impacted</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Values</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow text-center"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-foreground text-center mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Our dedicated team works tirelessly to ensure every donation makes a difference.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow text-center"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Make a Difference?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of donors who are changing lives every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-hero text-primary-foreground">
                <Link to="/donate">Start Donating</Link>
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
