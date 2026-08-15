import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SectionHeading, Reveal } from "./shared";
import { predictAnalysis } from "@/lib/analysis-model";
import { ANALYSIS_FABRICS, DYE_KNOWLEDGE } from "@/convex/constants";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Beaker, FlaskConical, Leaf, ThermometerSun } from "lucide-react";

const MORDANTS = [
  "Alum",
  "Iron",
  "Copper sulphate",
  "Tannin",
  "None (vat dye)",
  "Lime + iron",
];

export function DyeOptimizerSection() {
  const [fabric, setFabric] = useState("Organic Cotton");
  const [dye, setDye] = useState("Indigo");
  const [concentration, setConcentration] = useState(8); // %
  const [time, setTime] = useState(60); // minutes
  const [temp, setTemp] = useState(45); // °C
  const [mordant, setMordant] = useState(MORDANTS[0]);
  const [washes, setWashes] = useState(10);

  const k = DYE_KNOWLEDGE[dye];

  const results = useMemo(() => {
    const baseline = predictAnalysis({
      fabric,
      dye,
      pattern: "Geometric",
      washes,
      initialHex: k.hex,
    });

    // Simple demo adjustments — clearly labelled as estimates.
    const concFactor = 1 + (4 - Math.abs(concentration - 8)) * 0.008; // 8% is optimal
    const timeFactor = 1 + (k.durationMin <= time && time <= k.durationMax ? 0.02 : -0.05);
    const tempDelta = temp < k.tempMin ? k.tempMin - temp : temp > k.tempMax ? temp - k.tempMax : 0;
    const tempFactor = Math.max(0.86, 1 - tempDelta * 0.006);

    const retention = Math.round(
      Math.min(96, Math.max(15, baseline.retention * concFactor * timeFactor * tempFactor)),
    );
    const performance = Math.round(55 + retention * 0.45);
    const stability = Math.round(retention >= 85 ? 92 : retention >= 70 ? 78 : retention >= 55 ? 60 : 40);
    const sustainability = Math.round(baseline.sustainabilityScore * (mordant === "Copper sulphate" ? 0.94 : 1));

    return { retention, performance, stability, sustainability, baseline };
  }, [fabric, dye, concentration, time, temp, mordant, washes, k]);

  const recommended =
    temp >= k.tempMin && temp <= k.tempMax && time >= k.durationMin && time <= k.durationMax;

  return (
    <section id="optimize" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="AI Dye Optimization"
          title="Find the Perfect Natural Dye Formula"
          description={
            <>
              Tune concentration, time, temperature and mordant — EcoPrint AI
              projects retention, stability and sustainability for your recipe.{" "}
              <span className="font-medium text-amber-700">AI estimates, not laboratory-certified measurements.</span>
            </>
          }
        />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Controls */}
        <Reveal delay={0.05}>
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px]">Fabric type</Label>
                <Select value={fabric} onValueChange={setFabric}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ANALYSIS_FABRICS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px]">Natural dye</Label>
                <Select value={dye} onValueChange={setDye}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(DYE_KNOWLEDGE).map((d) => (
                      <SelectItem key={d} value={d}>
                        <span className="flex items-center gap-2">
                          <span className="size-3 rounded-full" style={{ background: DYE_KNOWLEDGE[d].hex }} /> {d}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <SliderRow label="Dye concentration" display={`${concentration}%`} value={concentration} min={2} max={20} step={1} onChange={setConcentration} />
              <SliderRow label="Dyeing time" display={`${time} min`} value={time} min={20} max={120} step={5} onChange={setTime} />
              <SliderRow label="Temperature" display={`${temp}°C`} value={temp} min={15} max={95} step={5} onChange={setTemp} hint={`recommended ${k.tempMin}–${k.tempMax}°C`} />
              <SliderRow label="Washing cycles" display={`${washes}`} value={washes} min={1} max={30} step={1} onChange={setWashes} />
              <div>
                <Label className="text-[11px]">Mordant</Label>
                <Select value={mordant} onValueChange={setMordant}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MORDANTS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Results */}
        <Reveal delay={0.1} className="space-y-4">
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">AI results</p>
              {recommended ? (
                <Badge className="gap-1 bg-emerald-500/10 text-emerald-700">
                  <FlaskConical className="size-3" /> In recommended range
                </Badge>
              ) : (
                <Badge className="gap-1 bg-amber-500/10 text-amber-700">
                  <ThermometerSun className="size-3" /> Adjust conditions
                </Badge>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <ResultBar label="Predicted Color Retention" value={`${results.retention}%`} pct={results.retention} tone="bg-primary" />
              <ResultBar label="Dye Performance" value={`${results.performance}/100`} pct={results.performance} tone="bg-chart-2" />
              <ResultBar label="Color Stability" value={`${results.stability}/100`} pct={results.stability} tone="bg-chart-4" />
              <ResultBar label="Sustainability Score" value={`${results.sustainability}/100`} pct={results.sustainability} tone="bg-emerald-600" />
            </div>
          </div>

          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Beaker className="size-4 text-primary" /> Recommended conditions
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <Cond label="Temperature" value={`${k.tempMin}–${k.tempMax}°C`} />
              <Cond label="Duration" value={`${k.durationMin}–${k.durationMax} min`} />
              <Cond label="Mordant" value={k.mordant.split(" ")[0] === "None" ? "None needed" : k.mordant} />
              <Cond label="Best fabrics" value={k.suitableFabrics.slice(0, 3).join(" / ")} />
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-muted-foreground">
              <Leaf className="mt-0.5 size-3 shrink-0 text-primary" /> {k.sustainability}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SliderRow({
  label,
  display,
  value,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  display: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label className="text-[11px]">{label}</Label>
        <span className="font-mono text-xs font-semibold text-primary">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-primary"
      />
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ResultBar({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: string;
  pct: number;
  tone: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-display text-lg font-semibold">{value}</p>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-700", tone)}
          style={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
}

function Cond({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background/70 px-3 py-2 ring-1 ring-border/60">
      <p className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 text-xs font-medium">{value}</p>
    </div>
  );
}
