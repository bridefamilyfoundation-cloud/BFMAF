import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "welcome" | "donation" | "approval" | "admin_message" | "signup_confirmation" | "contact_notification" | "contact_response";
  to: string;
  data: {
    name?: string;
    amount?: number;
    caseName?: string;
    message?: string;
    subject?: string;
    email?: string;
    originalMessage?: string;
    response?: string;
    confirmationUrl?: string;
  };
}

const getEmailContent = (type: string, data: EmailRequest["data"]) => {
  const orgName = "Bride Family Medical Aid Foundation";
  const tagline = "BFMAF";
  const siteUrl = "https://bfmaf.com";
  
  switch (type) {
    case "welcome":
      return {
        subject: `${tagline} WELCOMES YOU!! 🎉`,
        html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Welcome to BFMAF</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background-color:#4f46e5; padding:24px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">
                  ${orgName.toUpperCase()} (${tagline}) WELCOMES YOU!! 🎉
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px; color:#333333;">
                <h2 style="margin-top:0; font-size:20px;">
                  Welcome, ${data.name || "Friend"}!
                </h2>

                <p style="font-size:15px; line-height:1.6; margin:16px 0;">
                  Thank you for joining our community. We're thrilled to have you as part of our mission to support those in need.
                </p>

                <div style="background-color:#f0f9ff; border-left:4px solid #4f46e5; padding:16px; margin:24px 0;">
                  <p style="margin:0; font-size:14px;"><strong>Your account is pending approval.</strong></p>
                  <p style="margin:8px 0 0; font-size:14px;">An administrator will review your registration shortly. You'll receive an email once your account is approved.</p>
                </div>

                <p style="font-size:15px; line-height:1.6;">
                  While you wait, feel free to explore our active cases and learn more about the lives you can help transform.
                </p>

                <div style="text-align:center; margin:32px 0;">
                  <a
                    href="${siteUrl}/cases"
                    style="
                      background-color:#4f46e5;
                      color:#ffffff;
                      text-decoration:none;
                      padding:14px 28px;
                      border-radius:6px;
                      font-size:16px;
                      font-weight:bold;
                      display:inline-block;
                    "
                  >
                    View Active Cases
                  </a>
                </div>

                <p style="font-size:14px; font-style:italic; color:#555555; margin-top:24px;">
                  "And whether one member suffer, all the members suffer with it." - 1 Corinthians 12:26
                </p>

                <p style="font-size:14px; color:#555555; margin-top:24px;">
                  Shalom!<br />
                  <strong>The ${tagline} Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f4f6f8; padding:16px; text-align:center; font-size:12px; color:#888888;">
                © ${new Date().getFullYear()} ${tagline}. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
        `,
      };

    case "signup_confirmation":
      return {
        subject: `Confirm Your Email - ${tagline}`,
        html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Confirm Your Email</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background-color:#4f46e5; padding:24px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">
                   ${orgName.toUpperCase()} (${tagline}) WELCOMES YOU!! 🎉
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px; color:#333333;">
                <h2 style="margin-top:0; font-size:20px;">
                  Verify Your Email
                </h2>

                <p style="font-size:15px; line-height:1.6; margin:16px 0;">
                  Thanks for signing up! We're excited to have you with us.
                  To get started, please confirm your email address by clicking
                  the button below.
                </p>

                <div style="text-align:center; margin:32px 0;">
                  <a
                    href="${data.confirmationUrl || siteUrl}"
                    style="
                      background-color:#4f46e5;
                      color:#ffffff;
                      text-decoration:none;
                      padding:14px 28px;
                      border-radius:6px;
                      font-size:16px;
                      font-weight:bold;
                      display:inline-block;
                    "
                  >
                    Confirm my email
                  </a>
                </div>

                <p style="font-size:14px; line-height:1.6; color:#555555;">
                  If you didn't create an account, you can safely ignore this email.
                </p>

                <p style="font-size:14px; color:#555555; margin-top:24px;">
                  Shalom!<br />
                  <strong>${tagline}</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f4f6f8; padding:16px; text-align:center; font-size:12px; color:#888888;">
                © ${new Date().getFullYear()} ${tagline}. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
        `,
      };

    case "donation":
      return {
        subject: `Thank you for your donation! - ${tagline}`,
        html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Donation Receipt</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background-color:#4f46e5; padding:24px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">
                  Thank You For Your Generosity! 💝
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px; color:#333333;">
                <h2 style="margin-top:0; font-size:20px;">
                  Dear ${data.name || "Generous Donor"},
                </h2>

                <p style="font-size:15px; line-height:1.6; margin:16px 0;">
                  Your heart of compassion has made a real difference today!
                </p>

                <div style="background-color:#f0f9ff; border-left:4px solid #4f46e5; padding:16px; margin:24px 0;">
                  <p style="margin:0; font-size:14px;"><strong>Donation Amount:</strong></p>
                  <p style="margin:8px 0 0; font-size:28px; font-weight:bold; color:#4f46e5;">₦${data.amount?.toLocaleString() || "0"}</p>
                  ${data.caseName ? `<p style="margin:8px 0 0; font-size:14px;">Supporting: <strong>${data.caseName}</strong></p>` : ""}
                </div>

                <p style="font-size:15px; line-height:1.6;">
                  Your generous contribution will directly help someone in need of medical assistance. Every Naira counts in our mission to bring healing and hope.
                </p>

                <p style="font-size:15px; line-height:1.6;">
                  Because of donors like you, we can continue to provide medical aid to those who cannot afford it, support families during their most challenging times, and bring hope and healing to our community.
                </p>

                <p style="font-size:15px; line-height:1.6;">
                  May God bless you abundantly for your kindness.
                </p>

                <p style="font-size:14px; color:#555555; margin-top:24px;">
                  With heartfelt gratitude,<br />
                  <strong>The ${tagline} Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f4f6f8; padding:16px; text-align:center; font-size:12px; color:#888888;">
                © ${new Date().getFullYear()} ${tagline}. All rights reserved.<br />
                <a href="${siteUrl}" style="color:#4f46e5; text-decoration:none;">Visit our website</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
        `,
      };

    case "approval":
      return {
        subject: `Your account has been approved! - ${tagline}`,
        html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Account Approved</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background-color:#4f46e5; padding:24px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">
                  Account Approved! ✅
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px; color:#333333;">
                <h2 style="margin-top:0; font-size:20px;">
                  Great news, ${data.name || "Friend"}!
                </h2>

                <p style="font-size:15px; line-height:1.6; margin:16px 0;">
                  Your account has been approved by our administrators. You now have full access to all features on our platform.
                </p>

                <div style="background-color:#f0f9ff; border-left:4px solid #4f46e5; padding:16px; margin:24px 0;">
                  <p style="margin:0 0 8px; font-size:14px;"><strong>You can now:</strong></p>
                  <ul style="margin:0; padding-left:20px; font-size:14px;">
                    <li>Make donations to active cases</li>
                    <li>Track your donation history</li>
                    <li>Submit aid requests if needed</li>
                    <li>Connect with our community</li>
                  </ul>
                </div>

                <div style="text-align:center; margin:32px 0;">
                  <a
                    href="${siteUrl}/auth"
                    style="
                      background-color:#4f46e5;
                      color:#ffffff;
                      text-decoration:none;
                      padding:14px 28px;
                      border-radius:6px;
                      font-size:16px;
                      font-weight:bold;
                      display:inline-block;
                    "
                  >
                    Login Now
                  </a>
                </div>

                <p style="font-size:15px; line-height:1.6;">
                  We're excited to have you as an active member of our community. Together, we can make a difference in the lives of those who need it most.
                </p>

                <p style="font-size:14px; color:#555555; margin-top:24px;">
                  Welcome to the family!<br />
                  <strong>The ${tagline} Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f4f6f8; padding:16px; text-align:center; font-size:12px; color:#888888;">
                © ${new Date().getFullYear()} ${tagline}. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
        `,
      };

    case "admin_message":
      return {
        subject: data.subject || `Message from ${tagline}`,
        html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Message from BFMAF</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background-color:#4f46e5; padding:24px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">
                  ${tagline}
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px; color:#333333;">
                <h2 style="margin-top:0; font-size:20px;">
                  Hello ${data.name || "there"},
                </h2>

                <div style="background-color:#f0f9ff; border-left:4px solid #4f46e5; padding:16px; margin:24px 0;">
                  <p style="margin:0; font-size:15px; line-height:1.6; white-space:pre-wrap;">${data.message || "You have a new message from the administrator."}</p>
                </div>

                <p style="font-size:14px; line-height:1.6; color:#555555;">
                  If you have any questions, please don't hesitate to reach out to us.
                </p>

                <p style="font-size:14px; color:#555555; margin-top:24px;">
                  Shalom!<br />
                  <strong>The ${tagline} Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f4f6f8; padding:16px; text-align:center; font-size:12px; color:#888888;">
                © ${new Date().getFullYear()} ${tagline}. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
        `,
      };

    case "contact_notification":
      return {
        subject: `New Contact Message: ${data.subject || "No Subject"}`,
        html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>New Contact Message</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background-color:#4f46e5; padding:24px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">
                  New Contact Message 📬
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px; color:#333333;">
                <h2 style="margin-top:0; font-size:20px;">
                  You have a new contact form submission
                </h2>

                <div style="background-color:#f0f9ff; border-left:4px solid #4f46e5; padding:16px; margin:24px 0;">
                  <p style="margin:0 0 8px; font-size:14px;"><strong>From:</strong> ${data.name || "Unknown"}</p>
                  <p style="margin:0 0 8px; font-size:14px;"><strong>Email:</strong> ${data.email || "No email"}</p>
                  <p style="margin:0; font-size:14px;"><strong>Subject:</strong> ${data.subject || "No subject"}</p>
                </div>

                <div style="background-color:#f9fafb; padding:16px; border-radius:8px; margin:24px 0;">
                  <p style="margin:0 0 8px; font-size:14px;"><strong>Message:</strong></p>
                  <p style="margin:0; font-size:14px; white-space:pre-wrap;">${data.message || "No message"}</p>
                </div>

                <div style="text-align:center; margin:32px 0;">
                  <a
                    href="${siteUrl}/admin"
                    style="
                      background-color:#4f46e5;
                      color:#ffffff;
                      text-decoration:none;
                      padding:14px 28px;
                      border-radius:6px;
                      font-size:16px;
                      font-weight:bold;
                      display:inline-block;
                    "
                  >
                    Go to Admin Dashboard
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f4f6f8; padding:16px; text-align:center; font-size:12px; color:#888888;">
                Admin Notification - ${tagline}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
        `,
      };

    case "contact_response":
      return {
        subject: `Re: ${data.subject || "Your message to " + tagline}`,
        html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Response from BFMAF</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background-color:#4f46e5; padding:24px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">
                  ${tagline}
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px; color:#333333;">
                <h2 style="margin-top:0; font-size:20px;">
                  Hello ${data.name || "there"},
                </h2>

                <p style="font-size:15px; line-height:1.6; margin:16px 0;">
                  Thank you for contacting us. Here is our response to your inquiry:
                </p>

                <div style="background-color:#f0f9ff; border-left:4px solid #4f46e5; padding:16px; margin:24px 0;">
                  <p style="margin:0; font-size:15px; line-height:1.6; white-space:pre-wrap;">${data.response || ""}</p>
                </div>

                ${data.originalMessage ? `
                <div style="background-color:#f9fafb; padding:16px; border-radius:8px; margin:24px 0; border-left:4px solid #e5e7eb;">
                  <p style="margin:0 0 8px; font-size:14px;"><strong>Your original message:</strong></p>
                  <p style="margin:0; font-size:14px; color:#6b7280; white-space:pre-wrap;">${data.originalMessage}</p>
                </div>
                ` : ""}

                <p style="font-size:14px; line-height:1.6; color:#555555;">
                  If you have any further questions, please don't hesitate to reach out again.
                </p>

                <div style="text-align:center; margin:32px 0;">
                  <a
                    href="${siteUrl}/contact"
                    style="
                      background-color:#4f46e5;
                      color:#ffffff;
                      text-decoration:none;
                      padding:14px 28px;
                      border-radius:6px;
                      font-size:16px;
                      font-weight:bold;
                      display:inline-block;
                    "
                  >
                    Contact Us Again
                  </a>
                </div>

                <p style="font-size:14px; color:#555555; margin-top:24px;">
                  Shalom!<br />
                  <strong>The ${tagline} Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f4f6f8; padding:16px; text-align:center; font-size:12px; color:#888888;">
                © ${new Date().getFullYear()} ${tagline}. All rights reserved.<br />
                <a href="${siteUrl}" style="color:#4f46e5; text-decoration:none;">Visit our website</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
        `,
      };

    default:
      return {
        subject: `Notification from ${tagline}`,
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

    // Use verified domain email - update this once domain is verified on Resend
    const fromEmail = "BFMAF <noreply@bfmaf.com>";

    const emailResponse = await resend.emails.send({
      from: fromEmail,
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
