@AGENTS.md

# Shopper — Project Context

One Next.js app with the public storefront at `/` and the admin panel at `/admin`.
It is meant as a reusable "launch a store" kit: new Supabase project → apply
`supabase/migrations/0001_init.sql` → set env vars → deploy.
(The storefront came from `shopper-store`, now archived as `Ekinoxis-evm/shopper-store-archive`.)

## Stack
- Next.js 16.2.3 (App Router, Turbopack). Read AGENTS.md: breaking changes.
- React 19, TypeScript, Tailwind CSS v4
- Supabase (Postgres + Auth + Storage). The original project was deleted, so the schema now lives in `supabase/`.
- Admin UI: shadcn/ui (base-nova) + lucide. Storefront: hand-styled Tailwind with inline hex colors.

## Layout: two root layouts
| Area | Root layout | CSS | URL |
|---|---|---|---|
| Storefront | `src/app/(store)/layout.tsx` | `src/app/(store)/globals.css` (Obsidian/green theme, Plus Jakarta Sans + Manrope) | `/`, `/productos`, `/producto/[id]`, `/categoria/[slug]` |
| Admin | `src/app/admin/layout.tsx` | `src/app/admin/globals.css` (shadcn tokens, Geist, `.dark`) | `/admin/**` |

The two stylesheets define conflicting Tailwind theme tokens (`--color-primary` and others), so
**do not merge them** and do not add `src/app/layout.tsx`. Moving between the store and the admin
triggers a full page load. That is expected with multiple root layouts.

Inside admin, `src/app/admin/(panel)/layout.tsx` adds the sidebar. `/admin/login` and
`/admin/auth/callback` sit outside `(panel)`.

## Key conventions

### Route protection
Next.js 16 uses `src/proxy.ts`, not `middleware.ts`, and exports a named `proxy` function.
Its matcher is `/admin/:path*`, so **only admin routes run auth**. The storefront is public
and never hits the proxy. Inside the proxy, `/admin/login` and `/admin/auth/*` are exempt
from the redirect. Auth check: `supabase.auth.getUser()`.

### Supabase clients (one set)
- `@/lib/supabase/config`: URL and public key. Reads `NEXT_PUBLIC_SUPABASE_ANON_KEY`, falling back to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`.
- `@/lib/supabase/client`: browser client for Client Components.
- `@/lib/supabase/server`: server client (cookies) for Server Components, Server Actions and Route Handlers. Storefront pages use it too, so they render dynamically per request.
- Never use the service_role key in this app.

### Auth flow
Google OAuth on `/admin/login` → `/admin/auth/callback` exchanges the code → session cookie → `/admin/dashboard`.
RLS only grants admin data to users whose JWT has `app_metadata.role = 'admin'` (see `supabase/README.md`).

### Database
- Schema: `supabase/migrations/0001_init.sql`, reconstructed from the code. `-- GUESS:` marks inferences.
- Table → file map: `supabase/README.md`. Types: `src/lib/types.ts` (shared by store and admin).
- Storage bucket `product-images` (public): product images at `{productId}/{ts}-{rand}.{ext}`, plus category images.
- Add a column in a new migration file, then update `src/lib/types.ts`.

### Storefront
- Components: `src/components/store/*` (navbar, cart drawer, add-to-cart, product actions).
- Cart: `src/lib/cart-context.tsx`, persisted to `localStorage` key `shopper-cart`.
- Checkout goes over WhatsApp (`WA_NUMBER` in `src/components/store/cart-drawer.tsx` and `product-actions.tsx`). There is no online payment and no order insert.
- Fonts: `--font-headline` (Plus Jakarta Sans) and `--font-body`/`--font-label` (Manrope), applied inline with `style={{ fontFamily: "var(--font-headline)" }}`.
- Categories come from the `categories` table. The navbar links are hardcoded in `navbar.tsx`.
  Products match a category by `ilike(products.category, categories.name)`.
- Design references: `public/design/` (incl. `shopper_noir/DESIGN.md`).

### Admin
- Components: `src/components/*` (managers/editors) and `src/components/ui/*` (shadcn).
- Pages under `src/app/admin/(panel)/`.

## Campaign context (Mundial Colombia 2026)
Products: Combo Pareja, Combo Parceros, Combo Amigas, Camiseta Hombre, Body Mujer
Sales channel: WhatsApp + Meta Ads
Payment: Contraentrega. Envío gratis. 5 días.

## What's built
Storefront: `/` (hero, categories, featured), `/productos`, `/producto/[id]`, `/categoria/[slug]`, cart drawer + WhatsApp checkout.

Admin:
- `/admin/dashboard`: metrics and latest orders
- `/admin/products`: catalog CRUD, images, prices, promo toggle
- `/admin/categories`: category CRUD + image
- `/admin/ads`: copy caption, toggle active/paused
- `/admin/segments`: read-only Meta Ads targeting per product
- `/admin/benefits`: editable delivery config
- `/admin/playbook`: WhatsApp sales scripts (6 funnel stages)
- `/admin/orders`, `/admin/conversations`, `/admin/config`: operational views

## Commands
`npm run dev` · `npm run lint` · `npx tsc --noEmit` · `npm run build`

<!-- ekx:portfolio:start -->
## Ekinoxis portfolio

- **Product:** Shopper Center — Proofs of Concept ([website](https://ekinoxis.xyz/portfolio/proofs-of-concept)) · status **MVP**
- **What:** Fashion e-commerce with cash-on-delivery: storefront + admin.
- **Vercel (ekinoxis-team (team_jxTNRBmimeErr5ULGBepXlL0)):** store-shopper-center, shopper-center
- **Supabase:** deleted (database erased — app has no backend; live demo likely broken)
- **Sibling repos:** `~/Documents/ekinoxis/poc/shopper/shopper-store`
- **Stack:** Next.js · React · Tailwind · Supabase
- **Scripts:** `dev`, `build`, `start`, `lint`
- **Brain profile:** `../../../_brain/projects/poc/shopper.md` — shared skills (`ekx-*`), registry and the full portfolio live in `~/Documents/ekinoxis/_brain`.
- Edit this block in `_brain/registry/portfolio.json`, then run `python3 _brain/scripts/align-claude.py --apply`.
<!-- ekx:portfolio:end -->
