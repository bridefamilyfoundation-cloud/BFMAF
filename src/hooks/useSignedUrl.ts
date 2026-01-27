import { useState, useEffect } from "react";
import { getSignedUrl, getSignedUrls } from "@/lib/storage";

/**
 * Hook to get a signed URL for a single file
 */
export function useSignedUrl(
  filePath: string | null | undefined,
  fallbackUrl?: string
): { url: string | null; loading: boolean } {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filePath) {
      setUrl(fallbackUrl || null);
      return;
    }

    // If it's a full external URL (not storage), use as-is
    if (filePath.startsWith("http") && !filePath.includes("supabase.co/storage")) {
      setUrl(filePath);
      return;
    }

    // If it's a storage path (includes bucket name) or a filename, get signed URL
    // Filenames without path are assumed to be storage files

    setLoading(true);
    getSignedUrl(filePath)
      .then((signedUrl) => {
        setUrl(signedUrl || fallbackUrl || null);
      })
      .catch(() => {
        setUrl(fallbackUrl || null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filePath, fallbackUrl]);

  return { url, loading };
}

/**
 * Hook to get signed URLs for multiple files
 */
export function useSignedUrls(
  filePaths: string[] | null | undefined
): { urls: (string | null)[]; loading: boolean } {
  const [urls, setUrls] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!filePaths || filePaths.length === 0) {
      setUrls([]);
      return;
    }

    setLoading(true);
    getSignedUrls(filePaths)
      .then((signedUrls) => {
        setUrls(signedUrls);
      })
      .catch(() => {
        setUrls([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [JSON.stringify(filePaths)]);

  return { urls, loading };
}