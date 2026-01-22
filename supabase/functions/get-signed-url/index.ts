import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client for generating signed URLs
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { filePath, bucket = "aid-request-images", expiresIn = 3600 } = await req.json();

    if (!filePath) {
      return new Response(
        JSON.stringify({ error: "filePath is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the file name from the full URL if a full URL was provided
    let fileName = filePath;
    if (filePath.includes("/storage/v1/object/public/")) {
      // Extract filename from public URL
      const parts = filePath.split("/storage/v1/object/public/aid-request-images/");
      if (parts.length > 1) {
        fileName = parts[1];
      }
    } else if (filePath.includes("/object/public/aid-request-images/")) {
      const parts = filePath.split("/object/public/aid-request-images/");
      if (parts.length > 1) {
        fileName = parts[1];
      }
    }

    // Generate signed URL
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(fileName, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ signedUrl: data.signedUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in get-signed-url function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});