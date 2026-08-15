/**
 * Demo cart — persisted to localStorage so the cart icon, the design studio
 * section and the checkout section all stay in sync via custom events.
 *
 * This is a demo/shopping-cart experience for the public website. When a real
 * payments provider is connected, checkout moves to the authenticated app.
 */
import { useEffect, useState } from "react";

export interface CartItem {
  /** Stable id — design title + fabric + pattern, or yarn id. */
  id: string;
  title: string;
  price: number;
  quantity: number;
  /** "design" (AI-generated garment) or "yarn" (shop product). */
  kind?: "design" | "yarn";
  // Design fields (kind === "design") -------------------------------------
  fabric?: string;
  pattern?: string;
  dye?: string;
  seed?: number;
  palette?: { name: string; hex: string }[];
  // Yarn fields (kind === "yarn") -----------------------------------------
  unit?: string;
  colour?: string;
  material?: string;
  image?: string;
}

const STORAGE_KEY = "ecoprint-cart";
const CHANGE_EVENT = "ecoprint:cart-changed";

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => read());

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(CHANGE_EVENT, sync);
    return () => window.removeEventListener(CHANGE_EVENT, sync);
  }, []);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    const current = read();
    const found = current.find((i) => i.id === item.id);
    if (found) found.quantity += 1;
    else current.push({ ...item, kind: item.kind ?? "design", quantity: 1 });
    write(current);
  };

  const setQuantity = (id: string, quantity: number) => {
    const next = read()
      .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
      .filter((i) => i.quantity > 0);
    write(next);
  };

  const removeItem = (id: string) => {
    write(read().filter((i) => i.id !== id));
  };

  const clear = () => write([]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { items, count, subtotal, addItem, setQuantity, removeItem, clear };
}
