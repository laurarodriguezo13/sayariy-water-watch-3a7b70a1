import { lazy, Suspense, useState, useEffect } from "react";

const WellsMapInner = lazy(() => import("./wells-map-inner"));

function MapSkeleton() {
  return <div className="h-[300px] w-full animate-pulse rounded-xl bg-secondary/60" />;
}

export function WellsMap() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
      <h2 className="text-lg font-bold text-foreground">🗺️ Pozos Sayariy en Cayaltí</h2>
      <p className="text-xs text-muted-foreground">
        Pozo 1 principal (azul) · Pozo 2 ASR de respaldo (naranja). Haga clic en los marcadores para más información.
      </p>
      {mounted ? (
        <Suspense fallback={<MapSkeleton />}>
          <WellsMapInner />
        </Suspense>
      ) : (
        <MapSkeleton />
      )}
      <p className="text-xs text-muted-foreground text-center">
        WGS84 — Cayaltí, Chiclayo, Lambayeque, Perú · © OpenStreetMap contributors
      </p>
    </div>
  );
}
