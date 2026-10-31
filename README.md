# Shopper

Fashion e-commerce kit from Ekinoxis: a **public storefront** and an **admin panel** in one
Next.js app. Payment is cash on delivery (contraentrega), shipping is free, and checkout
happens over WhatsApp. It is built to be relaunched for new products: create a Supabase
project, apply the migration, set two env vars, deploy.

> The storefront used to be a separate repo (`shopper-store`, now archived as
> `Ekinoxis-evm/shopper-store-archive`). Its history stays there.

## Stack

- **Framework:** Next.js 16 App Router (Turbopack), React 19, TypeScript
- **Database, auth and storage:** Supabase (Postgres + Google OAuth + Storage)
- **UI:** Tailwind CSS v4. shadcn/ui in the admin, a custom dark/green theme in the store.

## Routes

| Route | Access | Description |
|---|---|---|
| `/` | public | Home: hero, categories, featured products, WhatsApp CTA |
| `/productos` | public | Full catalog |
| `/producto/[id]` | public | Product detail, gallery, sizes, WhatsApp order |
| `/categoria/[slug]` | public | Products in a category |
| `/admin` | admin | Redirects to `/admin/dashboard` |
| `/admin/login` | public | Google sign-in |
| `/admin/auth/callback` | public | OAuth code exchange |
| `/admin/dashboard` | admin | Overview |
| `/admin/products` | admin | Catalog CRUD, images, prices, promo toggle |
| `/admin/categories` | admin | Store categories and images |
| `/admin/orders` | admin | Orders and Dropi status |
| `/admin/conversations` | admin | WhatsApp conversations (AI / manual) |
| `/admin/ads` | admin | Ads per product: copy caption, activate/pause |
| `/admin/segments` | admin | Meta Ads targeting per product (read-only) |
| `/admin/benefits` | admin | Delivery terms |
| `/admin/playbook` | admin | WhatsApp sales playbook with copyable scripts |
| `/admin/config` | admin | AI agent settings |

`src/proxy.ts` guards only `/admin/**`. A visitor without a session is sent to `/admin/login`.
The storefront never requires login.

## Project structure

```
src/
├── app/
│   ├── (store)/            # storefront root layout + globals.css (public)
│   ├── admin/              # admin root layout + globals.css
│   │   ├── (panel)/        # sidebar layout: dashboard, products, orders, …
│   │   ├── login/
│   │   └── auth/callback/
│   └── icon.png
├── components/
│   ├── store/              # navbar, cart drawer, add-to-cart, product actions
│   ├── ui/                 # shadcn
│   └── *.tsx               # admin managers/editors
├── lib/
│   ├── supabase/           # config.ts, client.ts (browser), server.ts (server)
│   ├── cart-context.tsx
│   └── types.ts
└── proxy.ts                # auth for /admin/** (Next 16: proxy replaces middleware)
supabase/
├── migrations/0001_init.sql
└── README.md               # tables ↔ files, setup, access model
```

The store and the admin each have their own root layout and stylesheet. Their Tailwind
themes conflict, so moving between them does a full page load.

## Launch a new store

1. **Supabase:** create a project and apply `supabase/migrations/0001_init.sql`.
   Follow `supabase/README.md`: enable Google OAuth, add the redirect URL
   `https://<domain>/admin/auth/callback`, give your user `app_metadata.role = 'admin'`,
   and insert the `benefits` row.
2. **Env:** copy `.env.example` to `.env.local` and fill it in:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` *or* `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | the public key, **never** the service_role key |

3. **Content:** sign in at `/admin/login`, then create categories and products.
4. **WhatsApp number:** change `WA_NUMBER` in `src/components/store/cart-drawer.tsx` and
   `src/components/store/product-actions.tsx`, and the link in `src/app/(store)/page.tsx`.
5. **Deploy** to Vercel with the same env vars.

## Development

```bash
npm install
npm run dev        # http://localhost:3000 (store) and /admin
npm run lint
npx tsc --noEmit
npm run build
```
