/**
 * MockAIService — a deterministic, rule-based stand-in for a real AI.
 *
 * WHY DETERMINISTIC
 * -----------------
 * The same image always produces the same plant, palette and designs, which
 * makes the hackathon demo repeatable. A real vision model would be plugged
 * into this same class without touching the UI (see index.ts).
 *
 * - identifyPlant: hue-cluster matching against the species catalog, seeded
 *   by the image's SHA-256 so every photo yields a stable result.
 * - generateColourPalette: botanical palette + neutral tones, shuffled by a
 *   deterministic seed.
 * - generateDesigns: garment silhouettes × botanical motifs with tasteful
 *   combinations, again seeded.
 * - analyzeRisk: a rule engine that scores documentation/batch data for the
 *   exact fraud signals listed in the spec (missing info, inconsistent batch
 *   ids, duplicate docs, suspicious metadata, mismatched quantities,
 *   impossible dates, duplicate cert numbers).
 */
import type {
  AIService,
  DesignConcept,
  DesignOptions,
  PaletteColor,
  PlantInfo,
  PlantInput,
  RiskAnalysis,
} from "./types";
import { PLANT_CATALOG, findPlantById, type PlantSpecies } from "./plants";

// ---------------------------------------------------------------------------
// Deterministic helpers
// ---------------------------------------------------------------------------

function hashToNumber(hash: string | undefined): number {
  let n = 0;
  const source = hash ?? "natural-flow";
  for (let i = 0; i < Math.min(source.length, 16); i++) {
    n = (n * 31 + source.charCodeAt(i)) >>> 0;
  }
  return n;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)];
}

// ---------------------------------------------------------------------------
// Vision: hue cluster -> species bucket
// ---------------------------------------------------------------------------

/** Maps a dominant hex colour to a hue cluster used for species matching. */
export function hexToCluster(hex: string): PlantSpecies["hueCluster"] {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2 / 255;

  if (max - min < 30 && l > 0.75) return "white";
  if (max - min < 30) return "brown";

  const d = max - min;
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  h = (h + 1) % 1;

  if (h < 0.03 || h >= 0.93) return "red";
  if (h < 0.1) return "orange";
  if (h < 0.2) return "yellow";
  if (h < 0.38) return "green";
  if (h < 0.48) return "blue";
  if (h < 0.68) return "purple";
  if (h < 0.85) return "pink";
  return "red";
}

