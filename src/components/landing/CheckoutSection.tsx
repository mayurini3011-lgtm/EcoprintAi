import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DesignCanvas } from "@/components/design/DesignCanvas";
import { SectionHeading, Reveal } from "./shared";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  CreditCard,
  Landmark,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Trash2,
  Wallet,
} from "lucide-react";
import { Link } from "react-router";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone, note: "GPay, PhonePe, Paytm" },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, note: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net Banking", icon: Landmark, note: "All major banks" },
  { id: "wallet", label: "Wallets", icon: Wallet, note: "Paytm & more" },
] as const;

const DELIVERY_FEE = 49;
const FREE_DELIVERY_ABOVE = 2999;

export function CheckoutSection() {
  const { items, subtotal, setQuantity, removeItem, clear } = useCart();
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("upi");
  const [paying, setPaying] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + delivery + gst;

  const pay = async () => {
    if (items.length === 0) return;
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1400));
    const id = `ORD-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    setOrderId(id);
    clear();
    setPaying(false);
    toast.success(`Payment successful — order ${id} confirmed.`);
  };

  return (
    <section id="checkout" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Order & Payment"
          title="Checkout, Sustainably"
          description="Review your custom designs, choose a delivery slot and pay your way — UPI, card, net banking or wallet. Demo checkout — no real payment is processed and keys never touch the frontend."
        />
      </Reveal>

      {orderId ? (
        <Reveal>
          <div className="mx-auto max-w-xl rounded-3xl border border-primary/25 bg-card p-10 text-center shadow-sm">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="size-8" />
            </span>
            <h3 className="font-display mt-5 text-2xl font-semibold">Order confirmed</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Order <code className="font-mono font-semibold text-primary">{orderId}</code> is being
              prepared. Sign in to track it and receive its secure garment ID.
            </p>
            <Button asChild className="mt-6 gap-2 rounded-full">
              <Link to="/auth?returnTo=/orders/garments">Track my order</Link>
            </Button>
          </div>
        </Reveal>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Cart items */}
          <Reveal delay={0.05}>
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShoppingBag className="size-4 text-primary" /> Your cart
                <Badge variant="outline" className="ml-1">{items.length}</Badge>
              </p>

              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-14 text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <ShoppingBag className="size-7" />
                  </span>
                  <p className="text-sm font-medium">Your cart is empty</p>
                  <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                    Generate a design in the studio and add it to your cart to
                    see the checkout flow.
                  </p>
                  <Button asChild size="sm" className="mt-2 gap-1.5 rounded-full">
                    <Link to="/auth?returnTo=/design-studio">Open Design Studio</Link>
                  </Button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background p-3"
                    >
                      <div className="w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-border">
                        <DesignCanvas
                          spec={{
                            seed: item.seed ?? 1,
                            pattern: item.pattern ?? "Floral",
                            palette: item.palette ?? [],
                          }}
                          className="w-full"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{item.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {item.dye} on {item.fabric} · {item.pattern}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-primary">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          aria-label="Increase quantity"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          {/* Summary */}
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold">Order summary</p>
              <div className="mt-4 space-y-2.5 text-sm">
                <Row label="Product" value={`${items.reduce((s, i) => s + i.quantity, 0)} design(s)`} />
                <Row label="Customization" value="Fabric · dye · pattern" />
                <Row label="Subtotal" value={`₹${subtotal.toLocaleString("en-IN")}`} />
                <Row label="Delivery" value={delivery === 0 ? "Free" : `₹${delivery}`} />
                <Row label="GST (18%)" value={`₹${gst.toLocaleString("en-IN")}`} />
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-display text-xl font-semibold text-primary">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <p className="mt-5 text-xs font-semibold">Payment method</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors",
                      method === m.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border/70 hover:bg-muted/50",
                    )}
                  >
                    <m.icon className={cn("size-4", method === m.id ? "text-primary" : "text-muted-foreground")} />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium">{m.label}</span>
                      <span className="block truncate text-[9px] text-muted-foreground">{m.note}</span>
                    </span>
                  </button>
                ))}
              </div>

              <Button
                className="mt-5 w-full gap-2 rounded-full"
                onClick={() => void pay()}
                disabled={paying || items.length === 0}
              >
                {paying ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                {paying ? "Processing payment…" : "Proceed to Payment"}
              </Button>
              <p className="mt-3 text-center text-[10px] leading-4 text-muted-foreground">
                Demo checkout — no real money moves. When a payment provider is
                connected, checkout runs securely server-side.
              </p>
            </div>
          </Reveal>
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
