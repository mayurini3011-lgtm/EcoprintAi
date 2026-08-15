/**
 * Order workflow — placing an order registers a secure digital garment
 * identity (NF-2026-000125 ...) and appends a full tamper-evident supply
 * chain to it. Every event is hashed and linked (see security.ts).
 */
import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { buildChainSpecs } from "./chain_specs";
import { ORDER_STEPS, ORDER_STEP_LABELS } from "./constants";
import { getCurrentUser } from "./roles";

const paletteValidator = v.array(
  v.object({ name: v.string(), hex: v.string() }),
);

export const placeOrder = mutation({
  args: {
    customerName: v.string(),
    plantName: v.string(),
    plantBotanicalName: v.string(),
    design: v.object({
      garmentType: v.string(),
      title: v.string(),
      description: v.string(),
      motif: v.string(),
      patternDensity: v.string(),
      sleeveStyle: v.string(),
      neckStyle: v.string(),
      borderPattern: v.string(),
      fabricType: v.string(),
      palette: paletteValidator,
    }),
    fabricCode: v.string(),
    dyeCode: v.string(),
    tailorCode: v.string(),
    measurements: v.object({
      heightCm: v.number(),
      bustCm: v.number(),
      waistCm: v.number(),
      hipsCm: v.number(),
      shoulderCm: v.number(),
      sleeveCm: v.number(),
      lengthPreference: v.string(),
    }),
    totalPrice: v.number(),
    deliveryDate: v.optional(v.string()),
    deliveryWindow: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Look up the chosen catalogue items (server-side validation).
    const fabric = await ctx.db
      .query("fabrics")
      .withIndex("by_code", (q) => q.eq("code", args.fabricCode))
      .first();
    const dye = await ctx.db
      .query("dyes")
      .withIndex("by_code", (q) => q.eq("code", args.dyeCode))
      .first();
    const tailor = await ctx.db
      .query("tailors")
      .withIndex("by_code", (q) => q.eq("code", args.tailorCode))
      .first();
    const rawBatch = dye
      ? await ctx.db
          .query("rawMaterialBatches")
          .withIndex("by_code", (q) => q.eq("code", dye.rawBatchCode))
          .first()
      : null;
    const farmer = dye
      ? await ctx.db
          .query("farmers")
          .withIndex("by_code", (q) => q.eq("code", dye.farmerCode))
          .first()
      : null;

    if (!fabric || !dye || !tailor || !farmer || !rawBatch) {
      throw new Error("One or more selections are no longer available.");
    }

    // --- Next identifiers -------------------------------------------------
    const existingGarments = await ctx.db.query("garments").collect();
    const maxNum = existingGarments.reduce((max, g) => {
      const m = g.garmentId.match(/NF-2026-(\d+)$/);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 100);
    const garmentNumber = maxNum + 1;
    const garmentId = `NF-2026-${String(garmentNumber).padStart(6, "0")}`;

    const orderCount = (await ctx.db.query("orders").collect()).length;
    const orderCode = `ORD-2026-${String(orderCount + 1).padStart(4, "0")}`;
    const designCount = (await ctx.db.query("designs").collect()).length;
    const designCode = `DSG-2026-${String(designCount + 1).padStart(3, "0")}`;

    const now = new Date();
    const iso = (daysAgo: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString();
    };

    // --- Persist the AI design -------------------------------------------
    await ctx.db.insert("designs", {
      code: designCode,
      plantName: args.plantName,
      botanicalName: args.plantBotanicalName,
      garmentType: args.design.garmentType,
      title: args.design.title,
      description: args.design.description,
      palette: args.design.palette,
      motif: args.design.motif,
      patternDensity: args.design.patternDensity,
      sleeveStyle: args.design.sleeveStyle,
      neckStyle: args.design.neckStyle,
      borderPattern: args.design.borderPattern,
      fabricType: args.design.fabricType,
      createdAt: now.toISOString(),
      createdBy: user?.name ?? args.customerName,
    });

    // --- Create the order -------------------------------------------------
    const orderId = await ctx.db.insert("orders", {
      orderCode,
      userId: user?._id,
      customerName: args.customerName,
      designCode,
      designTitle: args.design.title,
      plantName: args.plantName,
      palette: args.design.palette,
      fabricCode: fabric.code,
      fabricName: fabric.name,
      dyeCode: dye.code,
      dyeName: dye.name,
      tailorCode: tailor.code,
      tailorName: tailor.name,
      measurements: args.measurements,
      totalPrice: args.totalPrice,
      status: ORDER_STEPS[0],
      createdAt: now.toISOString(),
      garmentId,
      deliveryDate: args.deliveryDate,
      deliveryWindow: args.deliveryWindow,
      paymentMethod: args.paymentMethod,
      notes: args.notes,
    });

    // --- Create the garment ----------------------------------------------
    await ctx.db.insert("garments", {
      garmentId,
      orderId: orderId.toString(),
      plantName: args.plantName,
      designCode,
      designTitle: args.design.title,
      fabricCode: fabric.code,
      fabricName: fabric.name,
      dyeCode: dye.code,
      dyeName: dye.name,
      farmerName: farmer.farmName,
      manufacturerName: dye.manufacturerName,
      tailorName: tailor.name,
      status: "in-production",
      createdAt: now.toISOString(),
      chainHash: "",
      verified: true,
    });

    // --- Append the supply-chain events (hash-chained) --------------------
    const chainSpecs = buildChainSpecs({
      garmentId,
      plantName: args.plantName,
      plantBotanicalName: args.plantBotanicalName,
      design: {
        code: designCode,
        garmentType: args.design.garmentType,
        palette: args.design.palette,
      },
      fabric: {
        code: fabric.code,
        name: fabric.name,
        material: fabric.material,
        weave: fabric.weave,
        sustainabilityScore: fabric.sustainabilityScore,
      },
      dye: {
        code: dye.code,
        name: dye.name,
        botanicalSource: dye.botanicalSource,
        mordant: dye.mordant,
        rawBatchCode: dye.rawBatchCode,
        manufacturerName: dye.manufacturerName,
      },
      farmer: {
        farmName: farmer.farmName,
        location: farmer.location,
        verified: farmer.verified,
      },
      rawBatch: {
        code: rawBatch.code,
        material: rawBatch.material,
        quantityKg: rawBatch.quantityKg,
      },
      tailor: {
        code: tailor.code,
        name: tailor.name,
        specialization: tailor.specialization,
        deliveryDays: tailor.deliveryDays,
      },
      dates: [iso(14), iso(11), iso(8), iso(6), iso(4), iso(2), iso(0)],
    });

    let lastHash = "";
    for (const spec of chainSpecs) {
      const result = await ctx.runMutation(api.security.createChainEvent, {
        garmentId,
        stage: spec.stage,
        title: spec.title,
        actor: spec.actor,
        batchId: spec.batchId,
        date: spec.date,
        status: spec.status,
        payload: spec.payload,
      });
      lastHash = result.hash;
    }

    await ctx.db.patch(
      (
        await ctx.db
          .query("garments")
          .withIndex("by_garment_id", (q) => q.eq("garmentId", garmentId))
          .first()
      )!._id,
      { chainHash: lastHash, verified: true },
    );

    await ctx.db.insert("auditLogs", {
      actor: args.customerName,
      action: "order_placed",
      entity: "order",
      entityCode: orderCode,
      details: `Order placed; garment ${garmentId} registered with 7 hash-chained events.`,
      timestamp: now.toISOString(),
    });

    return { orderCode, garmentId, orderId };
  },
});

export const advanceOrderStatus = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found.");

    const idx = ORDER_STEPS.indexOf(order.status as (typeof ORDER_STEPS)[number]);
    if (idx < 0 || idx >= ORDER_STEPS.length - 1) {
      throw new Error("Order already delivered.");
    }
    const next = ORDER_STEPS[idx + 1];

    await ctx.db.patch(orderId, { status: next });

    if (order.garmentId) {
      const garment = await ctx.db
        .query("garments")
        .withIndex("by_garment_id", (q) => q.eq("garmentId", order.garmentId!))
        .first();
      if (garment) {
        const finishedStatuses = ["stitching", "quality-check", "delivered"];
        await ctx.db.patch(garment._id, {
          status: finishedStatuses.includes(next) ? "finished" : "in-production",
        });
      }
    }

    await ctx.db.insert("auditLogs", {
      actor: "demo-user",
      action: "order_status_advanced",
      entity: "order",
      entityCode: order.orderCode,
      details: `Status moved to "${ORDER_STEP_LABELS[next]}".`,
      timestamp: new Date().toISOString(),
    });

    return { status: next };
  },
});

/** Look up a garment by ID for the customer traceability page. */
export const getGarmentById = query({
  args: { garmentId: v.string() },
  handler: async (ctx, { garmentId }) => {
    return await ctx.db
      .query("garments")
      .withIndex("by_garment_id", (q) => q.eq("garmentId", garmentId))
      .first();
  },
});

export const getOrderByCode = query({
  args: { orderCode: v.string() },
  handler: async (ctx, { orderCode }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_code", (q) => q.eq("orderCode", orderCode))
      .first();
  },
});
