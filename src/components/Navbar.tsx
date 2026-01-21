import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, HandHeart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "How It Works", path: "/about#how-it-works" },
  { name: "Request Help", path: "/get-help" },
  { name: "Support/Donate", path: "/donate" },
  { name: "Active Cases", path: "/cases" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "py-2 backdrop-blur-2xl bg-background/80 border-b border-border/50 shadow-lg shadow-primary/5"
          : "py-4 backdrop-blur-xl bg-white/60"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 group relative"
          >
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-gradient-hero rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              <img
                src={logo}
                alt="BFMAF Logo"
                className={cn(
                  "relative object-contain transition-all duration-300 group-hover:scale-105",
                  scrolled ? "h-9 sm:h-10" : "h-10 sm:h-12"
                )}
              />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "font-serif font-bold text-foreground leading-tight transition-all duration-300",
                scrolled ? "text-sm sm:text-base" : "text-base sm:text-lg"
              )}>
                <span className="hidden sm:inline">Bride Family Medical Aid</span>
                <span className="sm:hidden">BFMAF</span>
              </span>
              <span className={cn(
                "text-muted-foreground leading-tight hidden sm:block transition-all duration-300",
                scrolled ? "text-[10px]" : "text-xs"
              )}>
                Foundation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 bg-secondary/50 backdrop-blur-sm rounded-full px-2 py-1.5 border border-border/30">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300",
                    location.pathname === link.path
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/60"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-secondary hover:text-primary transition-all duration-300"
              >
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/get-help">
              <Button
                variant="accent"
                size="default"
                className="rounded-full shadow-accent hover:shadow-lg hover:scale-105 transition-all duration-300 group"
              >
                <HandHeart className="w-4 h-4 group-hover:animate-pulse" />
                Get Help
                <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "md:hidden p-2.5 rounded-xl transition-all duration-300",
              isOpen
                ? "bg-primary text-primary-foreground rotate-90"
                : "bg-secondary/80 hover:bg-secondary text-foreground"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-500 ease-out",
            isOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
          )}
        >
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 p-4 shadow-lg">
            <div className="flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-between group",
                    location.pathname === link.path
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span>{link.name}</span>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-all duration-300",
                      location.pathname === link.path
                        ? "opacity-100"
                        : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                    )}
                  />
                </Link>
              ))}
            </div>

            <div className="h-px bg-border/50 my-4" />

            <Link to="/profile" onClick={() => setIsOpen(false)} className="block">
              <Button variant="outline" className="w-full rounded-xl h-12">
                <User className="w-4 h-4" />
                Profile
              </Button>
            </Link>

            <Link to="/get-help" onClick={() => setIsOpen(false)} className="block mt-3">
              <Button variant="accent" className="w-full rounded-xl h-12 shadow-accent">
                <HandHeart className="w-4 h-4" />
                Get Help
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;