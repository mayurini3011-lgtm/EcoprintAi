import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { GarmentPreview } from "@/components/garment/GarmentPreview";
import { PaletteSwatches } from "@/components/garment/PaletteSwatches";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Fingerprint,
  Leaf,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

const HIBISCUS_PALETTE = [
  { name: "Hibiscus", hex: "#a6263b" },
  { name: "Blush", hex: "#e8c8c5" },
  { name: "Sage Leaf", hex: "#5c7a4a" },
  { name: "Cream", hex: "#f6f1e7" },
];

const STEPS = [
  {
    icon: "🌸",
    title: "Upload a flower",
    text: "A hibiscus, a marigold, a neem leaf — any botanical inspiration.",
  },
  {
    icon: "🤖",
    title: "AI designs it",
    text: "Botanical vision extracts pigments and composes garment concepts.",
  },
  {
    icon: "🧪",
    title: "Natural dye & fabric",
    text: "Pick a traced dye batch and a sustainable fabric from verified makers.",
  },
  {
    icon: "✂️",
    title: "Your tailor stitches",
    text: "Choose a vetted tailor; they receive your approved design.",
  },
  {
    icon: "👗",
    title: "Secure garment ID",
    text: "NF-2026-000125 — a SHA-256 sealed identity anyone can verify.",
  },
];

const JOURNEY = [
  { icon: "🌱", label: "Farmer", actor: "Green Valley Farm", batch: "FARM-IND-2026-001" },
  { icon: "🌿", label: "Raw Material", actor: "Quality Lab", batch: "250 kg indigo leaves" },
  { icon: "🧪", label: "Dye Maker", actor: "Aravalli Naturals", batch: "DYE-IND-2026-001" },
  { icon: "🧵", label: "Fabric", actor: "Maheshwar Co-op", batch: "FAB-ORG-001" },
  { icon: "🤖", label: "AI Design", actor: "NaturalFlow AI", batch: "DSG-2026-010" },
  { icon: "✂️", label: "Tailor", actor: "Ananya Tailors", batch: "TAI-001" },
  { icon: "👗", label: "Garment", actor: "Quality Check", batch: "NF-2026-000124" },
];

