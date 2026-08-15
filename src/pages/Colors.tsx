import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BotanicalImage } from "@/components/brand/BotanicalImage";
import { StoreLayout } from "@/components/landing/StoreLayout";
import { Reveal } from "@/components/landing/shared";
import {
  CLASSIC_COLOURS,
  naturalColourCards,
  recommendYarnFor,
  formatINR,
} from "@/lib/shop";
import {
  ArrowRight,
  Droplets,
  Leaf,
  Palette,
  Recycle,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export default function Colors() {
  const natural = naturalColourCards();

  return (
    <StoreLayout>
      <div className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.93_0.03_100),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:pt-20">
          <Reveal>
            <p className="text-center text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Colour Explorer
            </p>
            <h1 className="font-display mx-auto mt-3 max-w-2xl text-center text-4xl font-semibold tracking-tight sm:text-5xl">
              Explore Colours
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-center text-base leading-7 text-muted-foreground">
              Choose your colour. Discover its natural dye alternative — and
              the yarn that carries it best.
            </p>
          </Reveal>
        </div>

        {/* Natural dye colours */}
        <section id="natural" className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
          <Reveal>
            <div className="mb-8 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Droplets className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Natural Dye Colours
                </h2>
                <p className="text-sm text-muted-foreground">
                  Plant-based colourways from the EcoPrint dye library.
                </p>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {natural.map((c, i) => {
              const rec = recommendYarnFor(c.name);
              return (
                <Reveal key={c.name} delay={i * 0.04}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative overflow-hidden">
                      <BotanicalImage
                        src={c.image}
                        alt={`${c.name} — ${c.source}`}
                        emoji={c.emoji}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur">
                        <span className="size-4 rounded-full ring-1 ring-border" style={{ background: c.hex }} />
                        <span className="font-mono">{c.hex}</span>
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold">{c.name}</h3>
                          <p className="mt-0.5 text-xs italic text-muted-foreground">{c.source}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 gap-1 border-primary/25 bg-primary/5 text-[10px] text-primary">
                          <Leaf className="size-3" /> {c.retention}% retention
                        </Badge>
                      </div>
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {c.sustainability}
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Recycle className="size-3.5 text-primary" />
                        Sustainable dye option
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.suitableFabrics.slice(0, 3).map((f) => (
                          <span key={f} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {f}
                          </span>
                        ))}
                      </div>
                      <Button asChild size="sm" className="mt-4 w-full gap-1.5 rounded-full">
                        <Link to={`/design-studio?dye=${encodeURIComponent(c.name)}`}>
                          Explore Colour <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                      <p className="mt-2 text-center text-[10px] text-muted-foreground">
                        Pair with <span className="font-medium text-foreground">{rec.yarn.name}</span>
                      </p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Classic colours */}
        <section id="classic" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <Reveal>
            <div className="mb-8 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
                <Palette className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Classic Colours
                </h2>
                <p className="text-sm text-muted-foreground">
                  Everyday shades — each with a natural dye alternative.
                </p>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {CLASSIC_COLOURS.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.03}>
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <button
                    type="button"
                    className="relative block h-32 w-full overflow-hidden transition-opacity group-hover:opacity-95"
                    style={{ background: c.hex }}
                    aria-label={`${c.name} swatch`}
                  >
                    <span className="absolute inset-0" style={{ background: "radial-gradient(120% 100% at 20% 0%, rgba(255,255,255,0.25), transparent 60%)" }} />
                    <span className="absolute bottom-2.5 left-3 font-mono text-[10px] font-semibold text-white/90 drop-shadow">
                      {c.hex}
                    </span>
                  </button>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">{c.name}</h3>
                      <Badge variant="outline" className="shrink-0 gap-1 border-primary/25 bg-primary/5 text-[10px] text-primary">
                        <Sparkles className="size-3" /> {c.retention}%
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{c.tagline}</p>
                    <p className="mt-2.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                      Natural alternative
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {c.naturalAlternatives.map((alt) => (
                        <span
                          key={alt}
                          className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary"
                        >
                          {alt}
                        </span>
                      ))}
                    </div>
                    <Button asChild size="sm" variant="outline" className="mt-auto gap-1.5 rounded-full pt-4">
                      <Link to={`/design-studio?colour=${encodeURIComponent(c.name)}`}>
                        Explore Colour <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA strip */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <Reveal>
            <div className={cn("flex flex-col items-center gap-4 rounded-[2rem] bg-primary px-8 py-12 text-center text-primary-foreground")}>
              <Leaf className="size-8 opacity-80" />
              <h2 className="font-display max-w-xl text-2xl font-semibold sm:text-3xl">
                See your colour come alive on fabric
              </h2>
              <p className="max-w-md text-sm text-primary-foreground/80">
                Pick a colour, choose a fabric and watch the AI Design Studio
                preview the dyed result — then pair it with matching yarn.
              </p>
              <Button asChild size="lg" className="mt-2 gap-2 rounded-full bg-background text-foreground hover:bg-background/90">
                <Link to="/design-studio">
                  Open Design Studio <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </div>
    </StoreLayout>
  );
}
