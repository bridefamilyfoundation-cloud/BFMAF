import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X, HandHeart, CheckCircle } from "lucide-react";
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

const categories = ["Education", "Healthcare", "Emergency", "Community", "General"];
const urgencyLevels = [
  { value: "low", label: "Low - Can wait a few weeks" },
  { value: "medium", label: "Medium - Need help within a week" },
  { value: "high", label: "High - Urgent, need help immediately" },
];

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(50, "Please provide a detailed description (at least 50 characters)").max(2000, "Description must be less than 2000 characters"),
  category: z.string().min(1, "Please select a category"),
  goalAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Please enter a valid amount"),
  urgency: z.string().min(1, "Please select urgency level"),
  contactName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().optional(),
  location: z.string().optional(),
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
      title: "",
      description: "",
      category: "",
      goalAmount: "",
      urgency: "medium",
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
        // Pre-fill user info if logged in
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

    if (uploadedImages.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images",
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

      const { error: uploadError, data } = await supabase.storage
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
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("aid_requests").insert({
        user_id: user?.id || null,
        title: values.title,
        description: values.description,
        category: values.category,
        goal_amount: Number(values.goalAmount),
        urgency: values.urgency,
        contact_name: values.contactName,
        contact_email: values.contactEmail,
        contact_phone: values.contactPhone || null,
        location: values.location || null,
        image_urls: uploadedImages,
        status: "pending",
      });

      if (error) throw error;

      // Log the activity
      await supabase.from("activity_log").insert({
        user_id: user?.id || null,
        action: "aid_request_submitted",
        details: { title: values.title, category: values.category },
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
                Thank you for submitting your aid request. Our team will review it
                and get back to you within 24-48 hours. Once approved, your case
                will be visible on our platform for donors to support.
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
              Request <span className="text-gradient-primary">Aid</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tell us about your situation and how we can help. All requests are
              reviewed by our team before being published.
            </p>
          </div>

          {/* Form */}
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Case Details Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                    Case Details
                  </h2>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Case Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Help for medical expenses"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief, clear title for your aid request
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your situation in detail. Include what happened, why you need help, and how the funds will be used..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide as much detail as possible to help donors understand your situation
                        </FormDescription>
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
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
                      name="goalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount Needed ($) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              min="1"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency Level *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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

                {/* Images Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                    Supporting Images (Optional)
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Upload up to 5 images that help illustrate your situation. Images help donors connect with your story.
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

                    {uploadedImages.length < 5 && (
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
                          <FormLabel>Full Name *</FormLabel>
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
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              {...field}
                            />
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
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 000-0000" {...field} />
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
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, State/Country" {...field} />
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
                    By submitting, you agree that all information provided is accurate.
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