// Shared constants — importable from both Convex functions and the client.

export const ORDER_STEPS = [
  "design-approved",
  "fabric-prepared",
  "dye-verified",
  "tailor-assigned",
  "stitching",
  "quality-check",
  "delivered",
] as const;

export const ORDER_STEP_LABELS: Record<string, string> = {
  "design-approved": "Design Approved",
  "fabric-prepared": "Fabric Prepared",
  "dye-verified": "Dye Verified",
  "tailor-assigned": "Tailor Assigned",
  stitching: "Stitching",
  "quality-check": "Quality Check",
  delivered: "Delivered",
};

export const GARMENT_TYPES = [
  "Kurta",
  "Dress",
  "Saree Border",
  "Shirt",
  "Scarf",
  "Lehenga",
] as const;

export const SLEEVE_STYLES = [
  "Cap Sleeve",
  "Short Sleeve",
  "3/4 Sleeve",
  "Full Sleeve",
  "Bell Sleeve",
  "Sleeveless",
] as const;

export const NECK_STYLES = [
  "Round Neck",
  "V-Neck",
  "Mandarin Collar",
  "Boat Neck",
  "Square Neck",
  "Keyhole",
] as const;

export const BORDER_PATTERNS = [
  "Plain Hem",
  "Temple Border",
  "Paisley Edge",
  "Floral Vine",
  "Contrast Band",
  "Piping Detail",
] as const;

export const DENSITIES = ["low", "medium", "high"] as const;

/** Natural dye catalogue entries shown across the platform. */
export const DYE_NAMES = [
  "Indigo",
  "Turmeric",
  "Hibiscus",
  "Madder",
  "Pomegranate",
  "Marigold",
  "Walnut",
  "Neem",
  "Henna",
  "Onion",
  "Beetroot",
  "Tea",
] as const;

// ---------------------------------------------------------------------------
// Fabric analysis + design studio vocabulary
// ---------------------------------------------------------------------------

/** Fabric options for the fabric color-retention analysis. */
export const ANALYSIS_FABRICS = [
  "Cotton",
  "Organic Cotton",
  "Silk",
  "Linen",
  "Wool",
  "Jute",
  "Denim",
  "Khadi",
] as const;

/** Fabric options for the AI Fabric Design Studio. */
export const DESIGN_FABRICS = ["Cotton", "Silk", "Linen", "Wool", "Jute"] as const;

export const PATTERNS = [
  "Floral",
  "Geometric",
  "Traditional",
  "Minimal",
  "Abstract",
  "Block Print",
  "Tie Dye",
  "Ikat-inspired",
] as const;

/** Wash-cycle options for retention analysis. */
export const WASH_CYCLES = [1, 5, 10, 20, 30] as const;

export interface PaletteColor {
  name: string;
  hex: string;
}

/** Palette families offered by the design studio (name -> colour set). */
export const PALETTES: Record<string, PaletteColor[]> = {
  "Earth tones": [
    { name: "Terracotta", hex: "#b0704f" },
    { name: "Clay", hex: "#c9a28a" },
    { name: "Sand", hex: "#e5dcc8" },
    { name: "Umber", hex: "#6e4f3a" },
  ],
  Yellow: [
    { name: "Turmeric", hex: "#e3a32a" },
    { name: "Marigold", hex: "#e8a33d" },
    { name: "Saffron", hex: "#d9822b" },
    { name: "Cream", hex: "#f6f1e7" },
  ],
  "Indigo blue": [
    { name: "Deep Indigo", hex: "#2b4a9b" },
    { name: "Midnight", hex: "#1f3a7a" },
    { name: "Sky", hex: "#7fa8d9" },
    { name: "Stone", hex: "#c8c2b4" },
  ],
  Pink: [
    { name: "Hibiscus", hex: "#a6263b" },
    { name: "Blush", hex: "#e8c8c5" },
    { name: "Rose", hex: "#c98a8f" },
    { name: "Cream", hex: "#f6f1e7" },
  ],
  Brown: [
    { name: "Walnut", hex: "#5a4632" },
    { name: "Chestnut", hex: "#7a5c40" },
    { name: "Cocoa", hex: "#4a3826" },
    { name: "Sand", hex: "#e5dcc8" },
  ],
  Green: [
    { name: "Neem", hex: "#5c7a4a" },
    { name: "Sage", hex: "#8a9a78" },
    { name: "Moss", hex: "#6b7d4e" },
    { name: "Cream", hex: "#f6f1e7" },
  ],
};

