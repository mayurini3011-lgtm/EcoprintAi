import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function WashChart({
  curve,
  initialHex,
  afterHex,
}: {
  curve: { washes: number; retention: number }[];
  initialHex: string;
  afterHex: string;
}) {
  const data = curve.map((p) => ({ ...p, label: `${p.washes}` }));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-medium">Retention across wash cycles</p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full ring-1 ring-border" style={{ background: initialHex }} />
            Initial
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full ring-1 ring-border" style={{ background: afterHex }} />
            After {data[data.length - 1]?.washes ?? 30} washes
          </span>
        </div>
      </div>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="washGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                fontSize: 12,
                background: "var(--card)",
              }}
              formatter={(value) => [`${value}% retention`, "Predicted"]}
              labelFormatter={(label) => `${label} wash cycle(s)`}
            />
            <Area
              type="monotone"
              dataKey="retention"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              fill="url(#washGradient)"
              dot={{ r: 3.5, fill: "var(--chart-1)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Simulated projection from the EcoPrint retention model — validate with
        physical wash tests before production use.
      </p>
    </div>
  );
}
