import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseKey, supabaseUrl } from "./config";

// Server client — use in Server Components, Server Actions and Route Handlers.
// Reads the auth session from cookies, so admin queries run as the signed-in
// user and storefront queries run as anon (RLS applies to both).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore; the /admin
          // proxy refreshes the session cookie.
        }
      },
    },
  });
}
