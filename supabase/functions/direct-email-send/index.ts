
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { to, subject, html } = await req.json();
    
    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: "Email recipient and subject are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending direct email to: ${to}, subject: ${subject}`);

    // Here we'll send the email directly to the user via Supabase Auth API
    // Since we can't directly use other providers due to limitations in this project,
    // we'll use Supabase's built-in email sending capabilities
    
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      
      // For now, we'll just simulate success for development purposes
      // But we log details for debugging
      console.log("Email to:", to);
      console.log("Subject:", subject);
      console.log("HTML content:", html ? html.substring(0, 100) + "..." : "No HTML content");
      
      // In production, this would actually send an email through Supabase or another provider
      
      // Return success with a special note for testing
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email simulation successful. In a production environment, the email would be sent.",
          note: "For testing purposes, the verification code is: 123456" 
        }),
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
    console.error("Unexpected error in direct-email-send:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
