/**
 * Demo data seeder — fictional but realistic data for the hackathon.
 *
 * Seeds: 5 farmers, 3 manufacturers, 10 raw-material batches, 10 dye batches,
 * 10 fabrics, 5 tailors, 10 botanical designs, 10 garments (each with a full
 * 7-event hash-chained supply chain), 10 orders, security alerts, audit logs
 * and AI risk analyses.
 *
 * The hero showcase garment is NF-2026-000124 (Hibiscus Heritage Kurta) —
 * the target of the Security Center tamper demonstration. A fresh order
 * placed during the demo receives NF-2026-000125.
 */
import { api } from "./_generated/api";
import { mutation } from "./_generated/server";
import { buildChainSpecs } from "./chain_specs";
import { predictAnalysis } from "./analysis";
import { PALETTES } from "./constants";

const iso = (y: number, m: number, d: number, h = 10, min = 0) =>
  new Date(Date.UTC(y, m - 1, d, h, min)).toISOString();

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const farmers = [
  { code: "FARM-001", name: "Meera Iyer", farmName: "Green Valley Farm", location: "Nashik", crops: ["Indigo", "Marigold"], verified: true, sustainabilityNotes: "Rainwater-fed cultivation, crop rotation with pulses.", joinedAt: iso(2025, 11, 4) },
  { code: "FARM-002", name: "Arjun Patil", farmName: "Sahyadri Botanical Farms", location: "Pune", crops: ["Turmeric", "Hibiscus", "Henna"], verified: true, sustainabilityNotes: "Zero-chemical farming since 2021.", joinedAt: iso(2025, 12, 18) },
  { code: "FARM-003", name: "Laxmi Rabari", farmName: "Kutch Indigo Collective", location: "Bhuj", crops: ["Indigo"], verified: true, sustainabilityNotes: "Cooperative of 34 smallholders, open vat processing.", joinedAt: iso(2026, 1, 9) },
  { code: "FARM-004", name: "Sunita Sharma", farmName: "Aravali Herb Gardens", location: "Udaipur", crops: ["Madder", "Pomegranate", "Walnut"], verified: true, sustainabilityNotes: "Organic compost, solar drying sheds.", joinedAt: iso(2026, 2, 2) },
  { code: "FARM-005", name: "Ramesh Naik", farmName: "Konkan Neem Cooperative", location: "Ratnagiri", crops: ["Neem"], verified: false, sustainabilityNotes: "Onboarding in progress; documentation pending.", joinedAt: iso(2026, 4, 21) },
];

const manufacturers = [
  { code: "MFG-001", name: "Aravalli Naturals", location: "Jaipur", specialties: ["Indigo", "Madder"], certifications: ["GOTS", "EcoCert Natural Dye"], verified: true },
  { code: "MFG-002", name: "Coastal Colour Works", location: "Kochi", specialties: ["Turmeric", "Hibiscus", "Marigold", "Henna"], certifications: ["GOTS"], verified: true },
  { code: "MFG-003", name: "Vatika Dye Labs", location: "Varanasi", specialties: ["Walnut", "Pomegranate", "Neem"], certifications: ["EcoCert Natural Dye"], verified: true },
];

const rawBatches = [
  { code: "FARM-IND-2026-001", farmerCode: "FARM-001", farmerName: "Green Valley Farm", material: "Indigo leaves", quantityKg: 250, harvestDate: iso(2026, 5, 12), status: "verified" as const, submittedAt: iso(2026, 5, 14), verifiedAt: iso(2026, 5, 20) },
  { code: "FARM-TUR-2026-001", farmerCode: "FARM-002", farmerName: "Sahyadri Botanical Farms", material: "Turmeric rhizomes", quantityKg: 180, harvestDate: iso(2026, 4, 28), status: "verified" as const, submittedAt: iso(2026, 4, 30), verifiedAt: iso(2026, 5, 6) },
  { code: "FARM-HIB-2026-001", farmerCode: "FARM-002", farmerName: "Sahyadri Botanical Farms", material: "Hibiscus petals", quantityKg: 95, harvestDate: iso(2026, 6, 2), status: "verified" as const, submittedAt: iso(2026, 6, 4), verifiedAt: iso(2026, 6, 9) },
  { code: "FARM-IND-2026-002", farmerCode: "FARM-003", farmerName: "Kutch Indigo Collective", material: "Indigo leaves", quantityKg: 310, harvestDate: iso(2026, 5, 22), status: "verified" as const, submittedAt: iso(2026, 5, 24), verifiedAt: iso(2026, 5, 30) },
  { code: "FARM-MAR-2026-001", farmerCode: "FARM-001", farmerName: "Green Valley Farm", material: "Marigold petals", quantityKg: 140, harvestDate: iso(2026, 6, 10), status: "verified" as const, submittedAt: iso(2026, 6, 12), verifiedAt: iso(2026, 6, 17) },
  { code: "FARM-MAD-2026-001", farmerCode: "FARM-004", farmerName: "Aravali Herb Gardens", material: "Madder roots", quantityKg: 75, harvestDate: iso(2026, 3, 18), status: "verified" as const, submittedAt: iso(2026, 3, 20), verifiedAt: iso(2026, 3, 27) },
  { code: "FARM-POM-2026-001", farmerCode: "FARM-004", farmerName: "Aravali Herb Gardens", material: "Pomegranate rind", quantityKg: 120, harvestDate: iso(2026, 5, 8), status: "verified" as const, submittedAt: iso(2026, 5, 10), verifiedAt: iso(2026, 5, 16) },
  { code: "FARM-WAL-2026-001", farmerCode: "FARM-004", farmerName: "Aravali Herb Gardens", material: "Walnut husk", quantityKg: 90, harvestDate: iso(2026, 6, 15), status: "pending" as const, submittedAt: iso(2026, 6, 18) },
  { code: "FARM-NEM-2026-001", farmerCode: "FARM-005", farmerName: "Konkan Neem Cooperative", material: "Neem leaves", quantityKg: 200, harvestDate: iso(2026, 7, 1), status: "flagged" as const, submittedAt: iso(2026, 7, 3) },
  { code: "FARM-HEN-2026-001", farmerCode: "FARM-002", farmerName: "Sahyadri Botanical Farms", material: "Henna leaves", quantityKg: 60, harvestDate: iso(2026, 5, 30), status: "verified" as const, submittedAt: iso(2026, 6, 1), verifiedAt: iso(2026, 6, 7) },
  { code: "FARM-ONI-2026-001", farmerCode: "FARM-001", farmerName: "Green Valley Farm", material: "Onion skins", quantityKg: 180, harvestDate: iso(2026, 5, 28), status: "verified" as const, submittedAt: iso(2026, 5, 30), verifiedAt: iso(2026, 6, 5) },
  { code: "FARM-BEE-2026-001", farmerCode: "FARM-004", farmerName: "Aravali Herb Gardens", material: "Beetroot", quantityKg: 95, harvestDate: iso(2026, 6, 5), status: "verified" as const, submittedAt: iso(2026, 6, 7), verifiedAt: iso(2026, 6, 12) },
  { code: "FARM-TEA-2026-001", farmerCode: "FARM-004", farmerName: "Aravali Herb Gardens", material: "Waste tea leaves", quantityKg: 110, harvestDate: iso(2026, 5, 20), status: "verified" as const, submittedAt: iso(2026, 5, 22), verifiedAt: iso(2026, 5, 28) },
];

