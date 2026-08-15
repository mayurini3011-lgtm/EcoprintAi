import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, User as UserIcon, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

function readStoredPlan(): { plan: string; at: number } | null {
  try {
    const raw = localStorage.getItem("ecoprint_plan");
    return raw ? (JSON.parse(raw) as { plan: string; at: number }) : null;
  } catch {
    return null;
  }
}

export default function Account() {
  const { user } = useAuth();
  const [plan] = useState<{ plan: string; at: number } | null>(readStoredPlan);

  const planName =
    plan?.plan === "pro" ? "PRO" : plan?.plan === "business" ? "BUSINESS" : "FREE";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          EcoPrint AI · Account
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profile, demo plan and platform status.
        </p>
      </div>

      <Card className="shadow-none border-border/70">
        <CardContent className="flex flex-wrap items-center gap-4 p-6">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserIcon className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold">{user?.name ?? "Demo Guest"}</p>
            <p className="text-xs text-muted-foreground">
              {user?.email ?? "Anonymous demo session"}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-[10px]">
                Role: {(user?.role ?? "customer").toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {user?.isAnonymous ? "Guest session" : "Email sign-in"}
              </Badge>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/auth">Switch account</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="size-4 text-primary" /> Plan
            </CardTitle>
            <CardDescription>
              Your current plan (demo — no subscription is active).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-semibold">{planName}</p>
            {plan ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Activated in demo on {new Date(plan.at).toLocaleDateString("en-IN")}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Free tier — no demo checkout yet.</p>
            )}
            <Button asChild className="mt-4 w-full" variant={planName === "FREE" ? "default" : "outline"}>
              <Link to="/pricing">
                {planName === "FREE" ? "Upgrade" : "View plans"}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> AI status
            </CardTitle>
            <CardDescription>Honest platform status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
              <span className="text-muted-foreground">AI features</span>
              <span className="inline-flex items-center gap-1.5 font-medium text-amber-700">
                <span className="size-2 rounded-full bg-amber-500" /> Demo Mode
              </span>
            </div>
            <p className="text-[11px] leading-5 text-muted-foreground">
              The AI engine runs in demo mode until AI_API_KEY (chat) and
              AI_IMAGE_ENDPOINT (design images) are configured. No keys are ever
              exposed in the frontend.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
