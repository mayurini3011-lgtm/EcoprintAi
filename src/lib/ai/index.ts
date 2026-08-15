/**
 * AI service factory.
 *
 * Returns the active AIService implementation. Today this is the
 * deterministic mock so the whole platform works offline with zero API keys.
 *
 * To go live with a real AI provider later:
 *   1. Implement the AIService interface (types.ts) in a new file, e.g. a
 *      class calling a Convex action that proxies an external vision API
 *      (or the VLY completion gateway — see integrations.md).
 *   2. Return it from createAIService() below.
 *   3. No UI code changes required.
 */
import type { AIService } from "./types";
import { MockAIService } from "./mock";

export type { AIService };
export type {
  PlantInfo,
  PlantInput,
  DesignConcept,
  DesignOptions,
  PaletteColor,
  RiskAnalysis,
} from "./types";
export { PLANT_CATALOG, findPlantById } from "./plants";
export { analyzeImageFile } from "./vision";

let activeService: AIService | null = null;

export function getAIService(): AIService {
  if (!activeService) {
    // Swap here for a real provider-backed implementation.
    activeService = new MockAIService();
  }
  return activeService;
}
