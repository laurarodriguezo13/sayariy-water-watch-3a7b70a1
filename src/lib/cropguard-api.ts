/**
 * CropGuard API client — typed fetch wrappers for the Python backend.
 *
 * Set VITE_CROPGUARD_API_URL in your .env (or Cloudflare Pages env var) to
 * point at the Render deployment, e.g.:
 *   VITE_CROPGUARD_API_URL=https://cropguard.onrender.com
 *
 * Falls back to mock data when the env var is absent so the UI still renders.
 */

const BASE =
  (import.meta.env.VITE_CROPGUARD_API_URL as string | undefined) ??
  "https://cropguard-0k17.onrender.com";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/api/v1${path}`);
  if (!res.ok) throw new Error(`CropGuard API ${path} → ${res.status}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error ?? "API error");
  return json.data as T;
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

// ── API calls ────────────────────────────────────────────────────────────────

export const fetchCommunities = () => get<Community[]>("/communities");

export const fetchTimeseries = (id: string) =>
  get<TimeseriesPoint[]>(`/communities/${id}/timeseries`);

export const fetchWell = () => get<WellData>("/well");

export const fetchForecast = () => get<ForecastDay[]>("/forecast");

export const fetchEnso = () => get<EnsoData>("/enso");

export const fetchIrrigation = () => get<IrrigationRec>("/irrigation");

export const fetchCrops = () => get<CropRec[]>("/crops");

export const fetchAlerts = () => get<Alert[]>("/alerts");

export const fetchStatus = () => get<StatusData>("/status");
