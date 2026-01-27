import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";
import NewsletterSubscribe from "./NewsletterSubscribe";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-foreground text-primary-foreground relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-10 sm:py-16 relative z-10">
        {/* Newsletter Section */}
        <div className="bg-primary-foreground/5 rounded-2xl p-6 mb-12 border border-primary-foreground/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-serif font-semibold text-lg mb-1">Subscribe to Our Newsletter</h4>
              <p className="text-primary-foreground/70 text-sm">
                Stay updated on our cases, events, and ways you can help.
              </p>
            </div>
            <div className="md:w-96">
              <NewsletterSubscribe />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img 
                src={logo} 
                alt="BFMAF Logo" 
                className="h-14 w-auto object-contain bg-white/90 rounded-lg p-1"
              />
            </Link>
            <p className="text-primary-foreground/70 mb-4 text-sm italic">
              "{settings.scripture_text}"
            </p>
            <p className="text-primary-foreground/50 text-xs mb-6">— {settings.scripture_reference}</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-primary-foreground/70 hover:text-accent transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/70 hover:text-accent transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-primary-foreground/70 hover:text-accent transition-colors duration-300">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/cases" className="text-primary-foreground/70 hover:text-accent transition-colors duration-300">
                  Active Cases
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/70 hover:text-accent transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6">Get Involved</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/get-help" className="text-primary-foreground/70 hover:text-accent transition-colors duration-300">
                  Request Help
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-primary-foreground/70 hover:text-accent transition-colors duration-300">
                  Support / Donate
                </Link>
              </li>
              <li className="text-primary-foreground/70">🙏 Prayers</li>
              <li className="text-primary-foreground/70">👋 Visits</li>
              <li className="text-primary-foreground/70">📞 Calls to Encourage</li>
            </ul>
          </div>


          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-primary-foreground/70">
                  {settings.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <div className="flex flex-col">
                  {settings.phone1 && (
                    <a href={`tel:${settings.phone1}`} className="text-primary-foreground/70 hover:text-accent transition-colors">
                      {settings.phone1}
                    </a>
                  )}
                  {settings.phone2 && (
                    <a href={`tel:${settings.phone2}`} className="text-primary-foreground/70 hover:text-accent transition-colors">
                      {settings.phone2}
                    </a>
                  )}
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <a href={`mailto:${settings.email}`} className="text-primary-foreground/70 hover:text-accent transition-colors">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-primary-foreground/50 text-xs sm:text-sm">
            © {new Date().getFullYear()} {settings.organization_name}. All rights reserved.
          </p>
          <p className="text-primary-foreground/50 text-xs sm:text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-accent" /> for the Bride of Christ
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;