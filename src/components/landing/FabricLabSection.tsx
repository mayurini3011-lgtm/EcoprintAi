import { Button } from "@/components/ui/button";
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
import { analyzeImageFile } from "@/lib/ai";
import { predictAnalysis, type FabricAnalysisResult } from "@/lib/analysis-model";
import { storeDemoAnalysis } from "@/lib/demo-analysis";
import { ANALYSIS_FABRICS, DYE_KNOWLEDGE, PATTERNS, WASH_CYCLES } from "@/convex/constants";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  FlaskConical,
  ImagePlus,
  Loader2,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

const TEXTURES: Record<string, string> = {
  Cotton: "Soft plain weave",
  "Organic Cotton": "Lightweight, breathable weave",
  Silk: "Smooth satin lustre",
  Linen: "Crisp, textured weave",
  Wool: "Warm, brushed surface",
  Jute: "Coarse, natural basketweave",
  Denim: "Dense twill, sturdy",
  Khadi: "Hand-spun, irregular slub",
};

const EXAMPLES = [
  { dye: "Indigo", fabric: "Cotton", pattern: "Tie Dye", washes: 10, hex: "#2b4a9b" },
  { dye: "Turmeric", fabric: "Organic Cotton", pattern: "Floral", washes: 5, hex: "#e3a32a" },
  { dye: "Beetroot", fabric: "Silk", pattern: "Geometric", washes: 5, hex: "#8e2a4f" },
];

