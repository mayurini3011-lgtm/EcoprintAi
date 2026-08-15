import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DYE_KNOWLEDGE } from "@/convex/constants";
import { useQuery } from "convex/react";
import { ArrowRight, Droplets, Leaf, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Input } from "@/components/ui/input";

const DYE_EMOJI: Record<string, string> = {
  Indigo: "🔵",
  Turmeric: "🌼",
  Hibiscus: "🌺",
  Madder: "🌿",
  Pomegranate: "🍎",
  Marigold: "🌼",
  Walnut: "🪵",
  Neem: "🌿",
  Henna: "🌿",
  Onion: "🧅",
  Beetroot: "🍠",
  Tea: "🍵",
};

export default function DyeLibrary() {
  const dyes = useQuery(api.catalog.listDyes);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const list = (dyes ?? []).filter((d) => DYE_KNOWLEDGE[d.name]);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.botanicalSource.toLowerCase().includes(q) ||
        (DYE_KNOWLEDGE[d.name]?.suitableFabrics ?? []).some((f) => f.toLowerCase().includes(q)),
    );
  }, [dyes, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            EcoPrint AI · Natural Dye Library
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Explore natural dyes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sources, typical colours, suitable fabrics, mordants, dyeing
            conditions and sustainability notes for every supported dye.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dyes or fabrics…"
            className="pl-9"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <Card className="shadow-none border-dashed border-border/70">
          <CardContent className="py-16 text-center">
            <p className="text-sm font-medium">No dyes match “{query}”</p>
            <p className="mt-1 text-xs text-muted-foreground">Try “cotton”, “indigo” or clear the search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((d) => {
            const k = DYE_KNOWLEDGE[d.name];
            return (
              <Card key={d.code} className="flex flex-col shadow-none border-border/70 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-xl">
                        {DYE_EMOJI[d.name] ?? "🌿"}
                      </span>
                      <div>
                        <CardTitle className="text-sm">{d.name}</CardTitle>
                        <p className="text-[11px] italic text-muted-foreground">{d.botanicalSource}</p>
                      </div>
                    </div>
                    <span className="size-7 rounded-full shadow-inner ring-1 ring-border" style={{ background: d.colorHex }} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <Info label="Suitable fabrics" value={k.suitableFabrics.slice(0, 3).join(", ")} />
                    <Info label="Mordant" value={k.mordant} />
                    <Info label="Dyeing" value={`${k.tempMin}–${k.tempMax}°C · ${k.durationMin}–${k.durationMax} min`} />
                    <Info label="Baseline retention" value={`~${k.retentionBase}%`} />
                  </div>
                  <p className="flex items-start gap-1.5 leading-4 text-muted-foreground">
                    <Leaf className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {k.sustainability}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {d.status} · {d.availability}
                    </Badge>
                    <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
                      <Link to={`/dyes/${d.code}`}>
                        Learn More <ArrowRight className="size-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Droplets className="size-3.5 text-primary" />
        Each library card links to the full batch record with farmer → manufacturer
        provenance on the Dye Catalogue pages.
      </p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2.5 py-2">
      <p className="text-[9px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
