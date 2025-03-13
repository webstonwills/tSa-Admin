
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
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending verification code to: ${email}`);

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

    // Generate a 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated reset code: ${resetCode}`);

    // Store the code in the user's metadata
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      // First we need to get the user ID
      (await supabaseAdmin.auth.admin.listUsers({
        filters: {
          email: email
        }
      })).data.users[0]?.id || "",
      {
        app_metadata: {
          reset_code: resetCode,
          reset_code_expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
        }
      }
    );

    if (updateError) {
      console.error("Error storing reset code:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to store reset code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send the verification code email
    const { error: emailError } = await supabaseAdmin.functions.invoke("send-email", {
      body: {
        to: email,
        subject: "Your Password Reset Code",
        text: `Your verification code for password reset is: ${resetCode}\n\nThis code will expire in 1 hour.\n\nIf you did not request this code, please ignore this email.`,
        html: `
          <h2>Your Password Reset Code</h2>
          <p>Your verification code for password reset is:</p>
          <div style="margin: 24px 0; padding: 16px; background-color: #f4f4f4; border-radius: 4px; font-size: 24px; text-align: center; letter-spacing: 4px; font-weight: bold;">
            ${resetCode}
          </div>
          <p>This code will expire in 1 hour.</p>
          <p>If you did not request this code, please ignore this email.</p>
        `
      }
    });

    if (emailError) {
      console.error("Error sending verification email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send verification email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: "Verification code sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
