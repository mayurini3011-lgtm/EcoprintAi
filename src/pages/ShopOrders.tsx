import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BotanicalImage } from "@/components/brand/BotanicalImage";
import { StoreLayout } from "@/components/landing/StoreLayout";
import { Reveal } from "@/components/landing/shared";
import { listShopOrders } from "@/lib/orders";
import { formatINR, SHOP_ORDER_STEPS } from "@/lib/shop";
import { useState } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { Package, PackageSearch } from "lucide-react";

export default function ShopOrders() {
  const [orders] = useState(() => listShopOrders());

  return (
    <StoreLayout>
      <div className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.93_0.03_100),transparent)]" />
        <div className="mx-auto max-w-4xl px-4 pb-20 pt-16 sm:px-6 lg:pt-20">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Order Tracking</p>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              My orders
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
              Track every demo order from placement to delivery. These are
              simulated orders from the hackathon checkout — no real
              transactions.
            </p>
          </Reveal>

          {orders.length === 0 ? (
            <Reveal delay={0.05}>
              <div className="mx-auto mt-14 max-w-md rounded-3xl border border-border/70 bg-card p-10 text-center shadow-sm">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <PackageSearch className="size-7" />
                </span>
                <h2 className="font-display mt-5 text-xl font-semibold">No orders yet</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Place a demo order from the yarn shop or design studio and it
                  will appear here with its full tracking timeline.
                </p>
                <Button asChild className="mt-6 gap-2 rounded-full">
                  <Link to="/shop">Shop Sustainable Yarns</Link>
                </Button>
              </div>
            </Reveal>
          ) : (
            <div className="mt-10 space-y-5">
              {orders.map((order, orderIdx) => {
                const itemsSummary = order.items
                  .map((i) => `${i.quantity} × ${i.title}`)
                  .join(", ");
                const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <Reveal key={order.id} delay={Math.min(orderIdx * 0.04, 0.2)}>
                    <article className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Package className="size-5" />
                          </span>
                          <div>
                            <p className="font-mono text-sm font-semibold">{order.id}</p>
                            <p className="text-[11px] text-muted-foreground">
                              Placed {date} · {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-500/10 text-[10px] text-amber-700">Demo order</Badge>
                          <p className="font-display text-lg font-semibold text-primary">
                            {formatINR(order.total)}
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mt-4 flex flex-wrap gap-3">
                        {order.items.map((i) => (
                          <div
                            key={`${order.id}-${i.id}`}
                            className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-border/60 bg-background px-3 py-2"
                          >
                            {i.kind === "yarn" && i.image ? (
                              <BotanicalImage
                                src={i.image}
                                alt={i.title}
                                emoji="🧵"
                                className="size-8 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs">
                                ✦
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="max-w-40 truncate text-xs font-medium">{i.title}</p>
                              <p className="text-[10px] text-muted-foreground">
                                ×{i.quantity} · {formatINR(i.price * i.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Timeline */}
                      <div className="mt-5">
                        <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                          Status · {SHOP_ORDER_STEPS[order.step]}
                        </p>
                        <div className="mt-3 flex items-center">
                          {SHOP_ORDER_STEPS.map((step, i) => (
                            <div key={step} className="flex flex-1 items-center last:flex-none">
                              <div className="flex flex-col items-center gap-1.5">
                                <span
                                  className={cn(
                                    "flex size-6 items-center justify-center rounded-full border text-[9px] font-semibold",
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
                                    "hidden w-14 text-center text-[9px] leading-tight sm:block",
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

                      <p className="mt-4 truncate border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                        {itemsSummary} · {order.paymentMethod} · {order.shippingMethod}
                      </p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}
