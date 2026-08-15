import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StoreLayout } from "@/components/landing/StoreLayout";
import { Reveal } from "@/components/landing/shared";
import { useCart } from "@/lib/cart";
import { createShopOrder, type ShopOrder } from "@/lib/orders";
import { formatINR, SHOP_ORDER_STEPS } from "@/lib/shop";
import { useAction } from "convex/react";
import {
  BadgeCheck,
  Banknote,
  CreditCard,
  Landmark,
  Loader2,
  Mail,
  ShieldCheck,
  Smartphone,
  Truck,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DELIVERY_FEE = 49;
const FREE_DELIVERY_ABOVE = 999;
const DISCOUNT_ABOVE = 1499;
const DISCOUNT = 100;

const SHIPPING_METHODS = [
  { id: "standard", label: "Standard Delivery", eta: "5–7 days", fee: DELIVERY_FEE },
  { id: "express", label: "Express Delivery", eta: "2–3 days", fee: 149 },
] as const;

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone, note: "GPay · PhonePe · Paytm" },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, note: "Visa · Mastercard · RuPay" },
  { id: "netbanking", label: "Net Banking", icon: Landmark, note: "All major banks" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, note: "Pay at your door" },
] as const;

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const EMPTY_FORM: FormState = { name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" };

export default function ShopCheckout() {
  const { items, subtotal, clear } = useCart();
  const sendEmail = useAction(api.emails.sendOrderConfirmation);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [shipping, setShipping] = useState<(typeof SHIPPING_METHODS)[number]["id"]>("standard");
  const [payment, setPayment] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("upi");
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState<ShopOrder | null>(null);

  const shippingFee =
    subtotal >= FREE_DELIVERY_ABOVE
      ? 0
      : (SHIPPING_METHODS.find((s) => s.id === shipping)?.fee ?? DELIVERY_FEE);
  const discount = subtotal >= DISCOUNT_ABOVE ? DISCOUNT : 0;
  const total = subtotal + shippingFee - discount;

  const set = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email";
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) next.phone = "Enter a valid 10-digit phone";
    if (form.address.trim().length < 8) next.address = "Enter a complete address";
    if (form.city.trim().length < 2) next.city = "Required";
    if (form.state.trim().length < 2) next.state = "Required";
    if (!/^\d{6}$/.test(form.pincode.trim())) next.pincode = "6-digit pincode";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeOrder = async () => {
    if (items.length === 0) return;
    if (!validate()) {
      toast.error("Please complete the customer details.");
      return;
    }
    setPlacing(true);
    // Small delay so the "placing" state is visible in the demo.
    await new Promise((r) => setTimeout(r, 1200));

    const created = createShopOrder({
      customer: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      },
      shippingMethod: SHIPPING_METHODS.find((s) => s.id === shipping)?.label ?? "Standard Delivery",
      paymentMethod: PAYMENT_METHODS.find((p) => p.id === payment)?.label ?? "UPI",
      items: items.map((i) => ({
        id: i.id,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        kind: i.kind ?? "design",
        unit: i.unit,
        colour: i.colour,
        image: i.image,
      })),
      subtotal,
      shippingFee,
      discount,
      total,
    });

    // Best-effort confirmation email — never blocks the demo flow.
    try {
      const mail = await sendEmail({
        email: created.customer.email,
        customerName: created.customer.name,
        orderId: created.id,
        total: created.total,
        paymentMethod: created.paymentMethod,
        shippingMethod: created.shippingMethod,
        items: created.items.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
      });
      if (mail.mode === "live") toast.success("Confirmation email sent ✉️");
    } catch {
      // ignore — email is best-effort in demo mode
    }

    clear();
    setOrder(created);
    setPlacing(false);
    toast.success(`Order ${created.id} placed — demo payment recorded.`);
  };

  // Confirmation + tracking
  if (order) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <Reveal>
            <div className="rounded-[2rem] border border-emerald-400/40 bg-card p-8 text-center shadow-lg sm:p-12">
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <BadgeCheck className="size-9" />
              </span>
              <h1 className="font-display mt-5 text-3xl font-semibold tracking-tight">
                Order confirmed
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Order <code className="font-mono font-semibold text-primary">{order.id}</code> ·{" "}
                {formatINR(order.total)} · {order.paymentMethod}
              </p>
              <div className="mx-auto mt-4 max-w-md rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-800">
                Demo payment — simulated for the hackathon. No real money was
                charged. A confirmation email is sent automatically once an
                email provider is connected.
              </div>

              {/* Tracking timeline */}
              <div className="mt-8 text-left">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Tracking
                </p>
                <div className="mt-4 flex items-center">
                  {SHOP_ORDER_STEPS.map((step, i) => (
                    <div key={step} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          className={cn(
                            "flex size-7 items-center justify-center rounded-full border text-[10px] font-semibold",
                            i < order.step
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : i === order.step
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground",
                          )}
                        >
                          {i < order.step ? "✓" : i + 1}
                        </span>
                        <span
                          className={cn(
                            "hidden w-16 text-center text-[9px] leading-tight sm:block",
                            i === order.step ? "font-semibold text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {step}
                        </span>
                      </div>
                      {i < SHOP_ORDER_STEPS.length - 1 && (
                        <span className={cn("mx-1 h-px flex-1", i < order.step ? "bg-emerald-400" : "bg-border")} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild className="gap-2 rounded-full">
                  <Link to="/shop">
                    <Truck className="size-4" /> Continue Shopping
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2 rounded-full">
                  <Link to="/orders">View My Orders</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </StoreLayout>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-md px-4 py-28 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Zap className="size-7" />
          </span>
          <h1 className="font-display mt-5 text-2xl font-semibold">Checkout</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your cart is empty — add yarn or a design before checking out.
          </p>
          <Button asChild className="mt-6 gap-2 rounded-full">
            <Link to="/shop">Browse Yarn Shop</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.93_0.03_100),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:pt-20">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Checkout</p>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              Complete your order
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Demo checkout for the hackathon — payment is simulated and clearly
              labelled. Nothing is charged and no card details are stored.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
            {/* Left: forms */}
            <div className="space-y-6">
              {/* Customer details */}
              <Reveal>
                <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
                  <p className="text-sm font-semibold">1 · Customer details</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Field label="Full name" error={errors.name}>
                      <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Priya Nair" />
                    </Field>
                    <Field label="Email" error={errors.email}>
                      <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="priya@example.com" type="email" />
                    </Field>
                    <Field label="Phone number" error={errors.phone}>
                      <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98765 43210" inputMode="numeric" />
                    </Field>
                    <Field label="Pincode" error={errors.pincode}>
                      <Input value={form.pincode} onChange={(e) => set("pincode", e.target.value)} placeholder="560001" inputMode="numeric" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Address" error={errors.address}>
                        <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="House / street / area" className="min-h-16 resize-none" />
                      </Field>
                    </div>
                    <Field label="City" error={errors.city}>
                      <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Bengaluru" />
                    </Field>
                    <Field label="State" error={errors.state}>
                      <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="Karnataka" />
                    </Field>
                  </div>
                </div>
              </Reveal>

              {/* Shipping */}
              <Reveal delay={0.04}>
                <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
                  <p className="text-sm font-semibold">2 · Shipping method</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {SHIPPING_METHODS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setShipping(s.id)}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                          shipping === s.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border/70 hover:bg-muted/50",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Truck className={cn("size-4", shipping === s.id ? "text-primary" : "text-muted-foreground")} />
                          <span>
                            <span className="block text-sm font-medium">{s.label}</span>
                            <span className="block text-[10px] text-muted-foreground">{s.eta}</span>
                          </span>
                        </span>
                        <span className="text-sm font-semibold">
                          {subtotal >= FREE_DELIVERY_ABOVE ? "Free" : formatINR(s.fee)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Payment */}
              <Reveal delay={0.08}>
                <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">3 · Payment method</p>
                    <Badge className="gap-1 bg-amber-500/10 text-[10px] text-amber-700">
                      <ShieldCheck className="size-3" /> Demo Payment
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPayment(m.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                          payment === m.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border/70 hover:bg-muted/50",
                        )}
                      >
                        <span className={cn("flex size-9 items-center justify-center rounded-lg", payment === m.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                          <m.icon className="size-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">{m.label}</span>
                          <span className="block text-[10px] text-muted-foreground">{m.note}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3.5 py-2.5 text-[11px] leading-5 text-amber-800">
                    <strong>Demo Payment:</strong> no real transaction is
                    processed. When a payment gateway (Razorpay) is connected,
                    this flow upgrades to a secure, server-side checkout.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Right: summary */}
            <Reveal delay={0.1}>
              <div className="sticky top-24 rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
                <p className="text-sm font-semibold">Order summary</p>
                <div className="mt-4 space-y-2">
                  {items.map((i) => (
                    <div key={i.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{i.title}</span>
                        <span className="block text-[10px] text-muted-foreground">
                          {i.kind === "yarn"
                            ? `${i.unit ?? ""}${i.colour ? " · " + i.colour : ""}`
                            : `${i.dye} on ${i.fabric}`}{" "}
                          · ×{i.quantity}
                        </span>
                      </span>
                      <span className="shrink-0 font-medium">{formatINR(i.price * i.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2.5 border-t border-border/60 pt-4 text-sm">
                  <Row label="Subtotal" value={formatINR(subtotal)} />
                  <Row label="Shipping" value={shippingFee === 0 ? "Free" : formatINR(shippingFee)} />
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Bundle discount</span>
                      <span className="font-medium">−{formatINR(discount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="font-display text-2xl font-semibold text-primary">{formatINR(total)}</span>
                  </div>
                </div>
                <Button size="lg" className="mt-5 w-full gap-2 rounded-full" onClick={() => void placeOrder()} disabled={placing}>
                  {placing ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                  {placing ? "Placing demo order…" : `Place Order · ${formatINR(total)}`}
                </Button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground">
                  <Mail className="size-3 text-primary" />
                  Order confirmation email sent when an email provider is configured
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-[11px]">{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-[10px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