const dyes = [
  { code: "DYE-IND-2026-001", name: "Natural Indigo", botanicalSource: "Indigofera tinctoria", colorHex: "#2b4a9b", colorName: "Deep Indigo", farmerCode: "FARM-001", farmerName: "Green Valley Farm", manufacturerCode: "MFG-001", manufacturerName: "Aravalli Naturals", rawBatchCode: "FARM-IND-2026-001", availability: "available" as const, sustainabilityInfo: "Open vat fermentation; no synthetic reducing agents; wastewater recycled.", status: "verified" as const, mordant: "None (vat dye)", pricePerKg: 3400, verifiedAt: iso(2026, 5, 22) },
  { code: "DYE-TUR-2026-001", name: "Turmeric Gold", botanicalSource: "Curcuma longa", colorHex: "#e3a32a", colorName: "Golden Yellow", farmerCode: "FARM-002", farmerName: "Sahyadri Botanical Farms", manufacturerCode: "MFG-002", manufacturerName: "Coastal Colour Works", rawBatchCode: "FARM-TUR-2026-001", availability: "available" as const, sustainabilityInfo: "Solar-dried rhizomes; alum mordant; composted dye waste.", status: "verified" as const, mordant: "Alum", pricePerKg: 900, verifiedAt: iso(2026, 5, 10) },
  { code: "DYE-HIB-2026-001", name: "Hibiscus Crimson", botanicalSource: "Hibiscus rosa-sinensis", colorHex: "#a6263b", colorName: "Crimson", farmerCode: "FARM-002", farmerName: "Sahyadri Botanical Farms", manufacturerCode: "MFG-002", manufacturerName: "Coastal Colour Works", rawBatchCode: "FARM-HIB-2026-001", availability: "available" as const, sustainabilityInfo: "Cold-extracted petals; pH-adjusted with lime; 100% plant waste.", status: "verified" as const, mordant: "Lime + iron", pricePerKg: 1400, verifiedAt: iso(2026, 6, 11) },
  { code: "DYE-MAD-2026-001", name: "Madder Root Red", botanicalSource: "Rubia cordifolia", colorHex: "#8f2f3c", colorName: "Rose Red", farmerCode: "FARM-004", farmerName: "Aravali Herb Gardens", manufacturerCode: "MFG-001", manufacturerName: "Aravalli Naturals", rawBatchCode: "FARM-MAD-2026-001", availability: "available" as const, sustainabilityInfo: "Two-year aged roots; low-water extraction.", status: "verified" as const, mordant: "Alum + cream of tartar", pricePerKg: 2200, verifiedAt: iso(2026, 3, 30) },
  { code: "DYE-POM-2026-001", name: "Pomegranate Ochre", botanicalSource: "Punica granatum", colorHex: "#b5833c", colorName: "Warm Ochre", farmerCode: "FARM-004", farmerName: "Aravali Herb Gardens", manufacturerCode: "MFG-003", manufacturerName: "Vatika Dye Labs", rawBatchCode: "FARM-POM-2026-001", availability: "available" as const, sustainabilityInfo: "Rind extracted in solar stills; excellent light fastness.", status: "verified" as const, mordant: "Alum", pricePerKg: 1100, verifiedAt: iso(2026, 5, 19) },
  { code: "DYE-MAR-2026-001", name: "Marigold Sun", botanicalSource: "Tagetes erecta", colorHex: "#e8a33d", colorName: "Saffron Gold", farmerCode: "FARM-001", farmerName: "Green Valley Farm", manufacturerCode: "MFG-002", manufacturerName: "Coastal Colour Works", rawBatchCode: "FARM-MAR-2026-001", availability: "available" as const, sustainabilityInfo: "Petals harvested pre-bloom peak; alum mordant.", status: "verified" as const, mordant: "Alum", pricePerKg: 850, verifiedAt: iso(2026, 6, 20) },
  { code: "DYE-WAL-2026-001", name: "Walnut Bark Brown", botanicalSource: "Juglans regia", colorHex: "#5a4632", colorName: "Chestnut Brown", farmerCode: "FARM-004", farmerName: "Aravali Herb Gardens", manufacturerCode: "MFG-003", manufacturerName: "Vatika Dye Labs", rawBatchCode: "FARM-WAL-2026-001", availability: "limited" as const, sustainabilityInfo: "Husk harvested post-harvest; no mordant required.", status: "pending" as const, mordant: "None", pricePerKg: 1300 },
  { code: "DYE-NEM-2026-001", name: "Neem Leaf Green", botanicalSource: "Azadirachta indica", colorHex: "#5c7a4a", colorName: "Olive Green", farmerCode: "FARM-005", farmerName: "Konkan Neem Cooperative", manufacturerCode: "MFG-003", manufacturerName: "Vatika Dye Labs", rawBatchCode: "FARM-NEM-2026-001", availability: "limited" as const, sustainabilityInfo: "Neem also acts as natural insect repellent for storage.", status: "flagged" as const, mordant: "Copper sulphate", pricePerKg: 980 },
  { code: "DYE-IND-2026-002", name: "Indigo Vat No. 2", botanicalSource: "Indigofera tinctoria", colorHex: "#1f3a7a", colorName: "Midnight Indigo", farmerCode: "FARM-003", farmerName: "Kutch Indigo Collective", manufacturerCode: "MFG-001", manufacturerName: "Aravalli Naturals", rawBatchCode: "FARM-IND-2026-002", availability: "limited" as const, sustainabilityInfo: "Traditional Kutch open vat; community certified.", status: "verified" as const, mordant: "None (vat dye)", pricePerKg: 3600, verifiedAt: iso(2026, 6, 3) },
  { code: "DYE-HEN-2026-001", name: "Henna Rust", botanicalSource: "Lawsonia inermis", colorHex: "#9a4a2f", colorName: "Rust Orange", farmerCode: "FARM-002", farmerName: "Sahyadri Botanical Farms", manufacturerCode: "MFG-002", manufacturerName: "Coastal Colour Works", rawBatchCode: "FARM-HEN-2026-001", availability: "available" as const, sustainabilityInfo: "Lawsone-rich leaves; pH-adjusted bath.", status: "verified" as const, mordant: "Iron + vinegar", pricePerKg: 1200, verifiedAt: iso(2026, 6, 10) },
  { code: "DYE-ONI-2026-001", name: "Onion Skin Amber", botanicalSource: "Allium cepa", colorHex: "#b3702f", colorName: "Amber Brown", farmerCode: "FARM-001", farmerName: "Green Valley Farm", manufacturerCode: "MFG-002", manufacturerName: "Coastal Colour Works", rawBatchCode: "FARM-ONI-2026-001", availability: "available" as const, sustainabilityInfo: "Upcycled onion skins — circular, zero-cost dye source.", status: "verified" as const, mordant: "Alum", pricePerKg: 700, verifiedAt: iso(2026, 6, 6) },
  { code: "DYE-BEE-2026-001", name: "Beetroot Magenta", botanicalSource: "Beta vulgaris", colorHex: "#8e2a4f", colorName: "Magenta", farmerCode: "FARM-004", farmerName: "Aravali Herb Gardens", manufacturerCode: "MFG-002", manufacturerName: "Coastal Colour Works", rawBatchCode: "FARM-BEE-2026-001", availability: "limited" as const, sustainabilityInfo: "Food-industry by-product; low-temperature extraction.", status: "verified" as const, mordant: "Alum + iron", pricePerKg: 1100, verifiedAt: iso(2026, 6, 13) },
  { code: "DYE-TEA-2026-001", name: "Tea Leaf Brown", botanicalSource: "Camellia sinensis", colorHex: "#7a5c40", colorName: "Tea Brown", farmerCode: "FARM-004", farmerName: "Aravali Herb Gardens", manufacturerCode: "MFG-003", manufacturerName: "Vatika Dye Labs", rawBatchCode: "FARM-TEA-2026-001", availability: "available" as const, sustainabilityInfo: "Waste tea leaves from cafés — tannin-rich, circular source.", status: "verified" as const, mordant: "Iron", pricePerKg: 850, verifiedAt: iso(2026, 5, 29) },
];

