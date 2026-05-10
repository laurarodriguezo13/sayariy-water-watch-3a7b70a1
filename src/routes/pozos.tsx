/**
 * /pozos — Estado del pozo de agua, para trabajadores de campo.
 *
 * Secciones:
 * 1. Encabezado
 * 2. WellCard — nivel del pozo con indicador grande
 * 3. IrrigationCard — ¿hay que regar hoy?
 * 4. EnsoCard (completo) — cómo el clima afecta el pozo
 * 5. ForecastChart — lluvia vs evaporación 7 días
 * 6. RainCard — barras de lluvia diaria
 * 7. TipsCard — consejos para ahorrar agua
 */
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { EnsoCard } from "@/components/enso-card";
import { ForecastChart } from "@/components/forecast-chart";
import { WellsMap } from "@/components/wells-map";
import { ReportDownloadButton } from "@/components/report-download-button";
import { useWell, useForecast, useIrrigation, useEnso } from "@/hooks/use-cropguard";
import type { ForecastDay } from "@/lib/cropguard-api";

export const Route = createFileRoute("/pozos")({
  head: () => ({
    meta: [
      { title: "Pozos de Agua — Sayariy CropGuard" },
      {
        name: "description",
        content: "Estado del pozo de agua: nivel, días disponibles y pronóstico de lluvia.",
      },
    ],
  }),
  component: PozosPage,
});

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-secondary/60 ${className ?? "h-24 w-full"}`} />;
}

// ── Well gauge card ───────────────────────────────────────────────────────────

function WellCard({
  staticM,
  pct,
  date,
}: {
  staticM: number;
  pct: number;
  date: string;
}) {
  const color = pct > 60 ? "bg-teal-500" : pct > 30 ? "bg-amber-400" : "bg-red-500";
  const status =
    pct > 60
      ? { label: "Nivel bueno", emoji: "✅", bg: "bg-green-50 border-green-200 text-green-800" }
      : pct > 30
      ? { label: "Nivel medio — monitoree", emoji: "⚠️", bg: "bg-amber-50 border-amber-200 text-amber-800" }
      : { label: "Nivel bajo — use solo lo esencial", emoji: "🔴", bg: "bg-red-50 border-red-200 text-red-800" };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-5">
      <h2 className="text-xl font-bold text-foreground">💧 Nivel del pozo</h2>

      {/* Big gauge */}
      <div className="flex items-end gap-5">
        <div className="relative h-40 w-14 overflow-hidden rounded-xl border-2 border-teal-300 bg-teal-50">
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${color}`}
            style={{ height: `${pct}%` }}
          />
          {/* tick marks */}
          {[25, 50, 75].map((t) => (
            <div
              key={t}
              className="absolute left-0 right-0 border-t border-white/40"
              style={{ bottom: `${t}%` }}
            />
          ))}
        </div>
        <div>
          <div className="text-6xl font-black tabular-nums text-foreground leading-none">
            {Math.round(pct)}%
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {staticM.toFixed(2)} m de profundidad
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Última medición: {date}
          </div>
        </div>
      </div>

      {/* Status banner */}
      <div className={`rounded-xl border px-4 py-3 font-semibold ${status.bg}`}>
        {status.emoji} {status.label}
      </div>
    </div>
  );
}

// ── Rain week card ────────────────────────────────────────────────────────────

function RainCard({ days }: { days: ForecastDay[] }) {
  const totalRain = days.reduce((s, d) => s + d.rain_mm, 0);
  const rainDays = days.filter((d) => d.rain_mm > 1).length;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <h2 className="mb-4 text-xl font-bold text-foreground">🌧️ Lluvia esta semana</h2>

      <div className="flex gap-6 mb-5">
        <div>
          <div className="text-4xl font-black tabular-nums text-foreground">{totalRain.toFixed(0)} mm</div>
          <div className="text-xs text-muted-foreground">total esperado</div>
        </div>
        <div>
          <div className="text-4xl font-black tabular-nums text-foreground">{rainDays}</div>
          <div className="text-xs text-muted-foreground">días con lluvia</div>
        </div>
      </div>

      {/* Daily rain bars */}
      <div className="space-y-2">
        {days.map((d) => {
          const date = new Date(d.date + "T12:00:00");
          const dayName = date.toLocaleDateString("es-PE", { weekday: "long" });
          const barW = Math.min(100, (d.rain_mm / 20) * 100);
          return (
            <div key={d.date} className="flex items-center gap-3">
              <span className="w-24 text-xs font-medium text-muted-foreground capitalize">{dayName}</span>
              <div className="flex-1 h-4 rounded-full bg-secondary/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all"
                  style={{ width: `${barW}%` }}
                />
              </div>
              <span className="w-12 text-xs tabular-nums text-right text-muted-foreground">
                {d.rain_mm.toFixed(1)} mm
              </span>
            </div>
          );
        })}
      </div>

      {totalRain >= 5 && (
        <p className="mt-4 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-800 font-medium">
          💡 Con {totalRain.toFixed(0)} mm esperados esta semana, el pozo puede recuperarse. Reduzca el riego.
        </p>
      )}
    </div>
  );
}

