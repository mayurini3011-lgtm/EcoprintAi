/**
 * AIService abstraction.
 *
 * The rest of the app depends ONLY on these interfaces. Swap in a real
 * vision/LLM-backed implementation later (e.g. a Convex action calling an
 * external vision API) without touching any UI code — see mock.ts for the
 * deterministic demo implementation and index.ts for the factory.
 */

export interface PaletteColor {
  name: string;
  hex: string;
}

export interface PlantConfidence {
  label: string;
  score: number; // 0..1
}

export interface PlantInfo {
  id: string;
  name: string;
  botanicalName: string;
  family: string;
  type: "flower" | "leaf" | "root" | "bark";
  description: string;
  symbolism: string;
  naturalDye: string;
  colors: PaletteColor[];
  motifs: string[];
  suggestedGarments: string[];
  confidence: number; // 0..1 — how sure the model is
  topMatches: PlantConfidence[];
  matchedBy: "vision" | "manual";
}

export interface DesignConcept {
  id: string;
  garmentType: string;
  title: string;
  description: string;
  palette: PaletteColor[];
  motif: string;
  patternDensity: "low" | "medium" | "high";
  sleeveStyle: string;
  neckStyle: string;
  borderPattern: string;
  fabricType: string;
  seed: number; // deterministic variation seed
}

export interface RiskAnalysis {
  score: number; // 0..100
  status: "low" | "medium" | "high";
  reasons: string[];
}

export interface PlantInput {
  /** SHA-256 of the uploaded image bytes (deterministic seed). */
  imageHash?: string;
  /** Dominant colour clusters extracted from the image. */
  dominantColors?: { hex: string; weight: number }[];
  /** Manual selection (gallery pick) — bypasses vision. */
  manualPlantId?: string;
}

export interface DesignOptions {
  garmentType?: string;
  fabricType?: string;
  colorway?: string; // hex accent
  density?: "low" | "medium" | "high";
}

export interface AIService {
  identifyPlant(input: PlantInput): Promise<PlantInfo>;
  generateColourPalette(plant: PlantInfo): Promise<PaletteColor[]>;
  generateDesigns(
    plant: PlantInfo,
    options?: DesignOptions,
  ): Promise<DesignConcept[]>;
  analyzeRisk(data: Record<string, unknown>): Promise<RiskAnalysis>;
}