const fabrics = [
  { code: "FAB-ORG-001", name: "Organic Cotton Khadi", material: "Cotton", weave: "Khadi hand-spun", origin: "Maheshwar", sustainabilityScore: 92, pricePerMeter: 420, available: true, colors: ["Natural", "Indigo", "Cream"] },
  { code: "FAB-ORG-002", name: "Organic Cotton Voile", material: "Cotton", weave: "Voile", origin: "Coimbatore", sustainabilityScore: 88, pricePerMeter: 380, available: true, colors: ["Natural", "White", "Ochre"] },
  { code: "FAB-SILK-001", name: "Ahimsa Silk Satin", material: "Silk", weave: "Satin", origin: "Mysore", sustainabilityScore: 85, pricePerMeter: 1400, available: true, colors: ["Blush", "Ivory", "Rose"] },
  { code: "FAB-SILK-002", name: "Tussar Silk", material: "Silk", weave: "Tussar", origin: "Bhagalpur", sustainabilityScore: 86, pricePerMeter: 1100, available: true, colors: ["Gold", "Brown", "Rust"] },
  { code: "FAB-LIN-001", name: "European Flax Linen", material: "Linen", weave: "Plain", origin: "Kolkata", sustainabilityScore: 90, pricePerMeter: 950, available: true, colors: ["Natural", "Sand", "Olive"] },
  { code: "FAB-LIN-002", name: "Hemp Linen Blend", material: "Hemp/Linen", weave: "Twill", origin: "Kullu", sustainabilityScore: 94, pricePerMeter: 820, available: true, colors: ["Olive", "Natural", "Grey"] },
  { code: "FAB-COT-001", name: "Handloom Cotton Slub", material: "Cotton", weave: "Slub", origin: "Wardha", sustainabilityScore: 87, pricePerMeter: 360, available: true, colors: ["Indigo", "White", "Grey"] },
  { code: "FAB-COT-002", name: "GOTS Cotton Poplin", material: "Cotton", weave: "Poplin", origin: "Erode", sustainabilityScore: 90, pricePerMeter: 410, available: true, colors: ["White", "Marigold", "Sage"] },
  { code: "FAB-WOOL-001", name: "Merino Wool Challis", material: "Wool", weave: "Challis", origin: "Kullu", sustainabilityScore: 78, pricePerMeter: 1600, available: true, colors: ["Brown", "Olive", "Rust"] },
  { code: "FAB-DEN-001", name: "Natural Indigo Denim", material: "Cotton", weave: "Denim", origin: "Bhuj", sustainabilityScore: 84, pricePerMeter: 780, available: true, colors: ["Indigo", "Stone"] },
];

