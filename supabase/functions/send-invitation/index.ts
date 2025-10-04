import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";
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
      throw new Error("No authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { email, organizationName, inviterName }: InvitationRequest = await req.json();

    console.log(`Sending invitation to ${email} from ${inviterName}`);

    // Generate magic link for signup
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${Deno.env.get("SUPABASE_URL")}/auth/v1/verify`,
      }
    });

    if (signUpError) {
      console.error("Error generating magic link:", signUpError);
      throw signUpError;
    }

    const inviteLink = signUpData.properties?.action_link || `${supabaseUrl}/signup`;

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
                <h1>Запрошення до AccessHub</h1>
              </div>
              <div class="content">
                <p>Привіт!</p>
                <p><strong>${inviterName}</strong> запрошує вас приєднатися до <strong>${organizationName}</strong> в AccessHub.</p>
                <p>AccessHub - це платформа для керування доступом до ресурсів вашої команди.</p>
                <p style="text-align: center;">
                  <a href="${inviteLink}" class="button">Прийняти запрошення</a>
                </p>
                <p style="color: #666; font-size: 14px;">Або скопіюйте це посилання:</p>
                <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">${inviteLink}</p>
                <p style="margin-top: 30px; color: #666; font-size: 12px;">Якщо ви не очікували цього запрошення, просто проігноруйте цей лист.</p>
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
