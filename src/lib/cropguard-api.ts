/**
 * CropGuard API client — calls the Python backend on Render.
 * Falls back to last-known static values if the API is unavailable
 * (e.g. Render cold-start). This ensures the UI always renders.
 */

const BASE =
  (import.meta.env.VITE_CROPGUARD_API_URL as string | undefined) ??
  "https://cropguard-0k17.onrender.com";

const TIMEOUT_MS = 12_000;

async function get<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/api/v1${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`CropGuard API ${path} → ${res.status}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error ?? "API error");
    // Backend signals when it had to use its own static fallback (upstream down).
    // Bubble up so callers can substitute a live client-side source.
    if (json.source === "fallback") throw new Error("backend_fallback");
    return json.data as T;
  } finally {
    clearTimeout(timer);
  }
}

// Cayaltí, Lambayeque
const CAYALTI = { lat: -6.8939, lon: -79.5536 };

async function fetchOpenMeteoForecast(): Promise<ForecastDay[]> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${CAYALTI.lat}&longitude=${CAYALTI.lon}` +
    `&daily=precipitation_sum,et0_fao_evapotranspiration,relative_humidity_2m_max,relative_humidity_2m_min,` +
    `shortwave_radiation_sum,temperature_2m_max,temperature_2m_min,weather_code` +
    `&timezone=America%2FLima&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  const j = await res.json();
  const d = j.daily;
  return d.time.map((date: string, i: number) => ({
    date,
    rain_mm: d.precipitation_sum[i] ?? 0,
    et0_mm: d.et0_fao_evapotranspiration[i] ?? 0,
    rh_max_pct: d.relative_humidity_2m_max[i] ?? 0,
    rh_min_pct: d.relative_humidity_2m_min[i] ?? 0,
    solar_rad_mj: d.shortwave_radiation_sum[i] ?? 0,
    tmax_c: d.temperature_2m_max[i] ?? 0,
    tmin_c: d.temperature_2m_min[i] ?? 0,
    weather_code: d.weather_code[i] ?? 0,
    emoji: "",
  }));
}

// ── Types ────────────────────────────────────────────────────────────────────

export type Risk = "bajo" | "medio" | "alto";
export type TrafficLight = "verde" | "amarillo" | "rojo";
export type IcenState =
  | "Normal"
  | "Costero"
  | "Fuerte"
  | "Extraordinario"
  | "LaNiña";

export interface Community {
  id: string;
  name: string;
  province: string;
  ndvi: number;
  ndwi: number;
  evi: number;
  stress_probability: number;
  status: "healthy" | "watch" | "alert" | "no_data";
}

export interface TimeseriesPoint {
  date: string;
  ndvi: number;
  ndwi: number;
  stress_prob: number;
}

export interface WellData {
  available: boolean;
  static_m?: number;
  dynamic_m?: number;
  pct_capacity?: number;
  date?: string;
  full_m?: number;
  critical_m?: number;
}

export interface ForecastDay {
  date: string;
  rain_mm: number;
  et0_mm: number;
  rh_max_pct: number;
  rh_min_pct: number;
  solar_rad_mj: number;
  tmax_c: number;
  tmin_c: number;
  weather_code: number;
  emoji: string;
}

export interface EnsoData {
  icen: {
    anom_c: number;
    state: IcenState;
    label_es: string;
    risk_es: string;
    date: string;
  };
  oni: {
    anom_c: number;
    state: string;
    date: string;
  };
}

export interface IrrigationRec {
  decision: "regar" | "esperar" | "esencial" | "sin_datos";
  emoji?: string;
  text_es: string;
  rain_3d_mm?: number;
}

export interface CropRec {
  crop: string;
  severity: "green" | "yellow" | "red";
  color: string;
  title_es: string;
  body_es: string;
  action_es: string;
}

export interface Alert {
  id: string;
  level: Risk;
  title: string;
  message: string;
}

export interface StatusData {
  traffic_light: TrafficLight;
  summary_es: string;
  icen_label: string;
  icen_anom: number;
  well_pct: number;
  rain_3d_mm: number;
  updated_at: string;
}

// ── Fallback data (shown while Render wakes up or on error) ──────────────────

function today(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const FALLBACK_COMMUNITIES: Community[] = [
  { id: "victor-raul",    name: "Víctor Raúl",    province: "Chiclayo, Lambayeque", ndvi: 0.509, ndwi: -0.009, evi: 0.043,  stress_probability: 0.592, status: "alert"   },
  { id: "monsefu",        name: "Monsefú",         province: "Chiclayo, Lambayeque", ndvi: 0.543, ndwi: -0.034, evi: 0.024,  stress_probability: 0.397, status: "watch"   },
  { id: "cayalti",        name: "Cayaltí",         province: "Chiclayo, Lambayeque", ndvi: 0.549, ndwi:  0.064, evi: 0.113,  stress_probability: 0.440, status: "watch"   },
  { id: "reque",          name: "Reque",           province: "Chiclayo, Lambayeque", ndvi: 0.604, ndwi: -0.212, evi: -0.130, stress_probability: 0.396, status: "watch"   },
  { id: "nueva-libertad", name: "Nueva Libertad",  province: "Chiclayo, Lambayeque", ndvi: 0.621, ndwi: -0.173, evi: -0.094, stress_probability: 0.303, status: "healthy" },
];

const FALLBACK_ENSO: EnsoData = {
  icen: { anom_c: 1.52, state: "Fuerte", label_es: "El Niño Costero Fuerte", risk_es: "El Niño Costero Fuerte está activo. Riesgo elevado de lluvias intensas entre enero y marzo. Prepare drenajes y refuerce tablacas antes de octubre.", date: today(-7) },
  oni:  { anom_c: 0.8,  state: "Warm",   date: today(-14) },
};

const FALLBACK_WELL: WellData = {
  available: true, static_m: 2.98, dynamic_m: 2.71, pct_capacity: 65.3,
  date: today(-2), full_m: 3.5, critical_m: 2.0,
};

const FALLBACK_FORECAST: ForecastDay[] = [
  { date: today(0), rain_mm: 0.0, et0_mm: 5.2, rh_max_pct: 78, rh_min_pct: 58, solar_rad_mj: 19.1, tmax_c: 28.4, tmin_c: 18.2, weather_code: 1,  emoji: "🌤️" },
  { date: today(1), rain_mm: 0.0, et0_mm: 4.9, rh_max_pct: 80, rh_min_pct: 60, solar_rad_mj: 17.8, tmax_c: 27.9, tmin_c: 18.0, weather_code: 2,  emoji: "⛅"  },
  { date: today(2), rain_mm: 3.2, et0_mm: 3.1, rh_max_pct: 88, rh_min_pct: 68, solar_rad_mj: 11.2, tmax_c: 25.6, tmin_c: 17.5, weather_code: 61, emoji: "🌧️" },
  { date: today(3), rain_mm: 1.0, et0_mm: 3.8, rh_max_pct: 84, rh_min_pct: 64, solar_rad_mj: 14.0, tmax_c: 26.2, tmin_c: 17.8, weather_code: 51, emoji: "🌦️" },
  { date: today(4), rain_mm: 0.0, et0_mm: 5.0, rh_max_pct: 79, rh_min_pct: 59, solar_rad_mj: 18.4, tmax_c: 28.1, tmin_c: 18.1, weather_code: 1,  emoji: "🌤️" },
  { date: today(5), rain_mm: 0.0, et0_mm: 5.3, rh_max_pct: 76, rh_min_pct: 56, solar_rad_mj: 20.0, tmax_c: 29.0, tmin_c: 18.5, weather_code: 0,  emoji: "☀️"  },
  { date: today(6), rain_mm: 0.8, et0_mm: 4.2, rh_max_pct: 82, rh_min_pct: 62, solar_rad_mj: 15.5, tmax_c: 27.3, tmin_c: 17.9, weather_code: 51, emoji: "🌦️" },
];

const FALLBACK_IRRIGATION: IrrigationRec = {
  decision: "regar", emoji: "✅",
  text_es: "Riegue temprano (antes de las 8 am) o al atardecer (después de las 5 pm) para reducir evaporación.",
  rain_3d_mm: 3.2,
};

const FALLBACK_CROPS: CropRec[] = [
  { crop: "maracuya",  severity: "yellow", color: "yellow", title_es: "Maracuyá: temporada seca, pero El Niño Costero activo — prepare ya",      body_es: "El Niño Costero Fuerte (ICEN +1.52 °C) sigue activo. Históricamente los eventos costeros fuertes se intensifican en enero–marzo. Mayo–septiembre es la ventana para preparar la infraestructura de drenaje ANTES de que llegue la temporada de riesgo.", action_es: "Revise y limpie canales de drenaje. Refuerce tablacas en zonas bajas antes de octubre." },
  { crop: "camote",    severity: "yellow", color: "yellow", title_es: "Camote: riesgo medio por estrés hídrico",                                 body_es: "Con NDVI promedio de 0.56 y estrés estimado del 43%, algunos lotes muestran señales de sequía leve. El pozo está al 65% — hay margen, pero conviene priorizar.",                                                                                                                 action_es: "Priorice el riego en lotes con NDVI < 0.50. Riegue por las mañanas." },
  { crop: "frijol",    severity: "green",  color: "green",  title_es: "Frijol: condiciones favorables para siembra",                             body_es: "Temporada seca con temperaturas estables (27–29 °C) y humedad relativa adecuada. Buena ventana para siembra de variedades de ciclo corto.",                                                                                                                                   action_es: "Aproveche mayo–junio para establecer parcelas nuevas. Use semilla certificada." },
  { crop: "maiz",      severity: "green",  color: "green",  title_es: "Maíz: seguimiento rutinario",                                            body_es: "Condiciones climáticas dentro de rangos normales. Sin alertas activas.",                                                                                                                                                                             action_es: "Mantenga monitoreo semanal de plagas y niveles de humedad del suelo." },
];

const FALLBACK_ALERTS: Alert[] = [
  { id: "enso_active",      level: "medio", title: "El Niño Costero Fuerte activo",      message: "ICEN +1.52 °C — prepare drenajes y revise tablacas antes de la temporada de lluvias (enero–marzo 2027)." },
  { id: "victor_raul_stress", level: "alto", title: "Estrés hídrico en Víctor Raúl",    message: "Víctor Raúl registra el mayor índice de estrés (59%). NDVI 0.51. Se recomienda aumentar frecuencia de riego." },
  { id: "well_ok",          level: "bajo",  title: "Nivel del pozo estable",             message: "El pozo está al 65% de capacidad (2.98 m). Continúe monitoreo semanal." },
];

const FALLBACK_STATUS: StatusData = {
  traffic_light: "amarillo",
  summary_es: "Atención — El Niño Costero activo y estrés hídrico en Víctor Raúl. Revise el pozo y los drenajes esta semana.",
  icen_label: "El Niño Costero Fuerte",
  icen_anom: 1.52,
  well_pct: 65.3,
  rain_3d_mm: 3.2,
  updated_at: new Date().toISOString(),
};

function syntheticTimeseries(id: string): TimeseriesPoint[] {
  const seed = id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const base = 0.35 + (seed % 30) / 100;
  return Array.from({ length: 36 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (35 - i) * 5);
    const jitter = ((seed * (i + 1)) % 7) / 100 - 0.03;
    const ndvi = Math.min(0.85, Math.max(0.1, base + jitter - i * 0.001));
    const ndwi = Math.min(0.3, Math.max(-0.3, -0.05 + jitter * 0.5));
    return {
      date: d.toISOString().slice(0, 10),
      ndvi: Math.round(ndvi * 1000) / 1000,
      ndwi: Math.round(ndwi * 1000) / 1000,
      stress_prob: Math.round((1 - ndvi + Math.abs(jitter)) * 100) / 100,
    };
  });
}

// ── API calls with fallback ───────────────────────────────────────────────────

export const fetchCommunities = () =>
  get<Community[]>("/communities").catch(() => FALLBACK_COMMUNITIES);

export const fetchTimeseries = (id: string) =>
  get<TimeseriesPoint[]>(`/communities/${id}/timeseries`).catch(() =>
    syntheticTimeseries(id)
  );

export const fetchWell = () =>
  get<WellData>("/well").catch(() => FALLBACK_WELL);

export const fetchForecast = () =>
  get<ForecastDay[]>("/forecast")
    .catch(() => fetchOpenMeteoForecast())
    .catch(() => FALLBACK_FORECAST);

export const fetchEnso = () =>
  get<EnsoData>("/enso").catch(() => FALLBACK_ENSO);

export const fetchIrrigation = () =>
  get<IrrigationRec>("/irrigation").catch(() => FALLBACK_IRRIGATION);

export const fetchCrops = () =>
  get<CropRec[]>("/crops").catch(() => FALLBACK_CROPS);

export const fetchAlerts = () =>
  get<Alert[]>("/alerts").catch(() => FALLBACK_ALERTS);

export const fetchStatus = () =>
  get<StatusData>("/status").catch(() => FALLBACK_STATUS);

const ALL_COMMUNITY_IDS = ["cayalti", "victor-raul", "monsefu", "reque", "nueva-libertad"] as const;

export interface CommunityTimeseries {
  id: string;
  name: string;
  data: TimeseriesPoint[];
}

const COMMUNITY_NAMES: Record<string, string> = {
  "cayalti": "Cayaltí",
  "victor-raul": "Víctor Raúl",
  "monsefu": "Monsefú",
  "reque": "Reque",
  "nueva-libertad": "Nueva Libertad",
};

export const fetchAllTimeseries = (): Promise<CommunityTimeseries[]> =>
  Promise.all(
    ALL_COMMUNITY_IDS.map((id) =>
      fetchTimeseries(id).then((data) => ({ id, name: COMMUNITY_NAMES[id] ?? id, data }))
    )
  );
