import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { GarmentPreview } from "@/components/garment/GarmentPreview";
import { PaletteSwatches, StatusPill } from "@/components/garment/PaletteSwatches";
import { SupplyChainTimeline } from "@/components/garment/SupplyChainTimeline";
import { QrCode } from "@/components/security/QrCode";
import { useAuth } from "@/hooks/use-auth";
import {
  getAIService,
  PLANT_CATALOG,
  analyzeImageFile,
  type DesignConcept,
  type PaletteColor,
  type PlantInfo,
} from "@/lib/ai";
import { formatINR, formatDate } from "@/lib/format";
import {
  BORDER_PATTERNS,
  GARMENT_TYPES,
  NECK_STYLES,
  SLEEVE_STYLES,
} from "@/convex/constants";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Droplets,
  ImagePlus,
  Leaf,
  Loader2,
  Lock,
  QrCode as QrCodeIcon,
  Ruler,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  UploadCloud,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

type Dye = Doc<"dyes">;
type Fabric = Doc<"fabrics">;
type Tailor = Doc<"tailors">;

type Step =
  | "upload"
  | "concepts"
  | "customize"
  | "dye"
  | "measurements"
  | "tailor"
  | "review"
  | "placed";

const STEP_LABELS: Record<Step, string> = {
  upload: "Botanical",
  concepts: "AI Concepts",
  customize: "Customize",
  dye: "Dye & Fabric",
  measurements: "Measurements",
  tailor: "Tailor",
  review: "Review",
  placed: "Complete",
};

const ANALYZE_MESSAGES = [
  "Extracting pigments…",
  "Matching botanical species…",
  "Scanning dye profile…",
  "Composing colour palette…",
];

const PLANT_ICONS: Record<string, string> = {
  flower: "🌸",
  leaf: "🌿",
  root: "🥔",
  bark: "🪵",
};

