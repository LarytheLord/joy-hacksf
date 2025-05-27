import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

// Create a client-side Supabase client for use in client components
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return supabaseCreateClient(supabaseUrl, supabaseKey);
}

// Pre-initialized client for simpler imports
const supabase = createClient();

export { supabase };