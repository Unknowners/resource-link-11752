import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserRequest {
  userId: string;
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

    // Get requestor's organization
    const { data: memberData, error: memberError } = await requestorClient
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', requestor.id)
      .single();

    if (memberError || !memberData) {
      throw new Error("Organization not found");
    }

    // Check if requestor is owner
    if (memberData.role !== 'owner') {
      throw new Error("Only organization owners can delete users");
    }

    const { userId }: DeleteUserRequest = await req.json();

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Verify that the user to be deleted is in the same organization
    const { data: targetMember, error: targetError } = await requestorClient
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
      .eq('organization_id', memberData.organization_id)
      .maybeSingle();

    if (targetError) {
      throw new Error("Error verifying user membership");
    }

    if (!targetMember) {
      throw new Error("User is not a member of your organization");
    }

    // Prevent owner from deleting themselves
    if (userId === requestor.id) {
      throw new Error("You cannot delete your own account");
    }

    // Create admin client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Delete user from Auth (this will cascade delete from organization_members due to foreign key)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      throw new Error(`Failed to delete user: ${deleteError.message}`);
    }

    console.log(`User ${userId} deleted successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Користувача видалено повністю",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in delete-user function:", error);
    
    let status = 500;
    let message = error.message;
    
    if (error.message?.includes("No authorization header") || error.message?.includes("Unauthorized")) {
      status = 401;
      message = "Не авторизовано";
    } else if (error.message?.includes("Organization not found")) {
      status = 404;
      message = "Організацію не знайдено";
    } else if (error.message?.includes("Only organization owners")) {
      status = 403;
      message = "Тільки власники організації можуть видаляти користувачів";
    } else if (error.message?.includes("User ID is required")) {
      status = 400;
      message = "ID користувача обов'язкове";
    } else if (error.message?.includes("not a member of your organization")) {
      status = 403;
      message = "Користувач не є членом вашої організації";
    } else if (error.message?.includes("cannot delete your own account")) {
      status = 403;
      message = "Ви не можете видалити власний обліковий запис";
    }
    
    return new Response(
      JSON.stringify({
        error: message,
        success: false,
      }),
      {
        status: status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