export default function Studio() {
  const { user } = useAuth();
  const dyes = useQuery(api.catalog.listDyes);
  const fabrics = useQuery(api.catalog.listFabrics);
  const tailors = useQuery(api.catalog.listTailors);
  const placeOrder = useMutation(api.orders.placeOrder);

  const [step, setStep] = useState<Step>("upload");

  // AI pipeline state
  const [imageAnalysis, setImageAnalysis] = useState<{
    previewUrl: string;
    fileName: string;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState(0);
  const [plant, setPlant] = useState<PlantInfo | null>(null);
  const [designs, setDesigns] = useState<DesignConcept[]>([]);

  // Customization state
  const [selectedDesign, setSelectedDesign] = useState<DesignConcept | null>(null);
  const [garmentType, setGarmentType] = useState("Kurta");
  const [colorway, setColorway] = useState<PaletteColor | null>(null);
  const [density, setDensity] = useState<"low" | "medium" | "high">("medium");
  const [sleeve, setSleeve] = useState("3/4 Sleeve");
  const [neck, setNeck] = useState("Round Neck");
  const [border, setBorder] = useState("Temple Border");
  const [motif, setMotif] = useState("hibiscus bloom");
  const [fabricCode, setFabricCode] = useState<string>("");
  const [dye, setDye] = useState<Dye | null>(null);
  const [fabric, setFabric] = useState<Fabric | null>(null);

  // Measurements + tailor
  const [measurements, setMeasurements] = useState({
    heightCm: 162,
    bustCm: 88,
    waistCm: 70,
    hipsCm: 94,
    shoulderCm: 38,
    sleeveCm: 58,
    lengthPreference: "Knee length",
  });
  const [tailor, setTailor] = useState<Tailor | null>(null);

  // Placement
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<{ orderCode: string; garmentId: string } | null>(null);
  const placedGarment = useQuery(
    api.security.getGarmentWithChain,
    placed ? { garmentId: placed.garmentId } : "skip",
  );
  const placedVerification = useQuery(
    api.security.verifyGarmentChain,
    placed ? { garmentId: placed.garmentId } : "skip",
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycling "analysing" message
  useEffect(() => {
    if (!analyzing) return;
    const id = setInterval(() => setAnalyzeMsg((m) => m + 1), 620);
    return () => clearInterval(id);
  }, [analyzing]);

  const ai = useMemo(() => getAIService(), []);

  const palette: PaletteColor[] = useMemo(() => {
    if (plant) return plant.colors;
    if (selectedDesign) return selectedDesign.palette;
    return [];
  }, [plant, selectedDesign]);

  const currentPalette = useMemo(() => {
    if (!colorway && plant) return plant.colors;
    if (!colorway) return palette;
    return [colorway, ...palette.filter((c) => c.hex !== colorway.hex)].slice(0, 4);
  }, [colorway, palette, plant]);

  // Reset downstream state when a new design is picked.
  const pickDesign = (design: DesignConcept) => {
    setSelectedDesign(design);
    setGarmentType(design.garmentType);
    setColorway(null);
    setDensity(design.patternDensity);
    setSleeve(design.sleeveStyle);
    setNeck(design.neckStyle);
    setBorder(design.borderPattern);
    setMotif(design.motif);
    setFabricCode("");
    setFabric(null);
    setDye(null);
  };

  // ---------------------------------------------------------------------
  // Step 1: upload / pick
  // ---------------------------------------------------------------------

  const runIdentification = async (input: Parameters<typeof ai.identifyPlant>[0]) => {
    setAnalyzing(true);
    setAnalyzeMsg(0);
    setPlant(null);
    setDesigns([]);
    setSelectedDesign(null);
    try {
      const result = await ai.identifyPlant(input);
      setPlant(result);
      const paletteResult = await ai.generateColourPalette(result);
      setColorway(paletteResult[0] ?? null);
      const designResults = await ai.generateDesigns(result, {});
      setDesigns(designResults);
      setStep("concepts");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFile = async (file: File) => {
    try {
      const analysis = await analyzeImageFile(file);
      setImageAnalysis({ previewUrl: analysis.previewUrl, fileName: analysis.fileName });
      await runIdentification({
        imageHash: analysis.imageHash,
        dominantColors: analysis.dominantColors,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  // ---------------------------------------------------------------------
  // Step 7: place order
  // ---------------------------------------------------------------------

  const priceBreakdown = useMemo(() => {
    if (!fabric || !dye || !tailor) return null;
    const fabricCost = Math.round(3.2 * fabric.pricePerMeter);
    const dyeCost = Math.round(0.5 * dye.pricePerKg);
    const tailorCost = Math.round((tailor.priceMin + tailor.priceMax) / 2);
    return { fabricCost, dyeCost, tailorCost, total: fabricCost + dyeCost + tailorCost };
  }, [fabric, dye, tailor]);

  const handlePlaceOrder = async () => {
    if (!selectedDesign || !fabric || !dye || !tailor || !priceBreakdown) return;
    setPlacing(true);
    try {
      const result = await placeOrder({
        customerName: user?.name ?? "Demo Customer",
        plantName: plant?.name ?? "Botanical",
        plantBotanicalName: plant?.botanicalName ?? "Botanica sp.",
        design: {
          garmentType,
          title: selectedDesign.title,
          description: selectedDesign.description,
          motif,
          patternDensity: density,
          sleeveStyle: sleeve,
          neckStyle: neck,
          borderPattern: border,
          fabricType: fabric.name,
          palette: currentPalette,
        },
        fabricCode: fabric.code,
        dyeCode: dye.code,
        tailorCode: tailor.code,
        measurements,
        totalPrice: priceBreakdown.total,
      });
      setPlaced(result);
      setStep("placed");
    } catch (err) {
      console.error(err);
    } finally {
      setPlacing(false);
    }
  };

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  const stepper = (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      {(
        [
          "upload",
          "concepts",
          "customize",
          "dye",
          "measurements",
          "tailor",
          "review",
        ] as Step[]
      ).map((s, i) => {
        const active = step === s;
        const done = stepIndex(step) > i;
        return (
          <button
            key={s}
            type="button"
            onClick={() => done && setStep(s)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : done
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100"
                  : "border-border bg-background text-muted-foreground",
            )}
          >
            {done ? <Check className="size-3" /> : <span>{i + 1}</span>}
            {STEP_LABELS[s]}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          Design Studio
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          From plant to personalized fashion
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a flower or leaf — our botanical AI turns it into a
          one-of-a-kind, traceable garment.
        </p>
      </div>

      {stepper}

      {step === "upload" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-none border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Upload a flower or leaf</CardTitle>
              <CardDescription>
                JPG, PNG or WebP · up to 10 MB. The AI extracts pigments and
                identifies the botanical species.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-14 text-center transition-colors hover:border-primary/50 hover:bg-muted/60"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />
                {imageAnalysis ? (
                  <img
                    src={imageAnalysis.previewUrl}
                    alt="Uploaded botanical"
                    className="max-h-44 rounded-lg object-cover shadow-sm"
                  />
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UploadCloud className="size-6" />
                  </span>
                )}
                <p className="text-sm font-medium">
                  {imageAnalysis
                    ? `Analysing ${imageAnalysis.fileName}…`
                    : "Drop your image here, or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">
                  A red hibiscus, a marigold, a neem leaf — anything botanical
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-border/70">
            <CardHeader>
              <CardTitle className="text-base">
                …or pick from the botanical gallery
              </CardTitle>
              <CardDescription>
                Skip the upload — choose an inspiration directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PLANT_CATALOG.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={analyzing}
                    onClick={() => void runIdentification({ manualPlantId: p.id })}
                    className="group flex flex-col items-center gap-1 rounded-lg border border-border/70 bg-background p-3 text-center transition-all hover:border-primary/40 hover:bg-muted/40"
                  >
                    <span className="text-2xl">{PLANT_ICONS[p.type]}</span>
                    <span className="text-xs font-medium">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground italic">
                      {p.botanicalName}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {analyzing && (
            <Card className="shadow-none border-border/70 lg:col-span-2">
              <CardContent className="flex items-center gap-4 p-6">
                <Loader2 className="size-6 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-medium">Botanical AI is working…</p>
                  <p className="text-xs text-muted-foreground">
                    {ANALYZE_MESSAGES[analyzeMsg % ANALYZE_MESSAGES.length]}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {step === "concepts" && plant && (
        <div className="space-y-6">
          {/* Identification card */}
          <Card className="shadow-none border-border/70">
            <CardContent className="grid gap-6 p-6 md:grid-cols-[220px_1fr]">
              <div className="flex items-center gap-4 md:flex-col md:items-start">
                <span className="flex size-20 items-center justify-center rounded-2xl bg-primary/8 text-5xl">
                  {PLANT_ICONS[plant.type]}
                </span>
                <div>
                  <p className="text-lg font-semibold">{plant.name}</p>
                  <p className="text-xs text-muted-foreground italic">
                    {plant.botanicalName}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="size-3" />
                    AI identification · {Math.round(plant.confidence * 100)}%
                    confidence
                  </Badge>
                  <Badge variant="outline">{plant.family}</Badge>
                  <StatusPill
                    status={plant.matchedBy === "vision" ? "verified" : "pending"}
                    className="!normal-case"
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {plant.description}
                </p>
                <p className="mt-1 text-xs italic text-muted-foreground">
                  Symbolism: {plant.symbolism}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <PaletteSwatches palette={plant.colors} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    Natural dye:{" "}
                    <span className="font-medium text-foreground">
                      {plant.naturalDye}
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design concepts */}
          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-foreground">
              AI-generated design concepts
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {designs.map((design) => (
                <button
                  key={design.id}
                  type="button"
                  onClick={() => pickDesign(design)}
                  className={cn(
                    "group overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                    selectedDesign?.id === design.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/70",
                  )}
                >
                  <GarmentPreview
                    palette={design.palette}
                    garmentType={design.garmentType}
                    motif={design.motif}
                    className="w-full"
                  />
                  <div className="p-3">
                    <p className="text-sm font-semibold">{design.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                      {design.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {design.garmentType}
                      </span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {design.patternDensity} print
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <Button
              className="mt-5"
              disabled={!selectedDesign}
              onClick={() => setStep("customize")}
            >
              Customize my design
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "customize" && selectedDesign && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="shadow-none border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Customize your design</CardTitle>
              <CardDescription>
                Every option updates the live preview instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-xs">Garment type</Label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {GARMENT_TYPES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGarmentType(g)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        garmentType === g
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs">Colourway</Label>
                <div className="mt-1.5 flex items-center gap-3">
                  <PaletteSwatches
                    palette={palette}
                    selectedHex={colorway?.hex}
                    onSelect={setColorway}
                    size="lg"
                  />
                  <span className="text-xs text-muted-foreground">
                    {colorway?.name}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-xs">Pattern density</Label>
                <div className="mt-1.5 flex gap-1.5">
                  {(["low", "medium", "high"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDensity(d)}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                        density === d
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Sleeve style">
                  <Select value={sleeve} onValueChange={setSleeve}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SLEEVE_STYLES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Neck style">
                  <Select value={neck} onValueChange={setNeck}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NECK_STYLES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Border pattern">
                  <Select value={border} onValueChange={setBorder}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BORDER_PATTERNS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Botanical motif">
                  <Select value={motif} onValueChange={setMotif}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {plant?.motifs.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
              <GarmentPreview
                palette={currentPalette}
                garmentType={garmentType}
                motif={motif}
                className="w-full"
              />
              <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5">
                <p className="text-sm font-semibold">{selectedDesign.title}</p>
                <StatusPill status="pending" />
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-background p-4 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Design fingerprint
              </p>
              <ul className="mt-2 space-y-1">
                <li>• {garmentType} · {density} density</li>
                <li>• {sleeve} · {neck}</li>
                <li>• {border} · {motif} motif</li>
              </ul>
            </div>
            <Button className="w-full" onClick={() => setStep("dye")}>
              Approve design
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "dye" && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-1 text-sm font-semibold">1 · Choose your natural dye</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Every dye batch is traceable to its farmer and manufacturer.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(dyes ?? [])
                .slice()
                .sort((a, b) => Number(a.code === plant?.naturalDye) - Number(b.code === plant?.naturalDye))
                .map((d) => (
                  <button
                    key={d.code}
                    type="button"
                    onClick={() => setDye(d)}
                    className={cn(
                      "rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                      dye?.code === d.code
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border/70",
                      d.availability === "out" && "opacity-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="size-8 shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: d.colorHex }}
                      />
                      <StatusPill status={d.status} />
                    </div>
                    <p className="mt-2 text-sm font-semibold">{d.name}</p>
                    <p className="text-[11px] text-muted-foreground italic">
                      {d.botanicalSource}
                    </p>
                    <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                      Batch {d.code}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {d.farmerName} → {d.manufacturerName}
                    </p>
                    <p className="mt-2 text-xs font-semibold">
                      {formatINR(d.pricePerKg)}/kg
                      <span className="ml-1.5 font-normal text-muted-foreground capitalize">
                        · {d.availability}
                      </span>
                    </p>
                  </button>
                ))}
            </div>
          </div>

          <div>
            <h2 className="mb-1 text-sm font-semibold">2 · Choose your fabric</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Sustainability-scored natural fabrics from verified co-ops.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(fabrics ?? []).map((f) => (
                <button
                  key={f.code}
                  type="button"
                  onClick={() => {
                    setFabric(f);
                    setFabricCode(f.code);
                  }}
                  className={cn(
                    "rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                    fabric?.code === f.code
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/70",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{f.name}</p>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {f.sustainabilityScore}/100
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {f.material} · {f.weave} · {f.origin}
                  </p>
                  <p className="mt-2 text-xs font-semibold">
                    {formatINR(f.pricePerMeter)}/m
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("customize")}>
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
            <Button
              disabled={!dye || !fabric}
              onClick={() => setStep("measurements")}
            >
              Continue <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "measurements" && (
        <Card className="mx-auto max-w-2xl shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ruler className="size-4 text-primary" /> Your measurements
            </CardTitle>
            <CardDescription>
              Stored privately on your order — never exposed on the public
              traceability record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {(
                [
                  ["heightCm", "Height (cm)"],
                  ["bustCm", "Bust (cm)"],
                  ["waistCm", "Waist (cm)"],
                  ["hipsCm", "Hips (cm)"],
                  ["shoulderCm", "Shoulder (cm)"],
                  ["sleeveCm", "Sleeve (cm)"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <Label htmlFor={key} className="text-xs">
                    {label}
                  </Label>
                  <Input
                    id={key}
                    type="number"
                    min={40}
                    max={250}
                    className="mt-1 h-9 text-sm"
                    value={measurements[key]}
                    onChange={(e) =>
                      setMeasurements((m) => ({
                        ...m,
                        [key]: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              ))}
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="length" className="text-xs">
                  Length preference
                </Label>
                <Select
                  value={measurements.lengthPreference}
                  onValueChange={(v) =>
                    setMeasurements((m) => ({ ...m, lengthPreference: v }))
                  }
                >
                  <SelectTrigger id="length" className="mt-1 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Knee length", "Midi", "Ankle length", "Maxi", "Custom"].map(
                      (o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep("dye")}>
                <ArrowLeft className="mr-2 size-4" /> Back
              </Button>
              <Button onClick={() => setStep("tailor")}>
                Continue <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "tailor" && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Choose your tailor</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(tailors ?? []).map((t) => (
              <button
                key={t.code}
                type="button"
                onClick={() => setTailor(t)}
                className={cn(
                  "rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                  tailor?.code === t.code
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border/70",
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {t.shopName} · {t.location}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                    {t.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {t.specialization}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Scissors className="size-3" />
                  {formatINR(t.priceMin)}–{formatINR(t.priceMax)}
                  <span className="ml-auto">
                    {t.deliveryDays}–{t.deliveryDays + 2} days
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {t.previousWork.map((w) => (
                    <span
                      key={w}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("measurements")}>
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
            <Button disabled={!tailor} onClick={() => setStep("review")}>
              Continue <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "review" && selectedDesign && priceBreakdown && (
        <div className="mx-auto max-w-3xl space-y-4">
          <Card className="shadow-none border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Review your order</CardTitle>
              <CardDescription>
                Confirm the design, fabric, colour, measurements, tailor and
                price — then we mint your secure garment identity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <GarmentPreview
                  palette={currentPalette}
                  garmentType={garmentType}
                  motif={motif}
                  className="w-32 shrink-0 rounded-lg border"
                />
                <div className="text-sm">
                  <p className="font-semibold">{selectedDesign.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {garmentType} · {density} density · {sleeve} · {neck} ·{" "}
                    {border}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Motif: {motif} · Inspired by {plant?.name}
                  </p>
                  <div className="mt-2">
                    <PaletteSwatches palette={currentPalette} size="sm" />
                  </div>
                </div>
              </div>
              <Separator />
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <Row label="Fabric" value={`${fabric?.name} · ${fabric?.material}`} />
                <Row label="Natural dye" value={`${dye?.name} · Batch ${dye?.code}`} />
                <Row label="Tailor" value={`${tailor?.name} · ${tailor?.shopName}`} />
                <Row
                  label="Delivery estimate"
                  value={`${tailor?.deliveryDays}–${(tailor?.deliveryDays ?? 0) + 2} days`}
                />
              </dl>
              <Separator />
              <dl className="space-y-1.5 text-sm">
                <Row
                  label={`Fabric · 3.2 m × ${formatINR(fabric?.pricePerMeter ?? 0)}`}
                  value={formatINR(priceBreakdown.fabricCost)}
                />
                <Row
                  label={`Dye · 0.5 kg × ${formatINR(dye?.pricePerKg ?? 0)}`}
                  value={formatINR(priceBreakdown.dyeCost)}
                />
                <Row label="Tailoring" value={formatINR(priceBreakdown.tailorCost)} />
                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatINR(priceBreakdown.total)}</span>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("tailor")}>
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="gap-2"
            >
              {placing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Lock className="size-4" />
              )}
              {placing ? "Minting garment ID…" : "Place order & mint garment ID"}
            </Button>
          </div>
        </div>
      )}

      {step === "placed" && placed && (
        <div className="space-y-6">
          <Card className="shadow-none border-border/70">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-8" />
              </span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Order {placed.orderCode} placed
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your garment now has a cryptographically sealed digital
                  identity.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/40 px-6 py-3">
                <ShieldCheck className="size-5 text-primary" />
                <div className="text-left">
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Garment ID
                  </p>
                  <p className="font-mono text-xl font-semibold">
                    {placed.garmentId}
                  </p>
                </div>
                <StatusPill status="verified" />
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link to={`/verify/${placed.garmentId}`}>
                    <QrCodeIcon className="mr-2 size-4" /> Open verification page
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/security">Open Security Center</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/orders">My orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
            <Card className="shadow-none border-border/70">
              <CardHeader>
                <CardTitle className="text-base">
                  Secure supply-chain timeline
                </CardTitle>
                <CardDescription>
                  7 events · each sealed with SHA-256 and linked to the
                  previous hash.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {placedGarment ? (
                  <SupplyChainTimeline
                    events={placedGarment.events}
                    checks={placedVerification?.checks ?? null}
                  />
                ) : (
                  <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Sealing chain…
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-none border-border/70">
              <CardHeader>
                <CardTitle className="text-sm">Scan to verify</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-2">
                <QrCode
                  value={`${window.location.origin}/verify/${placed.garmentId}`}
                  size={150}
                />
                <p className="text-center text-[11px] text-muted-foreground">
                  Anyone can scan this QR to view the garment's authentic
                  provenance — no sensitive data is exposed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function stepIndex(step: Step): number {
  const order: Step[] = [
    "upload",
    "concepts",
    "customize",
    "dye",
    "measurements",
    "tailor",
    "review",
    "placed",
  ];
  return order.indexOf(step);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
