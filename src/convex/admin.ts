/**
 * Admin / Security Center statistics.
 */
import { query } from "./_generated/server";
import { ORDER_STEP_LABELS } from "./constants";

function monthKey(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export const adminStats = query({
  args: {},
  handler: async (ctx) => {
    const [users, farmers, manufacturers, tailors, orders, dyes, fabrics, garments, events, alerts, audits, analyses] =
      await Promise.all([
        ctx.db.query("users").collect(),
        ctx.db.query("farmers").collect(),
        ctx.db.query("manufacturers").collect(),
        ctx.db.query("tailors").collect(),
        ctx.db.query("orders").collect(),
        ctx.db.query("dyes").collect(),
        ctx.db.query("fabrics").collect(),
        ctx.db.query("garments").collect(),
        ctx.db.query("supplyChainEvents").collect(),
        ctx.db.query("securityAlerts").collect(),
        ctx.db.query("auditLogs").collect(),
        ctx.db.query("aiAnalyses").collect(),
      ]);

    const verifiedEvents = events.filter((e) => e.status === "verified" && !e.tampered);
    const suspiciousEvents = events.filter((e) => e.status !== "verified" || e.tampered);

    // Chart series ---------------------------------------------------------
    const eventsByStage = new Map<string, number>();
    const eventsByMonth = new Map<string, number>();
    for (const e of events) {
      eventsByStage.set(e.stage, (eventsByStage.get(e.stage) ?? 0) + 1);
      const m = monthKey(e.date);
      eventsByMonth.set(m, (eventsByMonth.get(m) ?? 0) + 1);
    }

    const ordersByStatus = new Map<string, number>();
    for (const o of orders) {
      const label = ORDER_STEP_LABELS[o.status] ?? o.status;
      ordersByStatus.set(label, (ordersByStatus.get(label) ?? 0) + 1);
    }

    const riskLevels = new Map<string, number>();
    for (const a of analyses) {
      riskLevels.set(a.status, (riskLevels.get(a.status) ?? 0) + 1);
    }

    const openAlerts = alerts.filter((a) => !a.resolved).length;

    return {
      totals: {
        users: users.length,
        farmers: farmers.length,
        manufacturers: manufacturers.length,
        tailors: tailors.length,
        orders: orders.length,
        dyes: dyes.length,
        fabrics: fabrics.length,
        garments: garments.length,
        events: events.length,
        verifiedRecords: verifiedEvents.length,
        suspiciousRecords: suspiciousEvents.length + alerts.length,
        openAlerts,
        auditLogs: audits.length,
        analyses: analyses.length,
      },
      charts: {
        eventsByStage: Object.fromEntries(eventsByStage),
        eventsByMonth: Object.fromEntries(eventsByMonth),
        ordersByStatus: Object.fromEntries(ordersByStatus),
        riskLevels: Object.fromEntries(riskLevels),
      },
    };
  },
});

/** Lightweight check used by the app shell to decide whether to seed. */
export const demoStatus = query({
  args: {},
  handler: async (ctx) => {
    const garments = await ctx.db.query("garments").collect();
    const dyes = await ctx.db.query("dyes").collect();
    return {
      seeded: garments.length > 0,
      garmentCount: garments.length,
      dyeCount: dyes.length,
    };
  },
});
