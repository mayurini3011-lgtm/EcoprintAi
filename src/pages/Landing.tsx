import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Logo } from "@/components/brand/Logo";
import { DesignCanvas } from "@/components/design/DesignCanvas";
import { PLANS } from "@/convex/constants";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FlaskConical,
  Leaf,
  Palette,
  ShieldCheck,
  Sparkles,
  Sprout,
  Wand2,
} from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

const HERO_SPEC = {
  seed: 12041,
  pattern: "Tie Dye",
  palette: [
    { name: "Deep Indigo", hex: "#2b4a9b" },
    { name: "Midnight", hex: "#1f3a7a" },
    { name: "Stone", hex: "#c8c2b4" },
    { name: "Cream", hex: "#f6f1e7" },
  ],
};

const STEPS = [
  {
    icon: "📸",
    title: "Upload Fabric",
    text: "Take a photo of your fabric — EcoPrint measures the dominant colour from the image.",
  },
  {
    icon: "🤖",
    title: "Analyze with AI",
    text: "Predict color retention, RGB/LAB values and colour difference across wash cycles.",
  },
  {
    icon: "🧪",
    title: "Optimize Dyeing",
    text: "Get dyeing temperature, duration, mordant and dye-fabric pairing recommendations.",
  },
  {
    icon: "🎨",
    title: "Generate Designs",
    text: "Compose natural-dye textile designs from a prompt, fabric, dye and pattern.",
  },
  {
    icon: "📈",
    title: "Track Color Retention",
    text: "Watch retention fade across 1–30 wash cycles and keep every report in history.",
  },
];

const FEATURES = [
  {
    icon: FlaskConical,
    title: "Fabric Analysis",
    text: "Upload a fabric photo to predict retention %, ΔE, dyeing conditions and mordants — with honest, clearly-labelled simulated results.",
    to: "/analyze",
  },
  {
    icon: Bot,
    title: "EcoPrint AI Assistant",
    text: "A context-aware assistant that answers dye, fabric, mordant and washing questions — and explains your latest analysis.",
    to: "/assistant",
  },
  {
    icon: Palette,
    title: "AI Fabric Design Studio",
    text: "Generate natural-dye textile designs from a prompt. Demo mode renders procedural previews; plug in an image API later.",
    to: "/design-studio",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Verified",
    text: "SHA-256 hash-chained supply chains, public QR verification, and zero customer data in public records.",
    to: "/security",
  },
];

