import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BotanicalImage } from "@/components/brand/BotanicalImage";
import { StoreLayout } from "@/components/landing/StoreLayout";
import { Reveal } from "@/components/landing/shared";
import { DesignCanvas } from "@/components/design/DesignCanvas";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/shop";
import { ArrowRight, Leaf, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

const DELIVERY_FEE = 49;
const FREE_DELIVERY_ABOVE = 999;
const DISCOUNT_ABOVE = 1499;
const DISCOUNT = 100;

export default function CartPage() {
  const { items, subtotal, setQuantity, removeItem } = useCart();

  const shippingFee = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const discount = subtotal >= DISCOUNT_ABOVE ? DISCOUNT : 0;
  const total = subtotal + shippingFee - discount;

  return (
    <StoreLayout>
      <div className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.93_0.03_100),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:pt-20">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Your Cart</p>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              Shopping cart
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
              Yarns and AI designs, held for you — quantities update instantly
              and the cart persists for this session.
            </p>
          </Reveal>

          {items.length === 0 ? (
            <Reveal delay={0.05}>
              <div className="mx-auto mt-14 max-w-md rounded-3xl border border-border/70 bg-card p-10 text-center shadow-sm">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShoppingBag className="size-7" />
                </span>
                <h2 className="font-display mt-5 text-xl font-semibold">Your cart is empty</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Browse the yarn shop or generate a design in the studio and
                  add it to your cart.
                </p>
                <Button asChild className="mt-6 gap-2 rounded-full">
                  <Link to="/shop">
                    Browse Yarn Shop <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
              {/* Items */}
              <Reveal delay={0.05}>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-3xl border border-border/70 bg-card p-4 shadow-sm"
                    >
                      <div className="w-20 shrink-0 overflow-hidden rounded-2xl ring-1 ring-border">
                        {item.kind === "yarn" && item.image ? (
                          <BotanicalImage
                            src={item.image}
                            alt={item.title}
                            emoji="🧵"
                            className="aspect-square w-full object-cover"
                          />
                        ) : (
                          <DesignCanvas
                            spec={{
                              seed: item.seed ?? 1,
                              pattern: item.pattern ?? "Floral",
                              palette: item.palette ?? [],
                            }}
                            className="w-full"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{item.title}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {item.kind === "yarn"
                            ? `${item.material ?? "Yarn"}${item.colour ? " · " + item.colour : ""} · ${item.unit ?? ""}`
                            : `${item.dye} on ${item.fabric} · ${item.pattern}`}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-primary">
                          {formatINR(item.price)}
                          <span className="text-[10px] font-normal text-muted-foreground"> each</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8 rounded-full"
                          aria-label="Decrease quantity"
                          onClick={() => {
                            if (item.quantity <= 1) removeItem(item.id);
                            else setQuantity(item.id, item.quantity - 1);
                          }}
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8 rounded-full"
                          aria-label="Increase quantity"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                      <div className="w-20 text-right">
                        <p className="text-sm font-semibold">{formatINR(item.price * item.quantity)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-0.5 size-8 rounded-full p-0 text-destructive hover:text-destructive"
                          aria-label={`Remove ${item.title}`}
                          onClick={() => {
                            removeItem(item.id);
                            toast.success(`${item.title} removed from cart`);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Summary */}
              <Reveal delay={0.1}>
                <div className="sticky top-24 rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
                  <p className="text-sm font-semibold">Order summary</p>
                  <div className="mt-4 space-y-2.5 text-sm">
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
                      <span className="font-display text-2xl font-semibold text-primary">
                        {formatINR(total)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <Truck className="size-3.5 text-primary" /> Free delivery above {formatINR(FREE_DELIVERY_ABOVE)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Leaf className="size-3.5 text-primary" /> Save {formatINR(DISCOUNT)} on orders above {formatINR(DISCOUNT_ABOVE)}
                    </p>
                  </div>
                  <Button asChild size="lg" className="mt-5 w-full gap-2 rounded-full">
                    <Link to="/checkout">
                      Proceed to Checkout <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="mt-2 w-full gap-2 rounded-full">
                    <Link to="/shop">
                      <ShoppingBag className="size-4" /> Continue Shopping
                    </Link>
                  </Button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground">
                    <Badge className="bg-amber-500/10 px-2 text-[9px] text-amber-700">Demo cart</Badge>
                    Nothing is charged — checkout is simulated for the hackathon.
                  </p>
                </div>
              </Reveal>
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
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
