import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0'

export const supabaseAdmin = createClient(
  // Supabase API URL - env var exported by default when deployed.
  Deno.env.get('SUPABASE_URL') ?? '',
  // Supabase API ANON KEY - env var exported by default when deployed.
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)