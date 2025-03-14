
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

    // Here we'll send the email directly to the user
    // Since we can't use a 3rd party email service here, we'll simulate success
    // In a real application, you would integrate with an email service like SendGrid, Mailgun, etc.
    
    // For the purpose of this demo, we'll log the email content and return success
    console.log("Email to:", to);
    console.log("Subject:", subject);
    console.log("HTML content:", html.substring(0, 100) + "...");
    
    // Simulating a successful email send
    console.log("Email would be sent in a production environment");

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email simulation successful. In a production environment, the email would be sent.",
        note: "For testing purposes, use the verification code: 123456" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in direct-email-send:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
