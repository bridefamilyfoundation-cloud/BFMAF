import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Users, Calendar, Target, Share2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Static data - will be replaced with database fetch
const allCases = [
  {
    id: "1",
    title: "Education for Rural Children",
    description: "Help provide quality education and learning materials to underprivileged children in rural communities.",
    fullDescription: `Our Education for Rural Children initiative aims to bridge the educational gap between urban and rural areas. Many children in remote villages lack access to basic learning materials, qualified teachers, and proper school infrastructure.

With your support, we can:
• Provide textbooks, notebooks, and stationery to 500+ students
• Train local teachers with modern teaching methodologies
• Build and renovate classrooms in 10 rural schools
• Establish computer labs with internet connectivity
• Create after-school tutoring programs

Every child deserves the opportunity to learn and grow. Your donation directly impacts a child's future and helps break the cycle of poverty through education.`,
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&auto=format&fit=crop",
    raised: 45000,
    goal: 75000,
    category: "Education",
    donors: 234,
    daysLeft: 45,
    location: "Rural India",
    organizer: "HopeFund Foundation",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Clean Water Initiative",
    description: "Bring clean and safe drinking water to communities facing severe water scarcity.",
    fullDescription: `Access to clean water is a fundamental human right, yet millions of people worldwide still lack this basic necessity. Our Clean Water Initiative focuses on providing sustainable water solutions to communities in need.

Our approach includes:
• Installing deep-bore wells in water-scarce regions
• Setting up water purification systems in villages
• Training community members in water system maintenance
• Educating families about water conservation and hygiene
• Creating rainwater harvesting infrastructure

Clean water transforms communities - reducing disease, improving education attendance, and freeing up time for economic activities. Your contribution helps us bring life-changing water access to those who need it most.`,
    image: "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=800&auto=format&fit=crop",
    raised: 28000,
    goal: 50000,
    category: "Healthcare",
    donors: 156,
    daysLeft: 30,
    location: "East Africa",
    organizer: "WaterLife Organization",
    createdAt: "2024-02-01",
  },
  {
    id: "3",
    title: "Emergency Relief Fund",
    description: "Support families affected by natural disasters with immediate aid and recovery assistance.",
    fullDescription: `When disaster strikes, immediate response can mean the difference between life and death. Our Emergency Relief Fund provides rapid assistance to families affected by natural disasters including earthquakes, floods, hurricanes, and wildfires.

Our emergency response includes:
• Immediate food and water supplies for affected families
• Emergency shelter and temporary housing solutions
• Medical supplies and first aid assistance
• Psychological support for trauma victims
• Long-term rebuilding and recovery programs

Disasters don't discriminate - they affect everyone regardless of background. Your donation ensures we can respond quickly and effectively when communities need help the most.`,
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop",
    raised: 62000,
    goal: 100000,
    category: "Emergency",
    donors: 412,
    daysLeft: 15,
    location: "Global",
    organizer: "Rapid Response Team",
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    title: "Healthcare Access Program",
    description: "Provide medical supplies and healthcare access to underserved communities worldwide.",
    fullDescription: `Healthcare should be accessible to everyone, regardless of where they live or their economic status. Our Healthcare Access Program brings essential medical services to underserved communities around the world.

Program components include:
• Mobile medical clinics visiting remote areas
• Distribution of essential medicines and vaccines
• Training community health workers
• Maternal and child health programs
• Chronic disease management support

By supporting this program, you help ensure that families in need can access quality healthcare. Together, we can reduce preventable deaths and improve health outcomes for thousands.`,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&auto=format&fit=crop",
    raised: 35000,
    goal: 60000,
    category: "Healthcare",
    donors: 189,
    daysLeft: 60,
    location: "Southeast Asia",
    organizer: "MedCare International",
    createdAt: "2024-01-20",
  },
  {
    id: "5",
    title: "Women Empowerment Initiative",
    description: "Support women entrepreneurs with training, resources, and microloans to start businesses.",
    fullDescription: `Empowering women creates a ripple effect that benefits entire communities. Our Women Empowerment Initiative provides women with the tools, training, and resources they need to become financially independent.

Initiative highlights:
• Business skills training and mentorship programs
• Microloans with favorable terms for women entrepreneurs
• Vocational training in high-demand skills
• Networking opportunities and peer support groups
• Childcare support to enable women's participation

When women succeed, families thrive, communities prosper, and economies grow. Your support helps create opportunities for women to build better futures for themselves and their families.`,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop",
    raised: 18000,
    goal: 40000,
    category: "Community",
    donors: 98,
    daysLeft: 90,
    location: "Sub-Saharan Africa",
    organizer: "Women Forward",
    createdAt: "2024-02-15",
  },
  {
    id: "6",
    title: "Hunger Relief Program",
    description: "Provide nutritious meals to families facing food insecurity and malnutrition.",
    fullDescription: `No one should go to bed hungry. Our Hunger Relief Program works to combat food insecurity and malnutrition in vulnerable communities by providing nutritious meals and sustainable food solutions.

Our comprehensive approach:
• Daily meal programs for children in schools
• Food distribution to families in crisis
• Community gardens and sustainable farming training
• Nutrition education for mothers and caregivers
• Emergency food reserves for disaster response

Food security is the foundation for health, education, and economic development. Your donation helps us fight hunger and give families the nourishment they need to thrive.`,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop",
    raised: 52000,
    goal: 80000,
    category: "Emergency",
    donors: 287,
    daysLeft: 25,
    location: "Central America",
    organizer: "FoodFirst Foundation",
    createdAt: "2024-03-01",
  },
];

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const caseData = allCases.find((c) => c.id === id);

  if (!caseData) {
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

  const progress = (caseData.raised / caseData.goal) * 100;

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingBackground />
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          {/* Back Button */}
          <Link to="/cases" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Cases
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Image */}
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={caseData.image}
                  alt={caseData.title}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-primary/90 text-primary-foreground text-sm font-semibold rounded-full backdrop-blur-sm">
                    {caseData.category}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                  {caseData.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {caseData.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {caseData.organizer}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Started {new Date(caseData.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h2 className="text-xl font-serif font-semibold text-foreground mb-4">About This Case</h2>
                <div className="prose prose-muted max-w-none">
                  {caseData.fullDescription.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground mb-4 whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Donation Card */}
              <div className="bg-card rounded-2xl p-6 shadow-card sticky top-28">
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-bold text-primary">${caseData.raised.toLocaleString()}</span>
                    <span className="text-muted-foreground">of ${caseData.goal.toLocaleString()}</span>
                  </div>
                  <Progress value={progress} className="h-3 mb-4" />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground">{caseData.donors}</div>
                      <div className="text-xs text-muted-foreground">Donors</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{caseData.daysLeft}</div>
                      <div className="text-xs text-muted-foreground">Days Left</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{Math.round(progress)}%</div>
                      <div className="text-xs text-muted-foreground">Funded</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link to={`/donate?case=${caseData.id}`} className="block">
                    <Button variant="hero" size="lg" className="w-full">
                      <Heart className="w-5 h-5" />
                      Donate Now
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="w-full">
                    <Share2 className="w-5 h-5" />
                    Share This Case
                  </Button>
                </div>
              </div>

              {/* Goal Info */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Funding Goal</h3>
                    <p className="text-sm text-muted-foreground">${caseData.goal.toLocaleString()} needed</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
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
