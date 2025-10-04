import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  userId: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Authenticate the requester
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const requestorClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: requestor }, error: authError } = await requestorClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !requestor) {
      throw new Error("Unauthorized");
    }

    // Get requestor's organization and role
    const { data: requestorMember, error: memberError } = await requestorClient
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', requestor.id)
      .single();

    if (memberError || !requestorMember) {
      throw new Error("Organization not found");
    }

    // Check if requestor is owner
    if (requestorMember.role !== 'owner') {
      throw new Error("Only organization owners can reset passwords");
    }

    const { userId, newPassword }: ResetPasswordRequest = await req.json();

    if (!userId || !newPassword) {
      throw new Error("Missing required fields");
    }

    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Verify target user is in the same organization
    const { data: targetMember } = await requestorClient
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
      .eq('organization_id', requestorMember.organization_id)
      .single();

    if (!targetMember) {
      throw new Error("User not found in your organization");
    }

    // Create admin client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Update user password
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      throw new Error(`Failed to update password: ${updateError.message}`);
    }

    console.log(`Password updated for user: ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Пароль успішно змінено",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in reset-user-password function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
