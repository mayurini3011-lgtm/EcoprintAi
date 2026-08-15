import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/garment/PaletteSwatches";
import { useQuery } from "convex/react";
import {
  ArrowUpRight,
  Clock,
  MapPin,
  Scissors,
  Search,
  Star,
} from "lucide-react";
import { formatINR } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import { Link } from "react-router";

export default function Tailors() {
  const tailors = useQuery(api.catalog.listTailors);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tailors ?? [];
    return (tailors ?? []).filter((t) =>
      [t.name, t.shopName, t.location, t.specialization, t.previousWork.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [tailors, query]);

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
          Tailor Network
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Skilled hands for your design
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vetted independent tailors who work with natural dyes and
          sustainable fabrics — pick one and book your delivery slot in the
          studio.
        </p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, city or specialty…"
          className="h-10 pl-9 text-sm"
        />
      </div>

      {filtered.length === 0 && (
        <Card className="shadow-none border-border/70">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No tailors match “{query}”.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <Card key={t.code} className="shadow-none border-border/70">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
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
                <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-700">
                  <Star className="size-3 fill-amber-500 text-amber-600" />
                  {t.rating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">{t.reviews} reviews</span>
                <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-3" /> {t.location}
                </span>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                {t.specialization}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg bg-muted/60 px-2.5 py-2">
                  <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
                    Price
                  </p>
                  <p className="mt-0.5 font-semibold">
                    {formatINR(t.priceMin)}–{formatINR(t.priceMax)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/60 px-2.5 py-2">
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

              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <Link to={`/tailors/${t.code}`}>
                  View profile <ArrowUpRight className="ml-1 size-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
