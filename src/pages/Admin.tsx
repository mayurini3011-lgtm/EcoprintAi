import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/security/StatCard";
import { StatusPill } from "@/components/garment/PaletteSwatches";
import { useQuery } from "convex/react";
import {
  Activity,
  Factory,
  Layers,
  Package,
  Scissors,
  ShieldCheck,
  Siren,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDateTime } from "@/lib/format";

const STATUS_COLORS = ["#10b981", "#f59e0b", "#f43f5e", "#6366f1", "#14b8a6"];

export default function Admin() {
  const stats = useQuery(api.admin.adminStats);

  const totals = stats?.totals;
  const charts = stats?.charts;

  const eventsByMonth = Object.entries(charts?.eventsByMonth ?? {}).map(
    ([name, value]) => ({ name, value }),
  );
  const eventsByStage = Object.entries(charts?.eventsByStage ?? {}).map(
    ([name, value]) => ({ name, value }),
  );
  const ordersByStatus = Object.entries(charts?.ordersByStatus ?? {}).map(
    ([name, value]) => ({ name, value }),
  );
  const riskLevels = Object.entries(charts?.riskLevels ?? {}).map(
    ([name, value]) => ({ name, value: Number(value) }),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          Admin Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Platform overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live counts across the supply chain, plus verification and risk
          telemetry.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={Users} label="Total users" value={totals?.users ?? "…"} />
        <StatCard icon={Sprout} label="Farmers" value={totals?.farmers ?? "…"} tone="success" />
        <StatCard icon={Factory} label="Manufacturers" value={totals?.manufacturers ?? "…"} tone="info" />
        <StatCard icon={Scissors} label="Tailors" value={totals?.tailors ?? "…"} />
        <StatCard icon={Package} label="Orders" value={totals?.orders ?? "…"} />
        <StatCard icon={Layers} label="Dye batches" value={totals?.dyes ?? "…"} tone="info" />
        <StatCard icon={Sparkles} label="Garments" value={totals?.garments ?? "…"} />
        <StatCard icon={ShieldCheck} label="Verified records" value={totals?.verifiedRecords ?? "…"} tone="success" />
        <StatCard icon={Siren} label="Suspicious records" value={totals?.suspiciousRecords ?? "…"} tone="danger" />
        <StatCard icon={Activity} label="Open alerts" value={totals?.openAlerts ?? "…"} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-sm">Supply-chain activity</CardTitle>
            <CardDescription>Events sealed per month</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={28} />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-sm">Verification status</CardTitle>
            <CardDescription>Supply-chain records by stage</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventsByStage}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {eventsByStage.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-sm">AI risk levels</CardTitle>
            <CardDescription>Scanned entities by risk band</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskLevels} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                  width={56}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {riskLevels.map((r, i) => (
                    <Cell
                      key={i}
                      fill={
                        r.name === "high"
                          ? "#f43f5e"
                          : r.name === "medium"
                            ? "#f59e0b"
                            : "#10b981"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-sm">Orders by status</CardTitle>
            <CardDescription>Order fulfilment distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" interval={0} angle={-18} textAnchor="end" height={44} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={28} />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="value" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-sm">Audit log</CardTitle>
            <CardDescription>
              Append-only record of security-relevant actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuditLogTable />
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/70">
          <CardHeader>
            <CardTitle className="text-sm">Open security alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { t: "Suspicious documentation", code: "FARM-NEM-2026-001", s: "high" },
              { t: "AI risk scan flagged garment", code: "NF-2026-000119", s: "high" },
              { t: "Duplicate certification number", code: "DYE-NEM-2026-001", s: "medium" },
            ].map((a) => (
              <div key={a.code} className="rounded-lg border border-border/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusPill status={a.s} />
                  <Badge variant="outline" className="text-[9px]">
                    OPEN
                  </Badge>
                </div>
                <p className="mt-1.5 text-xs font-medium">{a.t}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {a.code}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AuditLogTable() {
  const audits = useQuery(api.catalog.listAuditLogs);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Action</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead className="hidden sm:table-cell">Actor</TableHead>
          <TableHead className="text-right">Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(audits ?? []).slice(0, 8).map((log, i) => (
          <TableRow key={i}>
            <TableCell className="text-xs font-medium capitalize">
              {log.action.replace(/_/g, " ")}
            </TableCell>
            <TableCell className="font-mono text-[10px] text-muted-foreground">
              {log.entityCode}
            </TableCell>
            <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
              {log.actor}
            </TableCell>
            <TableCell className="text-right text-[11px] text-muted-foreground">
              {formatDateTime(log.timestamp)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