const tailors = [
  { code: "TAI-001", name: "Ananya Sharma", shopName: "Ananya Tailors", location: "Jaipur", rating: 4.8, reviews: 212, specialization: "Women's ethnic wear", priceMin: 500, priceMax: 1500, deliveryDays: 5, previousWork: ["Floral kurti sets", "Anarkali suits"], available: true },
  { code: "TAI-002", name: "Kabir Mehta", shopName: "The Bespoke Atelier", location: "Mumbai", rating: 4.9, reviews: 164, specialization: "Contemporary menswear & blazers", priceMin: 1200, priceMax: 3500, deliveryDays: 8, previousWork: ["Linen shirts", "Cotton blazers"], available: true },
  { code: "TAI-003", name: "Radha Verma", shopName: "Radha's Studio", location: "Varanasi", rating: 4.7, reviews: 98, specialization: "Saree blouses & lehengas", priceMin: 800, priceMax: 2200, deliveryDays: 6, previousWork: ["Saree blouses", "Party lehengas"], available: true },
  { code: "TAI-004", name: "Devika Rao", shopName: "Craft Collective", location: "Pune", rating: 4.6, reviews: 87, specialization: "Sustainable everyday wear", priceMin: 400, priceMax: 1200, deliveryDays: 4, previousWork: ["Everyday dresses", "Trousers"], available: true },
  { code: "TAI-005", name: "Meera Krishnan", shopName: "Meera Stitching Hub", location: "Coimbatore", rating: 4.5, reviews: 143, specialization: "Kurtas & western tops", priceMin: 300, priceMax: 900, deliveryDays: 3, previousWork: ["Cotton kurtas", "Casual tops"], available: true },
];

