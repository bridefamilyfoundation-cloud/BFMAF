import { Heart, ClipboardCheck, Users, HandHeart, ArrowRight, FileText, Camera, DollarSign, CheckCircle, MessageSquare, Phone, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingBackground from "@/components/FloatingBackground";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import heroBg from "@/assets/hero-bg.jpg";

const requestSteps = [
  {
    step: "01",
    icon: Camera,
    title: "Submit Your Request",
    description: "Fill out our assistance request form with your details, medical condition, and upload photographs of the patient and condition.",
  },
  {
    step: "02",
    icon: FileText,
    title: "Provide Documentation",
    description: "Submit your complete medical history from onset to current status, along with documentation of the financial implications.",
  },
  {
    step: "03",
    icon: ClipboardCheck,
    title: "Admin Review",
    description: "Our team reviews your submission, verifies the information, and assesses how we can best provide support.",
  },
  {
    step: "04",
    icon: CheckCircle,
    title: "Case Approval",
    description: "Once approved, your case is published on our platform where the Bride of Christ family can see and support you.",
  },
  {
    step: "05",
    icon: HandHeart,
    title: "Receive Support",
    description: "Receive prayers, encouragement, visits (where possible), and financial assistance from believers worldwide.",
  },
];

const howWeHelp = [
  {
    icon: BookOpen,
    title: "Prayers",
    description: "We intercede for our brothers and sisters in their time of need, lifting them up before the Lord in prayer.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Users,
    title: "Visits",
    description: "Where and when possible, we visit to show love, support, and the tangible presence of the body of Christ.",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: Phone,
    title: "Calls to Encourage",
    description: "We reach out to admonish and encourage during difficult times, reminding believers they are not alone.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: DollarSign,
    title: "Financial & Medical Aid",
    description: "We provide tangible support for medical expenses when conditions are beyond the local church to handle.",
    color: "bg-orange-500/10 text-orange-600",
  },
];

const whatToSubmit = [
  {
    icon: Camera,
    title: "Photographs",
    description: "Clear photographs of the patient and their current condition to help us understand the situation.",
  },
  {
    icon: FileText,
    title: "Medical History",
    description: "Complete medical history from onset to the current status of the condition, including any diagnosis or treatment plans.",
  },
  {
    icon: DollarSign,
    title: "Financial Breakdown",
    description: "Detailed breakdown of the financial implications of the medical management including treatment costs and ongoing care.",
  },
];

const faqs = [
  {
    q: "Who is eligible for assistance?",
    a: "We reach out to believers, brothers and sisters who are in despair due to prolonged or acute medical conditions that are overwhelming to the individual, family, and local church - conditions beyond what the local church can handle alone.",
  },
  {
    q: "How long does the review process take?",
    a: "Our team typically reviews submissions within 3-5 business days. Urgent cases may be expedited based on the severity of the condition.",
  },
  {
    q: "Can I submit a request on behalf of someone else?",
    a: "Yes, you can submit a request on behalf of a family member or fellow believer. Please ensure you have their consent and accurate information.",
  },
  {
    q: "What happens after my case is approved?",
    a: "Once approved, your case will be published on our platform. The Bride of Christ family worldwide will be able to view your case, pray for you, and contribute financially.",
  },
  {
    q: "How are funds distributed?",
    a: "Funds raised for your case are used directly for your medical expenses. We work to ensure transparency and accountability in how all donations are utilized.",
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="How It Works"
        description="Learn how BFMAF helps believers facing medical crises. Understand our process from request submission to receiving prayer, support, and financial aid."
        url="https://bfmaf.lovable.app/how-it-works"
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
          <div className="container mx-auto max-w-4xl relative z-10">
            <Breadcrumbs />
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                How It <span className="text-gradient-primary">Works</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 italic px-2">
                "And whether one member suffer, all the members suffer with it, or one member be honored, all the members rejoice with it."
              </p>
              <p className="text-sm text-primary mb-6">— 1 Corinthians 12:26</p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-2">
                Learn how the Bride Family Medical Aid Foundation connects believers in need 
                with the support of the body of Christ worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* How We Help Section */}
        <section className="py-12 sm:py-20 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                How We <span className="text-gradient-primary">Help</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
                Such assistance from the Bride of Christ family comes in the following ways:
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {howWeHelp.map((item, index) => (
                <div
                  key={index}
                  className="bg-card p-4 sm:p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 text-center"
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                    <item.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-base sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Request Process Section */}
        <section className="py-12 sm:py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                The Request <span className="text-gradient-primary">Process</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
                Here's how you can request assistance from the Bride Family Medical Aid Foundation:
              </p>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {requestSteps.map((step, index) => (
                <div key={index} className="relative flex gap-4 sm:gap-6 items-start">
                  {/* Connector Line */}
                  {index < requestSteps.length - 1 && (
                    <div className="absolute left-6 sm:left-8 top-16 sm:top-20 w-0.5 h-12 sm:h-16 bg-primary/20" />
                  )}
                  
                  {/* Step Number */}
                  <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg">
                    {step.step}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-card p-4 sm:p-6 rounded-xl shadow-card">
                    <div className="flex items-center gap-3 mb-2">
                      <step.icon className="h-5 w-5 text-primary" />
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 sm:mt-12">
              <Button asChild size="lg" className="bg-gradient-hero text-primary-foreground">
                <Link to="/get-help">
                  <HandHeart className="w-5 h-5" />
                  Request Assistance Now
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What to Submit Section */}
        <section className="py-12 sm:py-20 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                What to <span className="text-gradient-primary">Submit</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
                Individuals that need assistance should prepare and submit the following:
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {whatToSubmit.map((item, index) => (
                <div
                  key={index}
                  className="bg-card p-5 sm:p-8 rounded-xl shadow-card hover:shadow-card-hover transition-shadow relative group"
                >
                  <span className="text-5xl sm:text-6xl font-serif font-bold text-primary/10 group-hover:text-primary/20 transition-colors duration-300 absolute top-4 right-4">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Frequently Asked <span className="text-gradient-primary">Questions</span>
              </h2>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 sm:p-6 rounded-xl shadow-card">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-20 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-4xl text-center">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-4 sm:mb-6" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Take the Next Step?
            </h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
              Whether you need assistance or want to support a believer in need, 
              the Bride of Christ family is here for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button asChild size="lg" className="bg-gradient-hero text-primary-foreground">
                <Link to="/get-help">
                  <HandHeart className="w-5 h-5" />
                  Request Help
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/cases">
                  View Active Cases
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/donate">
                  <Heart className="w-5 h-5" />
                  Support / Donate
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
