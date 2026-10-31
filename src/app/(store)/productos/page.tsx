import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { Navbar } from "@/components/store/navbar";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import Link from "next/link";

async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
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

export const metadata = {
  title: "Productos — Shopper",
  description: "Explora todo nuestro catálogo de productos.",
};

export default async function ProductosPage() {
  const products = await getAllProducts();

  return (
    <main className="relative min-h-screen bg-[#131313]">
      <Navbar />

      <section className="pt-40 pb-20 px-8 max-w-7xl mx-auto">
        <div className="mb-16">
          <p
            className="tracking-[0.3em] text-[#4be277] mb-4 text-sm uppercase"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Catálogo completo
          </p>
          <h1
            className="text-5xl md:text-6xl font-extrabold tracking-tighter text-[#e2e2e2]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Todos los productos
          </h1>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-32">
            <span className="material-symbols-outlined text-[#3d4a3d] text-[64px]">inventory_2</span>
            <p className="mt-6 text-[#bccbb9] text-lg" style={{ fontFamily: "var(--font-body)" }}>
              No hay productos disponibles por el momento.
            </p>
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
                {product.category && (
                  <p
                    className="text-[#bccbb9] text-xs tracking-widest uppercase mb-1"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {product.category}
                  </p>
                )}
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

      <footer className="bg-[#0e0e0e] py-10 px-8 text-center">
        <p className="text-[#bccbb9] text-sm" style={{ fontFamily: "var(--font-body)" }}>
          © 2026 Shopper · Todos los derechos reservados
        </p>
      </footer>
    </main>
  );
}
