import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/about": "About Us",
  "/cases": "Active Cases",
  "/contact": "Contact",
  "/donate": "Support/Donate",
  "/get-help": "Request Help",
  "/profile": "Profile",
  "/activity": "Activity",
  "/admin": "Admin",
  "/auth": "Sign In",
};

interface BreadcrumbsProps {
  customTitle?: string;
}

const Breadcrumbs = ({ customTitle }: BreadcrumbsProps) => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on home page
  if (location.pathname === "/") return null;

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;
    
    // For the last segment, use customTitle if provided (for dynamic pages)
    const label = isLast && customTitle 
      ? customTitle 
      : routeLabels[path] || segment.charAt(0).toUpperCase() + segment.slice(1);

    return { path, label, isLast };
  });

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://bfmaf.lovable.app/",
      },
      ...breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: `https://bfmaf.lovable.app${item.path}`,
      })),
    ],
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <Home className="w-4 h-4" />
                <span className="sr-only sm:not-sr-only">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {breadcrumbItems.map((item) => (
            <BreadcrumbItem key={item.path}>
              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </BreadcrumbSeparator>
              {item.isLast ? (
                <BreadcrumbPage className="text-foreground font-medium">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.path} className="text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
};

export default Breadcrumbs;
