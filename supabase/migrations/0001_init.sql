-- Shopper — initial schema, reconstructed from the application code.
--
-- The original Supabase project was deleted and neither app had migrations.
-- Every table/column below is derived from a `.from(...)` query, a payload, or
-- a TypeScript type in src/. See supabase/README.md for the table → file map.
-- Anything not directly evidenced by the code is marked `-- GUESS:`.
--
-- Access model
--   * anon (storefront):  SELECT active products and active categories. Nothing else.
--   * admin:              full read/write on every table, via public.is_admin().
--   * service_role:       bypasses RLS. Used by the external WhatsApp agent /
--                         Dropi / MercadoPago integrations that create customers,
--                         conversations, messages, orders and payments.
--   No table is writable by anon: the storefront checks out over WhatsApp and
--   never inserts orders.

-- ─── Helpers ────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- GUESS: the original apps let any Google-authenticated user into the admin
-- (the proxy only checked that a session exists). Here "admin" means the JWT
-- carries app_metadata.role = 'admin'. Grant it with:
--   update auth.users
--      set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
--    where email = '<admin email>';
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── categories ─────────────────────────────────────────────────────────────

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,          -- /categoria/[slug]
  name        text not null,                 -- matched case-insensitively to products.category
  description text,
  image_url   text,                          -- public URL in the product-images bucket
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── products ───────────────────────────────────────────────────────────────

create table public.products (
  id                    uuid primary key default gen_random_uuid(),
  dropi_product_id      bigint,                  -- Dropi catalog reference (admin form "dropi_ref")
  name                  text not null,
  short_description     text,
  description           text,
  -- GUESS: free text, not a FK. The admin writes lowercase values
  -- ('ropa', 'hogar', 'mascotas', 'cuidado personal') and the store filters
  -- with ilike(category, categories.name).
  category              text,
  base_price            numeric(12,2) not null default 0,  -- GUESS: numeric(12,2) for COP amounts
  suggested_price       numeric(12,2),
  sale_price            numeric(12,2) not null default 0,
  images                text[],                  -- public URLs, product-images bucket
  variants              jsonb,                   -- [{dropi_variant_id, name, active}]
  dropi_stock           integer,
  weight                numeric,                 -- GUESS: unit unknown (Dropi weight)
  ai_selling_points     text,
  ai_objection_handling text,
  ai_keywords           text[],
  is_active             boolean not null default true,
  source                text not null default 'manual' check (source in ('manual', 'dropi')),
  -- campaign fields
  product_type          text,                    -- GUESS: no check; the form uses e.g. 'combo'
  combo_type            text,
  combo_items           text[],
  price_regular         numeric(12,2),
  price_promo           numeric(12,2),
  promo_active          boolean default false,
  features              text[],
  size_info             text,
  sizes                 jsonb,                   -- [{size, stock}]
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index products_is_active_name_idx on public.products (is_active, name);
create index products_category_idx on public.products (lower(category));

-- ─── customers ──────────────────────────────────────────────────────────────

create table public.customers (
  id         uuid primary key default gen_random_uuid(),
  phone      text not null unique,   -- GUESS: unique — WhatsApp number identifies the customer
  name       text,
  city       text,
  address    text,
  created_at timestamptz not null default now()
);

-- ─── conversations / messages ───────────────────────────────────────────────

create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references public.customers (id) on delete cascade,
  status          text not null default 'ai_active'
                    check (status in ('ai_active', 'human_active', 'closed')),
  last_message_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index conversations_customer_id_idx on public.conversations (customer_id);
create index conversations_status_updated_idx on public.conversations (status, updated_at desc);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  direction       text not null check (direction in ('inbound', 'outbound')),
  content         text not null,
  created_at      timestamptz not null default now()
);

create index messages_conversation_created_idx on public.messages (conversation_id, created_at);

-- ─── orders / payments ──────────────────────────────────────────────────────

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references public.customers (id) on delete restrict,
  -- GUESS: restrict, so deleting a product never erases order history.
  product_id      uuid not null references public.products (id) on delete restrict,
  variant_id      text,                    -- Dropi variant id
  quantity        integer not null default 1 check (quantity > 0),
  unit_price      numeric(12,2) not null,
  total_price     numeric(12,2) not null,
  is_cod          boolean not null default true,   -- contraentrega
  status          text not null default 'pending_payment'
                    check (status in ('pending_payment', 'paid', 'pending_dropi',
                                      'created_dropi', 'shipped', 'delivered', 'cancelled')),
  dropi_order_id  text,
  tracking_number text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index orders_customer_id_idx on public.orders (customer_id);
create index orders_product_id_idx on public.orders (product_id);
create index orders_status_created_idx on public.orders (status, created_at desc);

