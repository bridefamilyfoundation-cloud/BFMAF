import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingBackground from "@/components/FloatingBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background relative">
      <SEO 
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Return to BFMAF homepage to find what you need."
        robots="noindex, nofollow"
      />
      <FloatingBackground />
      <Navbar />
      
      <main className="flex items-center justify-center min-h-[70vh] px-4 pt-24">
        <div className="text-center max-w-lg">
          <div className="text-8xl font-bold text-gradient-primary mb-4">404</div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/cases">
                <Search className="mr-2 h-4 w-4" />
                Browse Cases
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-8">
            Need help? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;