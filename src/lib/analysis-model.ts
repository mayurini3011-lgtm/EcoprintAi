/**
 * EcoPrint AI fabric color-retention prediction model — PURE module.
 *
 * Shared by:
 *   - the Convex backend (src/convex/analysis.ts) for persistence,
 *   - the public landing page, which runs the SAME model client-side so the
 *     "AI Fabric Lab" demo works instantly without an account.
 *
 * The browser extracts the real dominant colour (RGB) from the uploaded
 * fabric photo; this model combines dye knowledge (temp, duration, mordant,
 * baseline fastness), fabric uptake factors and a wash-fade curve, then
 * computes CIEDE2000 colour difference between the original and the
 * simulated after-wash colour.
 *
 * IMPORTANT: predictions are SIMULATED reference values for the demo, not
 * lab-certified measurements. The `mode` field is always "simulated" unless
 * a real ML model is later connected.
 */
import { DYE_KNOWLEDGE, WASH_CYCLES } from "../convex/constants";
import {
  deltaE2000,
  fadeTowardPaper,
  hexToRgb,
  labToHex,
  rgbToLab,
} from "../convex/color";

// ---------------------------------------------------------------------------
// Deterministic factors
// ---------------------------------------------------------------------------

const FABRIC_FACTORS: Record<string, number> = {
  Cotton: 1.0,
  "Organic Cotton": 1.02,
  Silk: 0.95,
  Linen: 0.92,
  Wool: 0.9,
  Jute: 0.84,
  Denim: 1.04,
  Khadi: 1.0,
};

const PATTERN_FACTORS: Record<string, number> = {
  Floral: 1.0,
  Geometric: 0.98,
  Traditional: 0.99,
  Minimal: 1.01,
  Abstract: 1.0,
  "Block Print": 0.99,
  "Tie Dye": 0.96,
  "Ikat-inspired": 0.97,
};

const DYE_SUSTAINABILITY: Record<string, number> = {
  Indigo: 90,
  Turmeric: 88,
  Hibiscus: 84,
  Madder: 86,
  Pomegranate: 85,
  Marigold: 86,
  Walnut: 88,
  Neem: 85,
  Henna: 82,
  Onion: 92,
  Beetroot: 90,
  Tea: 91,
};

const FABRIC_SUSTAINABILITY: Record<string, number> = {
  Cotton: 80,
  "Organic Cotton": 92,
  Silk: 85,
  Linen: 88,
  Wool: 82,
  Jute: 90,
  Denim: 78,
  Khadi: 88,
};

export function hashToNumber(input: string | undefined): number {
  let n = 0;
  const source = input ?? "ecoprint";
  for (let i = 0; i < Math.min(source.length, 16); i++) {
    n = (n * 31 + source.charCodeAt(i)) >>> 0;
  }
  return n;
}

/** Human-friendly name for a detected colour, e.g. "#2b4a9b" -> "Deep blue". */
export function nameHue(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2 / 255;
  const sat = max === 0 ? 0 : (max - min) / max;

  const base =
    sat < 0.12
      ? l > 0.85
        ? "off-white"
        : l < 0.2
          ? "near-black"
          : "grey"
      : max === r
        ? g > b
          ? "orange"
          : "red"
        : max === g
          ? b > r
            ? "green"
            : "yellow-green"
          : r > g
            ? "purple"
            : "blue";

  const shade = l > 0.7 ? "light " : l < 0.3 ? "deep " : "";
  return `${shade}${base}`;
}

export function retentionCategory(retention: number): string {
  if (retention >= 85) return "Excellent";
  if (retention >= 70) return "Good";
  if (retention >= 55) return "Moderate";
  return "Low";
}

// ---------------------------------------------------------------------------
// The prediction model (pure function)
// ---------------------------------------------------------------------------

export interface AnalysisInput {
  fabric: string;
  dye: string;
  pattern: string;
  washes: number;
  initialHex: string;
  imageHash?: string;
}

export interface FabricAnalysisResult {
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
  mode: "simulated" | "model";
  /** Retention projected across the standard wash-cycle ladder. */
  curve: { washes: number; retention: number }[];
}

