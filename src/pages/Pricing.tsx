import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLANS } from "@/convex/constants";
import { Check, CreditCard, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Pricing() {
  const navigate = useNavigate();

  const handleCta = (planId: string, cta: string) => {
    if (planId === "free") {
      toast.success("Free plan selected — you're already on it.");
      navigate("/dashboard");
      return;
    }
    if (cta === "Contact Sales") {
      toast("Sales is a demo — email sales@ecoprint.ai to talk.");
      return;
    }
    navigate(`/checkout/plan?plan=${planId}`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          EcoPrint AI · Pricing
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          Simple plans for makers & studios
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Start free. Upgrade when you need unlimited analysis, the full AI
          assistant and advanced reports. Payments run in demo mode — no real
          money is charged.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "relative flex flex-col shadow-none border-border/70",
              plan.id === "pro" && "border-primary/60 ring-2 ring-primary/20",
            )}
          >
            {plan.id === "pro" && (
              <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground">
                <Sparkles className="size-3" /> MOST POPULAR
              </span>
            )}
            <CardHeader>
              <CardTitle className="text-sm tracking-wide">{plan.name}</CardTitle>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold">
                  ₹{plan.price}
                </span>
                <span className="text-xs text-muted-foreground">{plan.period}</span>
              </div>
              <CardDescription>{plan.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                variant={plan.id === "pro" ? "default" : "outline"}
                onClick={() => handleCta(plan.id, plan.cta)}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-none border-dashed border-border/70">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Demo Payment Mode</p>
              <p className="text-xs text-muted-foreground">
                Checkout is simulated for the hackathon. Connect Razorpay via
                RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to accept real payments.
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer">
              Razorpay dashboard
            </a>
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-[11px] text-muted-foreground">
        GST (18%) is added at checkout. Prices in INR. Educational demo — no
        subscription is actually activated.
      </p>
    </div>
  );
}
