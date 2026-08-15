import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BotanicalImage } from "@/components/brand/BotanicalImage";
import { StoreLayout } from "@/components/landing/StoreLayout";
import { Reveal } from "@/components/landing/shared";
import { useCart } from "@/lib/cart";
import { YARN_PRODUCTS, formatINR } from "@/lib/shop";
import { Leaf, ShoppingBag, Star, Truck, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-3.5 ${i < Math.round(rating) ? "fill-current" : "opacity-25"}`} />
      ))}
      <span className="ml-1 text-[11px] font-medium text-muted-foreground">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function Shop() {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const addToCart = (id: string) => {
    const yarn = YARN_PRODUCTS.find((y) => y.id === id);
    if (!yarn) return;
    addItem({
      id: yarn.id,
      title: yarn.name,
      price: yarn.price,
      kind: "yarn",
      unit: yarn.weight,
      colour: yarn.colours[0],
      material: yarn.material,
      image: yarn.image,
    });
    toast.success(`${yarn.name} added to cart`);
  };

  const buyNow = (id: string) => {
    addToCart(id);
    navigate("/checkout");
  };

  return (
    <StoreLayout>
      <div className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.93_0.03_100),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:pt-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                  Yarn Shop
                </p>
                <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Shop Sustainable Yarns
                </h1>
                <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                  Premium yarns selected for natural dyeing, sustainable fashion
                  and creative textile design.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-xs text-muted-foreground">
                <Truck className="size-4 text-primary" /> Free delivery above ₹999
              </div>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {YARN_PRODUCTS.map((y, i) => (
              <Reveal key={y.id} delay={i * 0.05}>
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                  <Link to={`/shop/${y.id}`} className="relative block overflow-hidden">
                    <BotanicalImage
                      src={y.image}
                      alt={y.name}
                      emoji={y.emoji}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <Badge className="absolute left-3 top-3 gap-1 border-primary/20 bg-background/85 text-primary backdrop-blur">
                      <Leaf className="size-3" /> {y.sustainabilityScore}/100 sustainable
                    </Badge>
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/shop/${y.id}`} className="text-base font-semibold transition-colors hover:text-primary">
                          {y.name}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{y.material}</p>
                      </div>
                      <p className="font-display text-lg font-semibold text-primary">
                        {formatINR(y.price)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Stars rating={y.rating} />
                      <span className="text-[11px] text-muted-foreground">{y.reviewCount} reviews</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                      <Info label="Weight" value={y.weight} />
                      <Info label="Colours" value={y.colours.join(" · ")} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {y.recommendedDyes.slice(0, 3).map((d) => (
                        <span key={d} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {d}
                        </span>
                      ))}
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        {y.dyeCompatibility} for dyeing
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-border/60 pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5 rounded-full"
                        onClick={() => addToCart(y.id)}
                      >
                        <ShoppingBag className="size-3.5" /> Add to Cart
                      </Button>
                      <Button size="sm" className="flex-1 gap-1.5 rounded-full" onClick={() => buyNow(y.id)}>
                        <Zap className="size-3.5" /> Buy Now
                      </Button>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2.5 py-1.5">
      <p className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 truncate text-[11px] font-medium">{value}</p>
    </div>
  );
}
