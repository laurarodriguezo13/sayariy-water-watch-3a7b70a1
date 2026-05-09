export type Risk = "bajo" | "medio" | "alto";

export interface Community {
  id: string;
  name: string;
  province: string;
  description: string;
  risk: Risk;
  ndvi: number;
  ndwi: number;
  evi: number;
  stressProbability: number; // 0-1
}

export const COMMUNITIES: Community[] = [
  {
    id: "cayalti",
    name: "Cayaltí",
    province: "Chiclayo, Lambayeque",
    description: "Cultivos de caña y arroz en la cuenca del Zaña.",
    risk: "medio",
    ndvi: 0.58,
    ndwi: 0.12,
    evi: 0.38,
    stressProbability: 0.42,
  },
  {
    id: "nueva-libertad",
    name: "Nueva Libertad",
    province: "Chiclayo, Lambayeque",
    description: "Pequeña agricultura familiar con riego solar.",
    risk: "alto",
    ndvi: 0.41,
    ndwi: 0.05,
    evi: 0.28,
    stressProbability: 0.71,
  },
  {
    id: "victor-raul",
    name: "Víctor Raúl",
    province: "Chiclayo, Lambayeque",
    description: "Comunidad con acuífero somero y bombeo solar.",
    risk: "bajo",
    ndvi: 0.68,
    ndwi: 0.22,
    evi: 0.46,
    stressProbability: 0.18,
  },
  {
    id: "reque",
    name: "Reque",
    province: "Chiclayo, Lambayeque",
    description: "Zona periurbana con cultivos hortícolas.",
    risk: "medio",
    ndvi: 0.55,
    ndwi: 0.14,
    evi: 0.36,
    stressProbability: 0.39,
  },
  {
    id: "monsefu",
    name: "Monsefú",
    province: "Chiclayo, Lambayeque",
    description: "Tradición agrícola y artesanal.",
    risk: "bajo",
    ndvi: 0.64,
    ndwi: 0.19,
    evi: 0.43,
    stressProbability: 0.22,
  },
];

export function getCommunity(id: string): Community | undefined {
  return COMMUNITIES.find((c) => c.id === id);
}

export function riskColor(risk: Risk): string {
  return risk === "alto"
    ? "bg-primary/15 text-primary border-primary/30"
    : risk === "medio"
    ? "bg-accent/30 text-accent-foreground border-accent/50"
    : "bg-success/15 text-success border-success/30";
}

// Mock 12-week time series (NDVI/NDWI/EVI)
export function mockTimeSeries(seed: number) {
  const out: { week: string; NDVI: number; NDWI: number; EVI: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    out.push({
      week: `S${i + 1}`,
      NDVI: +(0.45 + 0.2 * Math.sin(seed + t * 4) + 0.05 * Math.cos(i)).toFixed(2),
      NDWI: +(0.15 + 0.08 * Math.sin(seed * 1.3 + t * 3)).toFixed(2),
      EVI: +(0.32 + 0.12 * Math.sin(seed * 0.8 + t * 5)).toFixed(2),
    });
  }
  return out;
}

export interface Alert {
  id: string;
  communityId: string;
  level: Risk;
  date: string;
  title: string;
  message: string;
}

export const ALERTS: Alert[] = [
  {
    id: "a1",
    communityId: "nueva-libertad",
    level: "alto",
    date: "2026-05-04",
    title: "Caída sostenida del NDVI",
    message:
      "Se observa una baja del 18% en el NDVI promedio durante las últimas 3 semanas. Recomendamos verificar el caudal de las bombas solares y priorizar el riego en parcelas del sector norte.",
  },
  {
    id: "a2",
    communityId: "cayaltí",
    level: "medio",
    date: "2026-05-02",
    title: "Estrés moderado en parcelas sur",
    message:
      "El NDWI muestra reducción de humedad superficial. Conviene reforzar el monitoreo en los próximos 10 días.",
  },
];
