import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sends a demo shop order confirmation via Resend when RESEND_API_KEY is
 * configured. Best-effort: the checkout never blocks on this — when no key
 * is present (or the send fails) it returns { mode: "demo" } and the UI
 * simply notes that an email would be sent.
 *
 * Keys stay server-side; nothing here is exposed to the browser.
 */
export const sendOrderConfirmation = action({
  args: {
    email: v.string(),
    customerName: v.string(),
    orderId: v.string(),
    total: v.number(),
    paymentMethod: v.string(),
    shippingMethod: v.string(),
    items: v.array(
      v.object({
        title: v.string(),
        quantity: v.number(),
        price: v.number(),
      }),
    ),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return { sent: false, mode: "demo" as const, message: "RESEND_API_KEY not configured — email skipped." };
    }

    const lines = args.items
      .map(
        (it) =>
          `<tr><td style="padding:8px 12px;border-bottom:1px solid #e7e2d8">${it.title}</td>` +
          `<td style="padding:8px 12px;border-bottom:1px solid #e7e2d8;text-align:center">×${it.quantity}</td>` +
          `<td style="padding:8px 12px;border-bottom:1px solid #e7e2d8;text-align:right">₹${(it.price * it.quantity).toLocaleString("en-IN")}</td></tr>`,
      )
      .join("");

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "EcoPrint AI <onboarding@resend.dev>",
          to: [args.email],
          subject: `Order ${args.orderId} confirmed — EcoPrint AI`,
          html: `
            <div style="font-family:Inter,system-ui,sans-serif;background:#faf7f1;padding:32px">
              <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e2d8">
                <div style="background:#1f3d2b;color:#fff;padding:24px 28px">
                  <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.8">EcoPrint AI</p>
                  <h1 style="margin:8px 0 0;font-size:20px">Order ${args.orderId} confirmed</h1>
                </div>
                <div style="padding:28px">
                  <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4b4b4b">
                    Thank you, ${args.customerName}. Your order is being prepared
                    and will be dispatched shortly.
                  </p>
                  <table style="width:100%;border-collapse:collapse;font-size:13px">${lines}</table>
                  <p style="margin:16px 0 0;font-size:13px;color:#4b4b4b">
                    <strong>Payment:</strong> ${args.paymentMethod}<br/>
                    <strong>Delivery:</strong> ${args.shippingMethod}<br/>
                    <strong>Total:</strong> ₹${args.total.toLocaleString("en-IN")}
                  </p>
                  <p style="margin:20px 0 0;padding:12px 14px;background:#f6f0e4;border-radius:10px;font-size:12px;color:#7a6a4f">
                    This is a demo confirmation from the hackathon build — no real
                    payment was processed.
                  </p>
                </div>
              </div>
            </div>`,
        }),
      });
      const ok = res.ok;
      return {
        sent: ok,
        mode: ok ? ("live" as const) : ("error" as const),
        message: ok
          ? "Confirmation email sent."
          : `Resend rejected the send (HTTP ${res.status}). Verify the sender domain in Resend.`,
      };
    } catch (err) {
      return {
        sent: false,
        mode: "error" as const,
        message: err instanceof Error ? err.message : "Unknown email error",
      };
    }
  },
});
