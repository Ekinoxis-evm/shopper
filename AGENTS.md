<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Shopper: unified storefront + admin

One Next.js app. Read `CLAUDE.md` for the full context. The rules agents most often get wrong:

- **Two root layouts.** `src/app/(store)/layout.tsx` (public storefront, Spanish slugs:
  `/`, `/productos`, `/producto/[id]`, `/categoria/[slug]`) and `src/app/admin/layout.tsx`
  (admin panel under `/admin/**`). Each has its own `globals.css` with conflicting Tailwind
  tokens. Do not add `src/app/layout.tsx` and do not merge the stylesheets.
- **Auth only on `/admin/**`.** `src/proxy.ts` (Next 16 name for middleware) has matcher
  `/admin/:path*`. Never widen it to the storefront. `/admin/login` and `/admin/auth/*` stay exempt.
- **One set of Supabase clients** in `src/lib/supabase/` (`client.ts` browser, `server.ts`
  server, `config.ts` env). Don't create another.
- **Schema lives in `supabase/migrations/`.** Change the DB in a new migration with RLS
  enabled and explicit policies, and keep `supabase/README.md` and `src/lib/types.ts` in sync.
  Never run SQL against a remote database from an agent session.
- Env var **names** are in `.env.example`. Never read or create `.env.local`.
