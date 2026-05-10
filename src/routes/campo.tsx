/**
 * /campo — Vista para trabajadores de campo (sin conocimiento técnico).
 *
 * Pensada para usar en el celular desde el terreno:
 * - Semáforo grande (verde / amarillo / rojo)
 * - Estado ICEN compacto (El Niño Costero)
 * - Barra del pozo (cuánta agua hay)
 * - ¿Hay que regar hoy? (sí / no / solo lo esencial)
 * - Pronóstico del tiempo 7 días en emojis
 * - Avisos importantes
 * - ¿Qué plantar y qué cuidar?
 *
 * Sin números técnicos, sin ejes, sin jerga.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { EnsoCard } from "@/components/enso-card";
import { FieldNews } from "@/components/field-news";
import { ReportDownloadButton } from "@/components/report-download-button";
import {
  useStatus,
  useWell,
  useForecast,
  useIrrigation,
  useAlerts,
  useCrops,
  useEnso,
} from "@/hooks/use-cropguard";
import type { Alert, CropRec, EnsoData, ForecastDay, Risk, StatusData } from "@/lib/cropguard-api";

export const Route = createFileRoute("/campo")({
  head: () => ({
    meta: [
      { title: "Vista Simple — Sayariy CropGuard" },
      {
        name: "description",
        content:
          "Vista simple para agricultores: estado del día, agua del pozo, clima y avisos en lenguaje claro.",
      },
    ],
  }),
  component: CampoPage,
});

// ── Traffic-light hero ────────────────────────────────────────────────────────

function TrafficLightHero({
  light,
  summary,
}: {
  light: "verde" | "amarillo" | "rojo";
  summary: string;
}) {
  const cfg = {
    verde: {
      bg: "bg-green-50 border-green-200",
      dot: "bg-green-500",
      text: "text-green-800",
      label: "TODO BIEN",
    },
    amarillo: {
      bg: "bg-amber-50 border-amber-200",
      dot: "bg-amber-400",
      text: "text-amber-800",
      label: "ATENCIÓN",
    },
    rojo: {
      bg: "bg-red-50 border-red-200",
      dot: "bg-red-500",
      text: "text-red-800",
      label: "ALERTA",
    },
  }[light];

  return (
    <div className={`rounded-2xl border-2 p-6 ${cfg.bg}`}>
      <div className="flex items-center gap-4">
        <div className={`h-14 w-14 flex-shrink-0 rounded-full ${cfg.dot} shadow-lg`} />
        <div>
          <div className={`text-3xl font-black tracking-wide ${cfg.text}`}>{cfg.label}</div>
          <p className={`mt-1 text-base font-medium ${cfg.text} opacity-80`}>{summary}</p>
        </div>
      </div>
    </div>
  );
}

// ── Well gauge ────────────────────────────────────────────────────────────────

function WellGauge({ pct, staticM }: { pct: number; staticM: number }) {
  const color =
    pct > 60 ? "bg-teal-500" : pct > 30 ? "bg-amber-400" : "bg-red-500";
  const label =
    pct > 60 ? "Nivel bueno" : pct > 30 ? "Nivel medio — monitoree" : "Nivel bajo — use solo lo esencial";

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <h2 className="mb-4 text-lg font-bold text-foreground">
        💧 Cuánta agua hay en el pozo
      </h2>
      <div className="flex items-end gap-3">
        {/* vertical tank */}
        <div className="relative h-28 w-10 overflow-hidden rounded-lg border-2 border-teal-300 bg-teal-50">
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${color}`}
            style={{ height: `${pct}%` }}
          />
        </div>
        <div className="flex-1">
          <div className="text-4xl font-black tabular-nums text-foreground">
            {Math.round(pct)}%
          </div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Nivel actual: {staticM.toFixed(1)} m
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Weather strip ─────────────────────────────────────────────────────────────

function WeatherStrip({ days }: { days: ForecastDay[] }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <h2 className="mb-4 text-lg font-bold text-foreground">
        ☀️ El tiempo los próximos 7 días
      </h2>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const date = new Date(d.date + "T12:00:00");
          const dayName = date.toLocaleDateString("es-PE", { weekday: "short" });
          return (
            <div key={d.date} className="flex flex-col items-center gap-1 rounded-lg bg-secondary/40 py-2 px-1">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                {dayName}
              </span>
              <span className="text-2xl">{d.emoji}</span>
              {d.rain_mm > 0.5 && (
                <span className="text-[10px] font-medium text-blue-600">
                  {d.rain_mm.toFixed(0)}mm
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Irrigation recommendation ─────────────────────────────────────────────────

function IrrigationCard({
  emoji,
  text,
}: {
  emoji: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <h2 className="mb-4 text-lg font-bold text-foreground">
        🌱 ¿Hay que regar hoy?
      </h2>
      <div className="flex items-start gap-4">
        <span className="text-5xl">{emoji}</span>
        <p className="text-base font-medium leading-snug text-foreground">{text}</p>
      </div>
    </div>
  );
}

// ── Alerts ────────────────────────────────────────────────────────────────────

function AlertCard({ alert }: { alert: Alert }) {
  const styles: Record<Risk, string> = {
    alto: "bg-red-50 border-red-200 text-red-800",
    medio: "bg-amber-50 border-amber-200 text-amber-800",
    bajo: "bg-green-50 border-green-200 text-green-800",
  };
  const icons: Record<Risk, string> = {
    alto: "🔴",
    medio: "🟡",
    bajo: "🟢",
  };
  return (
    <div className={`rounded-xl border p-4 ${styles[alert.level]}`}>
      <div className="flex items-center gap-2 font-bold">
        {icons[alert.level]} {alert.title}
      </div>
      <p className="mt-2 text-sm leading-relaxed opacity-90">{alert.message}</p>
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
      <div className="flex items-center gap-2 font-bold text-foreground">
        {icons[rec.severity] ?? "🌱"} {rec.title_es}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rec.body_es}</p>
      {rec.action_es && (
        <p className="mt-2 text-sm font-semibold text-foreground">→ {rec.action_es}</p>
      )}
    </div>
  );
}

// ── Skeleton placeholder ──────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-secondary/60 ${className ?? "h-24 w-full"}`} />
  );
}

