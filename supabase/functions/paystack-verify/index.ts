import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("Paystack secret key not configured");
    }

    const { reference } = await req.json();

    if (!reference) {
      throw new Error("Transaction reference is required");
    }

    // Verify transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      throw new Error("Payment verification failed");
    }

    const transaction = data.data;
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Record the donation
    const { error: donationError } = await supabase.from("donations").insert({
      amount: transaction.amount / 100, // Convert from kobo to Naira
      donor_email: transaction.customer.email,
      donor_name: transaction.metadata?.donor_name || null,
      is_recurring: transaction.metadata?.donation_type === "monthly",
      is_anonymous: false,
      status: "completed",
      cause_id: null,
      user_id: transaction.metadata?.user_id || null,
    });

    if (donationError) {
      console.error("Error recording donation:", donationError);
    }

    // Log activity if user_id exists
    if (transaction.metadata?.user_id) {
      await supabase.from("activity_log").insert({
        user_id: transaction.metadata.user_id,
        action: "donation",
        details: {
          amount: transaction.amount / 100,
          type: "general_fund",
          payment_method: "paystack",
          is_recurring: transaction.metadata?.donation_type === "monthly",
          reference: reference,
        },
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verified successfully",
        amount: transaction.amount / 100,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Paystack verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
