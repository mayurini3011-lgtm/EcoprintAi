import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/security/StatCard";
import { PaletteSwatches } from "@/components/garment/PaletteSwatches";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  Bot,
  FlaskConical,
  Leaf,
  Palette,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router";
import { formatDate, formatINR } from "@/lib/format";

export default function Overview() {
  const analyses = useQuery(api.analysis.listAnalyses);
  const designs = useQuery(api.designsData.listSavedDesigns);
  const dyes = useQuery(api.catalog.listDyes);

  const rows = analyses ?? [];
  const total = rows.length;
  const avgRetention = total
    ? Math.round(rows.reduce((s, r) => s + r.retention, 0) / total)
    : 0;
  const avgSustain = total
    ? Math.round(rows.reduce((s, r) => s + r.sustainabilityScore, 0) / total)
    : 0;

  // Best performing dye by average retention (min 1 analysis).
  const byDye = new Map<string, { sum: number; n: number }>();
  for (const r of rows) {
    const cur = byDye.get(r.dye) ?? { sum: 0, n: 0 };
    cur.sum += r.retention;
    cur.n += 1;
    byDye.set(r.dye, cur);
  }
  const bestDye = [...byDye.entries()]
    .filter(([, v]) => v.n >= 1)
    .sort((a, b) => b[1].sum / b[1].n - a[1].sum / a[1].n)[0]?.[0] ?? "—";

  // Retention vs wash cycles (aggregated).
  const byWashes = new Map<number, { sum: number; n: number }>();
  for (const r of rows) {
    const cur = byWashes.get(r.washes) ?? { sum: 0, n: 0 };
    cur.sum += r.retention;
    cur.n += 1;
    byWashes.set(r.washes, cur);
  }
  const chartData = [...byWashes.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([washes, v]) => ({
      washes: `${washes} wash`,
      retention: Math.round(v.sum / v.n),
    }));

  const recent = rows.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            EcoPrint AI · Overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Your textile intelligence dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyze fabrics, predict retention, generate designs and track
            everything in one place.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/analyze">
            <FlaskConical className="size-4" /> Analyze a fabric
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard icon={FlaskConical} label="Total Analyses" value={total} tone="default" />
        <StatCard icon={TrendingUp} label="Avg Retention" value={`${avgRetention}%`} tone="success" />
        <StatCard icon={Leaf} label="Best Dye" value={bestDye} tone="info" />
        <StatCard icon={Palette} label="Designs Generated" value={designs?.length ?? 0} tone="warning" />
        <StatCard icon={Sparkles} label="Sustainability" value={`${avgSustain}/100`} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Retention trend */}
        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Average retention by wash cycles</CardTitle>
            <CardDescription>
              Aggregated across all EcoPrint analyses (simulated predictions).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Run your first fabric analysis to see the trend.
              </p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ovGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="washes" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12, background: "var(--card)" }}
                      formatter={(value) => [`${value}%`, "Avg retention"]}
                    />
                    <Area type="monotone" dataKey="retention" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#ovGradient)" dot={{ r: 3.5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent analyses */}
        <Card className="shadow-none border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent analyses</CardTitle>
              <CardDescription>Latest fabric color-retention results.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/history">
                View all <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {recent.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No analyses yet — upload a fabric to get started.
              </p>
            )}
            {recent.map((r) => (
              <Link
                key={r._id}
                to={`/reports?id=${r._id}`}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-background p-3 transition-colors hover:border-primary/40"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-border" style={{ background: r.initialHex }}>
                  <span className="sr-only">Colour swatch</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {r.dye} on {r.fabric}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.pattern} · {r.washes} wash(es) · {formatDate(r.createdAt)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">{r.retention}%</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: FlaskConical,
            title: "Fabric Analysis",
            text: "Upload a fabric photo and predict color retention, dyeing conditions and more.",
            to: "/analyze",
          },
          {
            icon: Palette,
            title: "AI Design Studio",
            text: "Generate natural-dye textile designs from a prompt, fabric, dye and pattern.",
            to: "/design-studio",
          },
          {
            icon: Bot,
            title: "AI Assistant",
            text: "Ask about dyes, mordants, wash cycles — or have your latest result explained.",
            to: "/assistant",
          },
        ].map((a) => (
          <Link
            key={a.title}
            to={a.to}
            className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <a.icon className="size-5" />
            </span>
            <p className="mt-3 text-sm font-semibold">{a.title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{a.text}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
              Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      {/* Demo library strip */}
      {(dyes ?? []).length > 0 && (
        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Natural dye library preview</CardTitle>
            <CardDescription>Every dye is traceable to its farmer and manufacturer.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              {(dyes ?? []).slice(0, 8).map((d) => (
                <Link
                  key={d.code}
                  to={`/dyes/${d.code}`}
                  className="flex items-center gap-2 rounded-full border border-border/70 bg-background py-1.5 pl-1.5 pr-3 text-xs font-medium transition-colors hover:border-primary/40"
                >
                  <span className="size-5 rounded-full ring-1 ring-border" style={{ background: d.colorHex }} />
                  {d.name}
                </Link>
              ))}
              <Link to="/dye-library" className="text-xs font-medium text-primary hover:underline">
                Open the library →
              </Link>
            </div>
            <div className="mt-3">
              <PaletteSwatches palette={(dyes ?? []).slice(0, 8).map((d) => ({ name: d.name, hex: d.colorHex }))} size="sm" />
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-[11px] text-muted-foreground">
        {formatINR(0)} · All predictions are simulated demo values unless a
        lab/ML backend is connected. See Pricing for plan details.
      </p>
    </div>
  );
}
