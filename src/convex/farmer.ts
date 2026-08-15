/**
 * Farmer portal — farmers register raw plant material batches.
 * Each submission is validated server-side and recorded for later
 * verification by the manufacturer / quality lab.
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./roles";

export const submitBatch = mutation({
  args: {
    farmerCode: v.string(),
    material: v.string(),
    quantityKg: v.number(),
    harvestDate: v.string(),
    notes: v.optional(v.string()),
    documentRiskScore: v.optional(v.number()), // from the AI risk scanner
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["farmer", "admin"]);

    if (args.quantityKg <= 0 || args.quantityKg > 100_000) {
      throw new Error("Quantity must be between 1 and 100,000 kg.");
    }
    if (!args.material.trim() || args.material.length > 120) {
      throw new Error("Material name is required (max 120 chars).");
    }

    const farmer = await ctx.db
      .query("farmers")
      .withIndex("by_code", (q) => q.eq("code", args.farmerCode))
      .first();
    if (!farmer) throw new Error("Farmer profile not found.");

    const harvest = new Date(args.harvestDate);
    if (Number.isNaN(harvest.getTime())) {
      throw new Error("Invalid harvest date.");
    }
    if (harvest.getTime() > Date.now()) {
      throw new Error("Harvest date cannot be in the future.");
    }

    const year = harvest.getFullYear();
    // Batch prefix from the material name, e.g. "Indigo leaves" -> IND.
    const materialPrefix = args.material
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
    const existing = await ctx.db.query("rawMaterialBatches").collect();
    const sequence = existing.filter((b) =>
      b.code.startsWith(`FARM-${materialPrefix}-${year}-`),
    ).length;
    const code = `FARM-${materialPrefix}-${year}-${String(sequence + 1).padStart(3, "0")}`;

    const now = new Date().toISOString();
    const flagged =
      (args.documentRiskScore ?? 0) >= 60 ||
      args.quantityKg > 400 ||
      args.quantityKg < 1;

    await ctx.db.insert("rawMaterialBatches", {
      code,
      farmerCode: farmer.code,
      farmerName: farmer.farmName,
      material: args.material,
      quantityKg: args.quantityKg,
      harvestDate: args.harvestDate,
      status: flagged ? "flagged" : "pending",
      submittedAt: now,
      notes: args.notes,
    });

    if (flagged) {
      await ctx.db.insert("securityAlerts", {
        type: "risk_scan",
        severity: args.quantityKg > 400 ? "medium" : "high",
        title: "Suspicious batch flagged",
        message: `Batch ${code} exceeded validation thresholds (risk ${args.documentRiskScore ?? 0}/100).`,
        entityType: "raw_material_batch",
        entityCode: code,
        timestamp: now,
        resolved: false,
      });
    }

    await ctx.db.insert("auditLogs", {
      actor: farmer.name,
      action: "batch_submitted",
      entity: "raw_material_batch",
      entityCode: code,
      details: `${args.material}, ${args.quantityKg} kg, harvest ${args.harvestDate}.`,
      timestamp: now,
    });

    return { code, status: flagged ? "flagged" : "pending" };
  },
});

export const listBatchesForFarmer = query({
  args: { farmerCode: v.string() },
  handler: async (ctx, { farmerCode }) => {
    return await ctx.db
      .query("rawMaterialBatches")
      .withIndex("by_farmer", (q) => q.eq("farmerCode", farmerCode))
      .order("desc")
      .collect();
  },
});
