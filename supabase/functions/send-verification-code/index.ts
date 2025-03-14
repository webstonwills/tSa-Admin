
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
      console.error("Missing email in request body");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing verification code request for email: ${email}`);

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

      // Generate a 6-digit code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Generated reset code: ${resetCode}`);

      // Check if the user exists
      const { data: existingUsers, error: findUserError } = await supabaseAdmin.auth.admin.listUsers({
        filters: {
          email: email
        }
      });

      if (findUserError) {
        throw findUserError;
      }

      if (!existingUsers.users || existingUsers.users.length === 0) {
        // We don't want to reveal if the email exists or not for security reasons
        console.log("User not found, but returning success for security");
        return new Response(
          JSON.stringify({ success: true, message: "If the email exists, a verification code has been sent" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userId = existingUsers.users[0].id;
      console.log(`User found with ID: ${userId}`);

      // Store the code in the user's metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          app_metadata: {
            reset_code: resetCode,
            reset_code_expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
          }
        }
      );

      if (updateError) {
        throw updateError;
      }

      console.log("Reset code stored successfully, now sending email");

      // Send the email with the verification code
      const { error: emailError } = await supabaseAdmin.functions.invoke("send-email", {
        body: {
          to: email,
          subject: "Your Password Reset Code",
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
        throw emailError;
      }

      console.log("Verification email sent successfully");

      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Verification code sent successfully",
          // Include this for development testing
          note: "For testing purposes, the verification code is: 123456"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (functionError: any) {
      console.error("Function error:", functionError);
      return new Response(
        JSON.stringify({ error: functionError.message || "Function error occurred" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("Unexpected error in send-verification-code:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
