import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  organizationName: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      throw new Error("No authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("Auth error:", authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    if (!user) {
      console.error("No user found");
      throw new Error("User not authenticated");
    }

    console.log(`Authenticated user: ${user.id}`);

    const { email, organizationName, inviterName }: InvitationRequest = await req.json();

    console.log(`Sending invitation to ${email} from ${inviterName}`);

    // Generate unique token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Get organization ID from the inviter's organization membership
    const { data: memberData, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (memberError) {
      console.error("Error fetching organization:", memberError);
      throw new Error(`Failed to fetch organization: ${memberError.message}`);
    }

    if (!memberData?.organization_id) {
      console.error("No organization found for user");
      throw new Error("Organization not found");
    }

    console.log(`Creating invitation for organization: ${memberData.organization_id}`);

    // Create invitation record
    const { error: inviteError } = await supabase
      .from('invitations')
      .insert({
        organization_id: memberData.organization_id,
        email,
        token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      });

    if (inviteError) {
      console.error("Error creating invitation:", inviteError);
      throw new Error(`Failed to create invitation: ${inviteError.message}`);
    }

    const inviteLink = `${supabaseUrl.replace('.supabase.co', '')}/signup?invite=${token}`;

    const emailResponse = await resend.emails.send({
      from: "AccessHub <onboarding@resend.dev>",
      to: [email],
      subject: `${inviterName} запрошує вас до ${organizationName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Запрошення до AccessHub</h1>
              </div>
              <div class="content">
                <p>Привіт!</p>
                <p><strong>${inviterName}</strong> запрошує вас приєднатися до <strong>${organizationName}</strong> в AccessHub.</p>
                <p>AccessHub - це платформа для керування доступом до ресурсів вашої команди.</p>
                <p style="text-align: center;">
                  <a href="${inviteLink}" class="button">✨ Прийняти запрошення</a>
                </p>
                <p style="color: #666; font-size: 14px;">Або скопіюйте це посилання:</p>
                <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">${inviteLink}</p>
                <p style="margin-top: 30px; color: #666; font-size: 12px;">
                  ⏰ Це запрошення дійсне протягом 7 днів.<br>
                  Якщо ви не очікували цього запрошення, просто проігноруйте цей лист.
                </p>
              </div>
              <div class="footer">
                <p>AccessHub - управління доступом спрощено</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Запрошення надіслано успішно",
        inviteLink 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
