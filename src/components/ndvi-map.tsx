import { lazy, Suspense, useState, useEffect } from "react";
import type { Community } from "@/lib/cropguard-api";

const NdviMapInner = lazy(() => import("./ndvi-map-inner"));

type IndexKey = "ndvi" | "ndwi" | "stress";

const INDEX_LABELS: Record<IndexKey, string> = {
  ndvi: "NDVI",
  ndwi: "NDWI",
  stress: "Estrés %",
};

const LEGEND: { ndvi: { color: string; label: string }[]; ndwi: { color: string; label: string }[]; stress: { color: string; label: string }[] } = {
  ndvi: [
    { color: "#2d6a2d", label: "≥ 0.65 — excelente" },
    { color: "#5aaa3a", label: "0.55-0.65 — buena" },
    { color: "#a8c83a", label: "0.45-0.55 — regular" },
    { color: "#d4b800", label: "0.35-0.45 — baja" },
    { color: "#e07020", label: "< 0.35 — crítica" },
  ],
  ndwi: [
    { color: "#1a6fa8", label: "≥ 0.10 — húmedo" },
    { color: "#5aa8d4", label: "0.00-0.10 — normal" },
    { color: "#a8cce0", label: "-0.10-0.00 — seco" },
    { color: "#e0c87a", label: "-0.20 - -0.10 — muy seco" },
    { color: "#d45a2a", label: "< -0.20 — crítico" },
  ],
  stress: [
    { color: "#2d6a2d", label: "≤ 30% — saludable" },
    { color: "#a8c83a", label: "30-45% — vigilancia" },
    { color: "#e07020", label: "45-60% — alerta" },
    { color: "#cc2200", label: "> 60% — crítico" },
  ],
};

function MapSkeleton() {
  return <div className="h-[340px] w-full animate-pulse rounded-xl bg-secondary/60" />;
}

interface NdviMapProps {
  communities: Community[] | null | undefined;
}

export function NdviMap({ communities }: NdviMapProps) {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState<IndexKey>("ndvi");
  useEffect(() => { setMounted(true); }, []);

  const comm = communities ?? [];

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-bold text-foreground">🗺️ Mapa de Salud de Cultivos</h2>
        <div className="flex gap-1">
          {(Object.keys(INDEX_LABELS) as IndexKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setIndex(k)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                index === k
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {INDEX_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      {mounted ? (
        <Suspense fallback={<MapSkeleton />}>
          <NdviMapInner communities={comm} index={index} />
        </Suspense>
      ) : (
        <MapSkeleton />
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {LEGEND[index].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Haga clic en cada zona para ver detalles · Sentinel-2 CDSE · © OpenStreetMap contributors
      </p>
    </div>
  );
}