// Botanical designs (DSG-2026-001..010), one per seeded garment.
const designs = [
  { code: "DSG-2026-001", plantName: "Rose", botanicalName: "Rosa damascena", garmentType: "Dress", title: "Rose Meadow Maxi", description: "A flowing maxi dress with scattered rose motifs and a soft matte finish.", palette: [{ name: "Rose Petal", hex: "#c98a8f" }, { name: "Blush", hex: "#e8c8c5" }, { name: "Sage Leaf", hex: "#7d8b68" }, { name: "Cream", hex: "#f6f1e7" }], motif: "Rose bloom", patternDensity: "medium", sleeveStyle: "3/4 Sleeve", neckStyle: "Round Neck", borderPattern: "Floral Vine", fabricType: "Organic Cotton Voile", createdAt: iso(2026, 3, 5) },
  { code: "DSG-2026-002", plantName: "Marigold", botanicalName: "Tagetes erecta", garmentType: "Dress", title: "Marigold Sundress", description: "Sunny tiered sundress with dense marigold dotwork on a poplin ground.", palette: [{ name: "Marigold", hex: "#e8a33d" }, { name: "Saffron", hex: "#d9822b" }, { name: "Leaf", hex: "#5c7a4a" }, { name: "Cream", hex: "#f6f1e7" }], motif: "Marigold pom", patternDensity: "high", sleeveStyle: "Cap Sleeve", neckStyle: "Square Neck", borderPattern: "Contrast Band", fabricType: "GOTS Cotton Poplin", createdAt: iso(2026, 3, 12) },
  { code: "DSG-2026-003", plantName: "Turmeric", botanicalName: "Curcuma longa", garmentType: "Kurta", title: "Turmeric Glow Kurta", description: "Minimal kurta washed in turmeric gold, finished with a slim piped border.", palette: [{ name: "Turmeric", hex: "#e3a32a" }, { name: "Sand", hex: "#e5dcc8" }, { name: "Deep Ochre", hex: "#b07d2b" }, { name: "Ivory", hex: "#faf7ef" }], motif: "Rhizome line", patternDensity: "low", sleeveStyle: "Full Sleeve", neckStyle: "Mandarin Collar", borderPattern: "Piping Detail", fabricType: "Organic Cotton Khadi", createdAt: iso(2026, 3, 19) },
  { code: "DSG-2026-004", plantName: "Indigo", botanicalName: "Indigofera tinctoria", garmentType: "Shirt", title: "Indigo Cloud Shirt", description: "Workwear shirt in deep indigo slub cotton with subtle cloud shibori.", palette: [{ name: "Deep Indigo", hex: "#2b4a9b" }, { name: "Midnight", hex: "#1f3a7a" }, { name: "Stone", hex: "#c8c2b4" }, { name: "White", hex: "#f7f5ef" }], motif: "Shibori cloud", patternDensity: "low", sleeveStyle: "Short Sleeve", neckStyle: "Mandarin Collar", borderPattern: "Plain Hem", fabricType: "Handloom Cotton Slub", createdAt: iso(2026, 3, 26) },
  { code: "DSG-2026-005", plantName: "Neem", botanicalName: "Azadirachta indica", garmentType: "Scarf", title: "Neem Calm Scarf", description: "Featherweight scarf dyed in olive neem green with a healing-leaf print.", palette: [{ name: "Olive", hex: "#5c7a4a" }, { name: "Sage", hex: "#8a9a78" }, { name: "Natural", hex: "#e5dcc8" }, { name: "Clay", hex: "#b0704f" }], motif: "Neem leaf", patternDensity: "medium", sleeveStyle: "Sleeveless", neckStyle: "Boat Neck", borderPattern: "Temple Border", fabricType: "Hemp Linen Blend", createdAt: iso(2026, 4, 2) },
  { code: "DSG-2026-006", plantName: "Pomegranate", botanicalName: "Punica granatum", garmentType: "Dress", title: "Pomegranate Ochre Dress", description: "A-line dress in warm pomegranate ochre with a bold seeded hem.", palette: [{ name: "Ochre", hex: "#b5833c" }, { name: "Pomegranate", hex: "#9e4f46" }, { name: "Cream", hex: "#f6f1e7" }, { name: "Bronze", hex: "#8a6a3c" }], motif: "Pomegranate seed", patternDensity: "medium", sleeveStyle: "Bell Sleeve", neckStyle: "V-Neck", borderPattern: "Paisley Edge", fabricType: "GOTS Cotton Poplin", createdAt: iso(2026, 4, 9) },
  { code: "DSG-2026-007", plantName: "Lotus", botanicalName: "Nelumbo nucifera", garmentType: "Lehenga", title: "Lotus Blush Lehenga", description: "Celebration lehenga with embroidered lotus medallions on ahimsa silk.", palette: [{ name: "Blush", hex: "#e8c8c5" }, { name: "Lotus Pink", hex: "#d98a9c" }, { name: "Gold", hex: "#c9a45c" }, { name: "Ivory", hex: "#faf7ef" }], motif: "Lotus medallion", patternDensity: "high", sleeveStyle: "Cap Sleeve", neckStyle: "Round Neck", borderPattern: "Contrast Band", fabricType: "Ahimsa Silk Satin", createdAt: iso(2026, 4, 16) },
  { code: "DSG-2026-008", plantName: "Jasmine", botanicalName: "Jasminum sambac", garmentType: "Kurta", title: "Jasmine Breeze Kurta", description: "Airy voile kurta scattered with tiny jasmine stars, daylight bright.", palette: [{ name: "Jasmine White", hex: "#fbf8ef" }, { name: "Soft Gold", hex: "#e5c98a" }, { name: "Mint", hex: "#b9cbb0" }, { name: "Ivory", hex: "#f7f4ea" }], motif: "Jasmine star", patternDensity: "low", sleeveStyle: "3/4 Sleeve", neckStyle: "Keyhole", borderPattern: "Piping Detail", fabricType: "Organic Cotton Voile", createdAt: iso(2026, 4, 23) },
  { code: "DSG-2026-009", plantName: "Walnut", botanicalName: "Juglans regia", garmentType: "Scarf", title: "Walnut Earth Scarf", description: "Plush wool challis scarf in chestnut walnut tones with a hand-knotted edge.", palette: [{ name: "Chestnut", hex: "#5a4632" }, { name: "Walnut", hex: "#7a5c40" }, { name: "Clay", hex: "#b0704f" }, { name: "Cream", hex: "#f0e9da" }], motif: "Walnut shell", patternDensity: "medium", sleeveStyle: "Sleeveless", neckStyle: "Boat Neck", borderPattern: "Temple Border", fabricType: "Merino Wool Challis", createdAt: iso(2026, 4, 30) },
  { code: "DSG-2026-010", plantName: "Hibiscus", botanicalName: "Hibiscus rosa-sinensis", garmentType: "Kurta", title: "Hibiscus Heritage Kurta", description: "Signature kurta in hibiscus crimson with a dark green temple border.", palette: [{ name: "Hibiscus", hex: "#a6263b" }, { name: "Blush", hex: "#e8c8c5" }, { name: "Sage Leaf", hex: "#5c7a4a" }, { name: "Cream", hex: "#f6f1e7" }], motif: "Hibiscus bloom", patternDensity: "medium", sleeveStyle: "Full Sleeve", neckStyle: "Round Neck", borderPattern: "Temple Border", fabricType: "Organic Cotton Khadi", createdAt: iso(2026, 5, 7) },
];