// ── Irrigation recommendation ─────────────────────────────────────────────────

function IrrigationCard({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <h2 className="mb-4 text-xl font-bold text-foreground">🌱 ¿Hay que regar hoy?</h2>
      <div className="flex items-start gap-4">
        <span className="text-5xl">{emoji}</span>
        <p className="text-base font-medium leading-snug text-foreground">{text}</p>
      </div>
    </div>
  );
}

// ── Water saving tips ─────────────────────────────────────────────────────────

function TipsCard({ pct }: { pct: number }) {
  const tips =
    pct < 30
      ? [
          "Riegue solo maracuyá adulta y cultivos que ya están en flor.",
          "Evite regar en las horas de más calor (10 am – 4 pm).",
          "Revise si hay fugas en las mangueras o goteros.",
          "Reporte el nivel del pozo a la ONG esta semana.",
        ]
      : pct < 60
      ? [
          "Riegue temprano (antes de las 8 am) o al atardecer.",
          "Priorice cultivos con mayor valor económico.",
          "Monitoree el pozo dos veces por semana.",
        ]
      : [
          "Continúe con su rutina de riego habitual.",
          "Registre el nivel del pozo cada semana para el historial.",
        ];

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <h2 className="mb-4 text-xl font-bold text-foreground">💡 Consejos para ahorrar agua</h2>
      <ul className="space-y-3">
        {tips.map((t) => (
          <li key={t} className="flex items-start gap-3 text-sm text-foreground">
            <span className="mt-0.5 flex-shrink-0 text-teal-500">✓</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

function PozosPage() {
  const { data: well, isLoading: wellLoading } = useWell();
  const { data: forecast, isLoading: fcLoading } = useForecast();
  const { data: irrigation, isLoading: irrLoading } = useIrrigation();
  const { data: enso, isLoading: ensoLoading } = useEnso();

  const pct = well?.pct_capacity ?? 50;

  return (
    <SiteShell>
      <section className="mx-auto max-w-lg px-4 py-8 space-y-5">
        {/* 1. Page header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Agua</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Estado del pozo de agua
          </h1>
        </div>

        {/* 2. WellCard */}
        {wellLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : well?.available ? (
          <WellCard staticM={well.static_m!} pct={well.pct_capacity!} date={well.date!} />
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card p-5 text-sm text-muted-foreground">
            Sin medición reciente del pozo. Contacte al equipo de la ONG.
          </div>
        )}

        {/* 3. IrrigationCard */}
        {irrLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : irrigation ? (
          <IrrigationCard emoji={irrigation.emoji ?? "💧"} text={irrigation.text_es} />
        ) : null}

        {/* 4. EnsoCard — full */}
        <div>
          <p className="mb-2 text-sm font-semibold text-muted-foreground">
            El estado del clima afecta el nivel del pozo
          </p>
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
        </div>

        {/* 5. ForecastChart */}
        {fcLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ForecastChart days={forecast} />
        )}

        {/* 6. RainCard */}
        {fcLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : forecast ? (
          <RainCard days={forecast} />
        ) : null}

        {/* 7. TipsCard */}
        {!wellLoading && <TipsCard pct={pct} />}

        {/* 8. Wells map */}
        <WellsMap />

        {/* 9. PDF report */}
        <ReportDownloadButton />


        <p className="text-center text-xs text-muted-foreground pb-4">
          ¿Necesita registrar una nueva medición?{" "}
          <a
            href="https://cropguard-0k17.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Abrir panel técnico →
          </a>
        </p>
      </section>
    </SiteShell>
  );
}