export function predictAnalysis(input: AnalysisInput): FabricAnalysisResult {
  const knowledge = DYE_KNOWLEDGE[input.dye] ?? DYE_KNOWLEDGE.Indigo;
  const fabricFactor = FABRIC_FACTORS[input.fabric] ?? 1.0;
  const patternFactor = PATTERN_FACTORS[input.pattern] ?? 1.0;

  // Wash-fade curve: exponential decay across the cycle ladder.
  const retentionAt = (washes: number) => {
    const fade = Math.exp(-0.012 * washes);
    const jitter = (hashToNumber(input.imageHash ?? input.initialHex) % 7) - 3;
    return Math.round(
      Math.min(97, Math.max(18, knowledge.retentionBase * fabricFactor * patternFactor * fade + jitter)),
    );
  };

  const retention = retentionAt(Math.max(1, input.washes));
  const category = retentionCategory(retention);

  const rgb = hexToRgb(input.initialHex);
  const lab = rgbToLab(rgb);
  const afterLab = fadeTowardPaper(lab, retention);
  const afterHex = labToHex(afterLab);
  const colorDifference = Math.round(deltaE2000(lab, afterLab) * 10) / 10;

  const suitable = knowledge.suitableFabrics.includes(input.fabric);
  const bestFabric = knowledge.suitableFabrics[0] ?? "Cotton";

  const dyeSustain = DYE_SUSTAINABILITY[input.dye] ?? 84;
  const fabricSustain = FABRIC_SUSTAINABILITY[input.fabric] ?? 82;
  const sustainabilityScore = Math.round(0.55 * dyeSustain + 0.45 * fabricSustain);

  const recommendation = suitable
    ? `${input.dye} on ${input.fabric} projects ${category.toLowerCase()} retention (${retention}%). Mordant with ${knowledge.mordant}; dye at ${knowledge.tempMin}–${knowledge.tempMax}°C for ${knowledge.durationMin}–${knowledge.durationMax} minutes.`
    : `${input.dye} performs best on ${knowledge.suitableFabrics.join(" / ")}. On ${input.fabric}, expect ${category.toLowerCase()} retention (${retention}%) — ${knowledge.note}`;

  const fabricRecommendation = suitable
    ? `${input.fabric} takes up ${input.dye} well — a strong match for this colourway.`
    : `Consider ${bestFabric} instead — it absorbs ${input.dye} more readily and improves fastness.`;

  const sensitive = ["Beetroot", "Hibiscus"].includes(input.dye);
  const washingRecommendation = sensitive
    ? `Hand wash in cold water with a pH-neutral detergent; machine wash only on delicate. ${input.dye} is water-soluble, so limit wash frequency and dry in shade.`
    : `Wash in cold water with a mild, pH-neutral detergent. Dry in shade; avoid bleach and optical brighteners. For ${input.washes}+ cycles, add a colour-catcher sheet and wash inside-out.`;

  const confidence = 88 + (hashToNumber(`${input.imageHash}-${input.dye}`) % 9);

  const curve = WASH_CYCLES.map((w) => ({ washes: w, retention: retentionAt(w) }));

  return {
    fabric: input.fabric,
    dye: input.dye,
    pattern: input.pattern,
    washes: Math.max(1, input.washes),
    initialHex: input.initialHex,
    dominantColor: nameHue(input.initialHex),
    rgb,
    lab: { L: Math.round(lab.L * 10) / 10, a: Math.round(lab.a * 10) / 10, b: Math.round(lab.b * 10) / 10 },
    afterHex,
    retention,
    retentionCategory: category,
    colorDifference,
    tempMin: knowledge.tempMin,
    tempMax: knowledge.tempMax,
    durationMin: knowledge.durationMin,
    durationMax: knowledge.durationMax,
    mordant: knowledge.mordant,
    recommendation,
    fabricRecommendation,
    washingRecommendation,
    sustainabilityScore,
    confidence,
    mode: "simulated",
    curve,
  };
}
