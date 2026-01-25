import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingBackground from "@/components/FloatingBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import heroBg from "@/assets/hero-bg.jpg";

const Contact = () => {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      details: [settings.address],
    },
    {
      icon: Phone,
      title: "Phone",
      details: [settings.phone1, settings.phone2].filter(Boolean),
    },
    {
      icon: Mail,
      title: "Email",
      details: [settings.email],
    },
    {
      icon: Clock,
      title: "Hours",
      details: ["Mon - Fri: 9am - 5pm", "Sat: 10am - 2pm"],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      if (error) throw error;

      // Send notification email to admin
      try {
        await supabase.functions.invoke("send-email", {
          body: {
            type: "contact_notification",
            to: "bridefamilyfoundation@gmail.com", // Admin email
            data: {
              name: formData.name,
              email: formData.email,
              subject: formData.subject,
              message: formData.message,
            },
          },
        });
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
      }

      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll get back to you soon.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const faqs = [
    {
      q: "How can I request medical assistance?",
      a: "You can submit your request through our 'Get Help' page. You'll need to provide photographs, your medical history from onset to current status, and the financial implications of the medical management.",
    },
    {
      q: "Who is eligible for assistance?",
      a: "We reach out to believers, brothers and sisters who are in despair due to prolonged or acute medical conditions that are overwhelming to the individual, family, and local church.",
    },
    {
      q: "How do you verify cases?",
      a: "All submitted cases are reviewed by our admin team. We verify the medical documentation and may contact the local church or medical providers for confirmation.",
    },
    {
      q: "How can I donate to help someone?",
      a: "You can donate through our Donate page. You can choose to give to a specific case or to the general fund which helps multiple cases.",
    },
  ];

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "NonprofitOrganization",
    name: "Bride Family Medical Aid Foundation",
    alternateName: "BFMAF",
    url: "https://bfmaf.lovable.app",
    logo: "https://bfmaf.lovable.app/favicon.png",
    image: "https://bfmaf.lovable.app/og-image.png",
    description: "Faith-based medical assistance for believers facing overwhelming medical conditions.",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Jos",
      addressRegion: "Plateau State",
      addressCountry: "NG",
    },
    telephone: settings.phone1,
    email: settings.email,
    openingHours: "Mo-Fr 09:00-17:00, Sa 10:00-14:00",
    sameAs: [
      "https://facebook.com/BFMAF",
      "https://twitter.com/BFMAF",
      "https://instagram.com/BFMAF",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings.phone1,
      contactType: "customer service",
      availableLanguage: "English",
    },
  };

  const combinedStructuredData = [faqStructuredData, localBusinessData];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Contact Us"
        description="Get in touch with BFMAF. We're here to help believers facing medical crises. Contact us for assistance or to learn how you can support our mission."
        url="https://bfmaf.lovable.app/contact"
        structuredData={combinedStructuredData}
      />
      <FloatingBackground />
      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <section 
          className="relative py-20 px-4 pt-32"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <Breadcrumbs />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Get in <span className="text-gradient-primary">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions about our foundation or want to get involved? We'd love to hear from you.
              For more information or enquiry, please call us directly.
            </p>
          </div>
        </section>

        {/* Contact Info & Form Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-8">Contact Information</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {contactInfo.map((info, index) => (
                    <div
                      key={index}
                      className="bg-card p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <info.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-muted-foreground text-sm">
                          {info.title === "Phone" ? (
                            <a href={`tel:${detail}`} className="hover:text-primary transition-colors">
                              {detail}
                            </a>
                          ) : info.title === "Email" ? (
                            <a href={`mailto:${detail}`} className="hover:text-primary transition-colors">
                              {detail}
                            </a>
                          ) : (
                            detail
                          )}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="mt-8 bg-secondary/50 rounded-xl h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Divine Love Christian Assembly Jos</p>
                    <p className="text-muted-foreground text-sm">Longwa Phase II</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-card p-8 rounded-2xl shadow-card">
                <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-hero text-primary-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-6 rounded-xl shadow-card">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;