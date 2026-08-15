import { Button } from "@/components/ui/button";
import { BotanicalImage } from "@/components/brand/BotanicalImage";
import { SectionHeading, Reveal } from "./shared";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

const COLLECTIONS = [
  {
    name: "Women",
    text: "Kurtas, dresses and lehengas in botanical palettes.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=70",
    emoji: "👗",
    href: "/auth?returnTo=/design-studio",
  },
  {
    name: "Men",
    text: "Field shirts and overshirts in earthy natural tones.",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=70",
    emoji: "🧥",
    href: "/auth?returnTo=/design-studio",
  },
  {
    name: "Sarees",
    text: "Handwoven sarees with AI-composed temple borders.",
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=700&q=70",
    emoji: "🥻",
    href: "/auth?returnTo=/tailors",
  },
  {
    name: "Ethnic Wear",
    text: "Festival-ready silhouettes dyed with madder & indigo.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=70",
    emoji: "✨",
    href: "/auth?returnTo=/dyes",
  },
  {
    name: "Modern Sustainable Wear",
    text: "Minimal everyday pieces from organic & upcycled fibres.",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=70",
    emoji: "🌿",
    href: "/auth?returnTo=/dye-library",
  },
  {
    name: "Custom Designs",
    text: "Your photo, your palette — tailored to your measurements.",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=70",
    emoji: "🧵",
    href: "/auth?returnTo=/design-studio",
  },
];

export function CollectionsSection() {
  return (
    <section id="collections" className="border-y border-border/60 bg-muted/40 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Sustainable Collections"
            title="Wear the Story of a Plant"
            description="Every collection is designed by AI, dyed with natural botanicals and traceable from farm to finished garment."
          />
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06}>
              <Link
                to={c.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/15"
              >
                <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                  <BotanicalImage src={c.image} alt={`${c.name} collection`} emoji={c.emoji} className="h-full w-full" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-amber-300 uppercase">{c.name}</p>
                  <p className="mt-1 text-sm leading-5 text-white/90">{c.text}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-foreground opacity-90 transition-all group-hover:gap-2.5">
                    Explore Collection <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
