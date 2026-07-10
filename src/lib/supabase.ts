import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function saveLead(email: string) {
  try {
    const { error } = await supabase
      .from('leads')
      .insert([{ email }])
      .select();
      
    if (error) {
      console.warn('Could not save lead to Supabase (is the leads table created?):', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error saving lead:', err);
    return false;
  }
}
