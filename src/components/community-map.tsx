import { Link } from "@tanstack/react-router";
import type { Community } from "@/lib/cropguard-api";

interface CommunityMapProps {
  communities: Community[] | null | undefined;
}

function statusDot(status: Community["status"], stress: number): string {
  if (status === "alert" || stress > 0.6) return "bg-red-500";
  if (status === "watch" || stress > 0.4) return "bg-amber-400";
  if (status === "no_data") return "bg-gray-400";
  return "bg-green-500";
}

function statusRing(status: Community["status"], stress: number): string {
  if (status === "alert" || stress > 0.6) return "ring-red-300";
  if (status === "watch" || stress > 0.4) return "ring-amber-300";
  if (status === "no_data") return "ring-gray-300";
  return "ring-green-300";
}

function statusLabel(status: Community["status"], stress: number): string {
  if (status === "alert" || stress > 0.6) return "En alerta";
  if (status === "watch" || stress > 0.4) return "En vigilancia";
  if (status === "no_data") return "Sin datos";
  return "Saludable";
}

function ndviLabel(v: number): string {
  if (v >= 0.55) return "buena";
  if (v >= 0.35) return "regular";
  return "baja";
}

function CommunityCardItem({ c }: { c: Community }) {
  const dot = statusDot(c.status, c.stress_probability);
  const ring = statusRing(c.status, c.stress_probability);
  const ndviPct = Math.min(100, Math.max(0, c.ndvi * 100));
  const stressPct = Math.round(c.stress_probability * 100);

  return (
    <Link
      to="/dashboard/comunidad/$id"
      params={{ id: c.id }}
      className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 transition hover:bg-secondary/30 hover:shadow-sm active:brightness-95"
    >
      {/* Status circle */}
      <div className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded-full ring-2 ring-offset-1 ${dot} ${ring}`} />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-foreground">{c.name}</p>
        <p className="text-xs text-muted-foreground">{c.province}</p>

        {/* NDVI progress bar */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Vegetación (NDVI): <span className="font-medium text-foreground">{ndviLabel(c.ndvi)}</span></span>
            <span className="tabular-nums">{c.ndvi.toFixed(2)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${ndviPct}%` }}
            />
          </div>
        </div>

        {/* Stress probability */}
        <p className="mt-1.5 text-xs font-medium text-muted-foreground">
          Estrés:{" "}
          <span
            className={
              stressPct > 60
                ? "text-red-600 font-bold"
                : stressPct > 40
                ? "text-amber-600 font-semibold"
                : "text-green-600"
            }
          >
            {stressPct}%
          </span>
        </p>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-secondary/60" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-secondary/60" />
          <div className="h-3 w-1/2 rounded bg-secondary/40" />
          <div className="h-1.5 w-full rounded-full bg-secondary/40" />
        </div>
      </div>
    </div>
  );
}

export function CommunityMap({ communities }: CommunityMapProps) {
  const sorted = communities
    ? [...communities].sort((a, b) => b.stress_probability - a.stress_probability)
    : null;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <h2 className="mb-4 text-lg font-bold text-foreground">
        🗺️ Comunidades monitoreadas
      </h2>

      {!sorted ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No hay comunidades disponibles en este momento.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((c) => (
            <CommunityCardItem key={c.id} c={c} />
          ))}
        </div>
      )}

      {sorted && sorted.length > 0 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Ordenadas por mayor riesgo de estrés · Toque para ver el historial →
        </p>
      )}
    </div>
  );
}