// Garments: NF-2026-000115..000124. The last one (Hibiscus Heritage Kurta)
// is the Security Center tamper-demo target.
const garmentSpecs: {
  garmentId: string;
  orderCode: string;
  plantName: string;
  plantBotanicalName: string;
  designCode: string;
  fabricCode: string;
  dyeCode: string;
  tailorCode: string;
  orderStatus: string;
  customerName: string;
  baseDate: string; // finish date
}[] = [
  { garmentId: "NF-2026-000115", orderCode: "ORD-2026-0001", plantName: "Rose", plantBotanicalName: "Rosa damascena", designCode: "DSG-2026-001", fabricCode: "FAB-LIN-001", dyeCode: "DYE-MAD-2026-001", tailorCode: "TAI-004", orderStatus: "delivered", customerName: "Priya Nair", baseDate: iso(2026, 3, 2) },
  { garmentId: "NF-2026-000116", orderCode: "ORD-2026-0002", plantName: "Marigold", plantBotanicalName: "Tagetes erecta", designCode: "DSG-2026-002", fabricCode: "FAB-COT-002", dyeCode: "DYE-MAR-2026-001", tailorCode: "TAI-002", orderStatus: "delivered", customerName: "Rohan Desai", baseDate: iso(2026, 3, 20) },
  { garmentId: "NF-2026-000117", orderCode: "ORD-2026-0003", plantName: "Turmeric", plantBotanicalName: "Curcuma longa", designCode: "DSG-2026-003", fabricCode: "FAB-ORG-001", dyeCode: "DYE-TUR-2026-001", tailorCode: "TAI-001", orderStatus: "delivered", customerName: "Anita Joshi", baseDate: iso(2026, 4, 6) },
  { garmentId: "NF-2026-000118", orderCode: "ORD-2026-0004", plantName: "Indigo", plantBotanicalName: "Indigofera tinctoria", designCode: "DSG-2026-004", fabricCode: "FAB-COT-001", dyeCode: "DYE-IND-2026-001", tailorCode: "TAI-005", orderStatus: "quality-check", customerName: "Vikram Singh", baseDate: iso(2026, 4, 22) },
  { garmentId: "NF-2026-000119", orderCode: "ORD-2026-0005", plantName: "Neem", plantBotanicalName: "Azadirachta indica", designCode: "DSG-2026-005", fabricCode: "FAB-LIN-002", dyeCode: "DYE-NEM-2026-001", tailorCode: "TAI-004", orderStatus: "dye-verified", customerName: "Sara Khan", baseDate: iso(2026, 5, 5) },
  { garmentId: "NF-2026-000120", orderCode: "ORD-2026-0006", plantName: "Pomegranate", plantBotanicalName: "Punica granatum", designCode: "DSG-2026-006", fabricCode: "FAB-COT-002", dyeCode: "DYE-POM-2026-001", tailorCode: "TAI-002", orderStatus: "stitching", customerName: "Dev Patel", baseDate: iso(2026, 5, 18) },
  { garmentId: "NF-2026-000121", orderCode: "ORD-2026-0007", plantName: "Lotus", plantBotanicalName: "Nelumbo nucifera", designCode: "DSG-2026-007", fabricCode: "FAB-SILK-001", dyeCode: "DYE-HEN-2026-001", tailorCode: "TAI-003", orderStatus: "tailor-assigned", customerName: "Kavya Reddy", baseDate: iso(2026, 6, 1) },
  { garmentId: "NF-2026-000122", orderCode: "ORD-2026-0008", plantName: "Jasmine", plantBotanicalName: "Jasminum sambac", designCode: "DSG-2026-008", fabricCode: "FAB-ORG-002", dyeCode: "DYE-TUR-2026-001", tailorCode: "TAI-001", orderStatus: "fabric-prepared", customerName: "Nikhil Menon", baseDate: iso(2026, 6, 12) },
  { garmentId: "NF-2026-000123", orderCode: "ORD-2026-0009", plantName: "Walnut", plantBotanicalName: "Juglans regia", designCode: "DSG-2026-009", fabricCode: "FAB-WOOL-001", dyeCode: "DYE-WAL-2026-001", tailorCode: "TAI-004", orderStatus: "design-approved", customerName: "Ishita Bansal", baseDate: iso(2026, 6, 28) },
  { garmentId: "NF-2026-000124", orderCode: "ORD-2026-0010", plantName: "Hibiscus", plantBotanicalName: "Hibiscus rosa-sinensis", designCode: "DSG-2026-010", fabricCode: "FAB-ORG-001", dyeCode: "DYE-HIB-2026-001", tailorCode: "TAI-001", orderStatus: "delivered", customerName: "Demo Customer", baseDate: iso(2026, 7, 14) },
];

const measurements = {
  heightCm: 162,
  bustCm: 88,
  waistCm: 70,
  hipsCm: 94,
  shoulderCm: 38,
  sleeveCm: 58,
  lengthPreference: "Knee length",
};

// ---------------------------------------------------------------------------
// Seed mutation
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Additive seeding — runs on every load for both fresh and existing
// deployments, so new catalogue entries and demo records appear without a
// full reset. Every insert is guarded by an existence check.
// ---------------------------------------------------------------------------

