import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { TimeseriesPoint } from "@/lib/cropguard-api";

interface CommunityTS {
  id: string;
  name: string;
  data: TimeseriesPoint[];
}

interface StressTimeseriesProps {
  series: CommunityTS[];
  isLoading?: boolean;
}

const COMMUNITY_COLORS: Record<string, string> = {
  "cayalti":        "#1f2937",
  "victor-raul":    "#7c3aed",
  "monsefu":        "#059669",
  "reque":          "#dc2626",
  "nueva-libertad": "#d97706",
};

type MergedPoint = Record<string, string | number>;

function mergeSeries(series: CommunityTS[]): MergedPoint[] {
  const byDate = new Map<string, MergedPoint>();

  for (const { id, data } of series) {
    for (const pt of data) {
      if (!byDate.has(pt.date)) {
        byDate.set(pt.date, { date: pt.date });
      }
      byDate.get(pt.date)![id] = pt.stress_prob;
    }
  }

  return Array.from(byDate.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-PE", { month: "short", day: "numeric" });
}

function Skeleton() {
  return <div className="h-[260px] w-full animate-pulse rounded-xl bg-secondary/60" />;
}

export function StressTimeseries({ series, isLoading }: StressTimeseriesProps) {
  if (isLoading || !series.length) return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
      <h2 className="text-lg font-bold text-foreground">📈 Serie temporal de estrés por cultivo</h2>
      <Skeleton />
    </div>
  );

  const merged = mergeSeries(series);
  const step = Math.max(1, Math.floor(merged.length / 8));

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
      <h2 className="text-lg font-bold text-foreground">📈 Serie temporal de estrés — todas las comunidades</h2>
      <p className="text-xs text-muted-foreground">
        Probabilidad de estrés hídrico por comunidad a lo largo del tiempo (Sentinel-2, modelos de IA)
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={merged} margin={{ top: 4, right: 12, left: -20, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickFormatter={formatDate}
            interval={step - 1}
          />
          <YAxis
            domain={[0.2, 0.85]}
            tickFormatter={(v) => `${Math.round((v as number) * 100)}%`}
            tick={{ fontSize: 10, fill: "#6b7280" }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${Math.round(value * 100)}%`,
              series.find((s) => s.id === name)?.name ?? name,
            ]}
            labelFormatter={formatDate}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend
            formatter={(value) => series.find((s) => s.id === value)?.name ?? value}
            wrapperStyle={{ fontSize: 11 }}
          />
          {series.map(({ id }) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              stroke={COMMUNITY_COLORS[id] ?? "#9ca3af"}
              dot={false}
              strokeWidth={1.8}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="text-center text-xs text-muted-foreground">
        Ordenado por fecha · Datos: Sentinel-2 CDSE + modelo Random Forest
      </p>
    </div>
  );
}
