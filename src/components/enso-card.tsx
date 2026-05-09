import type { IcenState } from "@/lib/cropguard-api";

interface EnsoCardProps {
  icen_anom: number;
  icen_label: string;
  icen_state: IcenState;
  risk_es: string;
  oni_anom: number;
  oni_state: string;
  compact?: boolean;
}

function headerConfig(state: IcenState): {
  bg: string;
  border: string;
  text: string;
  label: string;
} {
  switch (state) {
    case "LaNiña":
      return {
        bg: "bg-blue-600",
        border: "border-blue-700",
        text: "text-white",
        label: "La Niña",
      };
    case "Extraordinario":
      return {
        bg: "bg-red-800",
        border: "border-red-900",
        text: "text-white",
        label: "El Niño Extraordinario",
      };
    case "Fuerte":
      return {
        bg: "bg-red-500",
        border: "border-red-600",
        text: "text-white",
        label: "El Niño Fuerte",
      };
    case "Costero":
      return {
        bg: "bg-amber-500",
        border: "border-amber-600",
        text: "text-white",
        label: "El Niño Costero",
      };
    case "Normal":
    default:
      return {
        bg: "bg-green-600",
        border: "border-green-700",
        text: "text-white",
        label: "Normal",
      };
  }
}

export function EnsoCard({
  icen_anom,
  icen_label,
  icen_state,
  risk_es,
  oni_anom,
  oni_state,
  compact = false,
}: EnsoCardProps) {
  const cfg = headerConfig(icen_state);
  const anomSign = icen_anom >= 0 ? "+" : "";
  const oniSign = oni_anom >= 0 ? "+" : "";

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${cfg.border}`}>
      {/* Colored header band */}
      <div className={`${cfg.bg} px-5 py-4`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌊</span>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${cfg.text} opacity-80`}>
                Estado El Niño Costero (ICEN)
              </p>
              <p className={`text-xl font-black tabular-nums ${cfg.text}`}>
                {anomSign}{icen_anom.toFixed(2)}°C
              </p>
            </div>
          </div>
          <div className={`text-right`}>
            <p className={`text-sm font-bold ${cfg.text}`}>{icen_label}</p>
            <p className={`text-xs ${cfg.text} opacity-75`}>{cfg.label}</p>
          </div>
        </div>
      </div>

      {/* Body — hidden in compact mode */}
      {!compact && (
        <div className="bg-card px-5 py-4 space-y-3">
          {/* ONI global */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-base">🌍</span>
            <span>
              ONI global:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {oniSign}{oni_anom.toFixed(2)}°C
              </span>{" "}
              <span className="text-xs">({oni_state})</span>
            </span>
          </div>

          {/* Risk text */}
          <p className="text-sm leading-relaxed text-foreground">{risk_es}</p>
        </div>
      )}
    </div>
  );
}
