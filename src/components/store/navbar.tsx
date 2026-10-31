"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const categories = [
  { label: "Ropa", href: "/categoria/ropa" },
  { label: "Hogar", href: "/categoria/hogar" },
  { label: "Mascotas", href: "/categoria/mascotas" },
  { label: "Cuidado Personal", href: "/categoria/cuidado-personal" },
];

export function Navbar() {
  const { count, openCart } = useCart();

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-2xl bg-[#131313]/60 backdrop-blur-3xl shadow-[0_40px_60px_-15px_rgba(0,83,33,0.08)] flex justify-between items-center px-8 py-4 z-50">
      <Link
        href="/"
        className="text-2xl font-bold tracking-tighter text-[#e2e2e2] uppercase"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        SHOPPER
      </Link>

      <div className="hidden md:flex items-center gap-10">
        {categories.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="text-[#e2e2e2]/70 hover:text-[#e2e2e2] transition-all duration-300 text-sm font-medium tracking-wide"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {/* Cart button with badge */}
        <button
          onClick={openCart}
          className="relative text-[#e2e2e2]/70 hover:text-[#e2e2e2] transition-colors"
          aria-label={`Carrito${count > 0 ? ` — ${count} productos` : ""}`}
        >
          <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
          {count > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 bg-[#4be277] text-[#002109] text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>

        {/* Mobile menu (placeholder) */}
        <button className="md:hidden text-[#e2e2e2]/70 hover:text-[#e2e2e2] transition-colors">
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
      </div>
    </nav>
  );
}
