import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { ForecastDay } from "@/lib/cropguard-api";

interface ForecastChartProps {
  days: ForecastDay[] | null | undefined;
}

const DAY_ABBR: Record<number, string> = {
  0: "Dom",
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
};

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return DAY_ABBR[d.getDay()] ?? dateStr.slice(5);
}

interface ChartPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: ChartPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-medium tabular-nums">{p.value.toFixed(1)} mm</span>
        </p>
      ))}
    </div>
  );
}

export function ForecastChart({ days }: ForecastChartProps) {
  if (!days || days.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="mb-1 text-lg font-bold text-foreground">
          🌦️ Lluvia vs Evaporación — 7 días
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Si la barra azul supera la línea naranja, las plantas tienen agua suficiente
        </p>
        <div className="animate-pulse h-[220px] w-full rounded-lg bg-secondary/60" />
      </div>
    );
  }

  const chartData = days.map((d) => ({
    day: formatDay(d.date),
    "Lluvia (mm)": d.rain_mm,
    "Evaporación (mm)": d.et0_mm,
  }));

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <h2 className="mb-1 text-lg font-bold text-foreground">
        🌦️ Lluvia vs Evaporación — 7 días
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Si la barra azul supera la línea naranja, las plantas tienen agua suficiente
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Lluvia mm",
              angle: -90,
              position: "insideLeft",
              offset: 16,
              style: { fontSize: 10, fill: "currentColor", opacity: 0.5 },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "Evaporación",
              angle: 90,
              position: "insideRight",
              offset: 16,
              style: { fontSize: 10, fill: "currentColor", opacity: 0.5 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            yAxisId="left"
            dataKey="Lluvia (mm)"
            fill="#3b82f6"
            radius={[3, 3, 0, 0]}
            maxBarSize={32}
          />
          <Line
            yAxisId="right"
            dataKey="Evaporación (mm)"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