// ── Main page component ───────────────────────────────────────────────────────

function CampoPage() {
  const status = useStatus();
  const well = useWell();
  const forecast = useForecast();
  const irrigation = useIrrigation();
  const alerts = useAlerts();
  const crops = useCrops();
  const enso = useEnso();

  return (
    <SiteShell>
      <section className="mx-auto max-w-lg px-4 py-8 space-y-5">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Vista de campo
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Estado de hoy
          </h1>
        </div>

        {/* Traffic light */}
        {status.isLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : status.data ? (
          <TrafficLightHero
            light={status.data.traffic_light}
            summary={status.data.summary_es}
          />
        ) : (
          <TrafficLightHero light="amarillo" summary="No se pudo conectar con el servidor." />
        )}

        {/* ENSO compact card */}
        {enso.isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : enso.data ? (
          <EnsoCard
            icen_anom={enso.data.icen.anom_c}
            icen_label={enso.data.icen.label_es}
            icen_state={enso.data.icen.state}
            risk_es={enso.data.icen.risk_es}
            oni_anom={enso.data.oni.anom_c}
            oni_state={enso.data.oni.state}
            compact={true}
          />
        ) : null}

        {/* Well gauge */}
        {well.isLoading ? (
          <Skeleton className="h-44 w-full" />
        ) : well.data?.available ? (
          <WellGauge
            pct={well.data.pct_capacity ?? 50}
            staticM={well.data.static_m ?? 0}
          />
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card p-5 text-sm text-muted-foreground">
            💧 Sin medición reciente del pozo.
          </div>
        )}

        {/* Irrigation recommendation */}
        {irrigation.isLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : irrigation.data ? (
          <IrrigationCard
            emoji={irrigation.data.emoji ?? "💧"}
            text={irrigation.data.text_es}
          />
        ) : null}

        {/* Weather strip */}
        {forecast.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : forecast.data ? (
          <WeatherStrip days={forecast.data} />
        ) : null}

        {/* Alerts */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">🔔 Avisos importantes</h2>
          {alerts.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : alerts.data ? (
            alerts.data.map((a) => <AlertCard key={a.id} alert={a} />)
          ) : null}
        </div>

        {/* Crop recommendations */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">
            🌿 ¿Qué plantar y qué cuidar ahora?
          </h2>
          {crops.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : crops.data ? (
            crops.data.map((r) => <CropRecCard key={r.crop} rec={r} />)
          ) : null}
        </div>

        {/* Real-time news from Peru, summarized by AI */}
        <FieldNews />

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          ¿Necesita más detalle?{" "}
          <a href="/dashboard" className="text-primary underline">
            Ver panel completo →
          </a>
        </p>
      </section>
    </SiteShell>
  );
}
