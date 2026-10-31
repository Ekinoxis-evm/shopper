import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/lib/types";
import { Navbar } from "@/components/store/navbar";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data as Category | null;
}

async function getAllActiveCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  return (data ?? []) as Category[];
}

async function getProductsByCategory(categoryName: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .ilike("category", categoryName)
    .order("name");
  return (data ?? []) as Product[];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single();
  const name = data?.name ?? slug;
  return {
    title: `${name} — Shopper`,
    description: data?.description ?? `Explora nuestra colección de ${name.toLowerCase()}.`,
  };
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getAllActiveCategories(),
  ]);

  if (!category) notFound();

  const products = await getProductsByCategory(category.name);

  return (
    <main className="relative min-h-screen bg-[#131313]">
      <Navbar />

      {/* Category hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {category.image_url ? (
          <>
            <div className="absolute inset-0 z-0">
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-[#131313]" />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-8 pt-16">
              <nav className="mb-8 flex items-center gap-2 text-sm text-white/60" style={{ fontFamily: "var(--font-body)" }}>
                <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
                <span>/</span>
                <Link href="/productos" className="hover:text-white transition-colors">Productos</Link>
                <span>/</span>
                <span className="text-white">{category.name}</span>
              </nav>
              <p
                className="tracking-[0.3em] text-[#4be277] mb-3 text-sm uppercase"
                style={{ fontFamily: "var(--font-label)" }}
              >
                Categoría
              </p>
              <h1
                className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-4"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {category.name}
              </h1>
              {category.description && (
                <p className="text-white/70 text-lg max-w-xl" style={{ fontFamily: "var(--font-body)" }}>
                  {category.description}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="max-w-7xl mx-auto px-8 pt-40 pb-4">
            <nav className="mb-10 flex items-center gap-2 text-sm text-[#bccbb9]" style={{ fontFamily: "var(--font-body)" }}>
              <Link href="/" className="hover:text-[#e2e2e2] transition-colors">Inicio</Link>
              <span>/</span>
              <Link href="/productos" className="hover:text-[#e2e2e2] transition-colors">Productos</Link>
              <span>/</span>
              <span className="text-[#e2e2e2]">{category.name}</span>
            </nav>
            <p
              className="tracking-[0.3em] text-[#4be277] mb-4 text-sm uppercase"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Categoría
            </p>
            <h1
              className="text-5xl md:text-6xl font-extrabold tracking-tighter text-[#e2e2e2]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {category.name}
            </h1>
          </div>
        )}
      </section>

      <section className="px-8 pb-20 max-w-7xl mx-auto">
        {/* Category pills */}
        {allCategories.length > 1 && (
          <div className="flex flex-wrap gap-3 mb-12">
            {allCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  cat.slug === slug
                    ? "bg-[#4be277] text-[#002109]"
                    : "bg-[#1f1f1f] text-[#bccbb9] hover:bg-[#2a2a2a]"
                }`}
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-32">
            <span className="material-symbols-outlined text-[#3d4a3d] text-[64px]">inventory_2</span>
            <p className="mt-6 text-[#bccbb9] text-lg" style={{ fontFamily: "var(--font-body)" }}>
              No hay productos en esta categoría por el momento.
            </p>
            <Link
              href="/productos"
              className="mt-8 inline-block px-8 py-4 bg-[#1f1f1f] text-[#e2e2e2] rounded-lg hover:bg-[#2a2a2a] transition-colors"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Ver todos los productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link key={product.id} href={`/producto/${product.id}`} className="group cursor-pointer">
                <div className="aspect-square overflow-hidden rounded-2xl bg-[#1f1f1f] mb-5 relative">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#3d4a3d]">
                      <span className="material-symbols-outlined text-[48px]">image</span>
                    </div>
                  )}
                  {product.promo_active && (
                    <div className="absolute top-4 left-4 bg-[#4be277] text-[#002109] font-bold px-2 py-1 rounded text-xs">
                      OFERTA
                    </div>
                  )}
                </div>
                <h2
                  className="text-base font-bold mb-2 text-[#e2e2e2]"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {product.name}
                </h2>
                <div className="flex items-center gap-3">
                  <span
                    className="text-lg font-bold text-[#4be277]"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {formatPrice(product.price_promo ?? product.sale_price)}
                  </span>
                  {product.price_regular && product.price_regular > (product.price_promo ?? product.sale_price) && (
                    <span className="text-sm text-[#bccbb9] line-through">
                      {formatPrice(product.price_regular)}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <AddToCartButton item={{
                    id: product.id,
                    name: product.name,
                    price: product.price_promo ?? product.sale_price,
                    image: product.images?.[0] ?? null,
                    category: product.category ?? null,
                  }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="bg-[#0e0e0e] py-10 px-8 text-center mt-10">
        <p className="text-[#bccbb9] text-sm" style={{ fontFamily: "var(--font-body)" }}>
          © 2026 Shopper · Todos los derechos reservados
        </p>
      </footer>
    </main>
  );
}
