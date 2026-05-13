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
              <div className="flex items-baseline gap-1 text-[11px] tabular-nums">
                <span className="font-bold text-foreground">{Math.round(d.tmax_c)}°</span>
                <span className="text-muted-foreground">{Math.round(d.tmin_c)}°</span>
              </div>
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

// ── Crop simple tip card ─────────────────────────────────────────────────────

function shortCropTip(crop: string, status?: StatusData, enso?: EnsoData): string {
  const dry = (status?.rain_3d_mm ?? 0) < 2;
  const ninoActive = !!enso && enso.icen.state !== "Normal";
  const c = crop.toLowerCase();
  if (c === "maracuya")
    return ninoActive
      ? "Temporada seca, pero El Niño Costero activo. Prepárese ya."
      : dry
        ? "Riegue de noche. Cuide flores y polinizadores."
        : "Buen momento. Mantenga el riego regular.";
  if (c === "camote")
    return dry ? "Riegue ligero cada 3 días." : "Cuide hongos en hojas tras la lluvia.";
  if (c === "frijol")
    return ninoActive
      ? "Posponga siembra si hay aviso de lluvia fuerte."
      : "Buen momento para sembrar.";
  if (c === "maiz")
    return dry
      ? "Riegue al amanecer. Vigile estrés en hojas."
      : "Bien. Revise plagas en mazorca.";
  return "Siga la guía del técnico de campo.";
}

const CROP_EMOJI: Record<string, string> = {
  maracuya: "🍈",
  camote: "🍠",
  frijol: "🫘",
  maiz: "🌽",
  _suggestion: "✨",
  suggestion: "✨",
};
const CROP_NAME: Record<string, string> = {
  maracuya: "Maracuyá",
  camote: "Camote",
  frijol: "Frijol",
  maiz: "Maíz",
  _suggestion: "Sugerencia",
  suggestion: "Sugerencia",
};

function SimpleCropTip({
  rec,
  status,
  enso,
}: {
  rec: CropRec;
  status?: StatusData;
  enso?: EnsoData;
}) {
  const styles: Record<string, string> = {
    green: "bg-green-50 border-green-200 text-green-900",
    yellow: "bg-amber-50 border-amber-200 text-amber-900",
    red: "bg-red-50 border-red-200 text-red-900",
  };
  const pill: Record<string, string> = {
    green: "bg-green-500 text-white",
    yellow: "bg-amber-500 text-white",
    red: "bg-red-500 text-white",
  };
  const pillText: Record<string, string> = {
    green: "BIEN",
    yellow: "CUIDADO",
    red: "RIESGO",
  };
  const key = (rec.crop ?? "").toLowerCase();
  const emoji = CROP_EMOJI[key] ?? "🌱";
  const name = CROP_NAME[key] ?? rec.crop;
  const tip = shortCropTip(key, status, enso);

  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${styles[rec.severity] ?? "bg-card border-border/60"}`}>
      <span className="text-3xl leading-none">{emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold">{name}</span>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${pill[rec.severity] ?? "bg-muted"}`}>
            {pillText[rec.severity] ?? rec.severity.toUpperCase()}
          </span>
        </div>
        <p className="mt-0.5 text-sm leading-snug opacity-90">{tip}</p>
      </div>
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
            Vista Simple
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Estado de hoy
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lo importante para el día, en lenguaje claro.
          </p>
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

        {/* Crop quick tips (very short, visual) */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">🌿 Sus cultivos hoy</h2>
          {crops.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : crops.data ? (
            <div className="space-y-2">
              {crops.data.map((r) => (
                <SimpleCropTip key={r.crop} rec={r} status={status.data} enso={enso.data} />
              ))}
            </div>
          ) : null}
          <Link
            to="/recomendaciones"
            className="block rounded-xl border border-dashed border-border/70 bg-card/60 p-3 text-center text-sm font-semibold text-primary hover:bg-secondary/40"
          >
            🌱 Ver recomendaciones detalladas →
          </Link>
        </div>

        {/* Real-time news from Peru, summarized by AI */}
        <FieldNews />

        {/* Simple PDF download (only here, for farmers) */}
        <ReportDownloadButton variant="simple" />

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