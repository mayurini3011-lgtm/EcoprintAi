/**
 * Public marketplace data for the EcoPrint AI shop — yarn catalogue, classic
 * colour palette and colour/dye → yarn recommendations.
 *
 * Prices are in INR and are demo figures for the hackathon.
 */
import { DYE_KNOWLEDGE } from "@/convex/constants";

export interface YarnReview {
  author: string;
  rating: number;
  text: string;
}

export interface YarnProduct {
  id: string;
  name: string;
  price: number;
  weight: string;
  colours: string[];
  material: string;
  rating: number;
  reviewCount: number;
  image: string;
  emoji: string;
  sustainabilityScore: number;
  dyeCompatibility: "Excellent" | "Good" | "Moderate";
  recommendedDyes: string[];
  description: string;
  care: string[];
  shipping: string;
  stock: number;
  reviews: YarnReview[];
}

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

export const YARN_PRODUCTS: YarnProduct[] = [
  {
    id: "organic-cotton-yarn",
    name: "Organic Cotton Yarn",
    price: 299,
    weight: "100 g",
    colours: ["Natural", "Cream", "White"],
    material: "100% Organic Cotton",
    rating: 4.8,
    reviewCount: 214,
    image: U("photo-1528458909336-e7a0adfed0a5"),
    emoji: "🌿",
    sustainabilityScore: 92,
    dyeCompatibility: "Excellent",
    recommendedDyes: ["Indigo", "Turmeric", "Onion", "Hibiscus"],
    description:
      "GOTS-certified organic cotton yarn, combed for a soft, even spin. Takes natural dyes beautifully and is the studio's top pick for most colourways.",
    care: ["Machine wash cold (30°C)", "Mild pH-neutral detergent", "Dry flat in shade"],
    shipping: "Dispatched in 24 h · free delivery above ₹999",
    stock: 42,
    reviews: [
      { author: "Meera K.", rating: 5, text: "Dyes evenly with indigo — beautiful handfeel." },
      { author: "Arjun S.", rating: 5, text: "Soft and consistent tension. Great value." },
      { author: "Lakshmi R.", rating: 4, text: "Lovely yarn, natural shade is a warm white." },
    ],
  },
  {
    id: "recycled-cotton-yarn",
    name: "Recycled Cotton Yarn",
    price: 249,
    weight: "100 g",
    colours: ["Beige", "Grey", "Brown"],
    material: "Recycled Cotton (RCOT)",
    rating: 4.6,
    reviewCount: 168,
    image: U("photo-1583743814966-8936f5b7be1a"),
    emoji: "♻️",
    sustainabilityScore: 88,
    dyeCompatibility: "Good",
    recommendedDyes: ["Tea", "Walnut", "Onion"],
    description:
      "Spun from pre-consumer cotton waste, this rustic yarn is perfect for earthy, textured projects. Slightly slubby — each skein is unique.",
    care: ["Machine wash cold", "Line dry in shade", "Iron on low"],
    shipping: "Dispatched in 48 h · free delivery above ₹999",
    stock: 58,
    reviews: [
      { author: "Nithya V.", rating: 5, text: "Great texture for chunky throws." },
      { author: "Ravi T.", rating: 4, text: "Takes tea dye really well." },
    ],
  },
  {
    id: "bamboo-yarn",
    name: "Bamboo Yarn",
    price: 399,
    weight: "100 g",
    colours: ["Cream", "Green", "Natural"],
    material: "100% Bamboo Viscose",
    rating: 4.7,
    reviewCount: 131,
    image: U("photo-1596462502278-27bfdc403348"),
    emoji: "🎋",
    sustainabilityScore: 90,
    dyeCompatibility: "Good",
    recommendedDyes: ["Hibiscus", "Beetroot", "Marigold"],
    description:
      "Silky, drapey bamboo yarn with a natural sheen. A renewable grass fibre that feels luxurious against the skin.",
    care: ["Hand wash cold", "Reshape and dry flat", "Avoid tumble drying"],
    shipping: "Dispatched in 24 h · free delivery above ₹999",
    stock: 27,
    reviews: [
      { author: "Divya M.", rating: 5, text: "Feels like silk, dyes to a lovely blush." },
      { author: "Sneha P.", rating: 5, text: "Perfect for lightweight summer wear." },
    ],
  },
  {
    id: "linen-yarn",
    name: "Linen Yarn",
    price: 449,
    weight: "100 g",
    colours: ["Natural", "Beige"],
    material: "100% European Flax Linen",
    rating: 4.7,
    reviewCount: 96,
    image: U("photo-1591035897819-f4bdf739f446"),
    emoji: "🧵",
    sustainabilityScore: 89,
    dyeCompatibility: "Good",
    recommendedDyes: ["Indigo", "Tea", "Pomegranate"],
    description:
      "Washed linen yarn with a crisp, breezy handle. Strong, absorbent and naturally antibacterial — ages beautifully.",
    care: ["Hand wash cool", "Line dry — do not wring", "Press while damp"],
    shipping: "Dispatched in 48 h · free delivery above ₹999",
    stock: 21,
    reviews: [
      { author: "Aditi B.", rating: 5, text: "Crisp and durable. Indigo takes beautifully." },
      { author: "Kiran J.", rating: 4, text: "Gorgeous natural tone." },
    ],
  },
  {
    id: "hemp-yarn",
    name: "Hemp Yarn",
    price: 499,
    weight: "100 g",
    colours: ["Natural", "Brown"],
    material: "100% Industrial Hemp",
    rating: 4.8,
    reviewCount: 74,
    image: U("photo-1544441893-675973e31985"),
    emoji: "🌱",
    sustainabilityScore: 93,
    dyeCompatibility: "Excellent",
    recommendedDyes: ["Walnut", "Onion", "Neem"],
    description:
      "One of the most sustainable fibres on earth — hemp grows fast, needs no pesticides and strengthens when wet. Stiffens to a beautiful rustic drape.",
    care: ["Hand wash cool", "Dry flat in shade", "Gains softness with each wash"],
    shipping: "Dispatched in 48 h · free delivery above ₹999",
    stock: 18,
    reviews: [
      { author: "Rahul G.", rating: 5, text: "Incredibly strong — my favourite for bags." },
      { author: "Ananya D.", rating: 5, text: "Eco-friendly and looks premium." },
    ],
  },
  {
    id: "organic-wool-yarn",
    name: "Organic Wool Yarn",
    price: 549,
    weight: "100 g",
    colours: ["Cream", "Brown", "Grey"],
    material: "Certified Organic Wool",
    rating: 4.9,
    reviewCount: 189,
    image: U("photo-1600185365483-26d7a4cc7519"),
    emoji: "🐑",
    sustainabilityScore: 85,
    dyeCompatibility: "Excellent",
    recommendedDyes: ["Beetroot", "Madder", "Walnut"],
    description:
      "Warm, lofty organic wool from free-range farms. Protein fibres lock in natural dyes — rich, deep colourways with excellent fastness.",
    care: ["Hand wash in cool water", "Wool-safe detergent", "Dry flat, away from heat"],
    shipping: "Dispatched in 24 h · free delivery above ₹999",
    stock: 33,
    reviews: [
      { author: "Priya N.", rating: 5, text: "Beetroot gave the most stunning burgundy." },
      { author: "Sam W.", rating: 5, text: "Soft, bouncy and warm. Worth every rupee." },
    ],
  },
];

