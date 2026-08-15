import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BotanicalImage } from "@/components/brand/BotanicalImage";
import { StoreLayout } from "@/components/landing/StoreLayout";
import { Reveal } from "@/components/landing/shared";
import { useCart } from "@/lib/cart";
import { getYarn, formatINR } from "@/lib/shop";
import {
  ArrowLeft,
  Check,
  Droplets,
  Leaf,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function YarnDetail() {
  const { id } = useParams();
  const yarn = getYarn(id ?? "");
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [colour, setColour] = useState(yarn?.colours[0] ?? "");

  if (!yarn) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-md px-4 py-32 text-center">
          <h1 className="font-display text-2xl font-semibold">Yarn not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This product isn't in the catalogue — browse the full shop instead.
          </p>
          <Button asChild className="mt-6 gap-2 rounded-full">
            <Link to="/shop">Back to Yarn Shop</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const addToCart = () => {
    addItem({
      id: yarn.id,
      title: yarn.name,
      price: yarn.price,
      kind: "yarn",
      unit: yarn.weight,
      colour,
      material: yarn.material,
      image: yarn.image,
      quantity: qty,
    } as never);
    toast.success(`${qty} × ${yarn.name} added to cart`);
  };

  const buyNow = () => {
    addToCart();
    navigate("/checkout");
  };

  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 gap-1.5 rounded-full text-muted-foreground">
          <Link to="/shop">
            <ArrowLeft className="size-4" /> Back to Yarn Shop
          </Link>
        </Button>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-2 shadow-lg">
              <BotanicalImage
                src={yarn.image}
                alt={yarn.name}
                emoji={yarn.emoji}
                className="aspect-square w-full rounded-[1.6rem] object-cover"
              />
              <Badge className="absolute left-5 top-5 gap-1 border-primary/20 bg-background/85 text-primary backdrop-blur">
                <Leaf className="size-3" /> {yarn.sustainabilityScore}/100 sustainable
              </Badge>
              <span
                className={cn(
                  "absolute right-5 top-5 rounded-full px-3 py-1 text-[11px] font-semibold",
                  yarn.stock > 25
                    ? "bg-emerald-500/10 text-emerald-700"
                    : "bg-amber-500/10 text-amber-700",
                )}
              >
                {yarn.stock > 25 ? "In stock" : `Only ${yarn.stock} left`}
              </span>
            </div>
          </Reveal>

          {/* Info */}
          <Reveal delay={0.05}>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                Sustainable Yarn
              </p>
              <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {yarn.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("size-4", i < Math.round(yarn.rating) ? "fill-current" : "opacity-25")} />
                  ))}
                </span>
                <span className="text-sm text-muted-foreground">
                  {yarn.rating.toFixed(1)} · {yarn.reviewCount} reviews
                </span>
                <span className="font-display text-2xl font-semibold text-primary">
                  {formatINR(yarn.price)}
                  <span className="text-sm font-normal text-muted-foreground"> / {yarn.weight}</span>
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Info icon={Package} label="Material" value={yarn.material} />
                <Info icon={Droplets} label="Weight" value={yarn.weight} />
              </div>

              {/* Available colours */}
              <div className="mt-5">
                <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Available colours
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {yarn.colours.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColour(c)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                        colour === c
                          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                          : "border-border/70 text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dye compatibility */}
              <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Droplets className="size-4 text-primary" />
                  Natural dye compatibility: {yarn.dyeCompatibility}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {yarn.recommendedDyes.map((d) => (
                    <Link
                      key={d}
                      to={`/design-studio?dye=${encodeURIComponent(d)}`}
                      className="rounded-full border border-primary/20 bg-card px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      {d}
                    </Link>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Recommended dyes for this fibre — tap one to preview it in the Design Studio.
                </p>
              </div>

              {/* Quantity + CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-full border border-border/70 p-1">
                  <Button variant="ghost" size="icon" className="size-8 rounded-full" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                  <Button variant="ghost" size="icon" className="size-8 rounded-full" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
                    <Plus className="size-4" />
                  </Button>
                </div>
                <Button className="flex-1 gap-2 rounded-full" onClick={addToCart}>
                  <ShoppingBag className="size-4" /> Add to Cart · {formatINR(yarn.price * qty)}
                </Button>
                <Button variant="outline" className="gap-2 rounded-full" onClick={buyNow}>
                  <Zap className="size-4 text-primary" /> Buy Now
                </Button>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Truck className="size-3.5 text-primary" /> {yarn.shipping}
              </p>

              {/* Description */}
              <p className="mt-6 border-t border-border/60 pt-5 text-sm leading-7 text-muted-foreground">
                {yarn.description}
              </p>

              {/* Care + shipping */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-xs font-semibold">Care instructions</p>
                  <ul className="mt-2 space-y-1.5">
                    {yarn.care.map((c) => (
                      <li key={c} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                        <Check className="mt-0.5 size-3 shrink-0 text-primary" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-xs font-semibold">Shipping</p>
                  <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{yarn.shipping}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="size-3.5 text-primary" /> Carbon-neutral packaging
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Reviews */}
        <Reveal className="mt-14">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Customer reviews</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {yarn.reviews.map((r) => (
              <div key={r.author} className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{r.author}</p>
                  <span className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("size-3", i < r.rating ? "fill-current" : "opacity-25")} />
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">“{r.text}”</p>
                <p className="mt-2 text-[10px] text-muted-foreground">Verified buyer · EcoPrint demo</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </StoreLayout>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
        <p className="truncate text-xs font-medium">{value}</p>
      </div>
    </div>
  );
}
