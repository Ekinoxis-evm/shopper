"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  category?: string | null;
}

interface CartEntry {
  item: CartItem;
  quantity: number;
}

interface CartContextValue {
  entries: CartEntry[];
  count: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<CartEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shopper-cart");
      if (saved) setEntries(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("shopper-cart", JSON.stringify(entries));
  }, [entries]);

  const count = entries.reduce((sum, e) => sum + e.quantity, 0);
  const total = entries.reduce((sum, e) => sum + e.item.price * e.quantity, 0);

  const addItem = useCallback((item: CartItem) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.item.id === item.id);
      if (existing) {
        return prev.map((e) =>
          e.item.id === item.id ? { ...e, quantity: e.quantity + 1 } : e
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.item.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setEntries((prev) => prev.filter((e) => e.item.id !== id));
    } else {
      setEntries((prev) =>
        prev.map((e) => (e.item.id === id ? { ...e, quantity: qty } : e))
      );
    }
  }, []);

  const clearCart = useCallback(() => setEntries([]), []);

  return (
    <CartContext.Provider
      value={{
        entries,
        count,
        total,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
