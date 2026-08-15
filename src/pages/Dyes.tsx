import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/garment/PaletteSwatches";
import { useQuery } from "convex/react";
import { Droplets, Leaf, ShieldCheck, Sprout, Factory } from "lucide-react";
import { formatDate, formatINR } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dyes() {
  const dyes = useQuery(api.catalog.listDyes);
  const farmers = useQuery(api.catalog.listFarmers);
  const manufacturers = useQuery(api.catalog.listManufacturers);

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
          Natural Dye Catalogue
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Every batch traced to its roots
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dyes.length} dye batches · each linked to a farmer source and a
          certified manufacturer.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dyes.map((dye) => (
          <Card key={dye.code} className="shadow-none border-border/70">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="size-10 shrink-0 rounded-full border border-black/10 shadow-inner"
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
                  <Sprout className="size-3.5 text-emerald-600" />
                  <span className="text-muted-foreground">Source:</span>
                  <span className="font-medium">{dye.farmerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Factory className="size-3.5 text-sky-600" />
                  <span className="text-muted-foreground">Manufactured:</span>
                  <span className="font-medium">{dye.manufacturerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="size-3.5 text-indigo-600" />
                  <span className="text-muted-foreground">Raw batch:</span>
                  <span className="font-mono text-[10px]">{dye.rawBatchCode}</span>
                </div>
              </div>

              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-muted-foreground">
                <Leaf className="mt-0.5 size-3 shrink-0 text-emerald-600" />
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
                        ? "size-1.5 rounded-full bg-emerald-500"
                        : dye.availability === "limited"
                          ? "size-1.5 rounded-full bg-amber-500"
                          : "size-1.5 rounded-full bg-zinc-400"
                    }
                  />
                  {dye.availability}
                </span>
              </div>

              {dye.verifiedAt && (
                <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  Verified {formatDate(dye.verifiedAt)} · Mordant: {dye.mordant}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="shadow-none border-border/70">
          <CardContent className="p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sprout className="size-4 text-emerald-600" /> Farmer sources
            </p>
            <div className="space-y-2">
              {(farmers ?? []).map((f) => (
                <div
                  key={f.code}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs"
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
              <Factory className="size-4 text-sky-600" /> Manufacturers
            </p>
            <div className="space-y-2">
              {(manufacturers ?? []).map((m) => (
                <div
                  key={m.code}
                  className="rounded-lg bg-muted/50 px-3 py-2 text-xs"
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
                        className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700"
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
