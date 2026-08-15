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
] as const;
