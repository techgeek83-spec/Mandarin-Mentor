import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Architecture Note: Hard validation barrier to prevent silent network failures if environment variables fail to inject during Turbopack compilation.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("FATAL: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from the client bundle. Check frontend/.env.local");
}

// Architecture Note: Instantiates the Supabase singleton for client-side authentication and JWT lifecycle management. Fallback strings prevent instant crash to allow console error rendering.
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

/**
 * Architecture Note: Retrieves active session JWT or triggers anonymous sign-in
 * to maintain authenticated stateless gateway access without blocking user onboarding.
 */
export async function getValidToken(): Promise<string | null> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (session?.access_token && !sessionError) {
      return session.access_token;
    }

    // Architecture Note: Force-clears corrupted session cache from failed initializations before requesting anonymous credentials.
    await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.session) {
      console.error('[Supabase Auth Error] Anonymous sign-in failed:', error?.message);
      return null;
    }

    return data.session.access_token;
  } catch (err) {
    console.error('[Supabase Auth Exception]:', err);
    return null;
  }
  
  }