// ---------------------------------------------------------------------------
// Dye knowledge base (used by analysis + design studio + assistant)
// ---------------------------------------------------------------------------

export interface DyeKnowledge {
  /** Botanic source, e.g. "Allium cepa (onion skins)". */
  source: string;
  /** Representative colour. */
  hex: string;
  /** Optimal dye-bath temperature range in °C. */
  tempMin: number;
  tempMax: number;
  /** Recommended bath duration range in minutes. */
  durationMin: number;
  durationMax: number;
  /** Recommended mordant. */
  mordant: string;
  /** Fabrics the dye works best on. */
  suitableFabrics: string[];
  /** Baseline simulated retention (0-100) before wash/wear factors. */
  retentionBase: number;
  /** Sustainability note shown in the dye library. */
  sustainability: string;
  /** Practical dyeing note. */
  note: string;
}

/**
 * Per-dye knowledge. Values are curated reference figures for the demo —
 * they are recommendations, not lab-certified measurements. In production
 * this table would be populated from a lab/ML pipeline.
 */
export const DYE_KNOWLEDGE: Record<string, DyeKnowledge> = {
  Indigo: {
    source: "Indigofera tinctoria",
    hex: "#2b4a9b",
    tempMin: 20,
    tempMax: 30,
    durationMin: 30,
    durationMax: 60,
    mordant: "None (vat dye — needs oxidation)",
    suitableFabrics: ["Cotton", "Linen", "Organic Cotton", "Denim", "Khadi"],
    retentionBase: 88,
    sustainability: "Open-vat fermentation; no synthetic reducing agents; wastewater recycled.",
    note: "Dye in multiple short dips; the colour builds with each oxidation cycle.",
  },
  Turmeric: {
    source: "Curcuma longa",
    hex: "#e3a32a",
    tempMin: 60,
    tempMax: 80,
    durationMin: 40,
    durationMax: 60,
    mordant: "Alum",
    suitableFabrics: ["Cotton", "Silk", "Linen", "Organic Cotton"],
    retentionBase: 74,
    sustainability: "Solar-dried rhizomes; alum mordant; composted dye waste.",
    note: "Colour is light-sensitive — wash in shade and store away from direct sun.",
  },
  Hibiscus: {
    source: "Hibiscus rosa-sinensis",
    hex: "#a6263b",
    tempMin: 40,
    tempMax: 60,
    durationMin: 30,
    durationMax: 45,
    mordant: "Lime + iron",
    suitableFabrics: ["Cotton", "Silk", "Linen"],
    retentionBase: 68,
    sustainability: "Cold-extracted petals; pH adjusted with lime; 100% plant waste.",
    note: "The pigment is water-soluble and fades faster on plant fibres than on silk.",
  },
  Madder: {
    source: "Rubia cordifolia",
    hex: "#8f2f3c",
    tempMin: 70,
    tempMax: 90,
    durationMin: 60,
    durationMax: 90,
    mordant: "Alum + cream of tartar",
    suitableFabrics: ["Cotton", "Wool", "Silk", "Linen"],
    retentionBase: 82,
    sustainability: "Two-year aged roots; low-water extraction.",
    note: "One of the most lightfast natural reds when mordanted with alum.",
  },
  Pomegranate: {
    source: "Punica granatum",
    hex: "#b5833c",
    tempMin: 70,
    tempMax: 90,
    durationMin: 45,
    durationMax: 75,
    mordant: "Alum",
    suitableFabrics: ["Cotton", "Silk", "Linen", "Wool"],
    retentionBase: 84,
    sustainability: "Rind extracted in solar stills; excellent light fastness.",
    note: "Rinds can be re-used for a second, weaker bath.",
  },
  Marigold: {
    source: "Tagetes erecta",
    hex: "#e8a33d",
    tempMin: 60,
    tempMax: 80,
    durationMin: 40,
    durationMax: 60,
    mordant: "Alum",
    suitableFabrics: ["Cotton", "Silk", "Linen"],
    retentionBase: 78,
    sustainability: "Petals harvested pre-bloom peak; alum mordant.",
    note: "Use fresh petals for the brightest yellow-gold.",
  },
  Walnut: {
    source: "Juglans regia",
    hex: "#5a4632",
    tempMin: 70,
    tempMax: 85,
    durationMin: 60,
    durationMax: 90,
    mordant: "None",
    suitableFabrics: ["Cotton", "Wool", "Linen", "Silk"],
    retentionBase: 86,
    sustainability: "Husk harvested post-harvest; no mordant required.",
    note: "Husks contain natural tannins — a self-mordanting dye.",
  },
  Neem: {
    source: "Azadirachta indica",
    hex: "#5c7a4a",
    tempMin: 70,
    tempMax: 90,
    durationMin: 45,
    durationMax: 70,
    mordant: "Copper sulphate",
    suitableFabrics: ["Cotton", "Linen", "Silk"],
    retentionBase: 76,
    sustainability: "Neem also acts as a natural insect repellent in storage.",
    note: "Copper mordant shifts the olive tone and improves fastness.",
  },
  Henna: {
    source: "Lawsonia inermis",
    hex: "#9a4a2f",
    tempMin: 50,
    tempMax: 70,
    durationMin: 60,
    durationMax: 120,
    mordant: "Iron + vinegar",
    suitableFabrics: ["Cotton", "Silk", "Wool"],
    retentionBase: 80,
    sustainability: "Lawsone-rich leaves; pH-adjusted bath.",
    note: "Longer baths deepen the rust-orange tone.",
  },
  Onion: {
    source: "Allium cepa (skins)",
    hex: "#b3702f",
    tempMin: 60,
    tempMax: 80,
    durationMin: 45,
    durationMax: 75,
    mordant: "Alum",
    suitableFabrics: ["Cotton", "Silk", "Linen", "Wool"],
    retentionBase: 72,
    sustainability: "Upcycled kitchen waste — onion skins are a zero-cost, circular dye source.",
    note: "Red onion skins give warm browns; yellow skins give golden orange.",
  },
  Beetroot: {
    source: "Beta vulgaris",
    hex: "#8e2a4f",
    tempMin: 30,
    tempMax: 50,
    durationMin: 30,
    durationMax: 60,
    mordant: "Alum + iron",
    suitableFabrics: ["Silk", "Wool"],
    retentionBase: 58,
    sustainability: "Food-industry by-product; low-temperature extraction saves energy.",
    note: "Betanin fades quickly on cotton — best on protein fibres, wash cold.",
  },
  Tea: {
    source: "Camellia sinensis",
    hex: "#7a5c40",
    tempMin: 70,
    tempMax: 90,
    durationMin: 45,
    durationMax: 90,
    mordant: "Iron",
    suitableFabrics: ["Cotton", "Linen", "Silk", "Wool"],
    retentionBase: 80,
    sustainability: "Waste tea leaves from cafés — circular source with strong tannins.",
    note: "Black tea gives warm browns; add iron for charcoal undertones.",
  },
};

