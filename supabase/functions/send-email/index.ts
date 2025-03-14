
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// CORS headers
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
    const { to, subject, text, html } = await req.json();
    
    if (!to || !subject) {
      console.error("Missing required fields:", { to, subject });
      return new Response(
        JSON.stringify({ error: "Email recipient and subject are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending email to: ${to}, subject: ${subject}`);

    try {
      // Create a Supabase client with the Admin key
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      // Use the direct-email-send function to send the email
      const emailContent = html || `<p>${text || ""}</p>`;
      console.log("Email content:", emailContent.substring(0, 100) + "...");

      const { data, error: emailError } = await supabaseAdmin.functions.invoke("direct-email-send", {
        body: {
          to,
          subject,
          html: emailContent
        }
      });

      if (emailError) {
        throw emailError;
      }

      console.log("Email sent successfully:", data);

      // Return the same response as direct-email-send
      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (emailError: any) {
      console.error("Email sending failed:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("Unexpected error in send-email:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
