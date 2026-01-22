import { supabase } from "@/integrations/supabase/client";

// Cache for signed URLs to avoid repeated requests
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Get a signed URL for a storage file
 * Uses caching to minimize API calls
 */
export async function getSignedUrl(
  filePath: string,
  bucket: string = "aid-request-images",
  expiresIn: number = 3600 // 1 hour default
): Promise<string | null> {
  if (!filePath) return null;
  
  // Check if we have a cached URL that's still valid (with 5 min buffer)
  const cacheKey = `${bucket}:${filePath}`;
  const cached = signedUrlCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 300000) {
    return cached.url;
  }

  try {
    const { data, error } = await supabase.functions.invoke("get-signed-url", {
      body: { filePath, bucket, expiresIn },
    });

    if (error) {
      console.error("Error getting signed URL:", error);
      return null;
    }

    if (data?.signedUrl) {
      // Cache the URL
      signedUrlCache.set(cacheKey, {
        url: data.signedUrl,
        expiresAt: Date.now() + (expiresIn * 1000),
      });
      return data.signedUrl;
    }

    return null;
  } catch (error) {
    console.error("Error in getSignedUrl:", error);
    return null;
  }
}

/**
 * Get signed URLs for multiple file paths
 */
export async function getSignedUrls(
  filePaths: string[],
  bucket: string = "aid-request-images",
  expiresIn: number = 3600
): Promise<(string | null)[]> {
  return Promise.all(
    filePaths.map((path) => getSignedUrl(path, bucket, expiresIn))
  );
}

/**
 * Check if the current user is an admin (can access storage directly)
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    return !!roleData;
  } catch {
    return false;
  }
}

/**
 * Upload a file and return the file path (not URL)
 * The path can be used to generate signed URLs later
 */
export async function uploadFile(
  file: File,
  bucket: string = "aid-request-images"
): Promise<{ path: string; error: Error | null }> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    return { path: "", error };
  }

  return { path: fileName, error: null };
}