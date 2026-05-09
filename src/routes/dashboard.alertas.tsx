import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { ALERTS, COMMUNITIES, riskColor } from "@/lib/communities";

export const Route = createFileRoute("/dashboard/alertas")({
  head: () => ({
    meta: [
      { title: "Alertas — Sayariy CropGuard" },
      { name: "description", content: "Histórico de alertas generadas por CropGuard." },
    ],
  }),
  component: AlertasPage,
});

function AlertasPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Alertas</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          Histórico de alertas
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Resúmenes generados a partir de los índices satelitales y la salida del modelo
          predictivo. Pensados para equipos de campo.
        </p>

        <div className="mt-8 space-y-4">
          {ALERTS.map((a) => {
            const community = COMMUNITIES.find((c) => c.id === a.communityId);
            return (
              <article key={a.id} className="rounded-xl border border-border/60 bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${riskColor(a.level)}`}>
                      riesgo {a.level}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {community?.name ?? a.communityId}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.date}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.message}</p>
              </article>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
