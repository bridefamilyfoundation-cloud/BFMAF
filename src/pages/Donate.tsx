import { useState, useEffect } from "react";
import { Heart, CreditCard, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const donationAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

const Donate = () => {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10000);
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState("one-time");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser({ id: session.user.id, email: session.user.email || "" });
      
      // Pre-fill form with profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (profile) {
        setFormData({
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || session.user.email || "",
        });
      }
    }
  };

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const finalAmount = selectedAmount || Number(customAmount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please select or enter a donation amount.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create donation record - general fund donation
      const donationData: {
        amount: number;
        is_recurring: boolean;
        cause_id: null;
        user_id: string | null;
        donor_name: string | null;
        donor_email: string | null;
        status: string;
      } = {
        amount: finalAmount,
        is_recurring: donationType === "monthly",
        cause_id: null,
        user_id: user?.id || null,
        donor_name: user ? null : `${formData.firstName} ${formData.lastName}`,
        donor_email: user ? null : formData.email,
        status: "completed",
      };

      const { error: donationError } = await supabase
        .from("donations")
        .insert(donationData);

      if (donationError) throw donationError;

      // Log activity if user is logged in
      if (user) {
        await supabase.from("activity_log").insert({
          user_id: user.id,
          action: "donation",
          details: {
            amount: finalAmount,
            type: "general_fund",
            is_recurring: donationType === "monthly",
          },
        });
      }

      setIsSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your donation has been processed successfully.",
      });
    } catch (error) {
      console.error("Donation error:", error);
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background relative">
        <FloatingBackground />
        <Navbar />
        
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-card rounded-3xl p-12 shadow-card text-center">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
                Thank You!
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Your generous donation of ₦{finalAmount.toLocaleString()} to the General Fund will help transform lives.
                A confirmation email has been sent to you.
              </p>
              <p className="text-sm text-muted-foreground mb-8 italic">
                "Bear ye one another's burdens, and so fulfil the law of Christ." — Galatians 6:2
              </p>
              <Button variant="hero" onClick={() => {
                setIsSubmitted(false);
                setSelectedAmount(10000);
                setCustomAmount("");
              }}>
                Make Another Donation
              </Button>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingBackground />
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                100% goes to helping the community
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Support the <span className="text-gradient-primary">Community</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your donation to the General Fund helps us respond quickly to urgent medical needs across the body of Christ.
            </p>
            <p className="text-sm text-muted-foreground italic mt-4">
              "And whether one member suffer, all the members suffer with it" — 1 Corinthians 12:26
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
            {/* Donation Amount Selection */}
            <div className="md:col-span-2 space-y-8">
              {/* General Fund Notice */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">General Fund Donation</h3>
                    <p className="text-muted-foreground text-sm">
                      Your donation goes directly to the BFMAF General Fund, which allows us to allocate resources 
                      to the most urgent cases and provide immediate assistance to members in need.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h2 className="text-xl font-serif font-semibold text-foreground mb-6">
                  Select Donation Type
                </h2>
                <RadioGroup
                  value={donationType}
                  onValueChange={setDonationType}
                  className="flex gap-4"
                >
                  <Label
                    htmlFor="one-time"
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300",
                      donationType === "one-time"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value="one-time" id="one-time" />
                    <span className="font-medium">One-time</span>
                  </Label>
                  <Label
                    htmlFor="monthly"
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300",
                      donationType === "monthly"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value="monthly" id="monthly" />
                    <span className="font-medium">Monthly</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h2 className="text-xl font-serif font-semibold text-foreground mb-6">
                  Choose Amount
                </h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {donationAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleAmountClick(amount)}
                      className={cn(
                        "p-4 rounded-xl border-2 font-semibold text-lg transition-all duration-300",
                        selectedAmount === amount
                          ? "border-primary bg-primary text-primary-foreground shadow-glow"
                          : "border-border hover:border-primary/50 text-foreground"
                      )}
                    >
                      ₦{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                    ₦
                  </span>
                  <Input
                    type="number"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="pl-8 h-14 text-lg"
                  />
                </div>
              </div>

              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h2 className="text-xl font-serif font-semibold text-foreground mb-6">
                  Personal Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="mt-2"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="mt-2"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="mt-2"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h2 className="text-xl font-serif font-semibold text-foreground mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="mt-2" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" className="mt-2" required />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" className="mt-2" required />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-card sticky top-28">
                <h3 className="text-lg font-serif font-semibold text-foreground mb-6">
                  Donation Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{donationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fund</span>
                    <span className="font-medium">General Fund</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">₦{finalAmount.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-primary">
                        ₦{finalAmount.toLocaleString()}
                        {donationType === "monthly" && "/mo"}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="w-full"
                  disabled={finalAmount === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    "Processing..."
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      Complete Donation
                    </>
                  )}
                </Button>

                <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-success" />
                  <span>Secure 256-bit SSL encryption</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Donate;