import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/garment/PaletteSwatches";
import { useQuery } from "convex/react";
import { Clock, MapPin, Scissors, Star } from "lucide-react";
import { useNavigate } from "react-router";
import { formatINR } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export default function Tailors() {
  const tailors = useQuery(api.catalog.listTailors);
  const navigate = useNavigate();

  if (!tailors) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          Tailor Marketplace
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Skilled hands for your design
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vetted independent tailors who work with natural dyes and
          sustainable fabrics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tailors.map((t) => (
          <Card key={t.code} className="shadow-none border-border/70">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/8 text-primary">
                    <Scissors className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {t.shopName}
                    </p>
                  </div>
                </div>
                <StatusPill status={t.available ? "available" : "limited"} />
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-700">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  {t.rating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  {t.reviews} reviews
                </span>
                <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-3" /> {t.location}
                </span>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                {t.specialization}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                  <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
                    Price
                  </p>
                  <p className="mt-0.5 font-semibold">
                    {formatINR(t.priceMin)}–{formatINR(t.priceMax)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                  <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
                    Completion
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 font-semibold">
                    <Clock className="size-3" /> {t.deliveryDays}–{t.deliveryDays + 2} days
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {t.previousWork.map((w) => (
                  <Badge key={w} variant="secondary" className="text-[10px] font-normal">
                    {w}
                  </Badge>
                ))}
              </div>

              <Button
                className="mt-4 w-full"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Select Tailor
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
