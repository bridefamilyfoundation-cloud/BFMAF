import { Heart, ClipboardCheck, Users, HandHeart, ArrowRight, FileText, Camera, DollarSign, CheckCircle, MessageSquare, Phone, BookOpen, Shield, TrendingUp, CreditCard, Building, Eye, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingBackground from "@/components/FloatingBackground";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import heroBg from "@/assets/hero-bg.jpg";

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

const requestSteps = [
  {
    step: "01",
    icon: Camera,
    title: "Submit Your Request",
    description: "Fill out our assistance request form with patient details including name, age, local church, medical condition, and upload up to 5 photographs.",
  },
  {
    step: "02",
    icon: FileText,
    title: "Provide Documentation",
    description: "Submit your complete medical history from onset to current status, along with a detailed breakdown of the financial implications.",
  },
  {
    step: "03",
    icon: ClipboardCheck,
    title: "Admin Review",
    description: "Our team reviews your submission, verifies the information with your local church or medical providers, and assesses how we can best provide support.",
  },
  {
    step: "04",
    icon: CheckCircle,
    title: "Case Approval",
    description: "Once approved, your case is published on our platform where the Bride of Christ family worldwide can see and support you.",
  },
  {
    step: "05",
    icon: HandHeart,
    title: "Receive Support",
    description: "Receive prayers, encouragement, visits (where possible), and financial assistance from believers worldwide.",
  },
];

const whatToSubmit = [
  {
    icon: Camera,
    title: "Photographs",
    description: "Clear photographs of the patient and their current condition (up to 5 images).",
  },
  {
    icon: FileText,
    title: "Medical History",
    description: "Complete medical history from onset to current status, including diagnosis and treatment plans.",
  },
  {
    icon: DollarSign,
    title: "Financial Breakdown",
    description: "Detailed breakdown of medical costs including treatment, ongoing care, and any support already received.",
  },
];

const whyDonate = [
  {
    icon: Eye,
    title: "Full Transparency",
    description: "Every case is verified and published. You can see exactly who you're helping and track the impact of your donation.",
  },
  {
    icon: Heart,
    title: "Life-Saving Impact",
    description: "Your donation directly helps believers facing overwhelming medical conditions that their local church cannot handle alone.",
  },
  {
    icon: Users,
    title: "United as One Body",
    description: "When one member suffers, we all suffer together. Your support embodies the unity of the Bride of Christ.",
  },
  {
    icon: Shield,
    title: "Trusted Stewardship",
    description: "We ensure responsible management of every donation with accountability and regular updates on how funds are used.",
  },
];

const fundsBreakdown = [
  { label: "Direct Medical Assistance", percentage: 70, color: "bg-primary" },
  { label: "Support Services (Visits, Calls)", percentage: 15, color: "bg-accent" },
  { label: "Platform & Operations", percentage: 10, color: "bg-muted-foreground" },
  { label: "Emergency Reserve", percentage: 5, color: "bg-secondary-foreground" },
];

const donationMethods = [
  {
    icon: CreditCard,
    title: "Card Payment",
    description: "Securely donate using your debit or credit card via Paystack. Instant confirmation and receipt.",
  },
  {
    icon: Building,
    title: "Bank Transfer",
    description: "Make a direct bank deposit and upload your proof of payment. Our team will verify and process your donation.",
  },
];

const faqs = [
  {
    q: "What is the purpose of BFMAF?",
    a: "Bride Family Medical Aid Foundation (BFMAF) is a compassionate platform to reach out to severely traumatized believers who are in despair due to prolonged or acute medical conditions that are overwhelming to the individual, family, and local church. We connect them with the support of the global body of Christ.",
  },
  {
    q: "Who is eligible for assistance?",
    a: "We help believers, brothers and sisters facing medical conditions that are beyond what their local church can handle alone. This includes prolonged illnesses, acute conditions, and medical emergencies requiring significant financial support.",
  },
  {
    q: "How long does the review process take?",
    a: "Our team typically reviews submissions within 3-5 business days. Urgent cases may be expedited based on the severity of the condition.",
  },
  {
    q: "Can I submit a request on behalf of someone else?",
    a: "Yes, you can submit a request on behalf of a family member or fellow believer. Please ensure you have their consent and accurate information about their condition.",
  },
  {
    q: "How are funds distributed?",
    a: "Donations go to our General Fund which supports all verified cases. 70% goes directly to medical assistance, 15% to support services (visits, calls, encouragement), 10% to platform operations, and 5% to emergency reserves.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept card payments (via Paystack) and bank transfers in Nigerian Naira (₦). For bank transfers, you'll need to upload proof of payment which our team will verify.",
  },
  {
    q: "How can I track my donation's impact?",
    a: "All verified cases are published on our Active Cases page with updates. You can see the progress of fundraising and how the Bride of Christ family is coming together to help.",
  },
  {
    q: "Is my donation tax-deductible?",
    a: "Please consult with your local tax advisor regarding the deductibility of charitable donations in your jurisdiction.",
  },
];

const HowItWorks = () => {
  const { settings } = useSiteSettings();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="How It Works"
        description="Learn how BFMAF helps believers facing medical crises. Understand our process for requesting help, how donations are used, and ways to support the body of Christ."
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
                "{settings.scripture_text}"
              </p>
              <p className="text-sm text-primary mb-6">— {settings.scripture_reference}</p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-2">
                {settings.description || "Learn how the Bride Family Medical Aid Foundation connects believers in need with the support of the body of Christ worldwide."}
              </p>
            </div>
          </div>
        </section>

        {/* Our Purpose Section */}
        <section className="py-12 sm:py-20 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Our Purpose</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">
                  Why <span className="text-gradient-primary">BFMAF</span> Exists
                </h2>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  {settings.organization_name} is a platform borne out of compassion to reach out to the severely 
                  traumatized believers, brothers and sisters who are in despair due to prolonged or acute 
                  conditions that is overwhelming to the individual, family and local church.
                </p>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                  When medical conditions exceed what a local church can handle, the Bride of Christ as a 
                  Family reaches out for assistance. We believe that as the body of Christ, when one member 
                  suffers, we all suffer together—and when one is honored, we all rejoice.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-gradient-hero text-primary-foreground">
                    <Link to="/about">
                      Learn More About Us
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop"
                  alt="Community helping"
                  className="rounded-xl sm:rounded-2xl shadow-card-hover w-full"
                />
                <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-card p-4 sm:p-6 rounded-xl shadow-card">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{settings.tagline}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Bride Family Medical Aid</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How We Help Section */}
        <section className="py-12 sm:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                How We <span className="text-gradient-primary">Help</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
                Assistance from the Bride of Christ family comes in the following ways:
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

        {/* Getting Help Section Header */}
        <section className="py-8 sm:py-12 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl text-center">
            <HandHeart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              Getting Help
            </h2>
            <p className="text-primary-foreground/80 text-sm sm:text-base">
              If you or someone you know is facing an overwhelming medical condition, here's how to request assistance
            </p>
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
                Follow these steps to request assistance from BFMAF:
              </p>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {requestSteps.map((step, index) => (
                <div key={index} className="relative flex gap-4 sm:gap-6 items-start">
                  {index < requestSteps.length - 1 && (
                    <div className="absolute left-6 sm:left-8 top-16 sm:top-20 w-0.5 h-12 sm:h-16 bg-primary/20" />
                  )}
                  <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg">
                    {step.step}
                  </div>
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
                To be considered for assistance, please prepare and submit:
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

        {/* Supporting / Donating Section Header */}
        <section className="py-8 sm:py-12 px-4 bg-accent text-accent-foreground">
          <div className="container mx-auto max-w-4xl text-center">
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              Supporting & Donating
            </h2>
            <p className="text-accent-foreground/80 text-sm sm:text-base">
              Your generosity helps believers overcome overwhelming medical conditions
            </p>
          </div>
        </section>

        {/* Why Donate Section */}
        <section className="py-12 sm:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Why <span className="text-gradient-primary">Donate?</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
                Your donation makes a real difference in the lives of believers facing medical crises
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {whyDonate.map((item, index) => (
                <div
                  key={index}
                  className="bg-card p-4 sm:p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 text-center"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <item.icon className="h-6 w-6 sm:h-7 sm:w-7 text-accent" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How Funds Are Used Section */}
        <section className="py-12 sm:py-20 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                How Funds Are <span className="text-gradient-primary">Used</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
                We believe in complete transparency. Here's how your donations are allocated:
              </p>
            </div>
            
            <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-card">
              <div className="space-y-4 sm:space-y-6">
                {fundsBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm sm:text-base font-medium text-foreground">{item.label}</span>
                      <span className="text-sm sm:text-base font-bold text-primary">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3 sm:h-4 overflow-hidden">
                      <div 
                        className={`${item.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>{settings.funds_to_program}% of donations go directly to program services</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Donation Methods Section */}
        <section className="py-12 sm:py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Ways to <span className="text-gradient-primary">Donate</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
                Choose the payment method that works best for you (all donations in Nigerian Naira ₦)
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {donationMethods.map((method, index) => (
                <div
                  key={index}
                  className="bg-card p-6 sm:p-8 rounded-xl shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <method.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{method.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{method.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 sm:mt-12">
              <Button asChild size="lg" className="bg-gradient-hero text-primary-foreground">
                <Link to="/donate">
                  <Heart className="w-5 h-5" />
                  Donate Now
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-20 px-4 bg-secondary/30">
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

        {/* Final CTA Section */}
        <section className="py-12 sm:py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-gradient-hero rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySC0ydi0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
              
              <div className="relative z-10">
                <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-primary-foreground/80 mx-auto mb-4 sm:mb-6" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                  Ready to Take Action?
                </h2>
                <p className="text-primary-foreground/80 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
                  Whether you need assistance or want to support a believer in need, 
                  the Bride of Christ family is here for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                  <Button asChild size="lg" variant="accent">
                    <Link to="/get-help">
                      <HandHeart className="w-5 h-5" />
                      Request Help
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Link to="/donate">
                      <Heart className="w-5 h-5" />
                      Donate Now
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Link to="/cases">
                      View Active Cases
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-8 sm:py-12 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-4xl text-center">
            <p className="text-muted-foreground mb-2 text-sm sm:text-base">
              For more information or enquiries:
            </p>
            <p className="text-primary font-semibold text-lg">
              {settings.phone1 && <a href={`tel:${settings.phone1}`} className="hover:underline">{settings.phone1}</a>}
              {settings.phone1 && settings.phone2 && " or "}
              {settings.phone2 && <a href={`tel:${settings.phone2}`} className="hover:underline">{settings.phone2}</a>}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              <a href={`mailto:${settings.email}`} className="hover:text-primary transition-colors">{settings.email}</a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
