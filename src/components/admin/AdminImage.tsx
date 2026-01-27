import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getSignedUrl } from "@/lib/storage";

interface AdminImageProps {
  filePath: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Image component for admin that uses signed URLs
 */
const AdminImage = ({ filePath, alt, className = "", onClick }: AdminImageProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSignedUrl = async () => {
      setLoading(true);
      try {
        // If it's already a full URL with signed token, use it directly
        if (filePath.startsWith("http") && filePath.includes("token=")) {
          setSignedUrl(filePath);
        } else {
          const url = await getSignedUrl(filePath);
          setSignedUrl(url);
        }
      } catch (error) {
        console.error("Error loading image:", error);
        setSignedUrl(null);
      } finally {
        setLoading(false);
      }
    };

    loadSignedUrl();
  }, [filePath]);

  if (loading) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!signedUrl) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-xs text-muted-foreground">Unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      onClick={onClick}
    />
  );
};

export default AdminImage;