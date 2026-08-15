/**
 * Demo shop orders — persisted to localStorage so the checkout confirmation
 * and tracking timeline survive a page refresh. This is a simulated
 * marketplace flow for the hackathon; no real transaction is recorded.
 */
import { SHOP_ORDER_STEPS } from "./shop";

export interface ShopOrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  kind?: "design" | "yarn";
  unit?: string;
  colour?: string;
  image?: string;
}

export interface ShopOrder {
  id: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  shippingMethod: string;
  paymentMethod: string;
  items: ShopOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  /** Index into SHOP_ORDER_STEPS. */
  step: number;
  demo: true;
}

const STORAGE_KEY = "ecoprint-shop-orders";

function read(): ShopOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ShopOrder[]) : [];
  } catch {
    return [];
  }
}

function write(orders: ShopOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

/** Create a demo order, persist it and return it. */
export function createShopOrder(
  data: Omit<ShopOrder, "id" | "createdAt" | "step" | "demo">,
): ShopOrder {
  const id = `EC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const order: ShopOrder = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    step: 0,
    demo: true,
  };
  write([order, ...read()]);
  return order;
}

export function listShopOrders(): ShopOrder[] {
  return read();
}

export function shopOrderStatus(order: ShopOrder) {
  const current = SHOP_ORDER_STEPS[order.step] ?? "Order Placed";
  const done = order.step >= SHOP_ORDER_STEPS.length - 1;
  return { current, done };
}
