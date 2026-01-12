import { useState } from "react";
import { User, Mail, Phone, MapPin, Camera, Heart, Calendar, TrendingUp, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FloatingBackground from "@/components/FloatingBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const donationHistory = [
  { id: 1, cause: "Education for Rural Children", amount: 100, date: "2024-01-15", status: "completed" },
  { id: 2, cause: "Clean Water Initiative", amount: 50, date: "2024-01-10", status: "completed" },
  { id: 3, cause: "Emergency Relief Fund", amount: 250, date: "2023-12-28", status: "completed" },
  { id: 4, cause: "Healthcare Access Program", amount: 75, date: "2023-12-15", status: "completed" },
];

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (234) 567-890",
    address: "123 Charity Lane, Hope City, HC 12345",
  });

  const totalDonated = donationHistory.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingBackground />
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Profile Header */}
          <div className="bg-card rounded-3xl p-8 shadow-card mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-hero flex items-center justify-center shadow-glow">
                  <User className="w-16 h-16 text-primary-foreground" />
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-5 h-5 text-accent-foreground" />
                </button>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-muted-foreground mb-4">{profile.email}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <Heart className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      ${totalDonated.toLocaleString()} donated
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-accent">
                      Member since 2023
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant={isEditing ? "hero" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="w-full justify-start bg-card rounded-xl p-2 shadow-card">
              <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="donations" className="rounded-lg">Donation History</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg">Account Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Donated</p>
                      <p className="text-2xl font-serif font-bold text-foreground">
                        ${totalDonated.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Causes Supported</p>
                      <p className="text-2xl font-serif font-bold text-foreground">4</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-serif font-bold text-foreground">$150</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="text-xl font-serif font-semibold text-foreground mb-6">
                  Recent Donations
                </h3>
                <div className="space-y-4">
                  {donationHistory.slice(0, 3).map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                    >
                      <div>
                        <p className="font-medium text-foreground">{donation.cause}</p>
                        <p className="text-sm text-muted-foreground">{donation.date}</p>
                      </div>
                      <span className="font-semibold text-primary">
                        ${donation.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="donations">
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="text-xl font-serif font-semibold text-foreground mb-6">
                  All Donations
                </h3>
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
                          <td className="py-4 px-4 text-foreground">{donation.cause}</td>
                          <td className="py-4 px-4 font-semibold text-primary">${donation.amount}</td>
                          <td className="py-4 px-4 text-muted-foreground">{donation.date}</td>
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
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
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
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
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
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
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
                        value={profile.address}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
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
