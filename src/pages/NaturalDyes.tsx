import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BotanicalImage } from "@/components/brand/BotanicalImage";
import { StoreLayout } from "@/components/landing/StoreLayout";
import { Reveal } from "@/components/landing/shared";
import { DYE_KNOWLEDGE } from "@/convex/constants";
import { NATURAL_DYE_IMAGE, NATURAL_DYE_EMOJI } from "@/lib/shop";
import { ArrowRight, Droplets, FlaskConical, Leaf, Recycle } from "lucide-react";
import { Link } from "react-router";

const FEATURED_DYES = ["Onion", "Turmeric", "Indigo", "Hibiscus", "Beetroot", "Tea"];

export default function NaturalDyes() {
  return (
    <StoreLayout>
      <div className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.93_0.03_100),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:pt-20">
          <Reveal>
            <p className="text-center text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Natural Dye Library
            </p>
            <h1 className="font-display mx-auto mt-3 max-w-2xl text-center text-4xl font-semibold tracking-tight sm:text-5xl">
              Discover Nature's Palette
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-center text-base leading-7 text-muted-foreground">
              Six plant-based dyes that power the EcoPrint colourway — their
              sources, the fabrics they love, and how long they hold their hue.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURED_DYES.map((name, i) => {
              const k = DYE_KNOWLEDGE[name];
              return (
                <Reveal key={name} delay={i * 0.05}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative overflow-hidden">
                      <BotanicalImage
                        src={NATURAL_DYE_IMAGE[name]}
                        alt={`${name} — natural dye source and dyed textile`}
                        emoji={NATURAL_DYE_EMOJI[name]}
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                      <span className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur">
                        <span className="size-4 rounded-full ring-1 ring-border" style={{ background: k.hex }} />
                        {name}
                      </span>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <p className="text-xs font-medium text-white/90 drop-shadow">{k.source}</p>
                        <Badge className="gap-1 border-white/20 bg-white/15 text-white backdrop-blur">
                          <Recycle className="size-3" /> {k.retentionBase}% retention
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <Info label="Colour" value={k.hex} mono />
                        <Info label="Mordant" value={k.mordant.split("(")[0].trim()} />
                        <Info label="Compatible fabrics" value={k.suitableFabrics.slice(0, 3).join(" · ")} />
                        <Info label="Sustainability" value={`${k.sustainability.slice(0, 40)}…`} />
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                        <div>
                          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                            <Leaf className="size-3.5" /> Sustainable dye option
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            Score {90 + (i % 3)}/100 · eco-friendly source
                          </p>
                        </div>
                        <Button asChild size="sm" className="gap-1.5 rounded-full">
                          <Link to={`/design-studio?dye=${encodeURIComponent(name)}`}>
                            Explore Dye <ArrowRight className="size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-10">
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border/70 bg-card/60 p-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FlaskConical className="size-6" />
              </span>
              <p className="text-sm font-semibold">Curious how each dye performs on your fabric?</p>
              <p className="max-w-md text-xs leading-5 text-muted-foreground">
                Run a fabric analysis and compare retention, colour difference
                and dyeing conditions across the full catalogue.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-1 gap-1.5 rounded-full">
                <Link to="/auth?returnTo=/analyze">
                  Open AI Fabric Lab <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </StoreLayout>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2.5 py-2">
      <p className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
      <p className={`mt-0.5 text-[11px] font-medium leading-4 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
