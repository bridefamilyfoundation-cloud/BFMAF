import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sendDonationEmail = async (resend: any, email: string, name: string, amount: number, caseName?: string) => {
  const orgName = "Bride Family Medical Aid Foundation";
  const tagline = "BFMAF";
  
  try {
    await resend.emails.send({
      from: "BFMAF <onboarding@resend.dev>",
      to: [email],
      subject: `Thank you for your donation! - ${orgName}`,
      html: `
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; }
          .highlight { background: #f0fdfa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #14b8a6; }
          .amount { font-size: 28px; font-weight: bold; color: #0d9488; }
        </style>
        <div class="container">
          <div class="header">
            <h1>Thank You! 💝</h1>
            <p>${orgName}</p>
          </div>
          <div class="content">
            <h2>Dear ${name},</h2>
            <p>Your heart of compassion has made a real difference today!</p>
            <div class="highlight">
              <p>Donation Amount:</p>
              <p class="amount">₦${amount.toLocaleString()}</p>
              ${caseName ? `<p>Supporting: <strong>${caseName}</strong></p>` : ""}
            </div>
            <p>Your generous contribution will directly help someone in need of medical assistance. Every Naira counts in our mission to bring healing and hope.</p>
            <p>May God bless you abundantly for your kindness.</p>
          </div>
          <div class="footer">
            <p>With heartfelt gratitude,<br><strong>The ${tagline} Team</strong></p>
          </div>
        </div>
      `,
    });
    console.log("Donation thank you email sent to:", email);
  } catch (error) {
    console.error("Failed to send donation email:", error);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

    // Send donation thank you email
    if (RESEND_API_KEY && transaction.customer.email) {
      const resend = new Resend(RESEND_API_KEY);
      const donorName = transaction.metadata?.donor_name || "Generous Donor";
      const amount = transaction.amount / 100;
      await sendDonationEmail(resend, transaction.customer.email, donorName, amount);
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
