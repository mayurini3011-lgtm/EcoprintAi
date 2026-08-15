import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusPill } from "@/components/garment/PaletteSwatches";
import { useQuery } from "convex/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Droplets,
  Factory,
  Leaf,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { formatDate, formatINR } from "@/lib/format";

export default function DyeDetail() {
  const { code = "" } = useParams();
  const dyes = useQuery(api.catalog.listDyes);
  const rawBatches = useQuery(api.catalog.listRawMaterialBatches);
  const farmers = useQuery(api.catalog.listFarmers);
  const manufacturers = useQuery(api.catalog.listManufacturers);

  const dye = (dyes ?? []).find((d) => d.code === code);
  const rawBatch = rawBatches?.find((b) => b.code === dye?.rawBatchCode);
  const farmer = farmers?.find((f) => f.code === dye?.farmerCode);
  const manufacturer = manufacturers?.find(
    (m) => m.code === dye?.manufacturerCode,
  );

  if (dyes && !dye) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No dye batch found with code{" "}
          <code className="font-mono text-xs">{code}</code>.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/dyes">Back to the catalogue</Link>
        </Button>
      </div>
    );
  }

  if (!dye) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center text-sm text-muted-foreground">
        Loading batch record…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-xs">
        <Link to="/dyes">
          <ArrowLeft className="mr-1 size-3.5" /> Back to the catalogue
        </Link>
      </Button>

      {/* Header */}
      <Card className="shadow-none border-border/70">
        <CardHeader className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <span
              className="size-16 shrink-0 rounded-2xl border border-white/10 shadow-inner"
              style={{ backgroundColor: dye.colorHex }}
              title={dye.colorName}
            />
            <div>
              <CardTitle className="text-xl">{dye.name}</CardTitle>
              <CardDescription className="italic">
                {dye.botanicalSource}
              </CardDescription>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusPill status={dye.status} />
                <StatusPill status={dye.availability} />
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
              Batch
            </p>
            <p className="font-mono text-sm font-semibold">{dye.code}</p>
            {dye.verifiedAt && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
                <ShieldCheck className="size-3" /> Verified{" "}
                {formatDate(dye.verifiedAt)}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <DetailRow label="Price" value={`${formatINR(dye.pricePerKg)}/kg`} />
            <DetailRow label="Colour" value={dye.colorName} />
            <DetailRow label="Mordant" value={dye.mordant} />
          </dl>
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-border/60 bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
            <Leaf className="mt-0.5 size-4 shrink-0 text-emerald-400" />
            {dye.sustainabilityInfo}
          </p>
        </CardContent>
      </Card>

      {/* Lineage */}
      <h2 className="mt-8 mb-3 text-sm font-semibold">
        Provenance lineage
      </h2>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <Card className="shadow-none border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sprout className="size-4 text-emerald-400" /> Raw material
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            {rawBatch ? (
              <div className="space-y-1.5">
                <p className="font-medium">{rawBatch.material}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {rawBatch.code}
                </p>
                <p className="text-muted-foreground">
                  {rawBatch.quantityKg} kg · harvested{" "}
                  {formatDate(rawBatch.harvestDate)}
                </p>
                <StatusPill status={rawBatch.status} />
              </div>
            ) : (
              <p className="text-muted-foreground">Not linked</p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-center">
          <span className="flex size-8 items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground">
            <ArrowDown className="size-4" />
          </span>
        </div>

        <Card className="shadow-none border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Droplets className="size-4 text-indigo-400" /> Dye batch
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p className="font-medium">{dye.name}</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {dye.code}
            </p>
            <p className="text-muted-foreground">
              {dye.botanicalSource} · {dye.mordant} mordant
            </p>
            <StatusPill status={dye.status} />
          </CardContent>
        </Card>
      </div>

      {/* Actors */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Card className="shadow-none border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sprout className="size-4 text-emerald-400" /> Farm source
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            {farmer ? (
              <div className="space-y-1">
                <p className="font-medium">{farmer.farmName}</p>
                <p className="text-muted-foreground">
                  {farmer.name} · {farmer.location}
                </p>
                <p className="text-muted-foreground">
                  Crops: {farmer.crops.join(", ")}
                </p>
                <p className="flex items-start gap-1 text-[11px] text-muted-foreground">
                  <Leaf className="mt-0.5 size-3 shrink-0" />
                  {farmer.sustainabilityNotes}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-none border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Factory className="size-4 text-sky-400" /> Manufacturer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            {manufacturer ? (
              <div className="space-y-1">
                <p className="font-medium">{manufacturer.name}</p>
                <p className="text-muted-foreground">{manufacturer.location}</p>
                <p className="text-muted-foreground">
                  {manufacturer.specialties.join(", ")}
                </p>
                <div className="flex flex-wrap gap-1">
                  {manufacturer.certifications.map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="bg-emerald-500/10 text-[9px] text-emerald-300"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Button asChild className="mt-8 w-full gap-2 sm:w-auto">
        <Link to="/dashboard">
          Design with this dye <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2.5">
      <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
