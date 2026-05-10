/**
 * /recomendaciones — Recomendaciones detalladas de cultivo.
 *
 * Versión técnica/estructurada de "qué plantar y qué cuidar", separada de la
 * Vista Simple. Pensada para equipo NGO y técnicos.
 */
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { EnsoCard } from "@/components/enso-card";
import { useCrops, useEnso, useStatus } from "@/hooks/use-cropguard";
import type { CropRec } from "@/lib/cropguard-api";

export const Route = createFileRoute("/recomendaciones")({
  head: () => ({
    meta: [
      { title: "Recomendaciones de Cultivo — Sayariy CropGuard" },
      {
        name: "description",
        content:
          "Recomendaciones detalladas de manejo de cultivos según el estado climático y satelital actual.",
      },
    ],
  }),
  component: RecomendacionesPage,
});

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-secondary/60 ${className ?? "h-24 w-full"}`} />;
}

const SEVERITY_LABEL: Record<string, string> = {
  green: "Favorable",
  yellow: "Atención",
  red: "Riesgo alto",
};

function CropRecCard({ rec }: { rec: CropRec }) {
  const styles: Record<string, string> = {
    green: "bg-green-50 border-green-200",
    yellow: "bg-amber-50 border-amber-200",
    red: "bg-red-50 border-red-200",
  };
  const accent: Record<string, string> = {
    green: "bg-green-500 text-white",
    yellow: "bg-amber-500 text-white",
    red: "bg-red-500 text-white",
  };
  const icons: Record<string, string> = {
    green: "🌿",
    yellow: "⚠️",
    red: "🚫",
  };
  return (
    <article className={`rounded-2xl border p-5 ${styles[rec.severity] ?? "bg-card border-border/60"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-base font-bold text-foreground">
          <span className="text-xl">{icons[rec.severity] ?? "🌱"}</span>
          <span className="uppercase tracking-wide">{rec.crop}</span>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${accent[rec.severity] ?? "bg-muted text-foreground"}`}>
          {SEVERITY_LABEL[rec.severity] ?? rec.severity}
        </span>
      </div>
      <h3 className="mt-3 text-base font-semibold text-foreground">{rec.title_es}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rec.body_es}</p>
      {rec.action_es && (
        <div className="mt-3 rounded-lg border border-border/60 bg-background/70 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Acción recomendada</p>
          <p className="mt-1 text-sm font-medium text-foreground">{rec.action_es}</p>
        </div>
      )}
    </article>
  );
}

function RecomendacionesPage() {
  const { data: crops, isLoading: cropsLoading } = useCrops();
  const { data: enso, isLoading: ensoLoading } = useEnso();
  const { data: status } = useStatus();

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Manejo agronómico
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Recomendaciones de Cultivo
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Guía técnica para decidir qué sembrar y cómo cuidar cada cultivo según el
            estado climático actual, ENSO y la salud satelital de las parcelas.
          </p>
        </div>

        {status?.summary_es && (
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Contexto actual
            </p>
            <p className="mt-1 text-sm text-foreground">{status.summary_es}</p>
          </div>
        )}

        {ensoLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : enso ? (
          <EnsoCard
            icen_anom={enso.icen.anom_c}
            icen_label={enso.icen.label_es}
            icen_state={enso.icen.state}
            risk_es={enso.icen.risk_es}
            oni_anom={enso.oni.anom_c}
            oni_state={enso.oni.state}
            compact={false}
          />
        ) : null}

        <div>
          <h2 className="text-lg font-bold text-foreground mb-3">
            🌿 Recomendaciones por cultivo
          </h2>
          {cropsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : crops?.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {crops.map((r) => (
                <CropRecCard key={r.crop} rec={r} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay recomendaciones disponibles.</p>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
