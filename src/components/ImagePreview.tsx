import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { getSignedUrl } from "@/lib/storage";

interface ImagePreviewProps {
  filePath: string;
  index: number;
  onRemove: (index: number) => void;
  className?: string;
}

/**
 * Displays a secure image preview using signed URLs
 */
const ImagePreview = ({ filePath, index, onRemove, className = "" }: ImagePreviewProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSignedUrl = async () => {
      setLoading(true);
      try {
        // If it's already a full URL or blob URL, use it directly
        if (filePath.startsWith("http") || filePath.startsWith("blob:")) {
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

  return (
    <div className={`relative group ${className}`}>
      {loading ? (
        <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : signedUrl ? (
        <img
          src={signedUrl}
          alt={`Upload ${index + 1}`}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
          <span className="text-xs text-muted-foreground">Image unavailable</span>
        </div>
      )}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ImagePreview;