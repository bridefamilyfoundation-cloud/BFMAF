import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Camera, Heart, Calendar, TrendingUp, Edit2, Save, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

interface Donation {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  cause_title: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donationHistory, setDonationHistory] = useState<Donation[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    await fetchProfile(session.user.id);
    await fetchDonations(session.user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    if (data) {
      setProfile(data);
      setFormData({
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
      });
    }
  };

  const fetchDonations = async (userId: string) => {
    const { data, error } = await supabase
      .from("donations")
      .select(`
        id,
        amount,
        created_at,
        status,
        cause_id
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching donations:", error);
      return;
    }

    if (data) {
      // Fetch cause titles for each donation
      const donationsWithCauses = await Promise.all(
        data.map(async (donation) => {
          let causeTitle = "General Donation";
          if (donation.cause_id) {
            const { data: causeData } = await supabase
              .from("causes")
              .select("title")
              .eq("id", donation.cause_id)
              .maybeSingle();
            if (causeData) {
              causeTitle = causeData.title;
            }
          }
          return {
            id: donation.id,
            amount: Number(donation.amount),
            created_at: donation.created_at,
            status: donation.status,
            cause_title: causeTitle,
          };
        })
      );
      setDonationHistory(donationsWithCauses);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved.",
      });
      setIsEditing(false);
      setProfile({
        ...profile,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const totalDonated = donationHistory.reduce((sum, d) => sum + d.amount, 0);
  const causesSupported = new Set(donationHistory.map(d => d.cause_title)).size;
  const thisMonthDonations = donationHistory
    .filter(d => new Date(d.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, d) => sum + d.amount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <FloatingBackground />
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingBackground />
      <Navbar />

      <div className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Profile Header */}
          <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-card mb-6 sm:mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 items-center relative z-10">
              <div className="relative group">
                <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow">
                  <User className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-primary-foreground" />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-accent rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-foreground mb-1 sm:mb-2">
                  {formData.firstName} {formData.lastName}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4">{formData.email}</p>
                <div className="flex flex-wrap gap-2 sm:gap-4 justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span className="text-xs sm:text-sm font-medium text-primary">
                      ₦{totalDonated.toLocaleString()} donated
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/10 rounded-full">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                    <span className="text-xs sm:text-sm font-medium text-accent">
                      Member since {profile ? new Date(profile.created_at).getFullYear() : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button
                  variant={isEditing ? "hero" : "outline"}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={saving}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{saving ? "Saving..." : "Save Changes"}</span>
                      <span className="sm:hidden">{saving ? "..." : "Save"}</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </>
                  )}
                </Button>
                <Button variant="ghost" onClick={handleLogout} size="sm">
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6 sm:space-y-8">
            <TabsList className="w-full justify-start bg-card rounded-xl p-1.5 sm:p-2 shadow-card overflow-x-auto">
              <TabsTrigger value="overview" className="rounded-lg text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="donations" className="rounded-lg text-xs sm:text-sm">Donations</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg text-xs sm:text-sm">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 sm:space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Donated</p>
                      <p className="text-lg sm:text-2xl font-serif font-bold text-foreground">
                        ₦{totalDonated.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Causes Supported</p>
                      <p className="text-lg sm:text-2xl font-serif font-bold text-foreground">{causesSupported}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success/10 rounded-xl flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">This Month</p>
                      <p className="text-lg sm:text-2xl font-serif font-bold text-foreground">₦{thisMonthDonations.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="text-xl font-serif font-semibold text-foreground mb-6">
                  Recent Donations
                </h3>
                {donationHistory.length > 0 ? (
                  <div className="space-y-4">
                    {donationHistory.slice(0, 3).map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                      >
                        <div>
                          <p className="font-medium text-foreground">{donation.cause_title}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(donation.created_at)}</p>
                        </div>
                        <span className="font-semibold text-primary">
                          ${donation.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No donations yet.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="donations">
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="text-xl font-serif font-semibold text-foreground mb-6">
                  All Donations
                </h3>
                {donationHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cause</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donationHistory.map((donation) => (
                          <tr key={donation.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                            <td className="py-4 px-4 text-foreground">{donation.cause_title}</td>
                            <td className="py-4 px-4 font-semibold text-primary">${donation.amount.toLocaleString()}</td>
                            <td className="py-4 px-4 text-muted-foreground">{formatDate(donation.created_at)}</td>
                            <td className="py-4 px-4">
                              <span className="px-3 py-1 bg-success/10 text-success text-sm rounded-full capitalize">
                                {donation.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No donations yet.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h3 className="text-xl font-serif font-semibold text-foreground mb-6">
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;