export const getYarn = (id: string) => YARN_PRODUCTS.find((y) => y.id === id);

// ---------------------------------------------------------------------------
// Classic colours
// ---------------------------------------------------------------------------

export interface ClassicColour {
  name: string;
  hex: string;
  tagline: string;
  /** Natural dye names from the EcoPrint catalogue that approximate this shade. */
  naturalAlternatives: string[];
  retention: number;
  sustainability: string;
  yarn: string;
}

export const CLASSIC_COLOURS: ClassicColour[] = [
  { name: "Black", hex: "#1c1917", tagline: "Deep, grounding charcoal", naturalAlternatives: ["Walnut", "Tea"], retention: 82, sustainability: "Iron-modified walnut & tea overdye", yarn: "recycled-cotton-yarn" },
  { name: "White", hex: "#f5f4f0", tagline: "Undyed natural brightness", naturalAlternatives: ["Undyed"], retention: 95, sustainability: "Untreated fibre — zero dye impact", yarn: "organic-cotton-yarn" },
  { name: "Red", hex: "#c0392b", tagline: "Vibrant botanical crimson", naturalAlternatives: ["Hibiscus", "Beetroot"], retention: 66, sustainability: "Hibiscus petals or beetroot by-product", yarn: "organic-cotton-yarn" },
  { name: "Blue", hex: "#2563eb", tagline: "Classic true blue", naturalAlternatives: ["Indigo"], retention: 88, sustainability: "Open-vat indigo fermentation", yarn: "organic-cotton-yarn" },
  { name: "Green", hex: "#2e7d32", tagline: "Fresh leaf green", naturalAlternatives: ["Neem", "Tea"], retention: 76, sustainability: "Neem leaf bath with copper mordant", yarn: "bamboo-yarn" },
  { name: "Yellow", hex: "#f4c430", tagline: "Sun-bright turmeric gold", naturalAlternatives: ["Turmeric", "Marigold"], retention: 74, sustainability: "Solar-dried turmeric rhizomes", yarn: "organic-cotton-yarn" },
  { name: "Orange", hex: "#e67e22", tagline: "Warm harvest orange", naturalAlternatives: ["Onion", "Marigold"], retention: 72, sustainability: "Upcycled onion skins", yarn: "hemp-yarn" },
  { name: "Pink", hex: "#e91e63", tagline: "Bold hibiscus pink", naturalAlternatives: ["Hibiscus"], retention: 68, sustainability: "Cold-extracted hibiscus petals", yarn: "organic-cotton-yarn" },
  { name: "Purple", hex: "#8e44ad", tagline: "Royal botanical violet", naturalAlternatives: ["Hibiscus"], retention: 62, sustainability: "Hibiscus with iron-shifted pH", yarn: "organic-wool-yarn" },
  { name: "Brown", hex: "#6d4c41", tagline: "Earthy walnut brown", naturalAlternatives: ["Walnut", "Onion"], retention: 86, sustainability: "Self-mordanting walnut husks", yarn: "hemp-yarn" },
  { name: "Beige", hex: "#d6c7a8", tagline: "Soft natural beige", naturalAlternatives: ["Tea", "Undyed"], retention: 84, sustainability: "Weak tea bath or natural fibre", yarn: "linen-yarn" },
  { name: "Grey", hex: "#7f8c8d", tagline: "Calm stone grey", naturalAlternatives: ["Tea", "Walnut"], retention: 80, sustainability: "Iron-mordanted walnut or tea", yarn: "recycled-cotton-yarn" },
  { name: "Maroon", hex: "#7f1d1d", tagline: "Deep madder maroon", naturalAlternatives: ["Madder", "Beetroot"], retention: 78, sustainability: "Aged madder roots, alum mordant", yarn: "organic-wool-yarn" },
  { name: "Navy", hex: "#1f3864", tagline: "Midnight indigo navy", naturalAlternatives: ["Indigo"], retention: 90, sustainability: "Multi-dip indigo vat, deep shade", yarn: "organic-cotton-yarn" },
  { name: "Cream", hex: "#f3e9d2", tagline: "Ivory natural cream", naturalAlternatives: ["Undyed", "Tea"], retention: 90, sustainability: "Undyed or whisper-light tea", yarn: "linen-yarn" },
];

