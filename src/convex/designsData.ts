/** Saved-design persistence (separate from the node-runtime action module). */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./roles";

export const saveDesign = mutation({
  args: {
    title: v.string(),
    prompt: v.string(),
    fabric: v.string(),
    dye: v.string(),
    pattern: v.string(),
    palette: v.array(v.object({ name: v.string(), hex: v.string() })),
    seed: v.number(),
    mode: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const id = await ctx.db.insert("savedDesigns", {
      userId: user?._id,
      title: args.title,
      prompt: args.prompt,
      fabric: args.fabric,
      dye: args.dye,
      pattern: args.pattern,
      palette: args.palette,
      seed: args.seed,
      mode: args.mode,
      createdAt: new Date().toISOString(),
    });
    return { id };
  },
});

export const listSavedDesigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("savedDesigns").order("desc").collect();
  },
});

export const deleteSavedDesign = mutation({
  args: { id: v.id("savedDesigns") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { deleted: true };
  },
});
