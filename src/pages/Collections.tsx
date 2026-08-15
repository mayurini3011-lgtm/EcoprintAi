import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BotanicalImage } from "@/components/brand/BotanicalImage";
import { StoreLayout } from "@/components/landing/StoreLayout";
import { Reveal } from "@/components/landing/shared";
import { ArrowRight, Droplets, Layers, Scissors } from "lucide-react";
import { Link } from "react-router";

const COLLECTIONS = [
  {
    name: "Natural Earth",
    tagline: "Warm walnut & onion browns",
    dye: "Walnut",
    fabric: "Hemp",
    pattern: "Minimal",
    image: "photo-1518977956812-cd3dbadaaf31",
    emoji: "🥜",
    palette: ["#5a4632", "#7a5c40", "#e5dcc8", "#b3702f"],
    blurb: "Grounding earth tones from self-mordanting walnut husks and upcycled onion skins.",
  },
  {
    name: "Indigo Heritage",
    tagline: "Deep vat-dyed blues",
    dye: "Indigo",
    fabric: "Organic Cotton",
    pattern: "Tie Dye",
    image: "photo-1544441893-675973e31985",
    emoji: "🫐",
    palette: ["#2b4a9b", "#1f3a7a", "#7fa8d9", "#c8c2b4"],
    blurb: "Multi-dip indigo vats fermented the traditional way — blues that build with every oxidation.",
  },
  {
    name: "Golden Turmeric",
    tagline: "Sun-bright yellows & golds",
    dye: "Turmeric",
    fabric: "Organic Cotton",
    pattern: "Floral",
    image: "photo-1615485500704-8e990f9900f7",
    emoji: "🟡",
    palette: ["#e3a32a", "#e8a33d", "#d9822b", "#f6f1e7"],
    blurb: "Solar-dried turmeric and marigold petals for luminous golden colourways.",
  },
  {
    name: "Rose Botanical",
    tagline: "Pinks, reds & burgundy",
    dye: "Hibiscus",
    fabric: "Silk",
    pattern: "Geometric",
    image: "photo-1596040033229-a9821ebd058d",
    emoji: "🌺",
    palette: ["#a6263b", "#e8c8c5", "#c98a8f", "#f6f1e7"],
    blurb: "Cold-extracted hibiscus petals and aged madder roots for romantic rose tones.",
  },
  {
    name: "Minimal Neutrals",
    tagline: "Ivories, beiges & stone",
    dye: "Tea",
    fabric: "Linen",
    pattern: "Minimal",
    image: "photo-1544787219-7f47ccb76574",
    emoji: "🍃",
    palette: ["#7a5c40", "#d6c7a8", "#f3e9d2", "#c8c2b4"],
    blurb: "Gentle tea baths and undyed natural fibres for a calm, contemporary palette.",
  },
  {
    name: "Organic Essentials",
    tagline: "Fresh greens & botanical tones",
    dye: "Neem",
    fabric: "Bamboo",
    pattern: "Abstract",
    image: "photo-1528458909336-e7a0adfed0a5",
    emoji: "🌿",
    palette: ["#5c7a4a", "#8a9a78", "#6b7d4e", "#f6f1e7"],
    blurb: "Neem leaf baths and bamboo fibres — naturally pest-resistant and whisper-soft.",
  },
];

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

export default function Collections() {
  return (
    <StoreLayout>
      <div className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.93_0.03_100),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:pt-20">
          <Reveal>
            <p className="text-center text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Sustainable Collections
            </p>
            <h1 className="font-display mx-auto mt-3 max-w-2xl text-center text-4xl font-semibold tracking-tight sm:text-5xl">
              Curated by Colour, Dyed by Nature
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-center text-base leading-7 text-muted-foreground">
              Six signature collections — each pairing a natural dye, a fabric
              and a palette ready for the AI Design Studio.
            </p>
          </Reveal>

          <div className="mt-12 space-y-8">
            {COLLECTIONS.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.04}>
                <article className="group grid overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm transition-all hover:shadow-xl md:grid-cols-[1.1fr_1fr]">
                  <div className="relative overflow-hidden">
                    <BotanicalImage
                      src={U(c.image)}
                      alt={`${c.name} collection — ${c.tagline}`}
                      emoji={c.emoji}
                      className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] md:h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    <Badge className="absolute left-4 top-4 gap-1 border-white/20 bg-white/15 text-white backdrop-blur">
                      <Droplets className="size-3" /> {c.dye}
                    </Badge>
                  </div>
                  <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-primary uppercase">
                        Collection {String(i + 1).padStart(2, "0")}
                      </p>
                      <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                        {c.name}
                      </h2>
                      <p className="mt-1 text-sm italic text-muted-foreground">{c.tagline}</p>
                    </div>
                    <p className="max-w-md text-sm leading-6 text-muted-foreground">{c.blurb}</p>
                    <div className="flex items-center gap-2">
                      {c.palette.map((hex) => (
                        <span
                          key={hex}
                          className="size-8 rounded-full ring-2 ring-background shadow"
                          style={{ background: hex }}
                          title={hex}
                        />
                      ))}
                      <span className="ml-2 font-mono text-[10px] text-muted-foreground">{c.palette[0]}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Droplets className="size-3.5 text-primary" /> Dye: {c.dye}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="size-3.5 text-primary" /> Fabric: {c.fabric}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Scissors className="size-3.5 text-primary" /> Pattern: {c.pattern}
                      </span>
                    </div>
                    <Button asChild size="sm" className="mt-1 w-fit gap-1.5 rounded-full">
                      <Link
                        to={`/design-studio?dye=${encodeURIComponent(c.dye)}&fabric=${encodeURIComponent(c.fabric)}&pattern=${encodeURIComponent(c.pattern)}`}
                      >
                        Explore Collection <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