// ---------------------------------------------------------------------------
// Natural colour cards (derived from the dye knowledge base)
// ---------------------------------------------------------------------------

export interface NaturalColour {
  name: string;
  hex: string;
  source: string;
  retention: number;
  sustainability: string;
  mordant: string;
  suitableFabrics: string[];
  image: string;
  emoji: string;
  yarn: string;
}

export const NATURAL_DYE_IMAGE: Record<string, string> = {
  Onion: U("photo-1518977956812-cd3dbadaaf31"),
  Turmeric: U("photo-1615485500704-8e990f9900f7"),
  Hibiscus: U("photo-1596040033229-a9821ebd058d"),
  Beetroot: U("photo-1593105544559-ecb03bf76f82"),
  Tea: U("photo-1544787219-7f47ccb76574"),
  Indigo: U("photo-1544441893-675973e31985"),
};

export const NATURAL_DYE_EMOJI: Record<string, string> = {
  Onion: "🧅",
  Turmeric: "🟡",
  Indigo: "🫐",
  Hibiscus: "🌺",
  Beetroot: "🍠",
  Tea: "🍃",
  Madder: "🌹",
  Pomegranate: "🍎",
  Marigold: "🌼",
  Walnut: "🥜",
  Neem: "🌿",
  Henna: "🌴",
};

/** Yarn id recommended for each dye name. */
const DYE_YARN: Record<string, string> = {
  Indigo: "organic-cotton-yarn",
  Turmeric: "organic-cotton-yarn",
  Hibiscus: "organic-cotton-yarn",
  Madder: "organic-wool-yarn",
  Pomegranate: "linen-yarn",
  Marigold: "organic-cotton-yarn",
  Walnut: "hemp-yarn",
  Neem: "bamboo-yarn",
  Henna: "organic-wool-yarn",
  Onion: "hemp-yarn",
  Beetroot: "organic-wool-yarn",
  Tea: "linen-yarn",
};

export function naturalColourCards(): NaturalColour[] {
  return Object.entries(DYE_KNOWLEDGE).map(([name, k]) => ({
    name,
    hex: k.hex,
    source: k.source,
    retention: k.retentionBase,
    sustainability: k.sustainability,
    mordant: k.mordant,
    suitableFabrics: k.suitableFabrics,
    image: NATURAL_DYE_IMAGE[name] ?? U("photo-1544787219-7f47ccb76574"),
    emoji: NATURAL_DYE_EMOJI[name] ?? "🌿",
    yarn: DYE_YARN[name] ?? "organic-cotton-yarn",
  }));
}

// ---------------------------------------------------------------------------
// Colour → yarn recommendation
// ---------------------------------------------------------------------------

export function recommendYarnFor(key: string): { yarn: YarnProduct; rationale: string } {
  const classic = CLASSIC_COLOURS.find((c) => c.name.toLowerCase() === key.toLowerCase());
  const dyeCard = naturalColourCards().find((c) => c.name.toLowerCase() === key.toLowerCase());
  const yarnId = dyeCard?.yarn ?? classic?.yarn ?? "organic-cotton-yarn";
  const yarn = getYarn(yarnId) ?? YARN_PRODUCTS[0];
  const rationale = classic
    ? `${classic.name} shades dye beautifully onto ${yarn.name.toLowerCase()}, which gives the best depth for this colourway.`
    : `${key} performs best on ${yarn.name.toLowerCase()} — the fibres take up the dye evenly and keep the colour rich.`;
  return { yarn, rationale };
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Shop order tracking steps (demo timeline). */
export const SHOP_ORDER_STEPS = [
  "Order Placed",
  "Payment Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
] as const;
