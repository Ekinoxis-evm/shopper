import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only same-site admin paths: "@evil.com", "//evil.com" or "https://…" must never become the redirect target.
  const requested = searchParams.get("next") ?? "";
  const next = /^\/admin(\/[\w\-/]*)?$/.test(requested) ? requested : "/admin/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
