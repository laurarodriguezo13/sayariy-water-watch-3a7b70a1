/**
 * Fetches real news/alerts from FREE public sources relevant to Cayaltí (Lambayeque, Perú)
 * and uses Lovable AI to translate, summarize and classify severity for field workers.
 *
 * Sources (no API key required):
 * - ReliefWeb (UN OCHA): humanitarian reports filtered by Peru
 * - USGS Earthquakes: seismic events near Cayaltí (last 7 days)
 * - GDACS: global disaster alerts for Peru
 */

const CAYALTI_LAT = -6.9157;
const CAYALTI_LON = -79.5163;

export type NewsSeverity = "alta" | "media" | "baja";
export type NewsCategory = "clima" | "sismo" | "agua" | "plaga" | "social" | "otros";

export type FieldNewsItem = {
  id: string;
  title_es: string;
  summary_es: string;
  action_es: string | null;
  severity: NewsSeverity;
  category: NewsCategory;
  source: string;
  source_url: string;
  published_at: string; // ISO
};

type RawItem = {
  id: string;
  title: string;
  body: string;
  source: string;
  source_url: string;
  published_at: string;
};

// ── Source fetchers ─────────────────────────────────────────────────────────

async function fetchReliefWeb(): Promise<RawItem[]> {
  try {
    const url =
      "https://api.reliefweb.int/v1/reports?appname=sayariy-cropguard" +
      "&filter[field]=country&filter[value]=Peru" +
      "&fields[include][]=title&fields[include][]=body&fields[include][]=url" +
      "&fields[include][]=source.name&fields[include][]=date.created" +
      "&sort[]=date.created:desc&limit=8";
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: Array<{
        id: string;
        fields: {
          title?: string;
          body?: string;
          url?: string;
          source?: Array<{ name?: string }>;
          date?: { created?: string };
        };
      }>;
    };
    return (json.data ?? []).map((d) => ({
      id: `rw-${d.id}`,
      title: d.fields.title ?? "",
      body: (d.fields.body ?? "").slice(0, 1200),
      source: d.fields.source?.[0]?.name ?? "ReliefWeb",
      source_url: d.fields.url ?? "https://reliefweb.int/country/per",
      published_at: d.fields.date?.created ?? new Date().toISOString(),
    }));
  } catch (e) {
    console.error("ReliefWeb fetch failed:", e);
    return [];
  }
}

async function fetchUSGSEarthquakes(): Promise<RawItem[]> {
  try {
    // 300km radius around Cayaltí, last 7 days, magnitude ≥ 3.5
    const url =
      "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson" +
      `&latitude=${CAYALTI_LAT}&longitude=${CAYALTI_LON}` +
      "&maxradiuskm=300&minmagnitude=3.5" +
      `&starttime=${new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10)}` +
      "&orderby=time&limit=10";
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = (await res.json()) as {
      features?: Array<{
        id: string;
        properties: { mag: number; place: string; time: number; url: string };
        geometry: { coordinates: [number, number, number] };
      }>;
    };
    return (json.features ?? []).map((f) => ({
      id: `usgs-${f.id}`,
      title: `Sismo M${f.properties.mag.toFixed(1)} — ${f.properties.place}`,
      body: `Magnitud ${f.properties.mag}. Ubicación: ${f.properties.place}. Profundidad: ${f.geometry.coordinates[2]?.toFixed(0)} km.`,
      source: "USGS",
      source_url: f.properties.url,
      published_at: new Date(f.properties.time).toISOString(),
    }));
  } catch (e) {
    console.error("USGS fetch failed:", e);
    return [];
  }
}

async function fetchGDACS(): Promise<RawItem[]> {
  try {
    const url =
      "https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?country=PER&fromdate=" +
      new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = (await res.json()) as {
      features?: Array<{
        properties: {
          eventid: string | number;
          name?: string;
          description?: string;
          htmldescription?: string;
          fromdate?: string;
          url?: { report?: string };
          eventtype?: string;
        };
      }>;
    };
    return (json.features ?? []).slice(0, 5).map((f) => ({
      id: `gdacs-${f.properties.eventid}`,
      title: f.properties.name ?? `Alerta GDACS (${f.properties.eventtype ?? "desastre"})`,
      body: (f.properties.description ?? f.properties.htmldescription ?? "").slice(0, 1000),
      source: "GDACS",
      source_url: f.properties.url?.report ?? "https://www.gdacs.org/",
      published_at: f.properties.fromdate ?? new Date().toISOString(),
    }));
  } catch (e) {
    console.error("GDACS fetch failed:", e);
    return [];
  }
}

