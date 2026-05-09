import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, MapPin, TrendingDown, Activity } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { riskColor } from "@/lib/communities";
import { useCommunities, useAlerts, useEnso } from "@/hooks/use-cropguard";
import type { Community } from "@/lib/cropguard-api";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Panel — Sayariy CropGuard" },
      {
        name: "description",
        content:
          "Panel general de monitoreo: KPIs, comunidades, alertas activas y estado del sistema CropGuard.",
      },
    ],
  }),
  component: DashboardHome,
});

function statusToRisk(status: Community["status"]): "bajo" | "medio" | "alto" {
  if (status === "alert") return "alto";
  if (status === "watch") return "medio";
  return "bajo";
}

function DashboardHome() {
  const { data: communities, isLoading: commLoading } = useCommunities();
  const { data: alerts, isLoading: alertsLoading } = useAlerts();
  const { data: enso } = useEnso();

  const highRisk = communities?.filter((c) => c.status === "alert").length ?? 0;
  const avgNdvi = communities
    ? (communities.reduce((s, c) => s + c.ndvi, 0) / communities.length).toFixed(2)
    : "—";
  const activeAlerts = alerts?.filter((a) => a.level !== "bajo").length ?? 0;

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Panel</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              Estado actual de las comunidades
            </h1>
          </div>
          <div className="flex gap-2">
            {enso && (
              <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium">
                🌊 ICEN {enso.icen.anom_c > 0 ? "+" : ""}{enso.icen.anom_c.toFixed(2)}°C
                <span className={`font-semibold ${enso.icen.state !== "Normal" ? "text-primary" : "text-green-600"}`}>
                  {enso.icen.label_es}
                </span>
              </div>
            )}
            <Link
              to="/dashboard/alertas"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              <Bell className="h-4 w-4" /> Ver alertas
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={<MapPin className="h-5 w-5" />} label="Comunidades" value={communities ? String(communities.length) : "—"} />
          <Kpi icon={<TrendingDown className="h-5 w-5" />} label="En riesgo alto" value={commLoading ? "…" : String(highRisk)} tone="danger" />
          <Kpi icon={<Activity className="h-5 w-5" />} label="NDVI promedio" value={commLoading ? "…" : avgNdvi} tone="success" />
          <Kpi icon={<Bell className="h-5 w-5" />} label="Alertas activas" value={alertsLoading ? "…" : String(activeAlerts)} tone="accent" />
        </div>

        <h2 className="mt-12 text-xl font-semibold text-foreground">Comunidades</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
          {commLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
              Cargando datos del modelo…
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Comunidad</th>
                  <th className="px-4 py-3">NDVI</th>
                  <th className="px-4 py-3">NDWI</th>
                  <th className="px-4 py-3">EVI</th>
                  <th className="px-4 py-3">Prob. estrés</th>
                  <th className="px-4 py-3">Riesgo</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-card">
                {(communities ?? []).map((c) => {
                  const risk = statusToRisk(c.status);
                  return (
                    <tr key={c.id} className="hover:bg-secondary/40">
                      <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                      <td className="px-4 py-3 tabular-nums">{c.ndvi.toFixed(2)}</td>
                      <td className="px-4 py-3 tabular-nums">{c.ndwi.toFixed(2)}</td>
                      <td className="px-4 py-3 tabular-nums">{c.evi.toFixed(2)}</td>
                      <td className="px-4 py-3 tabular-nums">{Math.round(c.stress_probability * 100)}%</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${riskColor(risk)}`}>
                          {risk}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/dashboard/comunidad/$id"
                          params={{ id: c.id }}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Detalle →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <h2 className="mt-12 text-xl font-semibold text-foreground">Alertas recientes</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {alertsLoading ? (
            <div className="col-span-2 p-6 text-center text-sm text-muted-foreground animate-pulse">
              Cargando alertas…
            </div>
          ) : (
            (alerts ?? []).map((a) => (
              <article key={a.id} className="rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${riskColor(a.level)}`}>
                    riesgo {a.level}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.message}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </SiteShell>
  );
}

function Kpi({
  icon,
  label,
  value,
  tone = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "primary" | "success" | "danger" | "accent";
}) {
  const toneClass =
    tone === "success"
      ? "text-success bg-success/10"
      : tone === "danger"
      ? "text-primary bg-primary/10"
      : tone === "accent"
      ? "text-accent-foreground bg-accent/30"
      : "text-primary bg-primary/10";
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${toneClass}`}>
        {icon}
      </div>
      <div className="mt-4 text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
