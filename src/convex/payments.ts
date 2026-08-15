/**
 * Checkout backend — demo-first, Razorpay-ready.
 *
 * POST /api/create-order and POST /api/verify-payment equivalents (Convex
 * actions, also exposed over HTTP in http.ts).
 *
 * Demo mode (default, no env keys): returns a clearly-labelled simulated
 * order and accepts simulated payment. No real money moves.
 *
 * Live mode (RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET set in the environment):
 * creates a real Razorpay order via their REST API and verifies the payment
 * signature with HMAC-SHA256. Keys are read from process.env only and are
 * never exposed to the frontend.
 */
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { GST_RATE, PLANS } from "./constants";

export const createOrder = action({
  args: { planId: v.string() },
  handler: async (_ctx, { planId }) => {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) throw new Error("Unknown plan.");

    const subtotal = plan.price;
    const gst = Math.round(subtotal * GST_RATE);
    const total = subtotal + gst;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        },
        body: JSON.stringify({
          amount: total * 100, // paise
          currency: "INR",
          receipt: `ecoprint_${planId}_${Date.now()}`,
        }),
      });
      if (!res.ok) {
        throw new Error(`Razorpay order creation failed (${res.status}).`);
      }
      const order = (await res.json()) as { id: string; amount: number };
      return {
        orderId: order.id,
        amount: order.amount / 100,
        currency: "INR",
        demo: false,
        keyId,
        plan: { id: plan.id, name: plan.name, price: subtotal },
        gst,
        total,
      };
    }

    return {
      orderId: `demo_ord_${Date.now().toString(36)}`,
      amount: total,
      currency: "INR",
      demo: true,
      keyId: null,
      plan: { id: plan.id, name: plan.name, price: subtotal },
      gst,
      total,
    };
  },
});

export const verifyPayment = action({
  args: {
    orderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    razorpaySignature: v.optional(v.string()),
  },
  handler: async (_ctx, { orderId, razorpayPaymentId, razorpaySignature }) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const demo =
      !keySecret || !razorpayPaymentId || !razorpaySignature;
    if (demo) {
      return {
        success: true,
        demo: true,
        message: "Demo transaction — no real money was charged.",
      };
    }

    const crypto = await import("node:crypto");
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${razorpayPaymentId}`)
      .digest("hex");
    const ok = expected === razorpaySignature;
    return {
      success: ok,
      demo: false,
      message: ok ? "Payment verified." : "Signature mismatch — payment could not be verified.",
    };
  },
});
