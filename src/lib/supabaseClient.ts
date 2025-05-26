import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

// Create a single supabase client for the entire application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = supabaseCreateClient(supabaseUrl, supabaseKey);

export { supabase };