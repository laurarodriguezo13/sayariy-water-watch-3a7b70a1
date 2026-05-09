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
import { ALERTS, getCommunity, mockTimeSeries, riskColor } from "@/lib/communities";

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
  loader: ({ params }) => {
    const community = getCommunity(params.id);
    if (!community) throw notFound();
    return { community };
  },
  notFoundComponent: NotFound,
  errorComponent: ({ error }) => (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">No se pudo cargar la comunidad</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </SiteShell>
  ),
  component: ComunidadDetail,
});

function NotFound() {
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

function ComunidadDetail() {
  const { community } = Route.useLoaderData();
  const series = mockTimeSeries(community.name.length);
  const alerts = ALERTS.filter((a) => a.communityId === community.id);

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
          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${riskColor(community.risk)}`}>
            riesgo {community.risk}
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <MetricCard label="NDVI" value={community.ndvi.toFixed(2)} hint="Vegetación" />
          <MetricCard label="NDWI" value={community.ndwi.toFixed(2)} hint="Humedad" />
          <MetricCard label="EVI" value={community.evi.toFixed(2)} hint="Vigor" />
        </div>

        <div className="mt-10 rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Series temporales (12 semanas)</h2>
            <span className="text-xs text-muted-foreground">
              Prob. de estrés a 2–4 sem: {Math.round(community.stressProbability * 100)}%
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <RLineChart data={series} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
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
                <Line type="monotone" dataKey="EVI" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
              </RLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <h2 className="mt-12 text-xl font-semibold text-foreground">Alertas</h2>
        {alerts.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Sin alertas activas para esta comunidad.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {alerts.map((a) => (
              <article key={a.id} className="rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${riskColor(a.level)}`}>
                    riesgo {a.level}
                  </span>
                  <span className="text-xs text-muted-foreground">{a.date}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.message}</p>
              </article>
            ))}
          </div>
        )}
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
