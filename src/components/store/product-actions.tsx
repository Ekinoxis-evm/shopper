"use client";

import { useCart, type CartItem } from "@/lib/cart-context";

const WA_NUMBER = "573332848175";

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

interface Props {
  item: CartItem;
}

export function ProductActions({ item }: Props) {
  const { addItem } = useCart();

  const waMessage = [
    "Hola! Me interesa este producto:",
    "",
    `*${item.name}*`,
    `Precio: ${formatCOP(item.price)}`,
    "",
    "¿Está disponible?",
  ].join("\n");

  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => addItem(item)}
        className="flex items-center justify-center gap-3 w-full py-5 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#e2e2e2] font-bold rounded-xl text-lg transition-all active:scale-95 border border-[#353535]"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        <span className="material-symbols-outlined">add_shopping_cart</span>
        Agregar al carrito
      </button>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 w-full py-5 bg-gradient-to-br from-[#4be277] to-[#22c55e] text-[#002109] font-bold rounded-xl text-lg hover:scale-[1.01] active:scale-95 transition-all shadow-xl"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        <span className="material-symbols-outlined">chat</span>
        Pedir por WhatsApp
      </a>
    </div>
  );
}
