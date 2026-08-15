/**
 * Botanical species catalog — the knowledge base the AI mock draws from.
 * In a production deployment this would be a database of thousands of
 * species with trained embeddings; for the MVP these 12 cover the demo.
 */

export interface PlantSpecies {
  id: string;
  name: string;
  botanicalName: string;
  family: string;
  type: "flower" | "leaf" | "root" | "bark";
  description: string;
  symbolism: string;
  naturalDye: string;
  colors: { name: string; hex: string }[];
  motifs: string[];
  suggestedGarments: string[];
  hueCluster:
    | "red"
    | "pink"
    | "yellow"
    | "orange"
    | "purple"
    | "blue"
    | "green"
    | "white"
    | "brown";
}

export const PLANT_CATALOG: PlantSpecies[] = [
  {
    id: "hibiscus",
    name: "Hibiscus",
    botanicalName: "Hibiscus rosa-sinensis",
    family: "Malvaceae",
    type: "flower",
    description:
      "Large trumpet-shaped bloom in deep crimson with a pronounced stamen. Rich in anthocyanins — a classic natural dye source.",
    symbolism: "Fierce beauty, devotion and the impermanence of life.",
    naturalDye: "Hibiscus Crimson",
    colors: [
      { name: "Hibiscus Crimson", hex: "#a6263b" },
      { name: "Petal Blush", hex: "#e8c8c5" },
      { name: "Sage Leaf", hex: "#5c7a4a" },
      { name: "Cream", hex: "#f6f1e7" },
    ],
    motifs: ["hibiscus bloom", "stamen star", "scalloped petal"],
    suggestedGarments: ["Kurta", "Dress", "Saree Border", "Scarf"],
    hueCluster: "red",
  },
  {
    id: "rose",
    name: "Damask Rose",
    botanicalName: "Rosa damascena",
    family: "Rosaceae",
    type: "flower",
    description:
      "Layered velvet petals in soft rose pink with a honeyed fragrance. The rose of attar-making and ancient dye baths.",
    symbolism: "Love, secrecy and renewal.",
    naturalDye: "Madder Root Red",
    colors: [
      { name: "Rose Petal", hex: "#c98a8f" },
      { name: "Blush", hex: "#e8c8c5" },
      { name: "Sage Leaf", hex: "#7d8b68" },
      { name: "Cream", hex: "#f6f1e7" },
    ],
    motifs: ["rose bloom", "rosebud chain", "petal scatter"],
    suggestedGarments: ["Dress", "Lehenga", "Kurta", "Saree Border"],
    hueCluster: "pink",
  },
  {
    id: "marigold",
    name: "Marigold",
    botanicalName: "Tagetes erecta",
    family: "Asteraceae",
    type: "flower",
    description:
      "Clusters of ruffled golden pom-poms. One of the brightest, fastest natural yellows — the festival flower of India.",
    symbolism: "Joy, auspiciousness and the sun.",
    naturalDye: "Marigold Sun",
    colors: [
      { name: "Marigold", hex: "#e8a33d" },
      { name: "Saffron", hex: "#d9822b" },
      { name: "Leaf", hex: "#5c7a4a" },
      { name: "Cream", hex: "#f6f1e7" },
    ],
    motifs: ["marigold pom", "sunburst", "garland strand"],
    suggestedGarments: ["Dress", "Saree Border", "Scarf", "Shirt"],
    hueCluster: "yellow",
  },
  {
    id: "lotus",
    name: "Lotus",
    botanicalName: "Nelumbo nucifera",
    family: "Nelumbonaceae",
    type: "flower",
    description:
      "Sacred pink-and-white bloom rising from the mud. Its geometry inspires clean, meditative patterns.",
    symbolism: "Purity, awakening and grace.",
    naturalDye: "Henna Rust",
    colors: [
      { name: "Blush", hex: "#e8c8c5" },
      { name: "Lotus Pink", hex: "#d98a9c" },
      { name: "Old Gold", hex: "#c9a45c" },
      { name: "Ivory", hex: "#faf7ef" },
    ],
    motifs: ["lotus medallion", "lotus petal arc", "ripple line"],
    suggestedGarments: ["Lehenga", "Saree Border", "Dress", "Kurta"],
    hueCluster: "pink",
  },
  {
    id: "tulsi",
    name: "Tulsi (Holy Basil)",
    botanicalName: "Ocimum tenuiflorum",
    family: "Lamiaceae",
    type: "leaf",
    description:
      "Fragrant green leaves with serrated edges — the sacred basil of Indian households, known for healing properties.",
    symbolism: "Healing, protection and devotion.",
    naturalDye: "Neem Leaf Green",
    colors: [
      { name: "Tulsi Green", hex: "#5c7a4a" },
      { name: "Soft Sage", hex: "#8a9a78" },
      { name: "Sand", hex: "#e5dcc8" },
      { name: "Ivory", hex: "#faf7ef" },
    ],
    motifs: ["tulsi leaf pair", "basil sprig", "zig-zag hedge"],
    suggestedGarments: ["Shirt", "Kurta", "Scarf", "Dress"],
    hueCluster: "green",
  },
  {
    id: "neem",
    name: "Neem",
    botanicalName: "Azadirachta indica",
    family: "Meliaceae",
    type: "leaf",
    description:
      "Serrated dark-green leaflets on arching stems. Neem is the village pharmacy — and a gentle olive-green dye.",
    symbolism: "Protection, resilience and wellness.",
    naturalDye: "Neem Leaf Green",
    colors: [
      { name: "Neem Olive", hex: "#5c7a4a" },
      { name: "Faded Sage", hex: "#8a9a78" },
      { name: "Clay", hex: "#b0704f" },
      { name: "Natural", hex: "#e5dcc8" },
    ],
    motifs: ["neem leaf", "leaf cascade", "twig pattern"],
    suggestedGarments: ["Scarf", "Shirt", "Dress", "Kurta"],
    hueCluster: "green",
  },
  {
    id: "jasmine",
    name: "Jasmine",
    botanicalName: "Jasminum sambac",
    family: "Oleaceae",
    type: "flower",
    description:
      "Tiny star-shaped white blossoms with a heady night fragrance. Delicate, luminous, minimal.",
    symbolism: "Purity, love and moonlight.",
    naturalDye: "Turmeric Gold",
    colors: [
      { name: "Jasmine White", hex: "#fbf8ef" },
      { name: "Soft Gold", hex: "#e5c98a" },
      { name: "Mint", hex: "#b9cbb0" },
      { name: "Ivory", hex: "#f7f4ea" },
    ],
    motifs: ["jasmine star", "night-bloom trail", "tiny bud scatter"],
    suggestedGarments: ["Kurta", "Dress", "Scarf", "Saree Border"],
    hueCluster: "white",
  },
  {
    id: "sunflower",
    name: "Sunflower",
    botanicalName: "Helianthus annuus",
    family: "Asteraceae",
    type: "flower",
    description:
      "Bold golden ray petals around a dark seed disc. Sunlight made visible — energetic and optimistic.",
    symbolism: "Adoration, loyalty and vitality.",
    naturalDye: "Marigold Sun",
    colors: [
      { name: "Sun Gold", hex: "#e8a33d" },
      { name: "Deep Amber", hex: "#c8862d" },
      { name: "Olive Leaf", hex: "#7d8b68" },
      { name: "Cream", hex: "#f6f1e7" },
    ],
    motifs: ["sunflower disc", "ray petal fan", "seed spiral"],
    suggestedGarments: ["Dress", "Shirt", "Scarf", "Kurta"],
    hueCluster: "yellow",
  },
  {
    id: "lavender",
    name: "Lavender",
    botanicalName: "Lavandula angustifolia",
    family: "Lamiaceae",
    type: "flower",
    description:
      "Slender purple spikes with a calming, herbal scent. Lavender hues read quietly luxurious on natural fabrics.",
    symbolism: "Calm, clarity and devotion.",
    naturalDye: "Indigo Vat No. 2",
    colors: [
      { name: "Lavender", hex: "#9a8fb8" },
      { name: "Mauve Mist", hex: "#c9c3dd" },
      { name: "Sage", hex: "#7d8b68" },
      { name: "Cream", hex: "#f6f1e7" },
    ],
    motifs: ["lavender spike", "dotted cluster", "field row"],
    suggestedGarments: ["Dress", "Shirt", "Saree Border", "Scarf"],
    hueCluster: "purple",
  },
  {
    id: "poppy",
    name: "Field Poppy",
    botanicalName: "Papaver rhoeas",
    family: "Papaveraceae",
    type: "flower",
    description:
      "Vivid scarlet petals with a dark heart, swaying in summer fields. Bold, fleeting, memorable.",
    symbolism: "Memory, courage and the passing of time.",
    naturalDye: "Madder Root Red",
    colors: [
      { name: "Poppy Red", hex: "#c23b3b" },
      { name: "Deep Rose", hex: "#8f2f3c" },
      { name: "Blush", hex: "#e8c8c5" },
      { name: "Cream", hex: "#f6f1e7" },
    ],
    motifs: ["poppy bloom", "petal crinkle", "dark heart dot"],
    suggestedGarments: ["Dress", "Kurta", "Scarf", "Saree Border"],
    hueCluster: "red",
  },
  {
    id: "indigo",
    name: "Indigo",
    botanicalName: "Indigofera tinctoria",
    family: "Fabaceae",
    type: "leaf",
    description:
      "The legendary blue leaf — fermented into the world's oldest blue dye. Deep, complex, unmistakable.",
    symbolism: "Mystery, depth and the night sky.",
    naturalDye: "Natural Indigo",
    colors: [
      { name: "Deep Indigo", hex: "#2b4a9b" },
      { name: "Midnight", hex: "#1f3a7a" },
      { name: "Stone", hex: "#c8c2b4" },
      { name: "White", hex: "#f7f5ef" },
    ],
    motifs: ["shibori cloud", "vat ripple", "bandhani dot grid"],
    suggestedGarments: ["Shirt", "Dress", "Kurta", "Saree Border"],
    hueCluster: "blue",
  },
  {
    id: "pomegranate",
    name: "Pomegranate",
    botanicalName: "Punica granatum",
    family: "Lythraceae",
    type: "flower",
    description:
      "Crimson rind and jewel-like seeds. Its dried rind yields a warm, lightfast ochre.",
    symbolism: "Abundance, fertility and unity.",
    naturalDye: "Pomegranate Ochre",
    colors: [
      { name: "Ochre", hex: "#b5833c" },
      { name: "Pomegranate", hex: "#9e4f46" },
      { name: "Bronze", hex: "#8a6a3c" },
      { name: "Cream", hex: "#f6f1e7" },
    ],
    motifs: ["pomegranate seed", "crown calyx", "split rind"],
    suggestedGarments: ["Dress", "Kurta", "Saree Border", "Scarf"],
    hueCluster: "brown",
  },
];

export function findPlantById(id: string): PlantSpecies | undefined {
  return PLANT_CATALOG.find((p) => p.id === id);
}
