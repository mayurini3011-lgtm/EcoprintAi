import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading, Reveal } from "./shared";
import { readDemoAnalysis, ANALYSIS_CHANGED_EVENT } from "@/lib/demo-analysis";
import { predictAnalysis } from "@/lib/analysis-model";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { MoveHorizontal, ScanLine, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

/** Fallback sample so the section always has something to show. */
function sampleResult() {
  return predictAnalysis({
    fabric: "Cotton",
    dye: "Indigo",
    pattern: "Tie Dye",
    washes: 10,
    initialHex: "#2b4a9b",
  });
}

export function BeforeAfterSection() {
  const [pos, setPos] = useState(50);
  const [result, setResult] = useState(() => readDemoAnalysis() ?? sampleResult());

  useEffect(() => {
    const sync = () => {
      const stored = readDemoAnalysis();
      if (stored) setResult(stored);
    };
    window.addEventListener(ANALYSIS_CHANGED_EVENT, sync);
    return () => window.removeEventListener(ANALYSIS_CHANGED_EVENT, sync);
  }, []);

  const stability = useMemo(() => {
    const r = result.retention;
    if (r >= 85) return { pct: 92, label: "High" };
    if (r >= 70) return { pct: 78, label: "Good" };
    if (r >= 55) return { pct: 58, label: "Moderate" };
    return { pct: 38, label: "Low" };
  }, [result.retention]);

  return (
    <section id="before-after" className="border-y border-border/60 bg-muted/40 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Before & After"
            title="See How Your Color Performs"
            description="Drag the slider to compare the original dye shade with the projected colour after repeated washes."
          />
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* Comparison slider */}
          <Reveal delay={0.05}>
            <div className="overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
              <div className="relative aspect-[16/9] w-full select-none overflow-hidden rounded-2xl ring-1 ring-border">
                {/* After (base layer) */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: result.afterHex }}>
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-widest drop-shadow">After {result.washes} washes</span>
                </div>
                {/* Before (clipped layer) */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: result.initialHex, clipPath: `inset(0 ${100 - pos}% 0 0)` }}
                >
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-widest drop-shadow">Before washing</span>
                </div>
                {/* Divider */}
                <div className="absolute inset-y-0" style={{ left: `${pos}%` }}>
                  <div className="absolute inset-y-0 -ml-px w-0.5 bg-white/90 shadow-md" />
                  <span className="absolute top-1/2 -ml-4 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-lg">
                    <MoveHorizontal className="size-4" />
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pos}
                  onChange={(e) => setPos(Number(e.target.value))}
                  aria-label="Compare before and after washing"
                  className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
                />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <ScanLine className="size-3 text-primary" /> {result.dye} on {result.fabric} · {result.pattern} · {result.washes} wash cycles
              </p>
            </div>
          </Reveal>

          {/* Metrics */}
          <Reveal delay={0.1} className="space-y-3">
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold">Color performance</p>
              <div className="mt-4 space-y-4">
                <StatRow label="Color Retention" value={`${result.retention}%`} pct={result.retention} tone="text-primary" />
                <StatRow label="Color Difference (ΔE)" value={`${result.colorDifference}`} pct={Math.min(100, Math.round(result.colorDifference * 4))} tone="text-amber-700" invert />
                <StatRow label="Color Stability" value={stability.label} pct={stability.pct} tone="text-emerald-700" />
              </div>
            </div>
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
              <p className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-primary" /> Honest by design</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Retention and ΔE are AI estimates computed with CIEDE2000 color
                science from the EcoPrint model — useful for comparing options,
                not a substitute for lab swatch testing.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-4 gap-1.5 rounded-full">
                <Link to="/auth?returnTo=/analyze">Run your own analysis</Link>
              </Button>
            </div>
            <Badge variant="outline" className="gap-1 border-amber-400/40 bg-amber-500/10 text-[10px] text-amber-700">
              AI estimate — not lab-certified
            </Badge>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function StatRow({
  label,
  value,
  pct,
  tone,
  invert = false,
}: {
  label: string;
  value: string;
  pct: number;
  tone: string;
  invert?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("font-display text-xl font-semibold", tone)}>{value}</p>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full bg-primary transition-all duration-700", invert && "bg-amber-500")}
          style={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
}
