import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and service role key are required');
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
); 