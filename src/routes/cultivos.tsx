/**
 * /cultivos — Estado de los cultivos, para trabajadores de campo.
 *
 * Secciones:
 * 1. Encabezado de página
 * 2. EnsoCard (completo) — solo si estado != Normal
 * 3. CommunityMap — mapa de comunidades monitoreadas
 * 4. Recomendaciones de cultivo (¿Qué plantar y qué cuidar ahora?)
 */
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { EnsoCard } from "@/components/enso-card";
import { CommunityMap } from "@/components/community-map";
import { NdviMap } from "@/components/ndvi-map";
import { StressTimeseries } from "@/components/stress-timeseries";
import { useCommunities, useCrops, useEnso, useAllTimeseries } from "@/hooks/use-cropguard";
import { ReportDownloadButton } from "@/components/report-download-button";
import type { CropRec } from "@/lib/cropguard-api";

export const Route = createFileRoute("/cultivos")({
  head: () => ({
    meta: [
      { title: "Cultivos — Sayariy CropGuard" },
      {
        name: "description",
        content: "Estado de salud de los cultivos por comunidad y recomendaciones según el clima actual.",
      },
    ],
  }),
  component: CultivosPage,
});

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-secondary/60 ${className ?? "h-24 w-full"}`} />;
}

// ── Crop recommendation card ──────────────────────────────────────────────────

function CropRecCard({ rec }: { rec: CropRec }) {
  const styles: Record<string, string> = {
    green: "bg-green-50 border-green-200",
    yellow: "bg-amber-50 border-amber-200",
    red: "bg-red-50 border-red-200",
  };
  const icons: Record<string, string> = {
    green: "🌿",
    yellow: "⚠️",
    red: "🚫",
  };
  return (
    <div className={`rounded-xl border p-4 ${styles[rec.severity] ?? "bg-card border-border/60"}`}>
      <div className="flex items-center gap-2 font-bold text-foreground text-base">
        {icons[rec.severity] ?? "🌱"} {rec.title_es}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rec.body_es}</p>
      {rec.action_es && (
        <p className="mt-2 text-sm font-semibold text-foreground">→ {rec.action_es}</p>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

function CultivosPage() {
  const { data: communities, isLoading: commLoading } = useCommunities();
  const { data: crops, isLoading: cropsLoading } = useCrops();
  const { data: enso, isLoading: ensoLoading } = useEnso();
  const { data: allTimeseries, isLoading: tsLoading } = useAllTimeseries();

  const showEnso = !ensoLoading && enso && enso.icen.state !== "Normal";

  return (
    <SiteShell>
      <section className="mx-auto max-w-2xl px-4 py-8 space-y-5">
        {/* 1. Page header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Cultivos</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Estado de los cultivos
          </h1>
        </div>

        {/* 2. EnsoCard — only when state != Normal */}
        {ensoLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : showEnso ? (
          <EnsoCard
            icen_anom={enso!.icen.anom_c}
            icen_label={enso!.icen.label_es}
            icen_state={enso!.icen.state}
            risk_es={enso!.icen.risk_es}
            oni_anom={enso!.oni.anom_c}
            oni_state={enso!.oni.state}
            compact={false}
          />
        ) : null}

        {/* 3. NDVI satellite map */}
        <NdviMap communities={communities} />

        {/* 4. Community cards */}
        {commLoading ? (
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <h2 className="mb-4 text-lg font-bold text-foreground">🗺️ Comunidades monitoreadas</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-border/60 bg-card p-4 h-24" />
              ))}
            </div>
          </div>
        ) : (
          <CommunityMap communities={communities} />
        )}

        {/* 5. Stress timeseries */}
        <StressTimeseries series={allTimeseries ?? []} isLoading={tsLoading} />

        {/* 6. Link to detailed recommendations */}
        <a
          href="/recomendaciones"
          className="block rounded-2xl border border-border/60 bg-card p-4 transition hover:bg-secondary/40"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Manejo agronómico
          </p>
          <p className="mt-1 text-base font-semibold text-foreground">
            🌿 Ver recomendaciones detalladas por cultivo →
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Guía técnica completa: qué plantar, cómo regar, plagas y acciones recomendadas.
          </p>
        </a>

        {/* 7. PDF report */}
        <ReportDownloadButton />

        <p className="text-center text-xs text-muted-foreground pb-4">
          ¿Necesita más detalle técnico?{" "}
          <a
            href="https://cropguard-0k17.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Ver panel completo →
          </a>
        </p>
      </section>
    </SiteShell>
  );
}
