import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./config";

// Browser client — use in Client Components ("use client").
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