function weightedCluster(
  colors: { hex: string; weight: number }[],
): PlantSpecies["hueCluster"] {
  const votes = new Map<PlantSpecies["hueCluster"], number>();
  for (const c of colors) {
    const cluster = hexToCluster(c.hex);
    votes.set(cluster, (votes.get(cluster) ?? 0) + c.weight);
  }
  let best: PlantSpecies["hueCluster"] = "green";
  let bestWeight = -1;
  for (const [cluster, w] of votes) {
    if (w > bestWeight) {
      best = cluster;
      bestWeight = w;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Design vocabulary
// ---------------------------------------------------------------------------

const SLEEVES = [
  "Cap Sleeve",
  "Short Sleeve",
  "3/4 Sleeve",
  "Full Sleeve",
  "Bell Sleeve",
  "Sleeveless",
];
const NECKS = [
  "Round Neck",
  "V-Neck",
  "Mandarin Collar",
  "Boat Neck",
  "Square Neck",
  "Keyhole",
];
const BORDERS = [
  "Plain Hem",
  "Temple Border",
  "Paisley Edge",
  "Floral Vine",
  "Contrast Band",
  "Piping Detail",
];
const DENSITIES: ("low" | "medium" | "high")[] = ["low", "medium", "high"];
const FABRICS = [
  "Organic Cotton Khadi",
  "Organic Cotton Voile",
  "Ahimsa Silk Satin",
  "European Flax Linen",
  "Hemp Linen Blend",
  "GOTS Cotton Poplin",
  "Handloom Cotton Slub",
];

const TITLES: Record<string, string[]> = {
  Kurta: ["Botanical Kurta", "Heritage Kurta", "Garden Kurta", "Quiet Bloom Kurta"],
  Dress: ["Meadow Dress", "Botanical Maxi", "Sunlight Dress", "Petal A-Line"],
  "Saree Border": ["Temple Border", "Vine Border", "Garden Edge", "Festival Border"],
  Shirt: ["Field Shirt", "Botanical Overshirt", "Everyday Shirt", "Mist Shirt"],
  Scarf: ["Botanical Scarf", "Garden Wrap", "Lightweight Scarf", "Print Scarf"],
  Lehenga: ["Festival Lehenga", "Blush Lehenga", "Garden Lehenga", "Evening Lehenga"],
};

// ---------------------------------------------------------------------------
// Mock implementation
// ---------------------------------------------------------------------------

export class MockAIService implements AIService {
  async identifyPlant(input: PlantInput): Promise<PlantInfo> {
    // Small delay so the UI's "analysing" state is visible during the demo.
    await sleep(1400);

    if (input.manualPlantId) {
      const species = findPlantById(input.manualPlantId);
      if (species) {
        return toPlantInfo(species, 1, "manual");
      }
    }

    const seed = hashToNumber(input.imageHash);
    const colors = input.dominantColors ?? [];
    const cluster = weightedCluster(
      colors.length > 0
        ? colors
        : [{ hex: "#e8a33d", weight: 1 }],
    );

    const candidates = PLANT_CATALOG.filter((p) => p.hueCluster === cluster);
    const pool = candidates.length > 0 ? candidates : PLANT_CATALOG;
    const species = pool[seed % pool.length];

    // Confidence: higher when the hue signal was unambiguous.
    const top = colors.slice(0, 2);
    const spread =
      top.length >= 2
        ? Math.abs(weightedCluster([top[0]]) === weightedCluster([top[1]]) ? 0.2 : 0.05)
        : 0.05;
    const confidence = Math.min(0.97, 0.82 + spread + (seed % 10) / 100);

    const topMatches = PLANT_CATALOG.slice()
      .sort(
        (a, b) =>
          Number(b.hueCluster === cluster) - Number(a.hueCluster === cluster),
      )
      .slice(0, 4)
      .map((p, i) => ({
        label: p.name,
        score: i === 0 ? confidence : Math.max(0.05, confidence - 0.18 - i * 0.06),
      }));

    return { ...toPlantInfo(species, confidence, "vision"), topMatches };
  }

  async generateColourPalette(plant: PlantInfo): Promise<PaletteColor[]> {
    await sleep(500);
    const rand = mulberry32(hashToNumber(`${plant.id}-palette`));
    const colors = [...plant.colors].sort(() => rand() - 0.5);
    const neutrals: PaletteColor[] = [
      { name: "Natural Cream", hex: "#f6f1e7" },
      { name: "Stone Sand", hex: "#e5dcc8" },
    ];
    return [...colors.slice(0, 3), pick(neutrals, rand)];
  }

  async generateDesigns(
    plant: PlantInfo,
    options?: DesignOptions,
  ): Promise<DesignConcept[]> {
    await sleep(900);
    const rand = mulberry32(hashToNumber(`${plant.id}-designs-${options?.garmentType ?? "any"}`));

    const garmentTypes = options?.garmentType
      ? [options.garmentType]
      : plant.suggestedGarments.slice(0, 4);

    return garmentTypes.map((garmentType, i) => {
      const titlePool = TITLES[garmentType] ?? ["Botanical Piece"];
      const motif = pick(plant.motifs, rand);
      return {
        id: `${plant.id}-${garmentType.toLowerCase().replace(/\s+/g, "-")}-${i + 1}`,
        garmentType,
        title: pick(titlePool, rand),
        description: `${plant.name}-inspired ${garmentType.toLowerCase()} with a ${motif} motif, dyed in ${plant.naturalDye}.`,
        palette: plant.colors,
        motif,
        patternDensity: options?.density ?? pick(DENSITIES, rand),
        sleeveStyle: pick(SLEEVES, rand),
        neckStyle: pick(NECKS, rand),
        borderPattern: pick(BORDERS, rand),
        fabricType: options?.fabricType ?? pick(FABRICS, rand),
        seed: hashToNumber(`${plant.id}-${garmentType}-${i}`),
      };
    });
  }

  async analyzeRisk(data: Record<string, unknown>): Promise<RiskAnalysis> {
    await sleep(1200);
    const reasons: string[] = [];
    let score = 8; // baseline: some inherent uncertainty

    const requiredFields = [
      "material",
      "quantityKg",
      "harvestDate",
      "farmerCode",
      "documentName",
    ];
    const missing = requiredFields.filter(
      (f) => data[f] === undefined || data[f] === null || data[f] === "",
    );
    if (missing.length > 0) {
      score += missing.length * 9;
      reasons.push(`Missing information: ${missing.join(", ")}`);
    }

    // Batch ID consistency: e.g. "FARM-IND-2026-001" must match pattern.
    const batchId = String(data.batchId ?? "");
    if (batchId && !/^[A-Z]{3,5}-\d{4}-\d{3,6}$/.test(batchId)) {
      score += 16;
      reasons.push(`Inconsistent batch ID format: "${batchId}"`);
    }

    // Impossible dates: future harvest or pre-2000 timestamps.
    const harvest = data.harvestDate ? new Date(String(data.harvestDate)) : null;
    if (harvest && !Number.isNaN(harvest.getTime())) {
      if (harvest.getTime() > Date.now()) {
        score += 20;
        reasons.push("Impossible date: harvest date is in the future");
      }
      if (harvest.getFullYear() < 2000) {
        score += 14;
        reasons.push("Impossible date: harvest year before 2000");
      }
    } else if (data.harvestDate) {
      score += 12;
      reasons.push("Unparseable harvest date");
    }

    // Quantity sanity.
    const quantity = Number(data.quantityKg ?? 0);
    if (quantity > 0) {
      if (quantity > 400) {
        score += 12;
        reasons.push(`Mismatched quantity: ${quantity} kg exceeds farm capacity`);
      }
      const declared = Number(data.declaredQuantityKg ?? 0);
      if (declared > 0 && Math.abs(declared - quantity) / declared > 0.2) {
        score += 18;
        reasons.push(
          `Mismatched quantities: declared ${declared} kg vs recorded ${quantity} kg`,
        );
      }
    }

    // Document metadata heuristics.
    const fileName = String(data.documentName ?? "");
    if (/cert|invoice|receipt/i.test(fileName)) {
      const ext = fileName.split(".").pop()?.toLowerCase();
      if (ext && !["pdf", "png", "jpg", "jpeg"].includes(ext)) {
        score += 12;
        reasons.push(`Suspicious document extension: .${ext} for a certificate`);
      }
      if (/cert/i.test(fileName) && String(data.certNumber ?? "").length === 0) {
        score += 10;
        reasons.push("Certificate document uploaded without a certification number");
      }
    }
    if (data.resaveCount && Number(data.resaveCount) > 3) {
      score += 12;
      reasons.push(
        `Image metadata shows ${data.resaveCount} re-saves — possible manipulation`,
      );
    }
    if (data.duplicateCert) {
      score += 18;
      reasons.push("Duplicate certification number detected");
    }

    if (reasons.length === 0) {
      reasons.push("All required fields complete and internally consistent");
    }

    const final = Math.min(99, Math.max(2, score));
    return {
      score: final,
      status: final >= 60 ? "high" : final >= 30 ? "medium" : "low",
      reasons,
    };
  }
}

function toPlantInfo(
  species: PlantSpecies,
  confidence: number,
  matchedBy: "vision" | "manual",
): PlantInfo {
  return {
    id: species.id,
    name: species.name,
    botanicalName: species.botanicalName,
    family: species.family,
    type: species.type,
    description: species.description,
    symbolism: species.symbolism,
    naturalDye: species.naturalDye,
    colors: species.colors,
    motifs: species.motifs,
    suggestedGarments: species.suggestedGarments,
    confidence,
    topMatches: [],
    matchedBy,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