/** Names recognised by the analysis + design studio (catalogue + library). */
export const KNOWN_DYE_NAMES = Object.keys(DYE_KNOWLEDGE);

// ---------------------------------------------------------------------------
// Pricing (INR)
// ---------------------------------------------------------------------------

export const PLANS = [
  {
    id: "free",
    name: "FREE",
    price: 0,
    period: "forever",
    tagline: "For trying EcoPrint AI",
    features: [
      "Fabric analysis (10/mo)",
      "Basic dye recommendations",
      "Limited AI chatbot",
      "Basic design generation",
      "Basic reports",
    ],
    cta: "Start Free",
  },
  {
    id: "pro",
    name: "PRO",
    price: 199,
    period: "/month",
    tagline: "For makers & small studios",
    features: [
      "Unlimited fabric analysis",
      "Advanced AI recommendations",
      "Full AI chatbot",
      "AI design generation",
      "Detailed reports & export",
      "Advanced analytics",
    ],
    cta: "Upgrade to Pro",
    featured: true,
  },
  {
    id: "business",
    name: "BUSINESS",
    price: 499,
    period: "/month",
    tagline: "For teams & production",
    features: [
      "Everything in PRO",
      "Multiple users",
      "Advanced textile analytics",
      "Design library",
      "Priority processing",
      "Business reports",
    ],
    cta: "Contact Sales",
  },
] as const;

/** GST applied to demo checkout totals (Indian invoicing). */
export const GST_RATE = 0.18;
