import { SectionHeading, Reveal } from "./shared";
import { Camera, FlaskConical, ScanLine, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: Camera,
    num: "01",
    title: "Upload Fabric",
    text: "Take a photo of any fabric — EcoPrint measures the real dominant colour from the image.",
  },
  {
    icon: ScanLine,
    num: "02",
    title: "AI Analyzes Fabric",
    text: "Texture, colour (RGB/LAB), dye compatibility and projected retention are computed instantly.",
  },
  {
    icon: FlaskConical,
    num: "03",
    title: "Generate Design & Dye Recommendation",
    text: "Get the ideal natural dye, mordant and dyeing conditions — plus an AI-composed design.",
  },
  {
    icon: Sparkles,
    num: "04",
    title: "Create Sustainable Fashion",
    text: "Download, save, order and verify your garment on a tamper-proof supply chain.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="How It Works"
          title="From Plant to Personalized Fashion"
          description="A simple four-step journey — designed by AI, dyed naturally, protected by cybersecurity."
        />
      </Reveal>

      <div className="relative grid gap-5 md:grid-cols-4">
        {/* Connecting line */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 md:block"
        />
        {STEPS.map((s, i) => (
          <Reveal key={s.num} delay={i * 0.1}>
            <div className="group relative rounded-3xl border border-border/70 bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="relative mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-105">
                <s.icon className="size-7" />
                <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary-foreground">
                  {s.num}
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold">{s.title}</p>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
