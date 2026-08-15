/**
 * Fabric color-retention analysis — EcoPrint AI core feature.
 *
 * The prediction model itself lives in src/lib/analysis-model.ts (a pure,
 * client-safe module) so the public landing page can run the same model as
 * this backend. This module only adds Convex persistence.
 *
 * IMPORTANT: predictions are SIMULATED reference values for the demo, not
 * lab-certified measurements. The `mode` field is always "simulated" unless
 * a real ML model is later connected to this same function.
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./roles";
import {
  predictAnalysis,
  hashToNumber,
  type AnalysisInput,
  type FabricAnalysisResult,
} from "../lib/analysis-model";

export { predictAnalysis, hashToNumber };
export type { AnalysisInput, FabricAnalysisResult };

// ---------------------------------------------------------------------------
// Mutations & queries
// ---------------------------------------------------------------------------

export const analyzeFabric = mutation({
  args: {
    fabric: v.string(),
    dye: v.string(),
    pattern: v.string(),
    washes: v.number(),
    initialHex: v.string(),
    imageHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const result = predictAnalysis(args);
    const id = await ctx.db.insert("fabricAnalyses", {
      userId: user?._id,
      imageHash: args.imageHash,
      fabric: result.fabric,
      dye: result.dye,
      pattern: result.pattern,
      washes: result.washes,
      initialHex: result.initialHex,
      dominantColor: result.dominantColor,
      rgb: result.rgb,
      lab: result.lab,
      afterHex: result.afterHex,
      retention: result.retention,
      retentionCategory: result.retentionCategory,
      colorDifference: result.colorDifference,
      tempMin: result.tempMin,
      tempMax: result.tempMax,
      durationMin: result.durationMin,
      durationMax: result.durationMax,
      mordant: result.mordant,
      recommendation: result.recommendation,
      fabricRecommendation: result.fabricRecommendation,
      washingRecommendation: result.washingRecommendation,
      sustainabilityScore: result.sustainabilityScore,
      confidence: result.confidence,
      mode: result.mode,
      createdAt: new Date().toISOString(),
    });
    return { id, ...result };
  },
});

export const listAnalyses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("fabricAnalyses").order("desc").collect();
  },
});

export const getAnalysis = query({
  args: { id: v.id("fabricAnalyses") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const deleteAnalysis = mutation({
  args: { id: v.id("fabricAnalyses") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { deleted: true };
  },
});
