/**
 * Lightweight client-side "vision" preprocessing.
 *
 * For the MVP we do two cheap, real operations on the uploaded image:
 *   1. SHA-256 of the raw file bytes (deterministic seed for the AI mock),
 *   2. Dominant colour clustering from a downscaled canvas read.
 *
 * A production system would replace this with a hosted vision model; the
 * AIService interface (see types.ts) is unchanged.
 */

export interface ImageAnalysis {
  imageHash: string;
  dominantColors: { hex: string; weight: number }[];
  previewUrl: string;
  fileName: string;
  fileSize: number;
}

export async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const data =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Extract up to `k` dominant colours with relative weights from an image file. */
async function extractDominantColors(
  file: File,
  k = 4,
): Promise<{ hex: string; weight: number }[]> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const size = 24; // tiny sampling grid
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return [];
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    // Quantize to a 3-bit colour cube, then tally.
    const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 100) continue; // skip transparent pixels
      const key = `${r >> 5},${g >> 5},${b >> 5}`;
      const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
      bucket.count += 1;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      buckets.set(key, bucket);
    }

    return [...buckets.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, k)
      .map((bucket) => {
        const r = Math.round(bucket.r / bucket.count);
        const g = Math.round(bucket.g / bucket.count);
        const b = Math.round(bucket.b / bucket.count);
        const hex = `#${[r, g, b]
          .map((v) => v.toString(16).padStart(2, "0"))
          .join("")}`;
        return { hex, weight: bucket.count / (size * size) };
      });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image."));
    img.src = src;
  });
}

export async function analyzeImageFile(file: File): Promise<ImageAnalysis> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file (JPG, PNG or WebP).");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image must be smaller than 10 MB.");
  }

  const bytes = await file.arrayBuffer();
  const imageHash = await sha256Hex(bytes);
  const dominantColors = await extractDominantColors(file);
  const previewUrl = URL.createObjectURL(file);

  return {
    imageHash,
    dominantColors,
    previewUrl,
    fileName: file.name,
    fileSize: file.size,
  };
}
