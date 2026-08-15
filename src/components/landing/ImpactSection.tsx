import { SectionHeading, Reveal } from "./shared";
import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Droplets, Leaf, Recycle, Bot } from "lucide-react";

const IMPACTS = [
  { icon: Recycle, title: "Reduced Chemical Dye Usage", target: 62, suffix: "%", text: "fewer synthetic dyes across tested EcoPrint recipes" },
  { icon: Droplets, title: "Water-Conscious Fashion", target: 38, suffix: "%", text: "less water used through low-water extraction & vat recycling" },
  { icon: Leaf, title: "Sustainable Materials", target: 12, suffix: "", text: "plant-based, traceable natural dyes in the catalogue" },
  { icon: Bot, title: "AI-Assisted Decisions", target: 4, suffix: "×", text: "faster dye formulation compared to manual trial-and-error" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <span ref={ref} className="font-display text-5xl font-semibold text-primary sm:text-6xl">
      {value}
      {suffix}
    </span>
  );
}

export function ImpactSection() {
  return (
    <section id="impact" className="border-y border-border/60 bg-primary text-primary-foreground py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Impact"
          title="Fashion That Gives Back"
          description="Every decision in EcoPrint AI is scored for sustainability — here is what natural, AI-guided dyeing can do."
          className="[&_p]:text-primary-foreground/70"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {IMPACTS.map((imp, i) => (
            <Reveal key={imp.title} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur transition-colors hover:bg-primary-foreground/10">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-foreground/15">
                  <imp.icon className="size-5" />
                </span>
                <div className="mt-4">
                  <Counter target={imp.target} suffix={imp.suffix} />
                </div>
                <p className="mt-3 text-sm font-semibold">{imp.title}</p>
                <p className="mt-1 text-xs leading-5 text-primary-foreground/70">{imp.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] text-primary-foreground/60">
          Illustrative demo metrics for the hackathon — validate with real production data.
        </p>
      </div>
    </section>
  );
}
