import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X, HandHeart, CheckCircle, FileText, Camera, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const categories = ["General", "Surgery", "Chronic Illness", "Emergency", "Medication", "Treatment"];
const urgencyLevels = [
  { value: "low", label: "Low - Can wait a few weeks" },
  { value: "medium", label: "Medium - Need help within a week" },
  { value: "high", label: "High - Urgent, need help immediately" },
];

const formSchema = z.object({
  // Patient Information
  patientName: z.string().min(2, "Patient name is required").max(100, "Name must be less than 100 characters"),
  patientAge: z.string().optional(),
  localChurch: z.string().min(2, "Local church/assembly is required").max(200, "Church name must be less than 200 characters"),
  
  // Medical Information
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  medicalCondition: z.string().min(10, "Please describe the medical condition").max(500, "Description must be less than 500 characters"),
  medicalHistory: z.string().min(50, "Please provide detailed medical history from onset to current status (at least 50 characters)").max(3000, "Medical history must be less than 3000 characters"),
  currentStatus: z.string().min(20, "Please describe the current status of the condition").max(1000, "Current status must be less than 1000 characters"),
  category: z.string().min(1, "Please select a category"),
  urgency: z.string().min(1, "Please select urgency level"),
  
  // Financial Information
  goalAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Please enter a valid amount"),
  financialBreakdown: z.string().min(20, "Please provide a breakdown of the financial implications").max(2000, "Financial breakdown must be less than 2000 characters"),
  
  // Contact Information
  contactName: z.string().min(2, "Contact name is required").max(100, "Name must be less than 100 characters"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  location: z.string().min(5, "Please provide location details").max(200, "Location must be less than 200 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const GetHelp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      patientAge: "",
      localChurch: "",
      title: "",
      medicalCondition: "",
      medicalHistory: "",
      currentStatus: "",
      category: "",
      urgency: "medium",
      goalAmount: "",
      financialBreakdown: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      location: "",
    },
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          form.setValue("contactName", `${profile.first_name || ""} ${profile.last_name || ""}`.trim());
          form.setValue("contactEmail", profile.email || user.email || "");
          form.setValue("contactPhone", profile.phone || "");
          form.setValue("location", profile.address || "");
        } else if (user.email) {
          form.setValue("contactEmail", user.email);
        }
      }
    };
    getUser();
  }, [form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 10 images",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const newImageUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        });
        continue;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("aid-request-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("aid-request-images")
        .getPublicUrl(fileName);

      newImageUrls.push(publicUrl);
    }

    setUploadedImages((prev) => [...prev, ...newImageUrls]);
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    if (uploadedImages.length === 0) {
      toast({
        title: "Photographs Required",
        description: "Please upload at least one photograph of the patient",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const description = `
Patient: ${values.patientName}${values.patientAge ? ` (Age: ${values.patientAge})` : ''}
Local Church: ${values.localChurch}

Medical Condition: ${values.medicalCondition}

Medical History (from onset to current status):
${values.medicalHistory}

Current Status:
${values.currentStatus}

Financial Implications:
${values.financialBreakdown}
      `.trim();

      const { error } = await supabase.from("aid_requests").insert({
        user_id: user?.id || null,
        title: values.title,
        description: description,
        category: values.category,
        goal_amount: Number(values.goalAmount),
        urgency: values.urgency,
        contact_name: values.contactName,
        contact_email: values.contactEmail,
        contact_phone: values.contactPhone,
        location: values.location,
        image_urls: uploadedImages,
        status: "pending",
      });

      if (error) throw error;

      await supabase.from("activity_log").insert({
        user_id: user?.id || null,
        action: "aid_request_submitted",
        details: { title: values.title, category: values.category, patientName: values.patientName },
      });

      setIsSuccess(true);
      toast({
        title: "Request submitted!",
        description: "Your aid request has been submitted for review.",
      });
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background relative">
        <FloatingBackground />
        <Navbar />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-card rounded-2xl p-8 shadow-card text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
                Request Submitted!
              </h1>
              <p className="text-muted-foreground mb-8">
                Thank you for submitting your aid request to the Bride Family Medical Aid Foundation. 
                Our team will review it and get back to you within 24-48 hours. Once approved, your case
                will be visible on our platform for the body of Christ to support.
              </p>
              <p className="text-sm text-muted-foreground mb-8 italic">
                "Bear ye one another's burdens, and so fulfil the law of Christ." — Galatians 6:2
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate("/cases")} variant="outline">
                  View Cases
                </Button>
                <Button onClick={() => navigate("/")} variant="hero">
                  Return Home
                </Button>
              </div>
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
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HandHeart className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Request <span className="text-gradient-primary">Assistance</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Tell us about your situation and how the Bride of Christ family can help. 
              All requests are reviewed by our team before being published.
            </p>
            <p className="text-sm text-muted-foreground italic">
              "And whether one member suffer, all the members suffer with it" — 1 Corinthians 12:26
            </p>
          </div>

          {/* Requirements Notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-3">Requirements for Submission:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Camera className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Photographs</strong> - Clear images of the patient and condition</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Medical History</strong> - From onset to current status</span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span><strong>Financial Implication</strong> - Breakdown of medical management costs</span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Patient Information Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                    Patient Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient's Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name of the patient" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="patientAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient's Age</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 45" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="localChurch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local Church/Assembly *</FormLabel>
                        <FormControl>
                          <Input placeholder="Name and location of the patient's local church" {...field} />
                        </FormControl>
                        <FormDescription>
                          The patient's local church or assembly
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Medical Information Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                    Medical Information
                  </h2>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Kidney transplant needed for Brother John"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief, clear title for the aid request
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalCondition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Condition *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Briefly describe the medical condition..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical History (Onset to Current Status) *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide a detailed medical history from when the condition started to the current status. Include dates, treatments received, hospitals visited, doctors' diagnoses, etc."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Complete medical history from onset to current status
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Medical Status *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the current state of the patient's health and what treatment is currently needed..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgency Level *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select urgency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {urgencyLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Photographs Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                    Photographs *
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Upload clear photographs of the patient. You can upload up to 10 images. 
                    At least one photograph is required.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {uploadedImages.length < 10 && (
                      <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Upload</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                    Financial Implication
                  </h2>

                  <FormField
                    control={form.control}
                    name="goalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount Needed (₦) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 500000"
                            min="1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="financialBreakdown"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Financial Breakdown *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide a detailed breakdown of the financial implications of the medical management. Include costs for surgery, medication, hospital stay, follow-up care, etc."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed breakdown of the financial implications of the medical management
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                    Contact Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person's Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 08012345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <Input placeholder="City, State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <HandHeart className="w-5 h-5 mr-2" />
                        Submit Aid Request
                      </>
                    )}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    By submitting, you confirm that all information provided is accurate.
                    Your request will be reviewed within 24-48 hours.
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GetHelp;