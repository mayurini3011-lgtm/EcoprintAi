import { api } from "@/convex/_generated/api";
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
import { Textarea } from "@/components/ui/textarea";
import { DesignCanvas, downloadSvgElement, type DesignSpec } from "@/components/design/DesignCanvas";
import { SectionHeading, Reveal } from "./shared";
import {
  DESIGN_FABRICS,
  DYE_KNOWLEDGE,
  GARMENT_TYPES,
  PALETTES,
  PATTERNS,
  SLEEVE_STYLES,
} from "@/convex/constants";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { useAction, useQuery } from "convex/react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Download,
  Loader2,
  Palette,
  ShoppingBag,
  Sparkles,
  Wand2,
} from "lucide-react";

interface Generated {
  spec: DesignSpec;
  title: string;
  mode: string;
  provider: string;
}

export function DesignStudioSection() {
  const generateDesign = useAction(api.designStudio.generateDesign);
  const providers = useQuery(api.designProviders.listProviders);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const svgRefs = useRef(new Map<string, HTMLDivElement>());

  const [garment, setGarment] = useState<string>(GARMENT_TYPES[0]);
  const [fabric, setFabric] = useState("Cotton");
  const [dye, setDye] = useState("Indigo");
  const [pattern, setPattern] = useState("Floral");
  const [paletteName, setPaletteName] = useState("Indigo blue");
  const [style, setStyle] = useState<string>(SLEEVE_STYLES[0]);
  const [prompt, setPrompt] = useState("Flowing botanical motifs with a hand-crafted feel");

  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<Generated[]>([]);

  const liveProvider =
    providers?.find((p) => p.configured && p.id !== "demo")?.id ?? "demo";

  const generate = async () => {
    setGenerating(true);
    try {
      const palette = PALETTES[paletteName] ?? PALETTES["Indigo blue"];
      const out: Generated[] = [];
      for (let v = 0; v < 3; v++) {
        const res = await generateDesign({
          prompt: `${prompt} — ${garment} silhouette, ${style} sleeves`,
          fabric,
          dye,
          pattern,
          palette,
          seed: 1000 + v,
          provider: liveProvider,
        });
        out.push({
          spec: { seed: res.seed, pattern, palette: res.palette },
          title: res.title,
          mode: res.mode,
          provider: res.provider,
        });
      }
      setResults(out);
      toast.success(
        liveProvider === "demo"
          ? "Designs generated — procedural previews."
          : "Designs generated with the configured image model.",
      );
    } catch {
      toast.error("Generation failed — please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const download = (g: Generated, key: string) => {
    const el = svgRefs.current.get(key)?.querySelector("svg") as SVGSVGElement | null;
    if (el) downloadSvgElement(el, g.title);
    else toast.error("Could not serialize this design.");
  };

  const addToCart = (g: Generated) => {
    addItem({
      id: `${g.title}-${fabric}-${pattern}`,
      title: g.title,
      fabric,
      pattern,
      dye,
      seed: g.spec.seed,
      palette: g.spec.palette,
      price: 1499,
    });
    toast.success(`“${g.title}” added to cart`);
  };

  return (
    <section id="design-studio" className="border-y border-border/60 bg-muted/40 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="AI Design Studio"
            title="Imagine It. AI Creates It."
            description="Generate unique fashion concepts, patterns and sustainable clothing ideas using AI — then download, save or add them to your cart."
          />
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Controls */}
          <Reveal delay={0.05}>
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold">Design brief</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px]">Category</Label>
                  <Select value={garment} onValueChange={setGarment}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GARMENT_TYPES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[11px]">Fabric</Label>
                  <Select value={fabric} onValueChange={setFabric}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DESIGN_FABRICS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
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
                  <Label className="text-[11px]">Color palette</Label>
                  <Select value={paletteName} onValueChange={setPaletteName}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(PALETTES).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
                  <Label className="text-[11px]">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SLEEVE_STYLES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3">
                <Label htmlFor="lp-prompt" className="text-[11px]">Design prompt</Label>
                <Textarea
                  id="lp-prompt"
                  className="mt-1 min-h-16 text-xs"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your fashion design…"
                />
              </div>
              <Button className="mt-4 w-full gap-2 rounded-full" onClick={() => void generate()} disabled={generating}>
                {generating ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                {generating ? "Generating fashion designs…" : "Generate Fashion Design"}
              </Button>
              <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
                {liveProvider === "demo"
                  ? "Demo mode renders procedural previews instantly. Add an image API key to generate real images."
                  : "Live image model connected — designs render through the configured provider."}
              </p>
            </div>
          </Reveal>

          {/* Results */}
          <Reveal delay={0.1}>
            {results.length === 0 ? (
              <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/70 bg-card/60 p-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Palette className="size-7" />
                </span>
                <p className="text-sm font-medium">Your generated designs appear here</p>
                <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                  Pick your category, fabric, dye, pattern and palette — then
                  generate three fashion concepts.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((g, i) => {
                  const key = `${g.title}-${i}`;
                  return (
                    <div key={key} className="flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                      <div ref={(el) => {
                        if (el) svgRefs.current.set(key, el);
                        else svgRefs.current.delete(key);
                      }} className="overflow-hidden">
                        <DesignCanvas spec={g.spec} className="w-full transition-transform duration-500 hover:scale-[1.03]" />
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-5">{g.title}</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0 border-amber-400/40 bg-amber-500/10 text-[9px] text-amber-700",
                              g.mode !== "demo-svg" && "border-emerald-400/40 bg-emerald-500/10 text-emerald-700",
                            )}
                          >
                            {g.mode === "demo-svg" ? "PROCEDURAL" : "MODEL"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {dye} on {fabric} · {pattern} · {garment}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs rounded-full" onClick={() => download(g, key)}>
                            <Download className="size-3.5" /> Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 text-xs rounded-full"
                            onClick={() => {
                              navigate("/auth?returnTo=/designs");
                              toast("Sign in to save designs to your library.");
                            }}
                          >
                            <Sparkles className="size-3.5 text-primary" /> Save
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs rounded-full" onClick={() => navigate("/auth?returnTo=/design-studio")}>
                            Customize
                          </Button>
                          <Button size="sm" className="ml-auto h-8 gap-1 rounded-full text-xs" onClick={() => addToCart(g)}>
                            <ShoppingBag className="size-3.5" /> ₹1,499
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
