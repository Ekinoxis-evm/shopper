// Single source of Supabase connection settings for the browser client,
// the server client and the /admin proxy.
//
// The two original apps read the public key under different names
// (NEXT_PUBLIC_SUPABASE_ANON_KEY and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY).
// Either works; set one. Never put the service_role / secret key here.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)!;
