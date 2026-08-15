import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WashChart } from "@/components/analysis/WashChart";
import { analyzeImageFile } from "@/lib/ai";
import { ANALYSIS_FABRICS, DYE_KNOWLEDGE, PATTERNS, WASH_CYCLES } from "@/convex/constants";
import { formatDate } from "@/lib/format";
import { useMutation } from "convex/react";
import {
  AlertTriangle,
  FlaskConical,
  ImagePlus,
  Loader2,
  RefreshCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wand2,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Result {
  id: string;
  fabric: string;
  dye: string;
  pattern: string;
  washes: number;
  initialHex: string;
  dominantColor: string;
  rgb: { r: number; g: number; b: number };
  lab: { L: number; a: number; b: number };
  afterHex: string;
  retention: number;
  retentionCategory: string;
  colorDifference: number;
  tempMin: number;
  tempMax: number;
  durationMin: number;
  durationMax: number;
  mordant: string;
  recommendation: string;
  fabricRecommendation: string;
  washingRecommendation: string;
  sustainabilityScore: number;
  confidence: number;
  mode: string;
  curve: { washes: number; retention: number }[];
}

const RETENTION_TONE: Record<string, string> = {
  Excellent: "bg-emerald-500/10 text-emerald-700",
  Good: "bg-emerald-500/10 text-emerald-700",
  Moderate: "bg-amber-500/10 text-amber-700",
  Low: "bg-rose-500/10 text-rose-700",
};

export default function Analyze() {
  const analyzeFabric = useMutation(api.analysis.analyzeFabric);
  const fileRef = useRef<HTMLInputElement>(null);

  const [fabric, setFabric] = useState("Cotton");
  const [dye, setDye] = useState("Indigo");
  const [pattern, setPattern] = useState("Floral");
  const [washes, setWashes] = useState(10);

  const [preview, setPreview] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<string | undefined>(undefined);
  const [dominantHex, setDominantHex] = useState<string | undefined>(undefined);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    try {
      const analysis = await analyzeImageFile(file);
      setPreview(analysis.previewUrl);
      setImageHash(analysis.imageHash);
      setDominantHex(analysis.dominantColors[0]?.hex);
    } catch {
      setError("Unable to process image. Please upload JPG, JPEG or PNG.");
      toast.error("Unable to process image. Please upload JPG, JPEG or PNG.");
    }
  };

  const run = async () => {
    setError(null);
    setRunning(true);
    try {
      const initialHex = dominantHex ?? DYE_KNOWLEDGE[dye]?.hex ?? "#8a9a78";
      const res = await analyzeFabric({
        fabric,
        dye,
        pattern,
        washes,
        initialHex,
        imageHash,
      });
      setResult(res as unknown as Result);
      toast.success("Analysis complete — simulated prediction saved to history.");
    } catch {
      setError("Backend unavailable — Demo Mode enabled.");
      toast.error("Backend unavailable — Demo Mode enabled.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            EcoPrint AI · Fabric Analysis
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Predict color retention & dyeing conditions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a fabric photo, pick your inputs and let EcoPrint AI estimate
            fastness, ΔE, mordants and more.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700">
          <ScanLine className="size-3.5" /> Simulated prediction — not lab-certified
        </span>
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
          <span className="flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4" /> {error}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              setError(null);
              if (preview || dominantHex) await run();
              else toast("Nothing to retry — upload an image or pick inputs first.");
            }}
          >
            <RefreshCcw className="mr-1.5 size-3.5" /> Retry Connection
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* Inputs */}
        <div className="space-y-5">
          <Card className="shadow-none border-border/70">
            <CardHeader>
              <CardTitle className="text-base">1 · Fabric image</CardTitle>
              <CardDescription>
                JPG, PNG or WebP · up to 10 MB. The dominant colour is measured
                from the photo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) void handleFile(f);
                }}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/60",
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
                  <img src={preview} alt="Fabric preview" className="max-h-40 rounded-lg object-cover shadow-sm" />
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UploadCloud className="size-6" />
                  </span>
                )}
                <p className="text-sm font-medium">
                  {preview ? "Photo ready — tap to change" : "Drop your fabric photo, or click to browse"}
                </p>
              </div>
              {dominantHex && (
                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="size-3.5 rounded-full ring-1 ring-border" style={{ background: dominantHex }} />
                  Dominant colour detected: <code className="font-mono">{dominantHex}</code>
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-none border-border/70">
            <CardHeader>
              <CardTitle className="text-base">2 · Analysis inputs</CardTitle>
              <CardDescription>
                Fabric type, natural dye, pattern and wash cycles drive the prediction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Fabric type</Label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {ANALYSIS_FABRICS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFabric(f)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        fabric === f
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs">Natural dye</Label>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {Object.entries(DYE_KNOWLEDGE).map(([name, k]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setDye(name)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors",
                        dye === name
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/70 text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <span className="size-3.5 shrink-0 rounded-full ring-1 ring-border" style={{ background: k.hex }} />
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Pattern / design</Label>
                  <Select value={pattern} onValueChange={setPattern}>
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PATTERNS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Wash cycles</Label>
                  <Select value={String(washes)} onValueChange={(v) => setWashes(Number(v))}>
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WASH_CYCLES.map((w) => (
                        <SelectItem key={w} value={String(w)}>
                          {w} {w === 1 ? "wash" : "washes"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full gap-2" onClick={() => void run()} disabled={running}>
                {running ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                {running ? "Analyzing with AI…" : "Analyze with AI"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-5">
          {!result ? (
            <Card className="shadow-none border-dashed border-border/70">
              <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FlaskConical className="size-7" />
                </span>
                <p className="text-sm font-medium">Your results will appear here</p>
                <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                  EcoPrint AI will show fabric detection, dominant colour (RGB/LAB),
                  color difference, retention %, dyeing conditions, mordant and
                  recommendations.
                </p>
                {running && (
                  <span className="flex items-center gap-2 text-xs text-primary">
                    <Loader2 className="size-3.5 animate-spin" /> Running the retention model…
                  </span>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="shadow-none border-border/70">
                <CardHeader className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">Analysis result</CardTitle>
                    <CardDescription>
                      {result.dye} on {result.fabric} · {result.pattern} · {result.washes} wash(es)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                      <Sparkles className="size-3" /> {result.confidence}% AI confidence
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        RETENTION_TONE[result.retentionCategory] ?? "bg-muted text-muted-foreground",
                      )}
                    >
                      {result.retentionCategory}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Colour comparison */}
                  <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
                    <div className="text-center">
                      <span className="mx-auto block size-14 rounded-xl shadow-inner ring-1 ring-border" style={{ background: result.initialHex }} />
                      <p className="mt-1.5 text-[10px] text-muted-foreground">Initial</p>
                    </div>
                    <span className="text-lg text-muted-foreground">→</span>
                    <div className="text-center">
                      <span className="mx-auto block size-14 rounded-xl shadow-inner ring-1 ring-border" style={{ background: result.afterHex }} />
                      <p className="mt-1.5 text-[10px] text-muted-foreground">After {result.washes} washes</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="font-display text-3xl font-semibold text-primary">{result.retention}%</p>
                      <p className="text-[10px] text-muted-foreground">retention</p>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                    <Metric label="Fabric detected" value={result.fabric} />
                    <Metric label="Dominant colour" value={result.dominantColor} sub={<code className="font-mono">{result.initialHex}</code>} />
                    <Metric label="RGB" value={<code className="font-mono">{result.rgb.r}, {result.rgb.g}, {result.rgb.b}</code>} />
                    <Metric label="LAB" value={<code className="font-mono">L {result.lab.L} · a {result.lab.a} · b {result.lab.b}</code>} />
                    <Metric label="Color difference (ΔE)" value={`${result.colorDifference}`} />
                    <Metric label="Dyeing temperature" value={`${result.tempMin}–${result.tempMax}°C`} />
                    <Metric label="Dyeing duration" value={`${result.durationMin}–${result.durationMax} min`} />
                    <Metric label="Mordant" value={result.mordant} />
                    <Metric label="Sustainability score" value={`${result.sustainabilityScore}/100`} />
                  </div>

                  <div className="space-y-2">
                    <Reco icon="dye" text={result.recommendation} />
                    <Reco icon="fabric" text={result.fabricRecommendation} />
                    <Reco icon="wash" text={result.washingRecommendation} />
                  </div>

                  <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <ShieldCheck className="size-3 text-primary" />
                    Saved to history · {formatDate(new Date().toISOString())} ·{" "}
                    <Link to={`/reports?id=${result.id}`} className="font-medium text-primary hover:underline">
                      Open full report →
                    </Link>
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-none border-border/70">
                <CardContent className="p-4">
                  <WashChart curve={result.curve} initialHex={result.initialHex} afterHex={result.afterHex} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <p className="text-[9px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 text-xs font-medium">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Reco({ icon, text }: { icon: "dye" | "fabric" | "wash"; text: string }) {
  const Icon = icon === "dye" ? Wand2 : icon === "fabric" ? ImagePlus : Sparkles;
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-background px-3 py-2.5 text-xs leading-5 text-muted-foreground">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-3.5" />
      </span>
      <span>{text}</span>
    </div>
  );
}