async function ensureAdditiveData(ctx: import("./_generated/server").MutationCtx) {
  // 1) New catalogue dyes (onion / beetroot / tea) + their raw batches.
  const dyeCodes = new Set((await ctx.db.query("dyes").collect()).map((d) => d.code));
  const missingDyes = dyes.filter((d) => !dyeCodes.has(d.code));
  if (missingDyes.length > 0) {
    const rawCodes = new Set(
      (await ctx.db.query("rawMaterialBatches").collect()).map((b) => b.code),
    );
    for (const d of missingDyes) {
      const raw = rawBatches.find((b) => b.code === d.rawBatchCode);
      if (raw && !rawCodes.has(raw.code)) {
        await ctx.db.insert("rawMaterialBatches", raw);
      }
      await ctx.db.insert("dyes", d);
    }
  }

  // 2) Demo fabric analyses for the history / dashboard charts.
  const analysisCount = await ctx.db.query("fabricAnalyses").collect();
  if (analysisCount.length === 0) {
    const demo = [
      { fabric: "Cotton", dye: "Indigo", pattern: "Floral", washes: 10, initialHex: "#2b4a9b", day: 12 },
      { fabric: "Silk", dye: "Beetroot", pattern: "Abstract", washes: 5, initialHex: "#8e2a4f", day: 18 },
      { fabric: "Linen", dye: "Tea", pattern: "Block Print", washes: 20, initialHex: "#7a5c40", day: 24 },
      { fabric: "Organic Cotton", dye: "Turmeric", pattern: "Geometric", washes: 1, initialHex: "#e3a32a", day: 28 },
    ];
    for (const input of demo) {
      const r = predictAnalysis(input);
      await ctx.db.insert("fabricAnalyses", {
        fabric: r.fabric,
        dye: r.dye,
        pattern: r.pattern,
        washes: r.washes,
        initialHex: r.initialHex,
        dominantColor: r.dominantColor,
        rgb: r.rgb,
        lab: r.lab,
        afterHex: r.afterHex,
        retention: r.retention,
        retentionCategory: r.retentionCategory,
        colorDifference: r.colorDifference,
        tempMin: r.tempMin,
        tempMax: r.tempMax,
        durationMin: r.durationMin,
        durationMax: r.durationMax,
        mordant: r.mordant,
        recommendation: r.recommendation,
        fabricRecommendation: r.fabricRecommendation,
        washingRecommendation: r.washingRecommendation,
        sustainabilityScore: r.sustainabilityScore,
        confidence: r.confidence,
        mode: r.mode,
        createdAt: iso(2026, 6, input.day),
      });
    }
  }

  // 3) Demo saved designs for the Saved Designs page.
  const designCount = await ctx.db.query("savedDesigns").collect();
  if (designCount.length === 0) {
    const demos = [
      { title: "Tie Dye Swirl in Indigo", prompt: "Swirling indigo clouds over cotton", fabric: "Cotton", dye: "Indigo", pattern: "Tie Dye", palette: PALETTES["Indigo blue"], seed: 12041, day: 2 },
      { title: "Block Print in Marigold", prompt: "Hand block print with marigold blooms", fabric: "Organic Cotton", dye: "Marigold", pattern: "Block Print", palette: PALETTES.Yellow, seed: 77511, day: 6 },
      { title: "Geometric Prism in Hibiscus", prompt: "Sharp geometric prisms in hibiscus pink", fabric: "Silk", dye: "Hibiscus", pattern: "Geometric", palette: PALETTES.Pink, seed: 9823, day: 9 },
    ];
    for (const d of demos) {
      await ctx.db.insert("savedDesigns", {
        title: d.title,
        prompt: d.prompt,
        fabric: d.fabric,
        dye: d.dye,
        pattern: d.pattern,
        palette: d.palette,
        seed: d.seed,
        mode: "demo-svg",
        createdAt: iso(2026, 7, d.day),
      });
    }
  }
}

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx): Promise<{ seeded: boolean }> => {
    const existingGarments = await ctx.db.query("garments").collect();
    const firstSeed = existingGarments.length === 0;
    if (firstSeed) {

    // Actors ---------------------------------------------------------------
    for (const f of farmers) await ctx.db.insert("farmers", { ...f, joinedAt: f.joinedAt });
    for (const m of manufacturers) await ctx.db.insert("manufacturers", m);
    for (const b of rawBatches) await ctx.db.insert("rawMaterialBatches", b);
    for (const d of dyes) await ctx.db.insert("dyes", d);
    for (const f of fabrics) await ctx.db.insert("fabrics", f);
    for (const t of tailors) await ctx.db.insert("tailors", t);
    for (const d of designs) await ctx.db.insert("designs", d);

    // Orders ----------------------------------------------------------------
    for (const g of garmentSpecs) {
      const dye = dyes.find((d) => d.code === g.dyeCode)!;
      const fabric = fabrics.find((f) => f.code === g.fabricCode)!;
      const tailor = tailors.find((t) => t.code === g.tailorCode)!;
      const design = designs.find((d) => d.code === g.designCode)!;
      await ctx.db.insert("orders", {
        orderCode: g.orderCode,
        customerName: g.customerName,
        designCode: g.designCode,
        designTitle: design.title,
        plantName: g.plantName,
        palette: design.palette,
        fabricCode: fabric.code,
        fabricName: fabric.name,
        dyeCode: dye.code,
        dyeName: dye.name,
        tailorCode: tailor.code,
        tailorName: tailor.name,
        measurements,
        totalPrice: 2400 + fabric.pricePerMeter * 3,
        status: g.orderStatus,
        createdAt: g.baseDate,
        garmentId: g.garmentId,
      });
    }

    // Garments + hash-chained supply chains --------------------------------
    for (const g of garmentSpecs) {
      const dye = dyes.find((d) => d.code === g.dyeCode)!;
      const fabric = fabrics.find((f) => f.code === g.fabricCode)!;
      const tailor = tailors.find((t) => t.code === g.tailorCode)!;
      const design = designs.find((d) => d.code === g.designCode)!;
      const farmer = farmers.find((f) => f.code === dye.farmerCode)!;
      const rawBatch = rawBatches.find((b) => b.code === dye.rawBatchCode)!;

      const finished = new Date(g.baseDate).getTime();
      const dates = [14, 11, 8, 6, 4, 2, 0].map((offset) =>
        new Date(finished - offset * 24 * 60 * 60 * 1000).toISOString(),
      );

      const specs = buildChainSpecs({
        garmentId: g.garmentId,
        plantName: g.plantName,
        plantBotanicalName: g.plantBotanicalName,
        design: { code: design.code, garmentType: design.garmentType, palette: design.palette },
        fabric,
        dye,
        farmer: { farmName: farmer.farmName, location: farmer.location, verified: farmer.verified },
        rawBatch,
        tailor,
        dates,
      });

      let chainHash = "";
      for (const spec of specs) {
        const result = await ctx.runMutation(api.security.createChainEvent, {
          garmentId: g.garmentId,
          stage: spec.stage,
          title: spec.title,
          actor: spec.actor,
          batchId: spec.batchId,
          date: spec.date,
          status: spec.status,
          payload: spec.payload,
        });
        chainHash = result.hash;
      }

      await ctx.db.insert("garments", {
        garmentId: g.garmentId,
        orderId: g.orderCode,
        plantName: g.plantName,
        designCode: design.code,
        designTitle: design.title,
        fabricCode: fabric.code,
        fabricName: fabric.name,
        dyeCode: dye.code,
        dyeName: dye.name,
        farmerName: farmer.farmName,
        manufacturerName: dye.manufacturerName,
        tailorName: tailor.name,
        status: g.orderStatus === "delivered" ? "finished" : "in-production",
        createdAt: g.baseDate,
        chainHash,
        verified: true,
      });
    }

    // AI risk analyses ------------------------------------------------------
    const analyses = [
      {
        targetType: "garment",
        targetCode: "NF-2026-000119",
        riskScore: 87,
        status: "high" as const,
        reasons: [
          "Duplicate certification number detected in dye documentation",
          "Recorded quantity (200 kg) does not match dispatch manifest (140 kg)",
          "Image metadata shows multiple re-saves — possible manipulation",
        ],
        checkedAt: iso(2026, 5, 8),
        scanner: "fraud-scanner-v1 (rule engine)",
      },
      {
        targetType: "dye_batch",
        targetCode: "DYE-NEM-2026-001",
        riskScore: 64,
        status: "medium" as const,
        reasons: [
          "Batch ID pattern inconsistent with factory sequence",
          "Lab certification document missing",
          "Source farm onboarding incomplete",
        ],
        checkedAt: iso(2026, 5, 10),
        scanner: "fraud-scanner-v1 (rule engine)",
      },
      {
        targetType: "garment",
        targetCode: "NF-2026-000124",
        riskScore: 12,
        status: "low" as const,
        reasons: [
          "All required fields complete and consistent",
          "Document hashes match originals",
          "Batch lineage fully verified",
        ],
        checkedAt: iso(2026, 7, 12),
        scanner: "fraud-scanner-v1 (rule engine)",
      },
    ];
    for (const a of analyses) await ctx.db.insert("aiAnalyses", a);

    // Security alerts -------------------------------------------------------
    const alerts = [
      { type: "suspicious_doc", severity: "high" as const, title: "Suspicious documentation", message: "Batch FARM-NEM-2026-001 upload failed metadata validation (multiple re-saves, mismatched quantities).", entityType: "raw_material_batch", entityCode: "FARM-NEM-2026-001", timestamp: iso(2026, 5, 8), resolved: false },
      { type: "risk_scan", severity: "high" as const, title: "AI risk scan flagged garment", message: "Garment NF-2026-000119 scored 87/100 (HIGH RISK): duplicate certification number and quantity mismatch.", entityType: "garment", entityCode: "NF-2026-000119", timestamp: iso(2026, 5, 9), resolved: false },
      { type: "duplicate_cert", severity: "medium" as const, title: "Duplicate certification number", message: "Certification #EC-8841 appears on two different dye batches from unrelated manufacturers.", entityType: "dye", entityCode: "DYE-NEM-2026-001", timestamp: iso(2026, 5, 10), resolved: false },
    ];
    for (const a of alerts) await ctx.db.insert("securityAlerts", a);

    // Audit logs ------------------------------------------------------------
    const audits = [
      { actor: "system", action: "demo_data_seeded", entity: "platform", entityCode: "ALL", details: "Demo dataset initialised (farmers, dyes, garments, chains).", timestamp: iso(2026, 7, 14, 8) },
      { actor: "Quality Assurance Lab", action: "batch_verified", entity: "raw_material_batch", entityCode: "FARM-IND-2026-001", details: "Indigo leaves, 250 kg — purity 96%, moisture 8.2%.", timestamp: iso(2026, 5, 20) },
      { actor: "Aravalli Naturals", action: "dye_batch_created", entity: "dye", entityCode: "DYE-IND-2026-001", details: "Natural Indigo produced from FARM-IND-2026-001.", timestamp: iso(2026, 5, 22) },
      { actor: "EcoPrint AI", action: "design_generated", entity: "design", entityCode: "DSG-2026-010", details: "Hibiscus Heritage Kurta — 4-colour palette, temple border.", timestamp: iso(2026, 5, 7) },
      { actor: "Quality Check", action: "garment_finished", entity: "garment", entityCode: "NF-2026-000124", details: "12 checks passed; QR bound; chain hash stored.", timestamp: iso(2026, 7, 14) },
      { actor: "fraud-scanner-v1", action: "risk_scan_completed", entity: "garment", entityCode: "NF-2026-000119", details: "Risk score 87/100 — HIGH RISK.", timestamp: iso(2026, 5, 9) },
      { actor: "demo-admin", action: "chain_verified", entity: "garment", entityCode: "NF-2026-000124", details: "Full hash chain verified — no tampering detected.", timestamp: iso(2026, 7, 14, 12) },
      { actor: "demo-admin", action: "qr_generated", entity: "garment", entityCode: "NF-2026-000124", details: "Verification QR issued for public traceability page.", timestamp: iso(2026, 7, 14, 12, 30) },
    ];
    for (const a of audits) await ctx.db.insert("auditLogs", a);
    }

    await ensureAdditiveData(ctx);
    return { seeded: firstSeed };
  },
});

/** Wipes all demo tables and re-seeds (used by the demo reset button). */
export const resetDemoData = mutation({
  args: {},
  handler: async (ctx): Promise<{ seeded: boolean }> => {
    const tables = [
      "supplyChainEvents",
      "garments",
      "orders",
      "designs",
      "rawMaterialBatches",
      "dyes",
      "fabrics",
      "tailors",
      "farmers",
      "manufacturers",
      "aiAnalyses",
      "securityAlerts",
      "auditLogs",
    ] as const;

    for (const table of tables) {
      const rows = await ctx.db.query(table).collect();
      for (const row of rows) await ctx.db.delete(row._id);
    }

    const result: { seeded: boolean } = await ctx.runMutation(
      api.seed.seedDemoData,
    );
    return result;
  },
});
