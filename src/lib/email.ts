import { supabase } from "@/integrations/supabase/client";

type EmailType = "welcome" | "donation" | "approval" | "admin_message" | "signup_confirmation";

interface EmailData {
  name?: string;
  amount?: number;
  caseName?: string;
  message?: string;
  subject?: string;
}

export const sendEmail = async (
  type: EmailType,
  to: string,
  data: EmailData = {}
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: response, error } = await supabase.functions.invoke("send-email", {
      body: { type, to, data },
    });

    if (error) {
      console.error("Email sending error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Email sending failed:", err);
    return { success: false, error: err.message };
  }
};

// Convenience functions for specific email types
export const sendWelcomeEmail = (to: string, name: string) =>
  sendEmail("welcome", to, { name });

export const sendDonationEmail = (to: string, name: string, amount: number, caseName?: string) =>
  sendEmail("donation", to, { name, amount, caseName });

export const sendApprovalEmail = (to: string, name: string) =>
  sendEmail("approval", to, { name });

export const sendAdminMessage = (to: string, name: string, subject: string, message: string) =>
  sendEmail("admin_message", to, { name, subject, message });
