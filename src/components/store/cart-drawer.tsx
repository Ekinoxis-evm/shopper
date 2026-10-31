"use client";

import { useCart } from "@/lib/cart-context";
import { useEffect } from "react";

const WA_NUMBER = "573332848175";

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

export function CartDrawer() {
  const { entries, count, total, isOpen, closeCart, removeItem, updateQty } = useCart();

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeCart]);

  function buildWhatsAppUrl() {
    if (entries.length === 0) return "#";
    const lines = entries.map(
      ({ item, quantity }) =>
        `• ${item.name}${quantity > 1 ? ` × ${quantity}` : ""} — ${formatCOP(item.price * quantity)}`
    );
    const msg = [
      "Hola! Quiero hacer un pedido:",
      "",
      ...lines,
      "",
      `*Total: ${formatCOP(total)}*`,
      "",
      "¿Me pueden confirmar disponibilidad?",
    ].join("\n");
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-screen w-full md:w-[420px] bg-[#0e0e0e] shadow-[-20px_0_60px_rgba(0,0,0,0.6)] z-[70] flex flex-col transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 pt-8 pb-6 border-b border-[#1f1f1f]">
          <div>
            <h2 className="text-xl font-bold text-[#e2e2e2]" style={{ fontFamily: "var(--font-headline)" }}>
              Tu carrito
            </h2>
            <p className="text-xs text-[#e2e2e2]/40 mt-0.5 uppercase tracking-widest" style={{ fontFamily: "var(--font-body)" }}>
              {count === 0 ? "Vacío" : `${count} producto${count !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-[#1f1f1f] transition-colors text-[#e2e2e2]/70 hover:text-[#e2e2e2]"
            aria-label="Cerrar carrito"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-20">
              <span className="material-symbols-outlined text-[#3d4a3d] text-[56px]">shopping_bag</span>
              <p className="text-[#bccbb9] text-sm" style={{ fontFamily: "var(--font-body)" }}>
                Tu carrito está vacío.<br />Agrega productos para continuar.
              </p>
            </div>
          ) : (
            entries.map(({ item, quantity }) => (
              <div key={item.id} className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#1f1f1f] shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#3d4a3d] text-[28px]">image</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p
                      className="text-sm font-bold text-[#e2e2e2] leading-tight truncate"
                      style={{ fontFamily: "var(--font-headline)" }}
                    >
                      {item.name}
                    </p>
                    <span
                      className="text-sm font-bold text-[#4be277] shrink-0"
                      style={{ fontFamily: "var(--font-headline)" }}
                    >
                      {formatCOP(item.price * quantity)}
                    </span>
                  </div>
                  {item.category && (
                    <p className="text-xs text-[#bccbb9] uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-body)" }}>
                      {item.category}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    {/* Qty controls */}
                    <div className="flex items-center gap-3 bg-[#1b1b1b] rounded-lg px-3 py-1.5">
                      <button
                        onClick={() => updateQty(item.id, quantity - 1)}
                        className="text-[#bccbb9] hover:text-[#4be277] transition-colors text-lg leading-none"
                        aria-label="Quitar uno"
                      >
                        −
                      </button>
                      <span className="text-sm font-bold text-[#e2e2e2] w-4 text-center" style={{ fontFamily: "var(--font-headline)" }}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, quantity + 1)}
                        className="text-[#bccbb9] hover:text-[#4be277] transition-colors text-lg leading-none"
                        aria-label="Agregar uno"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[10px] uppercase tracking-wider font-bold text-[#e2e2e2]/30 hover:text-red-400 transition-colors"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div className="px-8 py-6 border-t border-[#1f1f1f] space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest text-[#e2e2e2]/40" style={{ fontFamily: "var(--font-body)" }}>
                Total
              </span>
              <span className="text-2xl font-bold text-[#e2e2e2]" style={{ fontFamily: "var(--font-headline)" }}>
                {formatCOP(total)}
              </span>
            </div>
            <p className="text-xs text-[#bccbb9] text-center" style={{ fontFamily: "var(--font-body)" }}>
              Envío gratis · Pago contraentrega
            </p>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-br from-[#4be277] to-[#22c55e] text-[#002109] font-bold rounded-xl text-base hover:scale-[1.01] active:scale-95 transition-all shadow-xl"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              Pedir por WhatsApp
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