export function FabricLabSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fabric, setFabric] = useState("Cotton");
  const [dye, setDye] = useState("Indigo");
  const [pattern, setPattern] = useState("Floral");
  const [washes, setWashes] = useState(10);
  const [preview, setPreview] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<FabricAnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    try {
      const analysis = await analyzeImageFile(file);
      setPreview(analysis.previewUrl);
      setFileName(analysis.fileName);
    } catch {
      setError("Unable to read that image — please upload JPG, JPEG or PNG.");
    }
  };

  const run = async () => {
    setError(null);
    setRunning(true);
    try {
      const initialHex = result?.initialHex ?? DYE_KNOWLEDGE[dye].hex;
      const res = predictAnalysis({ fabric, dye, pattern, washes, initialHex, imageHash: undefined });
      // Small delay so the analyzing state is visible.
      await new Promise((r) => setTimeout(r, 900));
      setResult(res);
      storeDemoAnalysis(res);
      toast.success("Fabric analyzed — AI estimate ready.");
    } catch {
      setError("Analysis failed — please try again.");
    } finally {
      setRunning(false);
    }
  };

  const knowledge = DYE_KNOWLEDGE[dye];
  const compatible = knowledge.suitableFabrics.includes(fabric);

  return (
    <section id="fabric-lab" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="AI Fabric Lab"
          title="Turn Fabric Into Data"
          description={
            <>
              Upload a fabric image and let AI analyze its texture, color,
              material characteristics and dye behavior — powered by real color
              science (CIEDE2000) and the same prediction model the full lab uses.
            </>
          }
        />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Upload card */}
        <Reveal delay={0.05} className="space-y-5">
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold">1 · Upload fabric image</p>
            <p className="mt-0.5 text-xs text-muted-foreground">JPG, JPEG or PNG — up to 10 MB.</p>

            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) void handleFile(f);
              }}
              className={cn(
                "mt-4 flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-border bg-muted/40 px-4 py-10 text-center transition-all hover:border-primary/50 hover:bg-muted/60",
                preview && "border-solid border-primary/40",
              )}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
              {preview ? (
                <img src={preview} alt="Fabric preview" className="max-h-36 rounded-xl object-cover shadow-sm" />
              ) : (
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UploadCloud className="size-7" />
                </span>
              )}
              <p className="text-sm font-medium">
                {preview ? "Photo ready — tap to change" : "Drop your fabric photo, or click to browse"}
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Camera className="size-3" /> {fileName ?? "Dominant colour is measured from the photo"}
              </p>
            </div>

            {error && (
              <p className="mt-3 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-800">{error}</p>
            )}
          </div>

          {/* Inputs */}
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold">2 · Analysis inputs</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
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
              <div>
                <Label className="text-[11px]">Pattern</Label>
                <Select value={pattern} onValueChange={setPattern}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PATTERNS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px]">Wash cycles</Label>
                <Select value={String(washes)} onValueChange={(v) => setWashes(Number(v))}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WASH_CYCLES.map((w) => (
                      <SelectItem key={w} value={String(w)}>{w} {w === 1 ? "wash" : "washes"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="mt-4 w-full gap-2 rounded-full" onClick={() => void run()} disabled={running}>
              {running ? <Loader2 className="size-4 animate-spin" /> : <ScanLine className="size-4" />}
              {running ? "Analyzing with AI…" : "Analyze Fabric with AI"}
            </Button>
            <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3 shrink-0 text-primary" />
              Live demo prediction — an AI estimate, not a lab-certified
              measurement. Sign in to save reports and history.
            </p>
          </div>
        </Reveal>

        {/* Results */}
        <Reveal delay={0.1}>
          {!result ? (
            <div className="flex h-full flex-col gap-3">
              <div className="rounded-3xl border border-dashed border-border/70 bg-card p-6">
                <p className="flex items-center gap-2 text-sm font-semibold"><ImagePlus className="size-4 text-primary" /> Example analyses</p>
                <div className="mt-4 space-y-2.5">
                  {EXAMPLES.map((ex) => (
                    <div key={ex.dye} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-3">
                      <span className="size-10 shrink-0 rounded-xl ring-1 ring-border" style={{ background: ex.hex }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{ex.dye} on {ex.fabric}</p>
                        <p className="text-[11px] text-muted-foreground">{ex.pattern} · {ex.washes} washes</p>
                      </div>
                      <Badge variant="outline" className="gap-1 border-amber-400/40 bg-amber-500/10 text-[10px] text-amber-700">
                        <FlaskConical className="size-3" /> Demo
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-dashed border-border/70 bg-card/60 p-6 text-center">
                <Sparkles className="mx-auto size-6 text-primary" />
                <p className="mt-2 text-sm font-medium">Your analysis results appear here</p>
                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                  Fabric type, color, texture, dye compatibility and estimated color retention.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">Analysis result</p>
                <div className="flex items-center gap-2">
                  <Badge className="gap-1 bg-primary/10 text-primary">
                    <Sparkles className="size-3" /> {result.confidence}% AI confidence
                  </Badge>
                  <Badge
                    className={cn(
                      "bg-emerald-500/10 text-emerald-700",
                      result.retentionCategory === "Moderate" && "bg-amber-500/10 text-amber-700",
                      result.retentionCategory === "Low" && "bg-rose-500/10 text-rose-700",
                    )}
                  >
                    {result.retentionCategory}
                  </Badge>
                </div>
              </div>

              {/* Before / after */}
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-muted/50 p-4">
                <div className="text-center">
                  <span className="mx-auto block size-12 rounded-xl shadow-inner ring-1 ring-border" style={{ background: result.initialHex }} />
                  <p className="mt-1.5 text-[10px] text-muted-foreground">Before</p>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="text-center">
                  <span className="mx-auto block size-12 rounded-xl shadow-inner ring-1 ring-border" style={{ background: result.afterHex }} />
                  <p className="mt-1.5 text-[10px] text-muted-foreground">After {result.washes} washes</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-display text-3xl font-semibold text-primary">{result.retention}%</p>
                  <p className="text-[10px] text-muted-foreground">color retention</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Metric label="Fabric type" value={result.fabric} />
                <Metric label="Color" value={result.dominantColor} sub={<code className="font-mono">{result.initialHex}</code>} />
                <Metric label="Texture" value={TEXTURES[result.fabric] ?? "—"} />
                <Metric label="Dye compatibility" value={compatible ? "Excellent" : "Fair"} sub={compatible ? "Great fibre match" : `Best on ${knowledge.suitableFabrics[0]}`} />
                <Metric label="Color difference" value={`${result.colorDifference} ΔE`} />
                <Metric label="Sustainability" value={`${result.sustainabilityScore}/100`} />
              </div>

              <p className="mt-4 rounded-xl bg-muted/50 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
                <span className="font-medium text-foreground">Mordant:</span> {result.mordant} ·{" "}
                <span className="font-medium text-foreground">Dyeing:</span> {result.tempMin}–{result.tempMax}°C, {result.durationMin}–{result.durationMax} min
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" className="gap-1.5 rounded-full">
                  <Link to="/auth?returnTo=/analyze">
                    Full lab & reports <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-full" onClick={() => void run()}>
                  <CheckCircle2 className="size-3.5 text-primary" /> Re-analyze
                </Button>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function Metric({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2.5">
      <p className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 text-xs font-medium">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
