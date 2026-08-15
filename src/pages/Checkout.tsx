import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLANS } from "@/convex/constants";
import { useAction } from "convex/react";
import { BadgeCheck, CreditCard, Landmark, Loader2, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone, hint: "GPay · PhonePe · Paytm" },
  { id: "card", label: "Credit Card", icon: CreditCard, hint: "Visa · Mastercard" },
  { id: "debit", label: "Debit Card", icon: Wallet, hint: "RuPay · Maestro" },
  { id: "netbanking", label: "Net Banking", icon: Landmark, hint: "All major banks" },
] as const;

export default function Checkout() {
  const [params] = useSearchParams();
  const planId = params.get("plan") ?? "pro";
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[1];

  const createOrder = useAction(api.payments.createOrder);
  const verifyPayment = useAction(api.payments.verifyPayment);

  const [method, setMethod] = useState<string>("upi");
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState<{
    orderId: string;
    total: number;
    demo: boolean;
    message: string;
  } | null>(null);
  const navigate = useNavigate();

  const subtotal = plan.price;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const handlePay = async () => {
    setPaying(true);
    try {
      const order = await createOrder({ planId: plan.id });
      const verified = await verifyPayment({
        orderId: order.orderId,
        razorpayPaymentId: undefined,
        razorpaySignature: undefined,
      });
      if (verified.demo) {
        // Demo transaction — store the demo plan locally so Account can show it.
        try {
          localStorage.setItem("ecoprint_plan", JSON.stringify({ plan: plan.id, at: Date.now() }));
        } catch {
          // storage unavailable — ignore
        }
        setSuccess({
          orderId: order.orderId,
          total: order.total,
          demo: true,
          message: "Demo transaction — no real money was charged.",
        });
      } else {
        toast.success("Payment verified.");
        setSuccess({ orderId: order.orderId, total: order.total, demo: false, message: verified.message });
      }
    } catch {
      toast.error("Payment could not be completed. Demo Mode is available for the hackathon.");
      setPaying(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="shadow-none border-emerald-400/40">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <BadgeCheck className="size-9" />
            </span>
            <div>
              <h1 className="text-xl font-semibold">Payment Successful — {success.demo ? "Demo Transaction" : "Verified"}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.name} plan · {formatINR(success.total)} · Order {success.orderId}
              </p>
            </div>
            <div className="w-full rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-800">
              {success.message}
            </div>
            <p className="text-[11px] leading-5 text-muted-foreground">
              In this demo no subscription is activated and no card is charged.
              When Razorpay credentials are configured, this flow creates a real
              order and verifies the payment signature server-side.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/dashboard")}>Go to dashboard</Button>
              <Button variant="outline" asChild>
                <Link to="/pricing">Back to pricing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          EcoPrint AI · Checkout
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Complete your upgrade
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Razorpay-ready checkout. In demo mode the payment is simulated and
          clearly labelled — no real money moves.
        </p>
      </div>

      <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-800">
        Demo Payment Mode — simulated checkout for the hackathon demonstration.
      </div>

      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        {/* Payment methods */}
        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Payment method</CardTitle>
            <CardDescription>Select how you'd like to pay (demo).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                  method === m.id ? "border-primary bg-primary/5" : "border-border/70 hover:bg-muted/50",
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <m.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{m.label}</span>
                  <span className="block text-[10px] text-muted-foreground">{m.hint}</span>
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Order summary */}
        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <Row label="Plan" value={`${plan.name} — ${plan.tagline}`} />
            <Row label="Billing cycle" value={plan.period === "forever" ? "One-time (free)" : "Monthly"} />
            <Row label="Subtotal" value={formatINR(subtotal)} />
            <Row label="GST (18%)" value={formatINR(gst)} />
            <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-base font-semibold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
            <Button className="mt-3 w-full gap-2" onClick={() => void handlePay()} disabled={paying}>
              {paying ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              {paying ? "Processing…" : "Pay " + formatINR(total)}
            </Button>
            <p className="text-[10px] leading-4 text-muted-foreground">
              No real payment is processed in demo mode. Razorpay integration is
              wired server-side and activates when RAZORPAY_KEY_ID /
              RAZORPAY_KEY_SECRET are configured.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