const DESIGNS = [
  {
    title: "Hibiscus Heritage Kurta",
    plant: "Hibiscus rosa-sinensis",
    palette: HIBISCUS_PALETTE,
    type: "Kurta",
  },
  {
    title: "Indigo Cloud Shirt",
    plant: "Indigofera tinctoria",
    palette: [
      { name: "Deep Indigo", hex: "#2b4a9b" },
      { name: "Midnight", hex: "#1f3a7a" },
      { name: "Stone", hex: "#c8c2b4" },
      { name: "White", hex: "#f7f5ef" },
    ],
    type: "Shirt",
  },
  {
    title: "Marigold Sundress",
    plant: "Tagetes erecta",
    palette: [
      { name: "Marigold", hex: "#e8a33d" },
      { name: "Saffron", hex: "#d9822b" },
      { name: "Leaf", hex: "#5c7a4a" },
      { name: "Cream", hex: "#f6f1e7" },
    ],
    type: "Dress",
  },
  {
    title: "Lotus Blush Lehenga",
    plant: "Nelumbo nucifera",
    palette: [
      { name: "Blush", hex: "#e8c8c5" },
      { name: "Lotus Pink", hex: "#d98a9c" },
      { name: "Old Gold", hex: "#c9a45c" },
      { name: "Ivory", hex: "#faf7ef" },
    ],
    type: "Lehenga",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#journey" className="transition-colors hover:text-foreground">
              Supply chain
            </a>
            <a href="#designs" className="transition-colors hover:text-foreground">
              AI designs
            </a>
            <a href="#security" className="transition-colors hover:text-foreground">
              Security
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth?returnTo=/dashboard">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth?returnTo=/dashboard">
                Open Studio <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.96_0.02_95),transparent)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Badge
              variant="outline"
              className="mb-5 gap-2 rounded-full border-primary/25 bg-primary/5 py-1.5 text-[11px] font-medium tracking-wide text-primary uppercase"
            >
              <Sparkles className="size-3.5" />
              AI × Cybersecurity × Natural Dye
            </Badge>
            <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              From plant to{" "}
              <span className="text-primary">personalized fashion</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Designed by AI, protected by cybersecurity. Upload a flower, get
              a bespoke garment — and prove its provenance anywhere with a
              cryptographically sealed identity.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth?returnTo=/dashboard">
                  Start designing <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth?returnTo=/security">
                  <ShieldCheck className="mr-2 size-4" />
                  See the tamper demo
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                SHA-256 verified chain
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                Zero synthetic dyes
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                No customer data exposed
              </span>
            </div>
          </motion.div>

          {/* Hero visual — live mini design card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl shadow-black/5">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
                <span className="text-xs font-medium">Hibiscus · live design</span>
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                >
                  <Fingerprint className="size-2.5" /> VERIFIED
                </Badge>
              </div>
              <div className="relative">
                <GarmentPreview
                  palette={HIBISCUS_PALETTE}
                  garmentType="Kurta"
                  motif="hibiscus bloom"
                  className="w-full"
                />
                <div className="absolute left-3 top-3 flex size-10 items-center justify-center rounded-full bg-white/90 text-xl shadow-sm">
                  🌺
                </div>
              </div>
              <div className="space-y-2.5 border-t border-border/60 px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Hibiscus Heritage Kurta</p>
                  <code className="font-mono text-[10px] text-muted-foreground">
                    NF-2026-000124
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <PaletteSwatches palette={HIBISCUS_PALETTE} size="sm" />
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <QrCode className="size-3" /> Scan to verify
                  </span>
                </div>
              </div>
            </div>
            {/* floating chips */}
            <div className="absolute -left-3 top-16 hidden rounded-xl border border-border/60 bg-background px-3 py-2 shadow-md sm:block">
              <p className="text-[9px] tracking-wide text-muted-foreground uppercase">
                AI identified
              </p>
              <p className="text-xs font-semibold">
                Hibiscus rosa-sinensis · 96%
              </p>
            </div>
            <div className="absolute -right-3 bottom-24 hidden rounded-xl border border-border/60 bg-background px-3 py-2 shadow-md sm:block">
              <p className="flex items-center gap-1 text-[10px] font-medium">
                <Lock className="size-3 text-primary" /> SHA-256 sealed
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4">
          {[
            { value: "10", label: "Natural dye batches traced" },
            { value: "128", label: "Supply-chain records verified" },
            { value: "7", label: "Sealed events per garment" },
            { value: "0", label: "Synthetic inputs" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-medium text-primary">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            How it works
          </p>
          <h2 className="font-display mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
            Five steps from flower to finished garment
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.07 }}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-xl">
                  {step.icon}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  0{i + 1}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold">{step.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Supply chain journey */}
      <section id="journey" className="border-y border-border/60 bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              Supply chain, visualized
            </p>
            <h2 className="font-display mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
              Every garment has a story. Prove it.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Each stage is a cryptographic event — hashed, linked, and
              verified. Change one record and the whole chain screams.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {JOURNEY.map((j, i) => (
              <div key={j.label} className="relative">
                <motion.div
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                  className="flex h-full flex-col items-center rounded-2xl border border-border/70 bg-card px-3 py-5 text-center shadow-sm"
                >
                  <span className="text-2xl">{j.icon}</span>
                  <p className="mt-2 text-xs font-semibold">{j.label}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {j.actor}
                  </p>
                  <code className="mt-2 rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                    {j.batch}
                  </code>
                  <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-600">
                    <CheckCircle2 className="size-3" /> VERIFIED
                  </span>
                </motion.div>
                {i < JOURNEY.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-muted-foreground lg:block"
                  >
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI designs */}
      <section id="designs" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              Botanical AI studio
            </p>
            <h2 className="font-display mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
              Designed by AI, from real botanicals
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/auth?returnTo=/dashboard">
              Design your own <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DESIGNS.map((d, i) => (
            <motion.div
              key={d.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
              className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <GarmentPreview
                palette={d.palette}
                garmentType={d.type}
                motif={d.plant}
                className="w-full"
              />
              <div className="p-4">
                <p className="text-sm font-semibold">{d.title}</p>
                <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                  {d.plant}
                </p>
                <div className="mt-2.5">
                  <PaletteSwatches palette={d.palette} size="sm" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section id="security" className="border-t border-border/60 bg-muted/30 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              Cybersecurity layer
            </p>
            <h2 className="font-display mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
              Tamper-evident by design
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Every supply-chain event is serialized into canonical JSON,
              hashed with SHA-256, and chained to the previous hash. A forged
              or modified record can never match the sealed digest — detection
              is mathematical, not optional.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                {
                  icon: Fingerprint,
                  text: "SHA-256 hash chain over every batch and event",
                },
                {
                  icon: ShieldCheck,
                  text: "Role-based access control for farmers, makers, tailors and admins",
                },
                {
                  icon: QrCode,
                  text: "Public QR verification with zero customer PII exposed",
                },
                {
                  icon: Leaf,
                  text: "AI fraud detection over documents, quantities and certifications",
                },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                    <f.icon className="size-3.5" />
                  </span>
                  <span className="text-muted-foreground">{f.text}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 gap-2">
              <Link to="/auth?returnTo=/security">
                <ShieldCheck className="size-4" />
                Open the Security Center demo
              </Link>
            </Button>
          </div>

          {/* hash chain visual */}
          <motion.div {...fadeUp} className="space-y-3">
            {[
              {
                stage: "🌱 Farmer registered",
                hash: "4f8a2b…c91d",
                ok: true,
              },
              {
                stage: "🌿 Raw material verified",
                hash: "9c31de…57ab",
                ok: true,
              },
              {
                stage: "🧪 Dye batch created",
                hash: "1b77e4…8a02",
                ok: false,
                note: "quantityKg modified after sealing",
              },
              {
                stage: "🧵 Fabric allocated",
                hash: "77ac13…e9b4",
                ok: true,
                note: "chain link broken → detection",
              },
            ].map((row) => (
              <div
                key={row.stage}
                className={cn(
                  "rounded-xl border p-4 shadow-sm",
                  row.ok
                    ? "border-border/70 bg-card"
                    : "border-rose-200 bg-rose-50",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{row.stage}</p>
                  <code className="font-mono text-[10px] text-muted-foreground">
                    {row.hash}
                  </code>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                  {row.ok ? (
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <CheckCircle2 className="size-3.5" /> HASH OK
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold text-rose-600">
                      🔴 MISMATCH
                    </span>
                  )}
                  {row.note && (
                    <span className="text-muted-foreground">{row.note}</span>
                  )}
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              🔴 TAMPERING DETECTED — the record's hash no longer matches the
              stored integrity chain.
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <div
            aria-hidden
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative">
            <p className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              From plant to personalized fashion.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/75">
              Designed by AI. Protected by cybersecurity. Worn with certainty.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-background text-foreground hover:bg-background/90"
              >
                <Link to="/auth?returnTo=/dashboard">
                  Start your design <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/auth?returnTo=/security">Watch the demo</Link>
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
            NaturalFlow · AI-powered secure natural fashion · Hackathon MVP
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sprout className="size-3.5 text-emerald-600" /> Farmers
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="size-3.5 text-sky-600" /> Dye makers
            </span>
            <span className="flex items-center gap-1">
              <Lock className="size-3.5 text-primary" /> SHA-256
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
