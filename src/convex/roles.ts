/**
 * Role helpers — RBAC for the platform.
 *
 * Every backend mutation that mutates or exposes sensitive state checks the
 * caller's role via requireRole(). The frontend additionally offers a
 * "demo role" switcher so hackathon judges can tour every portal in seconds;
 * in production this switcher would be replaced by real role assignment.
 */
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import {
  MutationCtx,
  QueryCtx,
  mutation,
} from "./_generated/server";
import { Role, roleValidator } from "./schema";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db.get(userId);
}

/** Throws unless the signed-in user has one of the allowed roles. */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowed: Role[],
) {
  const user = await getCurrentUser(ctx);
  const role: Role = user?.role ?? "customer";
  if (!allowed.includes(role)) {
    throw new Error(`Access denied: role "${role}" is not permitted.`);
  }
  return user;
}

/** Demo-only: switches the signed-in user's role so judges can tour portals. */
export const setDemoRole = mutation({
  args: { role: roleValidator },
  handler: async (ctx, { role }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not signed in.");

    await ctx.db.patch(user._id, { role });

    await ctx.db.insert("auditLogs", {
      actor: user.name ?? "demo-user",
      action: "demo_role_set",
      entity: "user",
      entityCode: user._id,
      details: `Demo role switched to "${role}".`,
      timestamp: new Date().toISOString(),
    });

    return { role };
  },
});
