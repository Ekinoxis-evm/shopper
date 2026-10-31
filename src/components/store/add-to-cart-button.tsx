"use client";

import { useCart, type CartItem } from "@/lib/cart-context";

export function AddToCartButton({ item }: { item: CartItem }) {
  const { addItem } = useCart();

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // don't follow the parent Link
        addItem(item);
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b1b1b] hover:bg-[#4be277] hover:text-[#002109] text-[#4be277] text-xs font-bold rounded-lg transition-all duration-200 active:scale-95"
      style={{ fontFamily: "var(--font-headline)" }}
      aria-label={`Agregar ${item.name} al carrito`}
    >
      <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
      Agregar
    </button>
  );
}
