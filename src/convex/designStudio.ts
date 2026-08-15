/**
 * AI Fabric Design Studio backend.
 *
 * POST /api/generate-design equivalent (Convex action, also exposed over
 * HTTP in http.ts).
 *
 * Image providers — the user picks one in the UI, and listProviders() reports
 * which are actually configured (env keys are never exposed to the client):
 *
 *   demo      — seeded procedural SVG rendered in the browser (always on).
 *   openai    — OpenAI Images API.  Requires OPENAI_API_KEY.
 *               Model: AI_IMAGE_MODEL (default "dall-e-3").
 *   stability — Stability AI.      Requires STABILITY_API_KEY.
 *               Model: STABILITY_IMAGE_MODEL (default "stable-image-ultra").
 *   together  — Together AI.       Requires TOGETHER_API_KEY.
 *               Model: TOGETHER_IMAGE_MODEL (default "black-forest-labs/FLUX.1-schnell").
 *   custom    — Any OpenAI-compatible images endpoint.
 *               Requires AI_API_KEY + AI_IMAGE_ENDPOINT.
 *
 * Images are returned as provider URLs where possible (and compact jpeg data
 * URLs otherwise) so results stay well under Convex's 1 MB value limit.
 * If the chosen provider is missing, misconfigured or fails at request time,
 * the action falls back to the demo procedural render.
 */
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { DYE_KNOWLEDGE } from "./constants";
import {
  PROVIDER_IDS,
  isConfigured,
  modelFor,
  type ImageProviderId,
} from "./designProviders";

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const PATTERN_TITLES: Record<string, string> = {
  Floral: "Bloom Garden",
  Geometric: "Geometric Prism",
  Traditional: "Heritage Motif",
  Minimal: "Quiet Minimal",
  Abstract: "Organic Flow",
  "Block Print": "Hand Block Print",
  "Tie Dye": "Tie Dye Swirl",
  "Ikat-inspired": "Ikat Weave",
};

function buildPrompt(args: {
  prompt: string;
  fabric: string;
  dye: string;
  pattern: string;
  palette: { name: string; hex: string }[];
}): string {
  return `Natural-dye textile pattern, ${args.pattern.toLowerCase()} style, dyed with ${args.dye}, on ${args.fabric.toLowerCase()}, palette ${args.palette.map((p) => p.hex).join(", ")}. ${args.prompt}`;
}

function composeTitle(pattern: string, dye: string): string {
  const patternTitle = PATTERN_TITLES[pattern] ?? "Textile";
  const dyeKnowledge = DYE_KNOWLEDGE[dye];
  return dyeKnowledge
    ? `${patternTitle} in ${dye} ${dyeKnowledge.hex}`
    : `${patternTitle} — ${dye}`;
}

export const generateDesign = action({
  args: {
    prompt: v.string(),
    fabric: v.string(),
    dye: v.string(),
    pattern: v.string(),
    palette: v.array(v.object({ name: v.string(), hex: v.string() })),
    seed: v.optional(v.number()),
    provider: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<{
    imageUrl: string | null;
    mode: "demo-svg" | "model";
    seed: number;
    title: string;
    palette: { name: string; hex: string }[];
    provider: ImageProviderId;
  }> => {
    const requested = PROVIDER_IDS.includes(args.provider as ImageProviderId)
      ? (args.provider as ImageProviderId)
      : "demo";

    // Try the requested live provider first (only when actually configured).
    if (requested !== "demo" && isConfigured(requested)) {
      try {
        const imageUrl = await generateImage(requested, buildPrompt(args));
        if (imageUrl) {
          return {
            imageUrl,
            mode: "model",
            seed: args.seed ?? hashString(args.prompt + args.fabric + args.dye + args.pattern),
            title: composeTitle(args.pattern, args.dye),
            palette: args.palette,
            provider: requested,
          };
        }
      } catch {
        // fall through to the demo render
      }
    }

    const seed =
      args.seed ??
      hashString(`${args.prompt}|${args.fabric}|${args.dye}|${args.pattern}`);
    return {
      imageUrl: null,
      mode: "demo-svg",
      seed,
      title: composeTitle(args.pattern, args.dye),
      palette: args.palette,
      provider: "demo",
    };
  },
});

async function generateImage(
  provider: ImageProviderId,
  prompt: string,
): Promise<string | null> {
  switch (provider) {
    case "openai":
      return openaiImage(prompt);
    case "stability":
      return stabilityImage(prompt);
    case "together":
      return togetherImage(prompt);
    case "custom":
      return customImage(prompt);
    case "demo":
      return null;
  }
}

/** Extract a URL (or a compact data URL) from a standard images-API payload. */
function imageFromPayload(data: {
  data?: { url?: string; b64_json?: string }[];
  url?: string;
}): string | null {
  const item = data.data?.[0];
  if (item?.url) return item.url;
  if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
  if (data.url) return data.url;
  return null;
}

async function openaiImage(prompt: string): Promise<string | null> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelFor("openai"),
      prompt,
      n: 1,
      size: "1024x1024",
      // URL responses avoid Convex 1 MB value limits for b64 payloads.
      response_format: "url",
    }),
  });
  if (!res.ok) return null;
  return imageFromPayload((await res.json()) as Parameters<typeof imageFromPayload>[0]);
}

async function stabilityImage(prompt: string): Promise<string | null> {
  const model = modelFor("stability"); // e.g. stable-image-ultra
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("aspect_ratio", "1:1");
  form.append("output_format", "jpeg"); // compact base64 stays well under 1 MB
  const res = await fetch(
    `https://api.stability.ai/v2beta/stable-image/generate/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: "application/json",
      },
      body: form,
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { image?: string };
  return data.image ? `data:image/jpeg;base64,${data.image}` : null;
}

async function togetherImage(prompt: string): Promise<string | null> {
  const res = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelFor("together"),
      prompt,
      n: 1,
      width: 1024,
      height: 1024,
    }),
  });
  if (!res.ok) return null;
  return imageFromPayload((await res.json()) as Parameters<typeof imageFromPayload>[0]);
}

async function customImage(prompt: string): Promise<string | null> {
  const res = await fetch(process.env.AI_IMAGE_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({ prompt, n: 1 }),
  });
  if (!res.ok) return null;
  return imageFromPayload((await res.json()) as Parameters<typeof imageFromPayload>[0]);
}
