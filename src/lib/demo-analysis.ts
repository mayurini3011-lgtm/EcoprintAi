import type { FabricAnalysisResult } from "./analysis-model";

/**
 * The most recent fabric analysis run on the landing page ("AI Fabric Lab").
 * Stored in localStorage so the floating assistant can explain the result
 * even before the user signs in and saves it to their account.
 */
export const ANALYSIS_STORAGE_KEY = "ecoprint-demo-analysis";
export const ANALYSIS_CHANGED_EVENT = "ecoprint:analysis-changed";

export function storeDemoAnalysis(result: FabricAnalysisResult) {
  localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(result));
  window.dispatchEvent(new CustomEvent(ANALYSIS_CHANGED_EVENT));
}

export function readDemoAnalysis(): FabricAnalysisResult | null {
  try {
    const raw = localStorage.getItem(ANALYSIS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FabricAnalysisResult) : null;
  } catch {
    return null;
  }
}
