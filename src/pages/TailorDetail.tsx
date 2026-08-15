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
  ArrowLeft,
  ArrowRight,
  Clock,
  MapPin,
  Scissors,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { formatINR } from "@/lib/format";

export default function TailorDetail() {
  const { code = "" } = useParams();
  const tailors = useQuery(api.catalog.listTailors);

  const tailor = (tailors ?? []).find((t) => t.code === code);

  if (tailors && !tailor) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No tailor found with code{" "}
          <code className="font-mono text-xs">{code}</code>.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/tailors">Back to the network</Link>
        </Button>
      </div>
    );
  }

  if (!tailor) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center text-sm text-muted-foreground">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-xs">
        <Link to="/tailors">
          <ArrowLeft className="mr-1 size-3.5" /> Back to the network
        </Link>
      </Button>

      <Card className="shadow-none border-border/70">
        <CardHeader className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Scissors className="size-7" />
            </span>
            <div>
              <CardTitle className="text-xl">{tailor.name}</CardTitle>
              <CardDescription>{tailor.shopName}</CardDescription>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusPill status={tailor.available ? "available" : "limited"} />
                <Badge variant="outline" className="font-mono text-[10px]">
                  {tailor.code}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-2.5 py-1.5 font-semibold text-amber-700">
              <Star className="size-4 fill-amber-500 text-amber-600" />
              {tailor.rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              {tailor.reviews} reviews
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-muted/50 px-3 py-2.5">
              <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
                Location
              </dt>
              <dd className="mt-0.5 flex items-center gap-1 font-medium">
                <MapPin className="size-3.5" /> {tailor.location}
              </dd>
            </div>
            <div className="rounded-xl bg-muted/50 px-3 py-2.5">
              <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
                Price range
              </dt>
              <dd className="mt-0.5 font-medium">
                {formatINR(tailor.priceMin)}–{formatINR(tailor.priceMax)}
              </dd>
            </div>
            <div className="rounded-xl bg-muted/50 px-3 py-2.5">
              <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
                Completion
              </dt>
              <dd className="mt-0.5 flex items-center gap-1 font-medium">
                <Clock className="size-3.5" /> {tailor.deliveryDays}–{tailor.deliveryDays + 2} days
              </dd>
            </div>
          </dl>

          <div className="mt-4 rounded-xl border border-border/60 bg-muted/50 p-3">
            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
              Specialization
            </p>
            <p className="mt-0.5 text-sm">{tailor.specialization}</p>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[10px] tracking-wide text-muted-foreground uppercase">
              Previous work
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tailor.previousWork.map((w) => (
                <Badge key={w} variant="secondary" className="text-[11px] font-normal">
                  {w}
                </Badge>
              ))}
            </div>
          </div>

          <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-emerald-500/10 p-3 text-[11px] leading-4 text-emerald-700">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Vetted partner: background-verified, works exclusively with
            natural dyes and sustainable fabrics, and accepts EcoPrint AI
            design packets.
          </p>
        </CardContent>
      </Card>

      <Button asChild className="mt-8 w-full gap-2 sm:w-auto">
        <Link to="/dashboard">
          Select this tailor in the studio <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
