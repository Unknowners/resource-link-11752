import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  role?: string;
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
      throw new Error("Only organization owners can create users");
    }

    const { email, password, firstName, lastName, company, role }: CreateUserRequest = await req.json();

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      throw new Error("Missing required fields");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Create admin client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create user with admin client
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        company: company || memberData.organization_id,
      }
    });

    if (createError) {
      console.error("Error creating user:", createError);
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    if (!newUser.user) {
      throw new Error("User creation failed");
    }

    console.log(`User created: ${newUser.user.id}`);

    // Add user to organization
    const { error: orgError } = await requestorClient
      .from('organization_members')
      .insert({
        user_id: newUser.user.id,
        organization_id: memberData.organization_id,
        role: role || 'member',
      });

    if (orgError) {
      console.error("Error adding to organization:", orgError);
      // Try to delete the user if org membership fails
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      throw new Error(`Failed to add user to organization: ${orgError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Користувача створено успішно",
        userId: newUser.user.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-user function:", error);
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
