import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BotanicalImage } from "@/components/brand/BotanicalImage";
import { motion } from "framer-motion";
import { Bot, CheckCircle2, FlaskConical, Palette, ScanLine, Sparkles } from "lucide-react";
import { Link } from "react-router";

const FLOAT_CARDS = [
  { icon: ScanLine, title: "AI Fabric Analysis", text: "Retention, ΔE & dye conditions in seconds" },
  { icon: Palette, title: "Natural Dye Intelligence", text: "12 plant-based dyes, fully traceable" },
  { icon: Sparkles, title: "Smart Pattern Design", text: "From botanical to bespoke textile" },
];

export function LandingHero() {
  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Background */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(65%_60%_at_15%_0%,oklch(0.93_0.03_100),transparent)]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(0.45 0.09 160 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.45 0.09 160 / 0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(75% 75% at 50% 0%, black, transparent)",
          WebkitMaskImage: "radial-gradient(75% 75% at 50% 0%, black, transparent)",
        }}
      />
      <div aria-hidden className="animate-float-slow pointer-events-none absolute -left-24 top-20 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden className="animate-float pointer-events-none absolute -right-16 top-1/3 -z-10 size-80 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-20">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <Badge
            variant="outline"
            className="mb-6 gap-2 rounded-full border-primary/25 bg-primary/5 py-1.5 text-[11px] font-medium tracking-[0.14em] text-primary uppercase"
          >
            <Sparkles className="size-3.5" /> Where AI Meets Sustainable Fashion
          </Badge>
          <h1 className="font-display text-balance text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.2rem]">
            Design Smarter.{" "}
            <span className="text-primary italic">Dye Naturally.</span> Wear
            Sustainably.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
            AI-powered fabric analysis and natural dye intelligence for the
            future of sustainable fashion — from a single plant to a finished,
            traceable garment.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2 rounded-full px-7 shadow-lg shadow-primary/20">
              <Link to="/auth?returnTo=/analyze">
                <FlaskConical className="size-4" /> Explore AI Fabric Lab
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 rounded-full px-7">
              <Link to="/auth?returnTo=/design-studio">
                <Palette className="size-4" /> Create Your Design
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="gap-2 rounded-full px-4"
              onClick={() => window.dispatchEvent(new Event("ecoprint:open-chat"))}
            >
              <Bot className="size-4 text-primary" /> Ask EcoPrint AI
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-primary" /> Real color science, CIEDE2000</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-primary" /> 12 natural dyes</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-primary" /> SHA-256 verified supply chain</span>
          </div>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          {/* Main fashion image */}
          <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card p-2 shadow-2xl shadow-primary/10">
            <BotanicalImage
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=70"
              alt="Model wearing elegant sustainable fashion in natural tones"
              emoji="🧵"
              className="aspect-[4/5] w-full rounded-[1.6rem]"
            />
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-2xl bg-background/85 px-4 py-3 backdrop-blur">
              <div>
                <p className="text-sm font-semibold">Indigo Tie Dye · Kurta</p>
                <p className="text-[11px] text-muted-foreground">Organic cotton · verified batch IND-2026-001</p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">88% retention</span>
            </div>
          </div>

          {/* Floating ingredient photo */}
          <div className="animate-float absolute -right-4 bottom-24 hidden w-36 rotate-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-1.5 shadow-xl shadow-primary/10 sm:block lg:-right-8">
            <BotanicalImage
              src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=320&q=70"
              alt="Marigold flowers — natural dye source"
              emoji="🌼"
              className="aspect-[4/3] w-full rounded-xl"
            />
            <p className="px-1 pt-1.5 text-[9px] font-medium tracking-wide text-muted-foreground uppercase">Marigold · natural dye</p>
          </div>

          {/* Floating info cards */}
          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {FLOAT_CARDS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                className="rounded-2xl border border-border/60 bg-card/90 px-3 py-3 shadow-sm backdrop-blur"
              >
                <c.icon className="size-4 text-primary" />
                <p className="mt-1.5 text-[11px] font-semibold leading-4">{c.title}</p>
                <p className="mt-0.5 text-[10px] leading-3.5 text-muted-foreground">{c.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
