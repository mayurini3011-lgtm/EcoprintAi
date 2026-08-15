import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BotanicalImage } from "@/components/brand/BotanicalImage";
import { SectionHeading, Reveal } from "./shared";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

const DYES = [
  {
    name: "ONION",
    shades: ["Golden / Brown shades"],
    source: "Allium cepa — upcycled kitchen skins",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=70",
    emoji: "🧅",
    swatches: ["#b3702f", "#c98a45", "#8a5a2b"],
    retention: "72%",
  },
  {
    name: "TURMERIC",
    shades: ["Bright yellow shades"],
    source: "Curcuma longa — solar-dried rhizomes",
    image:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=600&q=70",
    emoji: "🌼",
    swatches: ["#e3a32a", "#d9822b", "#f6c94a"],
    retention: "74%",
  },
  {
    name: "INDIGO",
    shades: ["Traditional natural blue"],
    source: "Indigofera tinctoria — fermented vat",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=70",
    emoji: "🔵",
    swatches: ["#2b4a9b", "#1f3a7a", "#7fa8d9"],
    retention: "88%",
  },
  {
    name: "HIBISCUS",
    shades: ["Pink / Purple shades"],
    source: "Hibiscus rosa-sinensis — cold-extracted petals",
    image:
      "https://images.unsplash.com/photo-1508614999368-9260051292e5?auto=format&fit=crop&w=600&q=70",
    emoji: "🌺",
    swatches: ["#a6263b", "#c98a8f", "#7d3b66"],
    retention: "68%",
  },
  {
    name: "BEETROOT",
    shades: ["Red / Burgundy shades"],
    source: "Beta vulgaris — food-industry by-product",
    image:
      "https://images.unsplash.com/photo-1458668383970-8ddd3927deed?auto=format&fit=crop&w=600&q=70",
    emoji: "🍠",
    swatches: ["#8e2a4f", "#a63c5f", "#5c1a33"],
    retention: "58%",
  },
];

export function DyeLibrarySection() {
  return (
    <section id="natural-dyes" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Natural Dye Library"
          title="Discover Nature's Palette"
          description="Every dye is plant-derived, traceable to its farmer and manufacturer, and scored for sustainability — no synthetic chemistry."
        />
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {DYES.map((dye, i) => (
          <Reveal key={dye.name} delay={i * 0.06}>
            <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
              <div className="relative aspect-[4/5] overflow-hidden">
                <BotanicalImage
                  src={dye.image}
                  alt={`${dye.name} — natural dye ingredient`}
                  emoji={dye.emoji}
                  className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3.5">
                  <p className="font-display text-lg font-semibold tracking-wide text-white">{dye.name}</p>
                  <Badge className="bg-white/90 text-foreground">{dye.retention}% retention</Badge>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex gap-1.5">
                  {dye.swatches.map((hex) => (
                    <span key={hex} className="size-5 rounded-full ring-1 ring-border" style={{ background: hex }} />
                  ))}
                </div>
                <p className="mt-2.5 text-xs font-semibold text-foreground">{dye.shades[0]}</p>
                <p className="mt-1 flex-1 text-[11px] leading-4 text-muted-foreground">{dye.source}</p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1 rounded-full text-xs"
                >
                  <Link to="/auth?returnTo=/dye-library">
                    Explore Dye <ArrowRight className="size-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
