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
import { FabricPreview } from "@/components/design/FabricPreview";
import {
  DESIGN_FABRICS,
  DYE_KNOWLEDGE,
  PALETTES,
  PATTERNS,
  type PaletteColor,
} from "@/convex/constants";
import { useCart } from "@/lib/cart";
import {
  CLASSIC_COLOURS,
  formatINR,
  naturalColourCards,
  recommendYarnFor,
} from "@/lib/shop";
import { useAction, useMutation, useQuery } from "convex/react";
import { Download, Leaf, Loader2, RefreshCcw, Save, ShoppingBag, Sparkles, Wand2, Zap } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProviderOption {
  id: string;
  label: string;
  model: string;
  description: string;
  configured: boolean;
  envVar: string;
}

const DEMO_PROVIDER: ProviderOption = {
  id: "demo",
  label: "Demo (procedural)",
  model: "procedural SVG",
  description: "Seeded browser-side renderer — works offline, no keys.",
  configured: true,
  envVar: "—",
};

export default function DesignStudio() {
  const generateDesign = useAction(api.designStudio.generateDesign);
  const saveDesign = useMutation(api.designsData.saveDesign);
  const providers = useQuery(api.designProviders.listProviders);

  // Deep-link support: /design-studio?dye=Indigo&fabric=Cotton&pattern=Floral
  const [searchParams] = useSearchParams();
  const linkDye = searchParams.get("dye");
  const linkFabric = searchParams.get("fabric");
  const linkPattern = searchParams.get("pattern");
  const linkColour = searchParams.get("colour");

  const [prompt, setPrompt] = useState("Soft flowing florals with a hand-crafted feel");
  const [fabric, setFabric] = useState(
    linkFabric && (DESIGN_FABRICS as readonly string[]).includes(linkFabric) ? linkFabric : "Cotton",
  );
  const [dye, setDye] = useState(linkDye && DYE_KNOWLEDGE[linkDye] ? linkDye : "Indigo");
  const [pattern, setPattern] = useState(
    linkPattern && (PATTERNS as readonly string[]).includes(linkPattern) ? linkPattern : "Floral",
  );
  const [paletteName, setPaletteName] = useState("Indigo blue");
  const [provider, setProvider] = useState("demo");

  // Colour explorer — natural dyes + classic colours drive the live preview.
  // Deep-link: /design-studio?colour=Blue&dye=Indigo
  const linkIsClassic =
    !!linkColour && CLASSIC_COLOURS.some((c) => c.name === linkColour);
  const linkIsNatural =
    !!linkDye && DYE_KNOWLEDGE[linkDye];
  const [colourTab, setColourTab] = useState<"natural" | "classic">(
    linkIsClassic ? "classic" : "natural",
  );
  const [colour, setColour] = useState(
    linkIsClassic
      ? (linkColour as string)
      : linkIsNatural
        ? (linkDye as string)
        : "Indigo",
  );

  const { addItem } = useCart();
  const navigate = useNavigate();

  const naturalCards = naturalColourCards();
  const colourInfo =
    naturalCards.find((c) => c.name === colour) ??
    CLASSIC_COLOURS.find((c) => c.name === colour);
  const colourHex = colourInfo?.hex ?? DYE_KNOWLEDGE[colour]?.hex ?? "#1f3d2b";
  const colourRetention = colourInfo?.retention ?? DYE_KNOWLEDGE[colour]?.retentionBase ?? 80;
  const colourSustainability = colourInfo?.sustainability ?? DYE_KNOWLEDGE[colour]?.sustainability ?? "Plant-based, traceable dye.";
  const { yarn, rationale } = recommendYarnFor(colour);

  const addYarnToCart = () => {
    addItem({
      id: yarn.id,
      title: yarn.name,
      price: yarn.price,
      kind: "yarn",
      unit: yarn.weight,
      colour: yarn.colours[0],
      material: yarn.material,
      image: yarn.image,
    });
    toast.success(`${yarn.name} added to cart`);
  };

  const pickColour = (name: string, isNatural: boolean) => {
    setColour(name);
    setColourTab(isNatural ? "natural" : "classic");
    if (isNatural && DYE_KNOWLEDGE[name]) setDye(name);
  };


  const [generating, setGenerating] = useState(false);
  const [spec, setSpec] = useState<DesignSpec | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"demo-svg" | "model">("demo-svg");
  const [usedProvider, setUsedProvider] = useState<string>("demo");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const providerOptions: ProviderOption[] = providers ?? [DEMO_PROVIDER];
  const selectedProvider =
    providerOptions.find((p) => p.id === provider) ?? DEMO_PROVIDER;

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
        provider,
      });
      setSpec({ seed: res.seed, pattern, palette: res.palette });
      setImageUrl(res.imageUrl);
      setMode(res.mode);
      setUsedProvider(res.provider);
      setTitle(res.title);
      if (res.mode === "demo-svg") {
        toast(
          res.provider !== "demo"
            ? `The ${res.provider} provider is not configured or failed — showing a demo preview instead.`
            : "Demo preview generated — no image API connected.",
        );
      } else {
        const used = providerOptions.find((p) => p.id === res.provider);
        toast.success(
          `Design generated with ${used?.label ?? res.provider}${used?.model ? ` · ${used.model}` : ""}`,
        );
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
            AI Design Studio
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a colour, watch the fabric preview update, then generate,
            save and shop the matching yarn.
          </p>
        </div>
        {spec && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700">
            {mode === "demo-svg" ? "Demo preview · procedural renderer" : (
              <>
                {providerOptions.find((p) => p.id === usedProvider)?.label ?? usedProvider} ·{" "}
                {providerOptions.find((p) => p.id === usedProvider)?.model ?? "model image"}
              </>
            )}
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
          {/* Live fabric preview */}
          <Card className="shadow-none border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Live fabric preview</CardTitle>
              <CardDescription>
                Choose a colour — the fabric tint updates instantly, keeping the
                weave and texture visible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 p-1">
                {(["natural", "classic"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setColourTab(tab)}
                    className={cn(
                      "flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                      colourTab === tab
                        ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab === "natural" ? "Natural Dyes" : "Classic Colours"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8">
                {(colourTab === "natural" ? naturalCards : CLASSIC_COLOURS).map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    aria-label={`Select ${c.name}`}
                    onClick={() => pickColour(c.name, colourTab === "natural")}
                    className={cn(
                      "aspect-square w-full rounded-lg ring-1 ring-border transition-all hover:scale-105",
                      colour === c.name && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    )}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>

              <FabricPreview hex={colourHex} label={colour} className="w-full rounded-2xl" />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
                  <p className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">Colour HEX</p>
                  <p className="mt-0.5 font-mono font-semibold uppercase">{colourHex}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
                  <p className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">Predicted retention</p>
                  <p className="mt-0.5 font-semibold text-emerald-700">{colourRetention}%</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Sustainability score</span>
                  <span className="font-semibold">{colourRetention}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-500" style={{ width: `${colourRetention}%` }} />
                </div>
                <p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">{colourSustainability}</p>
              </div>

              {/* Recommended yarn */}
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <p className="text-xs font-semibold">Recommended yarn</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{yarn.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{yarn.material}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{rationale}</p>
                  </div>
                  <p className="font-display shrink-0 text-lg font-semibold text-primary">
                    {formatINR(yarn.price)}
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5 rounded-full" onClick={addYarnToCart}>
                    <ShoppingBag className="size-3.5" /> Add to Cart
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 rounded-full"
                    onClick={() => {
                      addYarnToCart();
                      navigate("/checkout");
                    }}
                  >
                    <Zap className="size-3.5" /> Buy Yarn
                  </Button>
                </div>
                <Link
                  to={`/shop/${yarn.id}`}
                  className="mt-2 flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                >
                  <Leaf className="size-3" /> View in Yarn Shop
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Design brief</CardTitle>
              <CardDescription>
                The prompt is combined with fabric, dye, pattern and palette.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Image model</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providerOptions.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                        disabled={!p.configured && p.id !== "demo"}
                      >
                        <span className="flex items-center gap-2">
                          <span className="truncate">{p.label} · {p.model}</span>
                          {!p.configured && (
                            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                              add {p.envVar}
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">
                  {selectedProvider.configured
                    ? selectedProvider.description
                    : `Not configured — add ${selectedProvider.envVar} in the Keys tab to enable ${selectedProvider.label}.`}
                </p>
              </div>

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
                Demo mode renders a procedural preview in your browser — no keys
                needed. Add an image API key in the Keys tab to unlock live
                models: <code className="font-mono">OPENAI_API_KEY</code> (OpenAI),{" "}
                <code className="font-mono">STABILITY_API_KEY</code> (Stability),{" "}
                <code className="font-mono">TOGETHER_API_KEY</code> (FLUX), or{" "}
                <code className="font-mono">AI_API_KEY</code> +{" "}
                <code className="font-mono">AI_IMAGE_ENDPOINT</code> (custom). Keys
                stay server-side — never exposed in the frontend.
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