// ── AI classification ──────────────────────────────────────────────────────

async function classifyWithAI(items: RawItem[]): Promise<FieldNewsItem[]> {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY no configurada");
  }
  if (items.length === 0) return [];

  const userContent = items
    .map(
      (it, i) =>
        `[${i}] ID:${it.id}\nFuente:${it.source}\nFecha:${it.published_at}\nTítulo:${it.title}\nContenido:${it.body}`,
    )
    .join("\n\n---\n\n");

  const body = {
    model: "google/gemini-3-flash-preview",
    messages: [
      {
        role: "system",
        content:
          "Eres un asistente para agricultores de Cayaltí, Lambayeque (Perú). Recibes noticias/alertas reales en cualquier idioma. Para cada una: traduce al español si hace falta, resume en 1-2 frases muy claras (sin jerga técnica), clasifica severidad (alta/media/baja) según impacto para agricultura/comunidad, asigna categoría (clima, sismo, agua, plaga, social, otros) y propone una acción concreta corta (o null si no aplica). Descarta noticias irrelevantes para Lambayeque o sin impacto en agricultura/seguridad.",
      },
      {
        role: "user",
        content: `Procesa estas ${items.length} noticias:\n\n${userContent}`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "classify_news",
          description: "Devuelve la lista clasificada y resumida de noticias relevantes",
          parameters: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", description: "ID original recibido" },
                    title_es: { type: "string" },
                    summary_es: { type: "string" },
                    action_es: { type: ["string", "null"] },
                    severity: { type: "string", enum: ["alta", "media", "baja"] },
                    category: {
                      type: "string",
                      enum: ["clima", "sismo", "agua", "plaga", "social", "otros"],
                    },
                  },
                  required: ["id", "title_es", "summary_es", "severity", "category"],
                  additionalProperties: false,
                },
              },
            },
            required: ["items"],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "classify_news" } },
  };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Lovable AI error ${res.status}: ${txt.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{
      message?: {
        tool_calls?: Array<{ function?: { arguments?: string } }>;
      };
    }>;
  };

  const argsStr = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!argsStr) return [];

  const parsed = JSON.parse(argsStr) as {
    items: Array<{
      id: string;
      title_es: string;
      summary_es: string;
      action_es: string | null;
      severity: NewsSeverity;
      category: NewsCategory;
    }>;
  };

  const byId = new Map(items.map((i) => [i.id, i]));
  return parsed.items
    .map((c) => {
      const orig = byId.get(c.id);
      if (!orig) return null;
      return {
        id: c.id,
        title_es: c.title_es,
        summary_es: c.summary_es,
        action_es: c.action_es ?? null,
        severity: c.severity,
        category: c.category,
        source: orig.source,
        source_url: orig.source_url,
        published_at: orig.published_at,
      } as FieldNewsItem;
    })
    .filter((x): x is FieldNewsItem => x !== null);
}

// ── Cache + main ───────────────────────────────────────────────────────────

let CACHE: { ts: number; data: FieldNewsItem[] } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

export async function getFieldNews(): Promise<FieldNewsItem[]> {
  if (CACHE && Date.now() - CACHE.ts < CACHE_TTL_MS) {
    return CACHE.data;
  }

  const [rw, usgs, gdacs] = await Promise.all([
    fetchReliefWeb(),
    fetchUSGSEarthquakes(),
    fetchGDACS(),
  ]);

  const all = [...rw, ...usgs, ...gdacs].slice(0, 15);
  if (all.length === 0) {
    CACHE = { ts: Date.now(), data: [] };
    return [];
  }

  const classified = await classifyWithAI(all);
  // Sort: alta > media > baja, then most recent
  const order: Record<NewsSeverity, number> = { alta: 0, media: 1, baja: 2 };
  classified.sort((a, b) => {
    const s = order[a.severity] - order[b.severity];
    if (s !== 0) return s;
    return b.published_at.localeCompare(a.published_at);
  });

  CACHE = { ts: Date.now(), data: classified };
  return classified;
}
