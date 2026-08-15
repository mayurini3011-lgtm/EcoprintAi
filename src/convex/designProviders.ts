/**
 * AI Fabric Design Studio — image provider registry.
 *
 * Shared by:
 *   - listProviders (query) — the UI asks this to render the model picker.
 *   - generateDesign (action, designStudio.ts) — reads the same registry to
 *     decide which provider to call and what model name to use.
 *
 * Configuration is read from process.env on the server. Keys are never
 * returned to the client — only the `configured` boolean is.
 */
import { query } from "./_generated/server";

export type ImageProviderId = "demo" | "openai" | "stability" | "together" | "custom";

export interface ImageProviderSpec {
  id: ImageProviderId;
  label: string;
  model: string;
  description: string;
  configured: boolean;
  /** Which env var(s) enable this provider (shown in the UI). */
  envVar: string;
}

export const PROVIDER_IDS: ImageProviderId[] = [
  "demo",
  "openai",
  "stability",
  "together",
  "custom",
];

export function isConfigured(id: ImageProviderId): boolean {
  switch (id) {
    case "demo":
      return true;
    case "openai":
      return Boolean(process.env.OPENAI_API_KEY);
    case "stability":
      return Boolean(process.env.STABILITY_API_KEY);
    case "together":
      return Boolean(process.env.TOGETHER_API_KEY);
    case "custom":
      return Boolean(process.env.AI_API_KEY && process.env.AI_IMAGE_ENDPOINT);
  }
}

export function modelFor(id: ImageProviderId): string {
  switch (id) {
    case "demo":
      return "procedural SVG";
    case "openai":
      return process.env.AI_IMAGE_MODEL ?? "dall-e-3";
    case "stability":
      return process.env.STABILITY_IMAGE_MODEL ?? "stable-image-ultra";
    case "together":
      return process.env.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell";
    case "custom":
      return "OpenAI-compatible endpoint";
  }
}

function specFor(id: ImageProviderId): ImageProviderSpec {
  const meta = {
    demo: {
      label: "Demo (procedural)",
      description: "Seeded browser-side renderer — works offline, no keys.",
      envVar: "—",
    },
    openai: {
      label: "OpenAI",
      description: "OpenAI Images API — dalle-3 / gpt-image-1",
      envVar: "OPENAI_API_KEY",
    },
    stability: {
      label: "Stability AI",
      description: "Stable Image Ultra / Core",
      envVar: "STABILITY_API_KEY",
    },
    together: {
      label: "Together AI",
      description: "Open-source FLUX models",
      envVar: "TOGETHER_API_KEY",
    },
    custom: {
      label: "Custom endpoint",
      description: "Any OpenAI-compatible images API",
      envVar: "AI_API_KEY + AI_IMAGE_ENDPOINT",
    },
  }[id];
  return { id, model: modelFor(id), configured: isConfigured(id), ...meta };
}

/** Public list of supported providers with live configuration status. */
export const listProviders = query({
  args: {},
  handler: async (): Promise<ImageProviderSpec[]> => PROVIDER_IDS.map(specFor),
});
