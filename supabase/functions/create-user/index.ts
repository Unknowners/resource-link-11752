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

    // Try to create user with admin client
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

    let userId: string;
    let isExistingUser = false;

    // If user already exists, get their ID and add them to organization
    if (createError && createError.message?.includes("already been registered")) {
      console.log("User already exists, finding user by email:", email);
      
      // Get existing user by email
      const { data: existingUsers, error: listError } = await adminClient.auth.admin.listUsers();
      
      if (listError) {
        throw new Error(`Failed to find existing user: ${listError.message}`);
      }

      const existingUser = existingUsers.users.find(u => u.email === email);
      
      if (!existingUser) {
        throw new Error("Користувач існує, але не знайдено в системі");
      }

      userId = existingUser.id;
      isExistingUser = true;
      console.log(`Found existing user: ${userId}`);

      // Update user profile with new data
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            company: company || memberData.organization_id,
          }
        }
      );

      if (updateError) {
        console.error("Error updating user profile:", updateError);
      }

      // If password is provided, update it
      if (password) {
        const { error: passwordError } = await adminClient.auth.admin.updateUserById(
          userId,
          { password }
        );
        
        if (passwordError) {
          console.error("Error updating password:", passwordError);
        } else {
          console.log("Password updated for existing user");
        }
      }

    } else if (createError) {
      // Other creation errors
      console.error("Error creating user:", createError);
      const status = createError.status || 500;
      
      return new Response(
        JSON.stringify({
          error: createError.message,
          success: false,
        }),
        {
          status: status,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      // User successfully created
      if (!newUser.user) {
        throw new Error("User creation failed");
      }
      userId = newUser.user.id;
      console.log(`New user created: ${userId}`);
    }

    // Check if user is already in the organization
    const { data: existingMember } = await requestorClient
      .from('organization_members')
      .select('id')
      .eq('user_id', userId)
      .eq('organization_id', memberData.organization_id)
      .maybeSingle();

    if (existingMember) {
      return new Response(
        JSON.stringify({
          success: true,
          message: isExistingUser 
            ? "Користувача оновлено та підтверджено членство в організації"
            : "Користувач вже є членом організації",
          userId: userId,
          alreadyMember: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Add user to organization
    const { error: orgError } = await requestorClient
      .from('organization_members')
      .insert({
        user_id: userId,
        organization_id: memberData.organization_id,
        role: role || 'member',
      });

    if (orgError) {
      console.error("Error adding to organization:", orgError);
      
      // Only try to delete if it's a newly created user
      if (!isExistingUser) {
        await adminClient.auth.admin.deleteUser(userId);
      }
      
      throw new Error(`Failed to add user to organization: ${orgError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: isExistingUser 
          ? "Існуючого користувача додано до організації"
          : "Нового користувача створено успішно",
        userId: userId,
        isExistingUser,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-user function:", error);
    
    // Determine appropriate status code
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
      message = "Тільки власники організації можуть створювати користувачів";
    } else if (error.message?.includes("Missing required fields")) {
      status = 400;
      message = "Не всі обов'язкові поля заповнені";
    } else if (error.message?.includes("Password must be at least")) {
      status = 400;
      message = "Пароль повинен містити мінімум 8 символів";
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
