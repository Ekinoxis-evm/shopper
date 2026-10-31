import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/lib/types";
import { Navbar } from "@/components/store/navbar";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import Link from "next/link";

async function getActiveProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as Product[];
}

async function getActiveCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  return (data ?? []) as Category[];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getActiveCategories(),
  ]);
  const featured = products.slice(0, 3);
  const rest = products.slice(3, 9);

  return (
    <main className="relative">
      <Navbar />

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0e0e0e] via-[#131313] to-[#1b1b1b]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(75,226,119,0.08),transparent_60%)]" />
        </div>

        <div className="relative z-10 text-center max-w-5xl px-8">
          <p
            className="tracking-[0.3em] text-[#4be277] mb-6 text-sm uppercase"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Envío gratis · Pago contraentrega
          </p>
          <h1
            className="text-6xl md:text-8xl font-extrabold tracking-tighter text-[#e2e2e2] mb-10 leading-tight"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            TU ESTILO,<br />
            <span className="italic font-normal">sin complicaciones</span>
          </h1>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link
              href="/productos"
              className="px-10 py-5 bg-gradient-to-br from-[#4be277] to-[#22c55e] text-[#002109] font-bold rounded-lg text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Ver productos
            </Link>
            <Link
              href={categories[0] ? `/categoria/${categories[0].slug}` : "/productos"}
              className="px-10 py-5 bg-[#353535] text-[#e2e2e2] font-semibold rounded-lg text-lg hover:bg-[#393939] transition-all"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Explorar colección
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span
            className="text-[10px] tracking-widest uppercase"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Scroll
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-[#4be277] to-transparent" />
        </div>
      </section>

      {/* Beneficios */}
      <section className="bg-[#1b1b1b] py-10 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { icon: "local_shipping", label: "Envío gratis", sub: "A todo Colombia" },
            { icon: "payments", label: "Pago contraentrega", sub: "Pagas cuando recibes" },
            { icon: "schedule", label: "Entrega en 5 días", sub: "Rápido y seguro" },
          ].map((b) => (
            <div key={b.label} className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[#4be277] text-[36px]">{b.icon}</span>
              <p className="font-semibold text-[#e2e2e2]" style={{ fontFamily: "var(--font-headline)" }}>{b.label}</p>
              <p className="text-sm text-[#bccbb9]" style={{ fontFamily: "var(--font-body)" }}>{b.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categorías ──────────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
            <div>
              <p
                className="tracking-[0.3em] text-[#4be277] mb-3 text-sm uppercase"
                style={{ fontFamily: "var(--font-label)" }}
              >
                Colecciones
              </p>
              <h2
                className="text-4xl md:text-5xl font-bold tracking-tighter text-[#e2e2e2]"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Explora por categoría
              </h2>
            </div>
            <Link
              href="/productos"
              className="text-[#4be277] font-bold tracking-wider uppercase text-sm border-b border-[#4be277]/30 pb-1 hover:border-[#4be277] transition-all whitespace-nowrap"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Ver todo →
            </Link>
          </div>

          <div
            className={`grid gap-4 ${
              categories.length === 1
                ? "grid-cols-1 max-w-sm"
                : categories.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : categories.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-2 md:grid-cols-4"
            }`}
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer"
              >
                {/* Background image or gradient */}
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a]" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <h3
                    className="text-xl font-bold text-white mb-1 leading-tight"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p
                      className="text-sm text-white/70 mb-3 line-clamp-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {cat.description}
                    </p>
                  )}
                  <span
                    className="inline-flex items-center gap-1 text-[#4be277] text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    Ver productos →
                  </span>
                </div>

                {/* Green accent border on hover */}
                <div className="absolute inset-0 ring-2 ring-[#4be277]/0 rounded-2xl group-hover:ring-[#4be277]/40 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Productos Destacados ─────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-24 px-8 bg-[#1b1b1b]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
              <div>
                <p
                  className="tracking-[0.3em] text-[#4be277] mb-3 text-sm uppercase"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  Lo más destacado
                </p>
                <h2
                  className="text-4xl md:text-5xl font-bold tracking-tighter text-[#e2e2e2]"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Selección Destacada
                </h2>
              </div>
              <Link
                href="/productos"
                className="text-[#4be277] font-bold tracking-wider uppercase text-sm border-b border-[#4be277]/30 pb-1 hover:border-[#4be277] transition-all whitespace-nowrap"
                style={{ fontFamily: "var(--font-label)" }}
              >
                Ver todo el catálogo →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product) => (
                <Link
                  key={product.id}
                  href={`/producto/${product.id}`}
                  className="group cursor-pointer"
                >
                  {/* Product image */}
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-[#1f1f1f] mb-4 relative">
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
                      <div className="absolute top-4 left-4 bg-[#4be277] text-[#002109] font-bold px-2.5 py-1 rounded text-xs">
                        OFERTA
                      </div>
                    )}
                    {product.category && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white/80 px-2.5 py-1 rounded text-xs capitalize">
                        {product.category}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <h3
                    className="text-lg font-bold mb-1 text-[#e2e2e2] group-hover:text-white transition-colors"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {product.name}
                  </h3>
                  {product.short_description && (
                    <p
                      className="text-sm text-[#bccbb9] mb-2 line-clamp-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {product.short_description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xl font-bold text-[#4be277]"
                        style={{ fontFamily: "var(--font-headline)" }}
                      >
                        {formatPrice(product.price_promo ?? product.sale_price)}
                      </span>
                      {product.price_regular &&
                        product.price_regular > (product.price_promo ?? product.sale_price) && (
                          <span className="text-sm text-[#bccbb9] line-through">
                            {formatPrice(product.price_regular)}
                          </span>
                        )}
                    </div>
                    <span
                      className="text-xs font-bold text-[#22c55e] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      Ver →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Más productos ────────────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="py-20 px-8 bg-[#131313]">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-4xl font-bold tracking-tighter mb-16 text-[#e2e2e2]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Más productos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {rest.map((product) => (
                <Link key={product.id} href={`/producto/${product.id}`} className="group cursor-pointer">
                  <div className="aspect-square overflow-hidden rounded-2xl bg-[#1f1f1f] mb-6 relative">
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
                  <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-headline)" }}>
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[#4be277]" style={{ fontFamily: "var(--font-headline)" }}>
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
          </div>
        </section>
      )}

      {/* CTA WhatsApp */}
      <section className="py-32 px-8 text-center bg-[#131313]">
        <div className="max-w-2xl mx-auto">
          <p
            className="tracking-[0.3em] text-[#4be277] mb-6 text-sm uppercase"
            style={{ fontFamily: "var(--font-label)" }}
          >
            ¿Dudas? Escríbenos
          </p>
          <h2
            className="text-5xl font-bold tracking-tighter mb-8 text-[#e2e2e2]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Atención por WhatsApp
          </h2>
          <p className="text-[#bccbb9] text-lg mb-10" style={{ fontFamily: "var(--font-body)" }}>
            Estamos disponibles para ayudarte a elegir el producto perfecto.
          </p>
          <a
            href="https://wa.me/573332848175"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-br from-[#4be277] to-[#22c55e] text-[#002109] font-bold rounded-lg text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            <span className="material-symbols-outlined">chat</span>
            Chatear ahora
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0e0e0e] py-10 px-8 text-center">
        <p className="text-[#bccbb9] text-sm" style={{ fontFamily: "var(--font-body)" }}>
          © 2026 Shopper · Todos los derechos reservados
        </p>
      </footer>
    </main>
  );
}
