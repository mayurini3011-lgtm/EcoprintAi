/**
 * Thin mutations backing the public REST endpoints (see http.ts).
 * HTTP actions cannot run queries, so these read helpers are mutations that
 * the router invokes via ctx.runMutation.
 */
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { predictAnalysis } from "./analysis";

export const dyesSnapshot = mutation({
  args: {},
  handler: async (ctx) => {
    const dyes = await ctx.db.query("dyes").collect();
    return dyes.map((d) => ({
      code: d.code,
      name: d.name,
      botanicalSource: d.botanicalSource,
      colorHex: d.colorHex,
      colorName: d.colorName,
      availability: d.availability,
      status: d.status,
      pricePerKg: d.pricePerKg,
    }));
  },
});

export const analysesSnapshot = mutation({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("fabricAnalyses").order("desc").collect();
    return rows.map((r) => ({
      id: r._id,
      fabric: r.fabric,
      dye: r.dye,
      pattern: r.pattern,
      washes: r.washes,
      retention: r.retention,
      retentionCategory: r.retentionCategory,
      colorDifference: r.colorDifference,
      createdAt: r.createdAt,
    }));
  },
});

export const recordAnalysis = mutation({
  args: {
    fabric: v.string(),
    dye: v.string(),
    pattern: v.string(),
    washes: v.number(),
    initialHex: v.string(),
    imageHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = predictAnalysis(args);
    const id = await ctx.db.insert("fabricAnalyses", {
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

export const deleteAnalysisById = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const rows = await ctx.db.query("fabricAnalyses").collect();
    const target = rows.find((r) => r._id === id);
    if (target) await ctx.db.delete(target._id);
    return { deleted: Boolean(target) };
  },
});
