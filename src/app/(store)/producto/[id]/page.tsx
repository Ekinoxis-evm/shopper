import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { Navbar } from "@/components/store/navbar";
import { ProductActions } from "@/components/store/product-actions";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
  return data as Product | null;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const displayPrice = product.price_promo ?? product.sale_price;
  const hasDiscount =
    product.price_regular && product.price_regular > displayPrice;

  return (
    <main className="relative min-h-screen bg-[#131313]">
      <Navbar />

      <section className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-sm text-[#bccbb9]" style={{ fontFamily: "var(--font-body)" }}>
          <Link href="/" className="hover:text-[#e2e2e2] transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-[#e2e2e2] transition-colors">Productos</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/categoria/${product.category.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-[#e2e2e2] transition-colors"
              >
                {product.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#e2e2e2]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-2xl bg-[#1f1f1f] relative">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#3d4a3d]">
                  <span className="material-symbols-outlined text-[80px]">image</span>
                </div>
              )}
              {product.promo_active && (
                <div className="absolute top-6 left-6 bg-[#4be277] text-[#002109] font-bold px-3 py-1 rounded text-xs">
                  OFERTA
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(1, 5).map((img, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl bg-[#1f1f1f]">
                    <img src={img} alt={`${product.name} ${i + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:sticky lg:top-32">
            {product.category && (
              <p
                className="tracking-[0.3em] text-[#4be277] mb-3 text-xs uppercase"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {product.category}
              </p>
            )}
            <h1
              className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#e2e2e2] mb-6"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8">
              <span
                className="text-4xl font-bold text-[#4be277]"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-[#bccbb9] line-through">
                  {formatPrice(product.price_regular!)}
                </span>
              )}
            </div>

            {product.short_description && (
              <p className="text-[#bccbb9] text-lg leading-relaxed mb-8" style={{ fontFamily: "var(--font-body)" }}>
                {product.short_description}
              </p>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <p className="text-[#e2e2e2] font-semibold mb-3" style={{ fontFamily: "var(--font-headline)" }}>
                  Tallas disponibles
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((s) => (
                    <div
                      key={s.size}
                      className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
                        s.stock > 0
                          ? "border-[#353535] text-[#e2e2e2] hover:border-[#4be277] cursor-pointer transition-colors"
                          : "border-[#2a2a2a] text-[#555] cursor-not-allowed line-through"
                      }`}
                      style={{ fontFamily: "var(--font-headline)" }}
                    >
                      {s.size}
                    </div>
                  ))}
                </div>
                {product.size_info && (
                  <p className="mt-3 text-xs text-[#bccbb9]" style={{ fontFamily: "var(--font-body)" }}>
                    {product.size_info}
                  </p>
                )}
              </div>
            )}

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-t border-b border-[#1f1f1f]">
              {[
                { icon: "local_shipping", label: "Envío gratis" },
                { icon: "payments", label: "Contraentrega" },
                { icon: "schedule", label: "5 días hábiles" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-2 text-center">
                  <span className="material-symbols-outlined text-[#4be277] text-[24px]">{b.icon}</span>
                  <span className="text-xs text-[#bccbb9]" style={{ fontFamily: "var(--font-body)" }}>{b.label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <ProductActions
              item={{
                id: product.id,
                name: product.name,
                price: product.price_promo ?? product.sale_price,
                image: product.images?.[0] ?? null,
                category: product.category ?? null,
              }}
            />
          </div>
        </div>

        {/* Description & Features */}
        {(product.description || (product.features && product.features.length > 0)) && (
          <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-16">
            {product.description && (
              <div>
                <h2
                  className="text-2xl font-bold tracking-tighter mb-6 text-[#e2e2e2]"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Descripción
                </h2>
                <p className="text-[#bccbb9] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                  {product.description}
                </p>
              </div>
            )}
            {product.features && product.features.length > 0 && (
              <div>
                <h2
                  className="text-2xl font-bold tracking-tighter mb-6 text-[#e2e2e2]"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Características
                </h2>
                <ul className="space-y-3">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#bccbb9]" style={{ fontFamily: "var(--font-body)" }}>
                      <span className="material-symbols-outlined text-[#4be277] text-[18px] mt-0.5 flex-shrink-0">check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="bg-[#0e0e0e] py-10 px-8 text-center mt-20">
        <p className="text-[#bccbb9] text-sm" style={{ fontFamily: "var(--font-body)" }}>
          © 2026 Shopper · Todos los derechos reservados
        </p>
      </footer>
    </main>
  );
}
