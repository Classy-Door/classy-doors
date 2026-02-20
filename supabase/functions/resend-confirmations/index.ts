import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // List all users
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

    if (listError) {
      return new Response(JSON.stringify({ error: listError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const unconfirmed = users.filter(u => !u.email_confirmed_at && u.email);
    const results: { email: string; status: string }[] = [];

    for (const user of unconfirmed) {
      try {
        const { error } = await supabaseAdmin.auth.resend({
          type: 'signup',
          email: user.email!,
        });
        results.push({ email: user.email!, status: error ? `error: ${error.message}` : 'resent' });
      } catch (e) {
        results.push({ email: user.email!, status: `error: ${e.message}` });
      }
    }

    return new Response(JSON.stringify({ 
      total_users: users.length,
      unconfirmed_count: unconfirmed.length,
      results 
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
