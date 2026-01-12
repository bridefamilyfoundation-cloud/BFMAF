import { useState, useEffect } from "react";
import { Heart, CreditCard, Shield, CheckCircle, Building2, Landmark, Copy, Check } from "lucide-react";
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
import { useSearchParams } from "react-router-dom";

const donationAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

const bankDetails = {
  bankName: "First Bank of Nigeria",
  accountName: "BFMAF Foundation",
  accountNumber: "1234567890",
};

const Donate = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10000);
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState("one-time");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    checkAuth();
    
    // Check for payment success from Paystack redirect
    const status = searchParams.get("status");
    const reference = searchParams.get("reference");
    
    if (status === "success" && reference) {
      verifyPayment(reference);
    }
  }, [searchParams]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser({ id: session.user.id, email: session.user.email || "" });
      
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

  const verifyPayment = async (reference: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("paystack-verify", {
        body: { reference },
      });

      if (error) throw error;

      if (data.success) {
        setIsSubmitted(true);
        setSelectedAmount(data.amount);
        toast({
          title: "Payment Successful!",
          description: "Your donation has been processed successfully.",
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast({
        title: "Verification Error",
        description: "Could not verify payment. Please contact support.",
        variant: "destructive",
      });
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

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
  };

  const finalAmount = selectedAmount || Number(customAmount) || 0;

  const handlePaystackPayment = async () => {
    if (finalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please select or enter a donation amount.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("paystack-initialize", {
        body: {
          email: formData.email,
          amount: finalAmount,
          metadata: {
            donor_name: `${formData.firstName} ${formData.lastName}`.trim() || "Anonymous",
            donation_type: donationType,
            user_id: user?.id || null,
          },
        },
      });

      if (error) throw error;

      if (data.data?.authorization_url) {
        // Redirect to Paystack checkout
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankTransferSubmit = async () => {
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
      // Record the donation as pending for bank transfer
      const donationData = {
        amount: finalAmount,
        is_recurring: donationType === "monthly",
        cause_id: null,
        user_id: user?.id || null,
        donor_name: user ? null : `${formData.firstName} ${formData.lastName}`,
        donor_email: user ? null : formData.email,
        status: "pending", // Bank transfers start as pending
      };

      const { error: donationError } = await supabase
        .from("donations")
        .insert(donationData);

      if (donationError) throw donationError;

      if (user) {
        await supabase.from("activity_log").insert({
          user_id: user.id,
          action: "donation_initiated",
          details: {
            amount: finalAmount,
            type: "general_fund",
            payment_method: "bank_transfer",
            is_recurring: donationType === "monthly",
          },
        });
      }

      setIsSubmitted(true);
      toast({
        title: "Bank Transfer Initiated",
        description: "Please complete the transfer using the bank details provided.",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === "card") {
      await handlePaystackPayment();
    } else {
      await handleBankTransferSubmit();
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
                {paymentMethod === "bank" ? "Transfer Initiated!" : "Thank You!"}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {paymentMethod === "bank" ? (
                  <>
                    Please complete your transfer of ₦{finalAmount.toLocaleString()} to the General Fund.
                    <br />
                    <span className="text-sm">Your donation will be confirmed once we receive it.</span>
                  </>
                ) : (
                  <>
                    Your generous donation of ₦{finalAmount.toLocaleString()} to the General Fund will help transform lives.
                    A confirmation email has been sent to you.
                  </>
                )}
              </p>
              
              {paymentMethod === "bank" && (
                <div className="bg-secondary/50 rounded-2xl p-6 mb-8 text-left">
                  <h3 className="font-semibold text-foreground mb-4">Bank Transfer Details:</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Bank Name:</span>
                      <span className="font-medium">{bankDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Account Name:</span>
                      <span className="font-medium">{bankDetails.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium font-mono">{bankDetails.accountNumber}</span>
                        <button
                          onClick={() => copyToClipboard(bankDetails.accountNumber, "Account Number")}
                          className="p-1 hover:bg-secondary rounded"
                        >
                          {copiedField === "Account Number" ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-primary">₦{finalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
              
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

              {/* Payment Method Selection */}
              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h2 className="text-xl font-serif font-semibold text-foreground mb-6">
                  Select Payment Method
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={cn(
                      "p-6 rounded-xl border-2 transition-all duration-300 text-left",
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        paymentMethod === "card" ? "bg-primary text-primary-foreground" : "bg-secondary"
                      )}>
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Card Payment</h3>
                        <p className="text-sm text-muted-foreground">Pay securely with Paystack</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Mastercard-logo.png/200px-Mastercard-logo.png" alt="Mastercard" className="h-6 object-contain" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 object-contain" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Verve-logo.svg/200px-Verve-logo.svg.png" alt="Verve" className="h-4 object-contain" />
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={cn(
                      "p-6 rounded-xl border-2 transition-all duration-300 text-left",
                      paymentMethod === "bank"
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        paymentMethod === "bank" ? "bg-primary text-primary-foreground" : "bg-secondary"
                      )}>
                        <Landmark className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Bank Transfer</h3>
                        <p className="text-sm text-muted-foreground">Direct deposit to our account</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-xs text-muted-foreground">All Nigerian banks supported</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bank Transfer Details */}
              {paymentMethod === "bank" && (
                <div className="bg-card rounded-2xl p-8 shadow-card border-2 border-dashed border-primary/30">
                  <div className="flex items-center gap-3 mb-6">
                    <Building2 className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-serif font-semibold text-foreground">
                      Bank Transfer Details
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-xl">
                      <div>
                        <span className="text-sm text-muted-foreground">Bank Name</span>
                        <p className="font-semibold text-foreground">{bankDetails.bankName}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-xl">
                      <div>
                        <span className="text-sm text-muted-foreground">Account Name</span>
                        <p className="font-semibold text-foreground">{bankDetails.accountName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bankDetails.accountName, "Account Name")}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        {copiedField === "Account Name" ? (
                          <Check className="w-5 h-5 text-success" />
                        ) : (
                          <Copy className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-xl">
                      <div>
                        <span className="text-sm text-muted-foreground">Account Number</span>
                        <p className="font-semibold text-foreground font-mono text-lg">{bankDetails.accountNumber}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bankDetails.accountNumber, "Account Number")}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        {copiedField === "Account Number" ? (
                          <Check className="w-5 h-5 text-success" />
                        ) : (
                          <Copy className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Note:</strong> Please use your email address as the transfer reference/narration so we can identify your donation.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium capitalize">
                      {paymentMethod === "card" ? "Card (Paystack)" : "Bank Transfer"}
                    </span>
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
                  ) : paymentMethod === "card" ? (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay with Paystack
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      Confirm Bank Transfer
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
