/**
 * AI Fabric Design Studio backend.
 *
 * POST /api/generate-design equivalent (Convex action, also exposed over
 * HTTP in http.ts).
 *
 * Modes:
 *  1. LIVE — when AI_API_KEY + AI_IMAGE_ENDPOINT are configured, POSTs the
 *            prompt and options to the image API and returns the image URL.
 *  2. DEMO — returns a deterministic design *spec* (palette, pattern seed,
 *            title). The frontend renders it as a procedural SVG preview, so
 *            the studio works with zero paid APIs. The UI clearly labels
 *            demo previews as such.
 *
 * Saved designs persist to Convex and re-render deterministically from
 * { palette, seed } — no image storage required in demo mode.
 */
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { DYE_KNOWLEDGE } from "./constants";

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

export const generateDesign = action({
  args: {
    prompt: v.string(),
    fabric: v.string(),
    dye: v.string(),
    pattern: v.string(),
    palette: v.array(v.object({ name: v.string(), hex: v.string() })),
    seed: v.optional(v.number()),
  },
  handler: async (_ctx, args): Promise<{
    imageUrl: string | null;
    mode: "demo-svg" | "model";
    seed: number;
    title: string;
    palette: { name: string; hex: string }[];
  }> => {
    const apiKey = process.env.AI_API_KEY;
    const endpoint = process.env.AI_IMAGE_ENDPOINT;
    if (apiKey && endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            prompt: `Natural-dye textile pattern, ${args.pattern.toLowerCase()} style, dyed with ${args.dye}, on ${args.fabric.toLowerCase()}, palette ${args.palette.map((p) => p.hex).join(", ")}. ${args.prompt}`,
            n: 1,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            data?: { url?: string }[];
            url?: string;
          };
          const url = data.data?.[0]?.url ?? data.url;
          if (url) {
            return {
              imageUrl: url,
              mode: "model",
              seed: args.seed ?? hashString(args.prompt + args.fabric + args.dye + args.pattern),
              title: composeTitle(args.pattern, args.dye),
              palette: args.palette,
            };
          }
        }
        // fall through to demo if the provider call failed
      } catch {
        // fall through
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
    };
  },
});

function composeTitle(pattern: string, dye: string): string {
  const patternTitle = PATTERN_TITLES[pattern] ?? "Textile";
  const dyeKnowledge = DYE_KNOWLEDGE[dye];
  return dyeKnowledge
    ? `${patternTitle} in ${dye} ${dyeKnowledge.hex}`
    : `${patternTitle} — ${dye}`;
}


