
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
    const { email, code, newPassword } = await req.json();
    
    if (!email || !code || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Email, code, and new password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Verifying reset code for email: ${email}`);

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

      // For development testing, accept "123456" as a valid code
      if (code === "123456") {
        console.log("Using development test code: 123456");
        
        // Get the user to update their password
        const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
          filters: { email: email }
        });

        if (getUserError || !userData.users || userData.users.length === 0) {
          throw new Error("User not found");
        }

        const userId = userData.users[0].id;
        
        // Update the user's password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { password: newPassword }
        );

        if (updateError) {
          throw updateError;
        }

        console.log("Password updated successfully with test code");

        // Return success response
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Password reset successfully using test code",
            note: "This is a development environment override"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get the user
      const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
        filters: { email: email }
      });

      if (getUserError || !userData.users || userData.users.length === 0) {
        throw new Error("User not found");
      }

      const user = userData.users[0];
      const userId = user.id;
      
      // Verify the reset code
      const storedCode = user.app_metadata?.reset_code;
      const expiresAt = user.app_metadata?.reset_code_expires_at;
      
      console.log("Stored code:", storedCode);
      console.log("Submitted code:", code);
      console.log("Expires at:", expiresAt);
      
      if (!storedCode || storedCode !== code) {
        return new Response(
          JSON.stringify({ error: "Invalid verification code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (expiresAt && new Date(expiresAt) < new Date()) {
        return new Response(
          JSON.stringify({ error: "Verification code has expired" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Clear the reset code
      const { error: clearError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          app_metadata: {
            reset_code: null,
            reset_code_expires_at: null
          }
        }
      );

      if (clearError) {
        console.error("Error clearing reset code:", clearError);
        // Don't fail the process if clearing the code fails
      }

      // Update the user's password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (updateError) {
        throw updateError;
      }

      console.log("Password reset successfully");

      // Return success response
      return new Response(
        JSON.stringify({ success: true, message: "Password reset successfully" }),
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
    console.error("Unexpected error in verify-reset-code:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
