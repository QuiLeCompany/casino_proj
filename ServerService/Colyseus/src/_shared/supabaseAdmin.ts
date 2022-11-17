/**
 * When debug use import ...
 * When build release have to use require to use commonJs module
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
// const { createClient } = require('@supabase/supabase-js');

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)