create table public.payments (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders (id) on delete cascade,
  mp_payment_id    text,                   -- MercadoPago
  mp_preference_id text,
  status           text not null default 'pending'
                     check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  amount           numeric(12,2) not null,
  payment_method   text,
  created_at       timestamptz not null default now()
);

create index payments_order_id_idx on public.payments (order_id);
create index payments_status_created_idx on public.payments (status, created_at);

-- ─── agent_config ───────────────────────────────────────────────────────────

create table public.agent_config (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,       -- upsert onConflict: 'key' (playbook)
  value       text not null,
  description text
);

-- ─── ads / segments (Meta Ads campaign) ─────────────────────────────────────

create table public.ads (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  ad_number  integer not null,
  format     text not null check (format in ('video_reel', 'imagen_estatica', 'imagen_carrusel')),
  caption    text not null,
  status     text not null default 'draft' check (status in ('active', 'paused', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, ad_number)   -- GUESS: ad_number is per-product
);

create table public.segments (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null references public.products (id) on delete cascade,
  label               text not null,
  age_min             integer,
  age_max             integer,
  gender              text,
  relationship_status text[],
  education           text[],
  occupations         text[],
  cities_tier1        text[],
  cities_tier2        text[],
  interests_layer1    text[],
  interests_layer2    text[],
  interests_layer3    text[],
  device              text,
  android_models      text[],
  ios_models          text[],
  behaviors           text[],
  created_at          timestamptz not null default now()
);

create index segments_product_id_idx on public.segments (product_id);

-- ─── benefits ───────────────────────────────────────────────────────────────

-- The admin reads this with .single(), so it is expected to hold exactly one row.
create table public.benefits (
  id               uuid primary key default gen_random_uuid(),
  payment_type     text not null,
  delivery_cost    text not null,
  coverage         text not null,
  delivery_days    integer not null,
  required_fields  text[] not null default '{}',
  world_cup_start  date,          -- GUESS: date (typed as string | null)
  colombia_matches jsonb,         -- [{opponent, date}]
  updated_at       timestamptz not null default now()
);

-- ─── updated_at triggers ────────────────────────────────────────────────────

create trigger categories_set_updated_at    before update on public.categories    for each row execute function public.set_updated_at();
create trigger products_set_updated_at      before update on public.products      for each row execute function public.set_updated_at();
create trigger conversations_set_updated_at before update on public.conversations for each row execute function public.set_updated_at();
create trigger orders_set_updated_at        before update on public.orders        for each row execute function public.set_updated_at();
create trigger ads_set_updated_at           before update on public.ads           for each row execute function public.set_updated_at();
create trigger benefits_set_updated_at      before update on public.benefits      for each row execute function public.set_updated_at();

-- ─── Row Level Security ─────────────────────────────────────────────────────

alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.customers     enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.orders        enable row level security;
alter table public.payments      enable row level security;
alter table public.agent_config  enable row level security;
alter table public.ads           enable row level security;
alter table public.segments      enable row level security;
alter table public.benefits      enable row level security;

-- Storefront catalog: public can read active rows only.
create policy "Public reads active categories" on public.categories
  for select to anon, authenticated using (is_active);
create policy "Public reads active products" on public.products
  for select to anon, authenticated using (is_active);

-- Admin: full access on every table (reads include inactive catalog rows).
create policy "Admins read categories"   on public.categories for select to authenticated using ((select public.is_admin()));
create policy "Admins insert categories" on public.categories for insert to authenticated with check ((select public.is_admin()));
create policy "Admins update categories" on public.categories for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete categories" on public.categories for delete to authenticated using ((select public.is_admin()));

create policy "Admins read products"   on public.products for select to authenticated using ((select public.is_admin()));
create policy "Admins insert products" on public.products for insert to authenticated with check ((select public.is_admin()));
create policy "Admins update products" on public.products for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins delete products" on public.products for delete to authenticated using ((select public.is_admin()));

-- Operational tables: admin only. Rows are created by service_role integrations.
create policy "Admins manage customers"     on public.customers     for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage conversations" on public.conversations for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage messages"      on public.messages      for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage orders"        on public.orders        for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage payments"      on public.payments      for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage agent_config"  on public.agent_config  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage ads"           on public.ads           for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage segments"      on public.segments      for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage benefits"      on public.benefits      for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ─── Storage: product-images bucket ─────────────────────────────────────────
-- Product images ({productId}/{ts}-{rand}.{ext}) and category images.
-- Public bucket: objects are served by public URL. Admins upload and delete.
-- GUESS: 5 MB limit and image MIME types, from the old store CLAUDE.md.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "Admins read product images" on storage.objects
  for select to authenticated using (bucket_id = 'product-images' and (select public.is_admin()));
create policy "Admins upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "Admins update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "Admins delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (select public.is_admin()));
