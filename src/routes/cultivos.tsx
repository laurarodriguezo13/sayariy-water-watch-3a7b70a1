/**
 * /cultivos — Estado de los cultivos, para trabajadores de campo.
 *
 * Sin índices técnicos ni jerga. Muestra:
 * - Estado de salud de cada comunidad en colores simples
 * - Qué plantar y qué cuidar según el ICEN / El Niño actual
 * - Consejos prácticos por cultivo
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { useCommunities, useCrops, useEnso } from "@/hooks/use-cropguard";
import type { Community, CropRec } from "@/lib/cropguard-api";

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

// ── Community health card ──────────────────────────────────────────────────────

function communityLabel(c: Community): { emoji: string; text: string; bg: string } {
  if (c.status === "alert" || c.stress_probability > 0.6) {
    return { emoji: "🔴", text: "Cultivos en estrés — actúe ahora", bg: "bg-red-50 border-red-200" };
  }
  if (c.status === "watch" || c.stress_probability > 0.4) {
    return { emoji: "🟡", text: "Monitoree esta semana", bg: "bg-amber-50 border-amber-200" };
  }
  return { emoji: "🟢", text: "Cultivos sanos", bg: "bg-green-50 border-green-200" };
}

function CommunityCard({ c }: { c: Community }) {
  const label = communityLabel(c);
  return (
    <Link
      to="/dashboard/comunidad/$id"
      params={{ id: c.id }}
      className={`block rounded-xl border p-4 transition hover:brightness-95 ${label.bg}`}
    >
      <div className="flex items-center justify-between">
        <div className="font-bold text-foreground text-lg">{c.name}</div>
        <span className="text-2xl">{label.emoji}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{label.text}</p>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span>Vegetación: <strong>{ndviLabel(c.ndvi)}</strong></span>
        <span>Humedad: <strong>{ndwiLabel(c.ndwi)}</strong></span>
      </div>
    </Link>
  );
}

function ndviLabel(v: number): string {
  if (v >= 0.55) return "buena";
  if (v >= 0.35) return "regular";
  return "baja";
}
function ndwiLabel(v: number): string {
  if (v >= 0.10) return "buena";
  if (v >= -0.05) return "regular";
  return "seca";
}

// ── ENSO context banner ───────────────────────────────────────────────────────

function EnsoBanner({
  label,
  anom,
  risk,
}: {
  label: string;
  anom: number;
  risk: string;
}) {
  const active = label !== "Normal";
  if (!active) return null;
  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">🌊</span>
        <div>
          <div className="font-bold text-amber-900 text-lg">El Niño Costero activo</div>
          <div className="text-sm text-amber-800">
            ICEN {anom > 0 ? "+" : ""}{anom.toFixed(2)}°C — {label}
          </div>
        </div>
      </div>
      <p className="text-sm text-amber-900 leading-relaxed">{risk}</p>
    </div>
  );
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
  const { data: enso } = useEnso();

  return (
    <SiteShell>
      <section className="mx-auto max-w-lg px-4 py-8 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Cultivos</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Estado de los cultivos
          </h1>
        </div>

        {/* ENSO context */}
        {enso && (
          <EnsoBanner
            label={enso.icen.label_es}
            anom={enso.icen.anom_c}
            risk={enso.icen.risk_es}
          />
        )}

        {/* Community health */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-3">
            🗺️ Comunidades monitoreadas
          </h2>
          {commLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              {(communities ?? []).map((c) => (
                <CommunityCard key={c.id} c={c} />
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Toque una comunidad para ver el detalle histórico →
          </p>
        </div>

        {/* Crop recommendations */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-3">
            🌿 ¿Qué plantar y qué cuidar ahora?
          </h2>
          {cropsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : crops ? (
            <div className="space-y-3">
              {crops.map((r) => (
                <CropRecCard key={r.crop} rec={r} />
              ))}
            </div>
          ) : null}
        </div>

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
