import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/garment/PaletteSwatches";
import { useQuery } from "convex/react";
import {
  ArrowUpRight,
  Droplets,
  Leaf,
  Search,
  ShieldCheck,
  Sprout,
  Factory,
} from "lucide-react";
import { formatDate, formatINR } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import { Link } from "react-router";

export default function Dyes() {
  const dyes = useQuery(api.catalog.listDyes);
  const farmers = useQuery(api.catalog.listFarmers);
  const manufacturers = useQuery(api.catalog.listManufacturers);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dyes ?? [];
    return (dyes ?? []).filter((d) =>
      [d.name, d.botanicalSource, d.code, d.colorName, d.farmerName, d.manufacturerName]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [dyes, query]);

  if (!dyes) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          Dye Catalogue
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Every batch traced to its roots
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dyes.length} verified dye batches · each linked to a farm source and
          a certified manufacturer.
        </p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by dye, source, batch or maker…"
          className="h-10 pl-9 text-sm"
        />
      </div>

      {filtered.length === 0 && (
        <Card className="shadow-none border-border/70">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No dye batches match “{query}”.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((dye) => (
          <Card key={dye.code} className="shadow-none border-border/70">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="size-10 shrink-0 rounded-full border border-white/10 shadow-inner"
                    style={{ backgroundColor: dye.colorHex }}
                    title={dye.colorName}
                  />
                  <div>
                    <p className="text-sm font-semibold">{dye.name}</p>
                    <p className="text-[11px] text-muted-foreground italic">
                      {dye.botanicalSource}
                    </p>
                  </div>
                </div>
                <StatusPill status={dye.status} />
              </div>

              <p className="mt-3 font-mono text-[10px] text-muted-foreground">
                Batch {dye.code} · {dye.colorName}
              </p>

              <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-xs">
                <div className="flex items-center gap-2">
                  <Sprout className="size-3.5 text-emerald-400" />
                  <span className="text-muted-foreground">Source:</span>
                  <span className="font-medium">{dye.farmerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Factory className="size-3.5 text-sky-400" />
                  <span className="text-muted-foreground">Manufactured:</span>
                  <span className="font-medium">{dye.manufacturerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="size-3.5 text-indigo-400" />
                  <span className="text-muted-foreground">Raw batch:</span>
                  <span className="font-mono text-[10px]">{dye.rawBatchCode}</span>
                </div>
              </div>

              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-muted-foreground">
                <Leaf className="mt-0.5 size-3 shrink-0 text-emerald-400" />
                {dye.sustainabilityInfo}
              </p>

              <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-xs font-semibold">
                  {formatINR(dye.pricePerKg)}/kg
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground capitalize">
                  <span
                    className={
                      dye.availability === "available"
                        ? "size-1.5 rounded-full bg-emerald-400"
                        : dye.availability === "limited"
                          ? "size-1.5 rounded-full bg-amber-400"
                          : "size-1.5 rounded-full bg-zinc-500"
                    }
                  />
                  {dye.availability}
                </span>
              </div>

              {dye.verifiedAt && (
                <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <ShieldCheck className="size-3 text-emerald-400" />
                  Verified {formatDate(dye.verifiedAt)} · Mordant: {dye.mordant}
                </p>
              )}

              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <Link to={`/dyes/${dye.code}`}>
                  View batch record <ArrowUpRight className="ml-1 size-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="shadow-none border-border/70">
          <CardContent className="p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sprout className="size-4 text-emerald-400" /> Farm sources
            </p>
            <div className="space-y-2">
              {(farmers ?? []).map((f) => (
                <div
                  key={f.code}
                  className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-medium">{f.farmName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {f.location} · {f.crops.join(", ")}
                    </p>
                  </div>
                  <StatusPill status={f.verified ? "verified" : "pending"} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none border-border/70">
          <CardContent className="p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Factory className="size-4 text-sky-400" /> Manufacturers
            </p>
            <div className="space-y-2">
              {(manufacturers ?? []).map((m) => (
                <div
                  key={m.code}
                  className="rounded-lg bg-muted/60 px-3 py-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{m.name}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {m.code}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {m.location} · {m.specialties.join(", ")}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.certifications.map((c) => (
                      <span
                        key={c}
                        className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
