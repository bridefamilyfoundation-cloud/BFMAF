import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, CheckCircle, Heart } from "lucide-react";
import FloatingBackground from "@/components/FloatingBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sendWelcomeEmail } from "@/lib/email";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/profile");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/profile");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } catch (error: unknown) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: "https://bfmaf.com/auth",
          data: {
            first_name: signupData.firstName,
            last_name: signupData.lastName,
          },
        },
      });

      if (error) throw error;

      // Create profile for the new user
      if (data.user) {
        await supabase.from("profiles").insert({
          user_id: data.user.id,
          first_name: signupData.firstName,
          last_name: signupData.lastName,
          email: signupData.email,
        });

        // Send welcome email
        const fullName = `${signupData.firstName} ${signupData.lastName}`.trim();
        sendWelcomeEmail(signupData.email, fullName).catch(console.error);
      }

      // Show success state and switch to login tab after delay
      setSignupSuccess(true);
      toast({
        title: "Registration Successful!",
        description: "Please check your email to confirm your account, then login.",
      });

      // Clear form and switch to login tab after 3 seconds
      setTimeout(() => {
        setSignupData({ email: "", password: "", firstName: "", lastName: "" });
        setSignupSuccess(false);
        setActiveTab("login");
      }, 3000);
      
    } catch (error: unknown) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <FloatingBackground />

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <Heart className="w-8 h-8 text-primary" />
          <span className="text-xl font-serif font-bold text-foreground">
            Bride Family <span className="text-gradient-primary">Medical Aid</span>
          </span>
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
            Welcome to <span className="text-gradient-primary">BFMAF</span>
          </h1>
          <p className="text-muted-foreground">
            Join our community of compassion
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-hero text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              {signupSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Registration Successful!</h3>
                  <p className="text-muted-foreground">
                    A confirmation email has been sent to your email address. 
                    Please verify your email to complete registration.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to login...
                  </p>
                </div>
              ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="first-name"
                        placeholder="John"
                        className="pl-10"
                        value={signupData.firstName}
                        onChange={(e) =>
                          setSignupData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Doe"
                      value={signupData.lastName}
                      onChange={(e) =>
                        setSignupData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-hero text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Auth;
