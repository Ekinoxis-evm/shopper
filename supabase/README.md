# Supabase

The original Supabase project was deleted and neither app had migrations.
`migrations/0001_init.sql` rebuilds the schema from the queries in `src/`.
Lines marked `-- GUESS:` are inferences, not evidence from the code. Review them
before you launch a new store.

## Set up a new project

1. Create a Supabase project, then apply the migration with `supabase db push`
   or by pasting the file into the SQL editor.
2. Copy `.env.example` to `.env.local` and fill in the project URL and anon/publishable key.
3. Auth → Providers → Google: enable it and add
   `https://<your-domain>/admin/auth/callback` to the allowed redirect URLs.
4. Make yourself an admin. RLS only lets users with `app_metadata.role = 'admin'` into admin data:
   ```sql
   update auth.users
      set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
    where email = 'you@example.com';
   ```
   Sign out and back in so the JWT picks up the role.
5. Insert the single `benefits` row. `/admin/benefits` edits it but cannot create it.

## Access model

| Who | Can do |
|---|---|
| anon (storefront) | `select` active `products` and active `categories` |
| admin (`is_admin()`) | everything on every table, plus upload/delete in `product-images` |
| service_role | bypasses RLS. The external WhatsApp agent (n8n), Dropi and MercadoPago integrations write customers, conversations, messages, orders and payments this way. None of that code is in this repo. |

The storefront never writes. Checkout is a WhatsApp deep link, so anon cannot insert orders.

## Tables

| Table | Used by (reads → R, writes → W) |
|---|---|
| `products` | R `src/app/(store)/page.tsx`, `src/app/(store)/productos/page.tsx`, `src/app/(store)/producto/[id]/page.tsx`, `src/app/(store)/categoria/[slug]/page.tsx`, `src/app/admin/(panel)/products/page.tsx`, `src/app/admin/(panel)/playbook/page.tsx`; embedded in `ads`/`segments`/`orders` selects. W (insert/update/delete) `src/components/products-manager.tsx` |
| `categories` | R `src/app/(store)/page.tsx`, `src/app/(store)/categoria/[slug]/page.tsx`, `src/app/admin/(panel)/categories/page.tsx`. W (insert/update/delete) `src/components/categories-manager.tsx` |
| `orders` | R `src/app/admin/(panel)/dashboard/page.tsx`, `src/app/admin/(panel)/orders/page.tsx`. W (update status/tracking) `src/components/orders-table.tsx` |
| `customers` | R (embedded) dashboard, orders and conversations pages |
| `conversations` | R `src/app/admin/(panel)/dashboard/page.tsx`, `src/app/admin/(panel)/conversations/page.tsx`. W (update status) `src/components/conversations-list.tsx` |
| `messages` | R `src/components/conversations-list.tsx` |
| `payments` | R `src/app/admin/(panel)/dashboard/page.tsx` (approved amount today) |
| `agent_config` | R `src/app/admin/(panel)/config/page.tsx`, `src/app/admin/(panel)/playbook/page.tsx`. W `src/components/agent-config-editor.tsx` (update), `src/app/admin/(panel)/playbook/actions.ts` (upsert on `key`) |
| `ads` | R `src/app/admin/(panel)/ads/page.tsx`. W (update status) `src/components/ads-manager.tsx` |
| `segments` | R `src/app/admin/(panel)/segments/page.tsx` (read-only in UI) |
| `benefits` | R `src/app/admin/(panel)/benefits/page.tsx` (`.single()`). W (update) `src/components/benefits-editor.tsx` |

Column shapes mirror `src/lib/types.ts`.

## Storage

| Bucket | Used by |
|---|---|
| `product-images` (public) | upload/remove/getPublicUrl in `src/components/products-manager.tsx` (`{productId}/{ts}-{rand}.{ext}`) and `src/components/categories-manager.tsx`. The storefront renders the public URLs. |

## Auth

Google OAuth. `src/app/admin/login/page.tsx` → `signInWithOAuth` →
`src/app/admin/auth/callback/route.ts` (`exchangeCodeForSession`) → `/admin/dashboard`.
`src/proxy.ts` refreshes the session and guards `/admin/**`. Sign-out is in `src/components/app-sidebar.tsx`.

## Guesses worth reviewing

- **Admin role** comes from `app_metadata.role = 'admin'`. The old apps let in any signed-in user.
- **Money columns** are `numeric(12,2)`. Amounts are COP.
- `products.category` is free text, not a foreign key to `categories`. The admin
  writes lowercase values and the store matches with `ilike` against `categories.name`.
- `orders.product_id` uses `on delete restrict`, so you cannot delete a product that has orders.
  `ads`/`segments` cascade.
- `customers.phone` is unique. `ads (product_id, ad_number)` is unique.
- `benefits.world_cup_start` is a `date`. `products.weight` has no known unit.
- The bucket size limit (5 MB) and MIME list come from the old store docs.
