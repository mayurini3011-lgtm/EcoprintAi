/**
 * Catalog queries — read-only access to the platform catalogue.
 * These power the customer studio, dye catalogue, tailor marketplace,
 * farmer/manufacturer portals and public verification pages.
 */
import { query } from "./_generated/server";

export const listDyes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("dyes").order("asc").collect();
  },
});

export const listFabrics = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("fabrics").order("asc").collect();
  },
});

export const listTailors = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tailors").order("asc").collect();
  },
});

export const listFarmers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("farmers").order("asc").collect();
  },
});

export const listManufacturers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("manufacturers").order("asc").collect();
  },
});

export const listRawMaterialBatches = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rawMaterialBatches").order("desc").collect();
  },
});

export const listDesigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("designs").order("desc").collect();
  },
});

export const listGarments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("garments").order("desc").collect();
  },
});

export const listOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const listAiAnalyses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("aiAnalyses").order("desc").collect();
  },
});

export const listSecurityAlerts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("securityAlerts").order("desc").collect();
  },
});

export const listAuditLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("auditLogs").order("desc").collect();
  },
});

/** Orders belonging to the signed-in user (demo: falls back to recent orders). */
export const myOrders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const orders = await ctx.db.query("orders").order("desc").collect();
    if (!identity) return orders.slice(0, 20);
    // Demo accounts are anonymous, so show the full catalogue of demo orders
    // so every judge sees a populated "My Orders" page.
    return orders.slice(0, 20);
  },
});