const FAQ = [
  {
    q: "What is EcoPrint AI?",
    a: "EcoPrint AI is a sustainable-textile platform: it analyzes fabric photos to predict color retention and dyeing conditions, recommends dye-fabric pairings, generates natural-dye textile designs, and verifies the supply chain behind every garment.",
  },
  {
    q: "How does fabric analysis work?",
    a: "The app extracts the dominant colour (RGB) from your fabric photo, converts it to CIELAB, and runs the EcoPrint retention model — dye knowledge, fabric uptake and a wash-fade curve — to estimate retention and colour difference (ΔE). The colour math is real; the predictions are simulated reference values for the demo.",
  },
  {
    q: "What is color retention?",
    a: "Color retention is the percentage of the original colour that survives after a number of wash cycles. Higher retention means better fastness — the dye holds onto the fabric instead of washing out.",
  },
  {
    q: "Which natural dyes are supported?",
    a: "Indigo, Turmeric, Hibiscus, Madder, Pomegranate, Marigold, Walnut, Neem, Henna, Onion, Beetroot and Tea — each with source, mordant, dyeing conditions and sustainability notes.",
  },
  {
    q: "Can I use EcoPrint AI for real textile production?",
    a: "You can use it to guide experiments and compare options, but every recommendation should be validated with physical swatch tests before production. The app says so in every report.",
  },
  {
    q: "Is the AI prediction scientifically guaranteed?",
    a: "No — and we don't pretend otherwise. Demo predictions are rule-based simulations, clearly labelled. A real ML model or lab pipeline can be connected later without changing the interface.",
  },
  {
    q: "Is payment required?",
    a: "No. There is a free tier with fabric analysis, basic recommendations, a limited assistant and demo design generation. Paid plans are simulated in demo mode — no real money is ever charged.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#dyes" className="transition-colors hover:text-foreground">Dye library</a>
            <a href="#features" className="transition-colors hover:text-foreground">AI features</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth?returnTo=/dashboard">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth?returnTo=/dashboard">
                Launch app <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_0%,oklch(0.92_0.03_150),transparent)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0.5 0.1 155 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.5 0.1 155 / 0.06) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(70% 70% at 50% 0%, black, transparent)",
            WebkitMaskImage: "radial-gradient(70% 70% at 50% 0%, black, transparent)",
          }}
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Badge
              variant="outline"
              className="mb-5 gap-2 rounded-full border-primary/30 bg-primary/10 py-1.5 text-[11px] font-medium tracking-wide text-primary uppercase"
            >
              <Sparkles className="size-3.5" /> EcoPrint AI · Sustainable textile intelligence
            </Badge>
            <h1 className="font-display text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Transform Natural Dyes{" "}
              <span className="text-primary">with AI</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Analyze fabrics, predict color retention, optimize natural dyeing
              conditions, and create sustainable textile designs with AI.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth?returnTo=/analyze">
                  <FlaskConical className="size-4" /> Analyze Fabric
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/auth?returnTo=/design-studio">
                  <Wand2 className="size-4" /> Try AI Design Studio
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="gap-2">
                <Link to="/auth?returnTo=/assistant">
                  <Bot className="size-4" /> Ask EcoPrint AI
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-primary" /> 12 natural dyes
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-primary" /> 8 patterns
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-primary" /> Full demo mode — no API keys
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-primary" /> SHA-256 verified supply chain
              </span>
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl shadow-primary/10">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
                <span className="text-xs font-medium">Indigo Tie Dye · preview</span>
                <Badge variant="outline" className="gap-1 border-amber-400/40 bg-amber-500/10 text-[10px] text-amber-700">
                  DEMO RENDER
                </Badge>
              </div>
              <DesignCanvas spec={HERO_SPEC} className="w-full" />
              <div className="space-y-2 border-t border-border/60 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Cotton · Indigo · Tie Dye</p>
                  <code className="font-mono text-[10px] text-muted-foreground">88% retention</code>
                </div>
                <div className="flex items-center gap-1.5">
                  {HERO_SPEC.palette.map((c) => (
                    <span key={c.hex} title={c.name} className="size-4 rounded-full ring-1 ring-border" style={{ background: c.hex }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -left-3 top-14 hidden rounded-xl border border-border/60 bg-background/95 px-3 py-2 shadow-lg backdrop-blur sm:block">
              <p className="text-[9px] tracking-wide text-muted-foreground uppercase">AI Status</p>
              <p className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                <span className="size-1.5 rounded-full bg-amber-500" /> Demo Mode
              </p>
            </div>
            <div className="absolute -right-3 bottom-20 hidden rounded-xl border border-border/60 bg-background/95 px-3 py-2 shadow-lg backdrop-blur sm:block">
              <p className="flex items-center gap-1 font-mono text-[10px] font-medium">
                <Leaf className="size-3 text-primary" /> Zero synthetic dyes
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">How it works</p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            From fabric photo to verified textile insight
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-xl">{step.icon}</span>
                <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
              </div>
              <p className="mt-3 text-sm font-semibold">{step.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dye library */}
      <section id="dyes" className="border-y border-border/60 bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wider text-primary uppercase">Natural Dye Library</p>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Twelve dyes, one philosophy: plant-first
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Every dye card shows its botanical source, typical colour, suitable
                fabrics, suggested mordants, dyeing conditions and sustainability notes.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/auth?returnTo=/dye-library">
                Open the library <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["🧅", "Onion"],
              ["🌼", "Turmeric"],
              ["🔵", "Indigo"],
              ["🌺", "Hibiscus"],
              ["🍠", "Beetroot"],
              ["🍵", "Tea"],
            ].map(([emoji, name]) => (
              <div key={name} className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-card px-3 py-5 text-center shadow-sm">
                <span className="text-2xl">{emoji}</span>
                <p className="text-xs font-semibold">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">AI features</p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything a sustainable maker needs
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
            >
              <Link
                to={`/auth?returnTo=${f.to}`}
                className="group flex h-full gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{f.text}</p>
                  <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Explore <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sustainability */}
      <section className="border-y border-border/60 bg-muted/40 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">Sustainability</p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Better for the planet, provably
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              EcoPrint AI scores every dye-fabric pairing for sustainability, favours
              upcycled dye sources like onion skins and tea waste, and seals the whole
              journey — farmer to garment — in a SHA-256 hash chain anyone can verify.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                { icon: Sprout, text: "Plant-based, biodegradable dye chemistry" },
                { icon: Leaf, text: "Upcycled sources and low-water extraction" },
                { icon: ShieldCheck, text: "Public QR verification with zero customer PII" },
                { icon: Sparkles, text: "Honest AI — simulated results always labelled" },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="size-3.5" />
                  </span>
                  <span className="text-muted-foreground">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">Example pairing score</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold">Organic Cotton + Turmeric</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Geometric pattern · 1 wash</p>
                <div className="mt-3 space-y-2 text-xs">
                  <ScoreRow label="Expected retention" value="76%" tone="text-emerald-700" />
                  <ScoreRow label="Sustainability" value="90/100" tone="text-emerald-700" />
                  <ScoreRow label="Mordant" value="Alum" />
                  <ScoreRow label="Dyeing" value="60–80°C · 40–60 min" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="flex size-20 items-center justify-center rounded-2xl font-display text-2xl font-semibold text-primary shadow-inner ring-1 ring-border" style={{ background: "#e3a32a22" }}>
                  90
                </span>
                <span className="text-[10px] text-muted-foreground">sustainability</span>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-muted-foreground">
              Simulated recommendation — validate with physical testing.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">Pricing</p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Start free. Scale when you're ready.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Payments run in demo mode — no real money is charged during the hackathon.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "rounded-2xl border border-border/70 bg-card p-6 shadow-sm",
                plan.id === "pro" && "border-primary/60 ring-2 ring-primary/20",
              )}
            >
              <p className="text-sm font-semibold tracking-wide">{plan.name}</p>
              <p className="font-display mt-2 text-3xl font-semibold">
                ₹{plan.price}
                <span className="text-xs font-normal text-muted-foreground"> {plan.period}</span>
              </p>
              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                {plan.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-6 w-full"
                variant={plan.id === "pro" ? "default" : "outline"}
              >
                <Link to={plan.id === "free" ? "/auth?returnTo=/dashboard" : "/auth?returnTo=/pricing"}>
                  {plan.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/60 bg-muted/40 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">FAQ</p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Honest answers
            </h2>
          </div>
          <Accordion type="single" collapsible className="rounded-2xl border border-border/70 bg-card px-5 shadow-sm">
            {FAQ.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-6 text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <div
            aria-hidden
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 70%, currentColor 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative">
            <p className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Transform natural dyes with AI.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80">
              Free to start. Runs entirely in demo mode. Your first fabric
              analysis takes under a minute.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                <Link to="/auth?returnTo=/analyze">
                  Analyze a fabric <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/auth?returnTo=/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <Logo />
          <p className="text-xs text-muted-foreground">
            EcoPrint AI · AI-Powered Natural Dye Optimization & Fabric Color Retention Analysis
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sprout className="size-3.5 text-primary" /> Sustainable
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-primary" /> Verified
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="size-3.5 text-primary" /> AI-powered
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ScoreRow({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", tone)}>{value}</span>
    </div>
  );
}
