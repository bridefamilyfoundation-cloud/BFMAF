import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "welcome" | "donation" | "approval" | "admin_message" | "signup_confirmation";
  to: string;
  data: {
    name?: string;
    amount?: number;
    caseName?: string;
    message?: string;
    subject?: string;
  };
}

const getEmailContent = (type: string, data: EmailRequest["data"]) => {
  const orgName = "Bride Family Medical Aid Foundation";
  const tagline = "BFMAF";
  
  const baseStyles = `
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
      .header h1 { margin: 0; font-size: 24px; }
      .header p { margin: 10px 0 0; opacity: 0.9; }
      .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
      .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; }
      .button { display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
      .highlight { background: #f0fdfa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #14b8a6; }
      .amount { font-size: 28px; font-weight: bold; color: #0d9488; }
    </style>
  `;

  switch (type) {
    case "welcome":
      return {
        subject: `Welcome to ${orgName}!`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>${tagline}</h1>
              <p>${orgName}</p>
            </div>
            <div class="content">
              <h2>Welcome, ${data.name || "Friend"}! 🎉</h2>
              <p>Thank you for joining our community. We're thrilled to have you as part of our mission to support those in need.</p>
              <div class="highlight">
                <p><strong>Your account is pending approval.</strong></p>
                <p>An administrator will review your registration shortly. You'll receive an email once your account is approved.</p>
              </div>
              <p>While you wait, feel free to explore our active cases and learn more about the lives you can help transform.</p>
              <p>In the meantime, we encourage you to:</p>
              <ul>
                <li>Browse our active medical cases</li>
                <li>Learn about our mission and values</li>
                <li>Connect with our community</li>
              </ul>
              <p><em>"And whether one member suffer, all the members suffer with it."</em> - 1 Corinthians 12:26</p>
            </div>
            <div class="footer">
              <p>With love and gratitude,<br><strong>The ${tagline} Team</strong></p>
            </div>
          </div>
        `,
      };

    case "signup_confirmation":
      return {
        subject: `Confirm your email - ${orgName}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>${tagline}</h1>
              <p>${orgName}</p>
            </div>
            <div class="content">
              <h2>Confirm Your Email Address</h2>
              <p>Hello ${data.name || "there"},</p>
              <p>Thank you for signing up with ${orgName}. Please confirm your email address to complete your registration.</p>
              <div class="highlight">
                <p>Once confirmed, your account will be reviewed by our team for approval.</p>
              </div>
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br><strong>The ${tagline} Team</strong></p>
            </div>
          </div>
        `,
      };

    case "donation":
      return {
        subject: `Thank you for your donation! - ${orgName}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>Thank You! 💝</h1>
              <p>${orgName}</p>
            </div>
            <div class="content">
              <h2>Dear ${data.name || "Generous Donor"},</h2>
              <p>Your heart of compassion has made a real difference today!</p>
              <div class="highlight">
                <p>Donation Amount:</p>
                <p class="amount">₦${data.amount?.toLocaleString() || "0"}</p>
                ${data.caseName ? `<p>Supporting: <strong>${data.caseName}</strong></p>` : ""}
              </div>
              <p>Your generous contribution will directly help someone in need of medical assistance. Every Naira counts in our mission to bring healing and hope.</p>
              <p>Because of donors like you, we can continue to:</p>
              <ul>
                <li>Provide medical aid to those who cannot afford it</li>
                <li>Support families during their most challenging times</li>
                <li>Bring hope and healing to our community</li>
              </ul>
              <p>May God bless you abundantly for your kindness.</p>
            </div>
            <div class="footer">
              <p>With heartfelt gratitude,<br><strong>The ${tagline} Team</strong></p>
            </div>
          </div>
        `,
      };

    case "approval":
      return {
        subject: `Your account has been approved! - ${orgName}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>Account Approved! ✅</h1>
              <p>${orgName}</p>
            </div>
            <div class="content">
              <h2>Great news, ${data.name || "Friend"}!</h2>
              <p>Your account has been approved by our administrators. You now have full access to all features on our platform.</p>
              <div class="highlight">
                <p><strong>You can now:</strong></p>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Make donations to active cases</li>
                  <li>Track your donation history</li>
                  <li>Submit aid requests if needed</li>
                  <li>Connect with our community</li>
                </ul>
              </div>
              <p>We're excited to have you as an active member of our community. Together, we can make a difference in the lives of those who need it most.</p>
            </div>
            <div class="footer">
              <p>Welcome to the family!<br><strong>The ${tagline} Team</strong></p>
            </div>
          </div>
        `,
      };

    case "admin_message":
      return {
        subject: data.subject || `Message from ${orgName}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>${tagline}</h1>
              <p>${orgName}</p>
            </div>
            <div class="content">
              <h2>Hello ${data.name || "there"},</h2>
              <div class="highlight">
                ${data.message || "You have a new message from the administrator."}
              </div>
              <p>If you have any questions, please don't hesitate to reach out to us.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br><strong>The ${tagline} Team</strong></p>
            </div>
          </div>
        `,
      };

    default:
      return {
        subject: `Notification from ${orgName}`,
        html: `<p>You have a new notification from ${orgName}.</p>`,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, type" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailContent = getEmailContent(type, data);

    const emailResponse = await resend.emails.send({
      from: "BFMAF <onboarding@resend.dev>",
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
