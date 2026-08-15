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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DesignCanvas, downloadSvgElement, type DesignSpec } from "@/components/design/DesignCanvas";
import {
  DESIGN_FABRICS,
  DYE_KNOWLEDGE,
  PALETTES,
  PATTERNS,
  type PaletteColor,
} from "@/convex/constants";
import { useAction, useMutation } from "convex/react";
import { Download, Loader2, RefreshCcw, Save, Sparkles, Wand2, Zap } from "lucide-react";
import { useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

export default function DesignStudio() {
  const generateDesign = useAction(api.designStudio.generateDesign);
  const saveDesign = useMutation(api.designsData.saveDesign);

  // Deep-link support: /design-studio?dye=Indigo&fabric=Cotton&pattern=Floral
  const [searchParams] = useSearchParams();
  const linkDye = searchParams.get("dye");
  const linkFabric = searchParams.get("fabric");
  const linkPattern = searchParams.get("pattern");

  const [prompt, setPrompt] = useState("Soft flowing florals with a hand-crafted feel");
  const [fabric, setFabric] = useState(
    linkFabric && (DESIGN_FABRICS as readonly string[]).includes(linkFabric) ? linkFabric : "Cotton",
  );
  const [dye, setDye] = useState(linkDye && DYE_KNOWLEDGE[linkDye] ? linkDye : "Indigo");
  const [pattern, setPattern] = useState(
    linkPattern && (PATTERNS as readonly string[]).includes(linkPattern) ? linkPattern : "Floral",
  );
  const [paletteName, setPaletteName] = useState("Indigo blue");

  const [generating, setGenerating] = useState(false);
  const [spec, setSpec] = useState<DesignSpec | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"demo-svg" | "model">("demo-svg");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const svgWrapRef = useRef<HTMLDivElement>(null);

  const palette: PaletteColor[] = PALETTES[paletteName] ?? PALETTES["Indigo blue"];

  const generate = async (seed?: number) => {
    setError(null);
    setGenerating(true);
    try {
      const res = await generateDesign({
        prompt,
        fabric,
        dye,
        pattern,
        palette,
        seed,
      });
      setSpec({ seed: res.seed, pattern, palette: res.palette });
      setImageUrl(res.imageUrl);
      setMode(res.mode);
      setTitle(res.title);
      if (res.mode === "demo-svg") {
        toast("Demo preview generated — no image API connected.");
      }
    } catch {
      setError("AI generation unavailable. Try Demo Mode.");
      toast.error("AI generation unavailable. Try Demo Mode.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = `${title || "design"}.png`;
      a.click();
      return;
    }
    const svg = svgWrapRef.current?.querySelector("svg");
    if (svg) downloadSvgElement(svg, title || "design");
    else toast.error("Generate a design first.");
  };

  const handleSave = async () => {
    if (!spec) return;
    try {
      await saveDesign({
        title: title || "Untitled design",
        prompt,
        fabric,
        dye,
        pattern,
        palette: spec.palette,
        seed: spec.seed,
        mode,
      });
      toast.success("Design saved to your library.");
    } catch {
      toast.error("Could not save the design right now.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            EcoPrint AI · AI Fabric Design Studio
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Generate natural-dye textile designs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe a design, pick a fabric, dye, pattern and palette — and let
            EcoPrint AI compose a preview.
          </p>
        </div>
        {spec && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700">
            {mode === "demo-svg" ? "Demo preview · procedural renderer" : "Model image"}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-800">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Controls */}
        <div className="space-y-5">
          <Card className="shadow-none border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Design brief</CardTitle>
              <CardDescription>
                The prompt is combined with fabric, dye, pattern and palette.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt" className="text-xs">Prompt</Label>
                <Textarea
                  id="prompt"
                  className="mt-1 min-h-20 text-xs"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your fabric design…"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Fabric</Label>
                  <Select value={fabric} onValueChange={setFabric}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DESIGN_FABRICS.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Natural dye</Label>
                  <Select value={dye} onValueChange={setDye}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(DYE_KNOWLEDGE).map((d) => (
                        <SelectItem key={d} value={d}>
                          <span className="flex items-center gap-2">
                            <span className="size-3 rounded-full" style={{ background: DYE_KNOWLEDGE[d].hex }} />
                            {d}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Pattern</Label>
                  <Select value={pattern} onValueChange={setPattern}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PATTERNS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Color palette</Label>
                  <Select value={paletteName} onValueChange={setPaletteName}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(PALETTES).map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Palette</span>
                <div className="flex gap-1.5">
                  {palette.map((c) => (
                    <span key={c.hex} title={c.name} className="size-5 rounded-full ring-1 ring-border" style={{ background: c.hex }} />
                  ))}
                </div>
              </div>

              <Button className="w-full gap-2" onClick={() => void generate()} disabled={generating}>
                {generating ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                {generating ? "Generating design…" : "Generate AI Design"}
              </Button>

              <p className="text-[10px] leading-4 text-muted-foreground">
                Demo mode renders a procedural preview in your browser. Connect an
                AI image API (AI_API_KEY + AI_IMAGE_ENDPOINT) to generate real
                images — no keys are exposed in the frontend.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          {!spec ? (
            <Card className="shadow-none border-dashed border-border/70">
              <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="size-7" />
                </span>
                <p className="text-sm font-medium">Your design preview appears here</p>
                <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                  Pick your options and hit Generate AI Design.
                </p>
                {generating && (
                  <span className="flex items-center gap-2 text-xs text-primary">
                    <Loader2 className="size-3.5 animate-spin" /> Composing design…
                  </span>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div ref={svgWrapRef} className="mx-auto max-w-sm">
                  <DesignCanvas spec={spec} imageUrl={imageUrl} className="w-full" />
                </div>
                <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {dye} on {fabric} · {pattern} · {paletteName}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">seed {spec.seed}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="size-4" /> Download Design
                </Button>
                <Button variant="outline" onClick={() => void generate()} disabled={generating} className="gap-2">
                  <RefreshCcw className="size-4" /> Regenerate
                </Button>
                <Button variant="outline" onClick={() => void generate(spec.seed + 1)} disabled={generating} className="gap-2">
                  <Zap className="size-4" /> Generate Variation
                </Button>
                <Button variant="outline" onClick={() => void handleSave()} className="gap-2">
                  <Save className="size-4" /> Save Design
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Demo previews are procedural artworks, not generated by a real
                image model. "Use This Design" is available once you save and
                reuse it in your library.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
