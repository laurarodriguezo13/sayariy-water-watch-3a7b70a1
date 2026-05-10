import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SiteShell } from "@/components/site-shell";
import { riskColor } from "@/lib/communities";
import { useTimeseries } from "@/hooks/use-cropguard";
import { useCommunities } from "@/hooks/use-cropguard";
import type { Community } from "@/lib/cropguard-api";

export const Route = createFileRoute("/dashboard/comunidad/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Comunidad ${params.id} — Sayariy CropGuard` },
      {
        name: "description",
        content: `Detalle de monitoreo satelital para la comunidad ${params.id}: NDVI, NDWI, EVI y alertas activas.`,
      },
    ],
  }),
  component: ComunidadDetail,
});

function statusToRisk(status: Community["status"]): "bajo" | "medio" | "alto" {
  if (status === "alert") return "alto";
  if (status === "watch") return "medio";
  return "bajo";
}

function ComunidadDetail() {
  const { id } = Route.useParams();
  const { data: communities, isLoading } = useCommunities();
  const { data: series } = useTimeseries(id);

  if (isLoading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground animate-pulse">
          Cargando datos de la comunidad…
        </div>
      </SiteShell>
    );
  }

  const community = communities?.find((c) => c.id === id);
  if (!community) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Comunidad no encontrada</h1>
          <Link to="/comunidades" className="mt-4 inline-block text-primary hover:underline">
            Volver a comunidades
          </Link>
        </div>
      </SiteShell>
    );
  }

  const risk = statusToRisk(community.status);
  const chartData = (series ?? []).map((p) => ({
    week: p.date.slice(5), // MM-DD
    NDVI: p.ndvi,
    NDWI: p.ndwi,
    "Estrés": +(p.stress_prob * 100).toFixed(0),
  }));

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Link to="/dashboard" className="text-xs font-semibold uppercase tracking-widest text-primary">
          ← Panel
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{community.name}</h1>
            <p className="text-sm text-muted-foreground">{community.province}</p>
          </div>
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${riskColor(risk)}`}>
            riesgo {risk}
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <MetricCard label="NDVI" value={community.ndvi.toFixed(2)} hint="Vegetación" />
          <MetricCard label="NDWI" value={community.ndwi.toFixed(2)} hint="Humedad" />
          <MetricCard label="EVI" value={community.evi.toFixed(2)} hint="Vigor" />
        </div>

        <div className="mt-10 rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Series temporales</h2>
            <span className="text-xs text-muted-foreground">
              Prob. de estrés actual: {Math.round(community.stress_probability * 100)}%
            </span>
          </div>
          {chartData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <RLineChart data={chartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={10} interval={4} />
                  <YAxis yAxisId={0} stroke="var(--color-muted-foreground)" fontSize={12} domain={[0, 1]} />
                  <YAxis yAxisId={1} orientation="right" stroke="var(--color-muted-foreground)" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="NDVI" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="NDWI" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Estrés" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} yAxisId={1} />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground animate-pulse">
              Cargando series…
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-bold text-foreground tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
