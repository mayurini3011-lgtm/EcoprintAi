import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { api } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * Public REST endpoints (demo-friendly; unauthenticated).
 * The web app itself calls Convex functions directly; these routes exist so
 * the platform can be driven from external clients / curl for the demo.
 */
http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        status: "ok",
        service: "ecoprint-ai",
        version: "1.0",
        demoMode: true,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }),
});

http.route({
  path: "/api/dyes",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const dyes = await ctx.runMutation(api.httpHelpers.dyesSnapshot);
    return new Response(JSON.stringify({ dyes }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/api/history",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const history = await ctx.runMutation(api.httpHelpers.analysesSnapshot);
    return new Response(JSON.stringify({ history }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/api/history",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await ctx.runMutation(api.httpHelpers.recordAnalysis, {
      fabric: String(body.fabric ?? ""),
      dye: String(body.dye ?? ""),
      pattern: String(body.pattern ?? ""),
      washes: Number(body.washes ?? 1),
      initialHex: String(body.initialHex ?? "#8a9a78"),
      imageHash: body.imageHash ? String(body.imageHash) : undefined,
    });
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/api/history/:id",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const id = new URL(request.url).pathname.split("/").pop() ?? "";
    await ctx.runMutation(api.httpHelpers.deleteAnalysisById, { id });
    return new Response(JSON.stringify({ deleted: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/api/chat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = (await request.json()) as {
      message?: string;
      analysis_context?: Record<string, unknown>;
    };
    if (!body.message) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const result = await ctx.runAction(api.chat.chat, {
      message: body.message,
      analysisContext: body.analysis_context,
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/api/generate-design",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await ctx.runAction(api.designStudio.generateDesign, {
      prompt: String(body.prompt ?? ""),
      fabric: String(body.fabric ?? "Cotton"),
      dye: String(body.dye ?? "Indigo"),
      pattern: String(body.pattern ?? "Floral"),
      palette: (body.palette as { name: string; hex: string }[] | undefined) ?? [],
      seed: body.seed ? Number(body.seed) : undefined,
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/api/create-order",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = (await request.json()) as { planId?: string };
    if (!body.planId) {
      return new Response(JSON.stringify({ error: "planId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const result = await ctx.runAction(api.payments.createOrder, {
      planId: body.planId,
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/api/verify-payment",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = (await request.json()) as {
      orderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    };
    const result = await ctx.runAction(api.payments.verifyPayment, {
      orderId: body.orderId ?? "",
      razorpayPaymentId: body.razorpayPaymentId,
      razorpaySignature: body.razorpaySignature,
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
