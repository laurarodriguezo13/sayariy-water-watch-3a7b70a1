import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "@/assets/sayariy-logo.png";
import type {
  Community,
  CropRec,
  EnsoData,
  ForecastDay,
  IrrigationRec,
  StatusData,
  WellData,
  Alert,
  TimeseriesPoint,
  RainHistoryDay,
} from "@/lib/cropguard-api";

export interface ReportData {
  status?: StatusData;
  well?: WellData;
  forecast?: ForecastDay[];
  rainHistory?: RainHistoryDay[];
  irrigation?: IrrigationRec;
  enso?: EnsoData;
  crops?: CropRec[];
  communities?: Community[];
  alerts?: Alert[];
  timeseries?: { id: string; name: string; data: TimeseriesPoint[] }[];
}

// Brand palette (RGB)
const BRAND = {
  magenta: [168, 25, 92] as [number, number, number],
  magentaDark: [120, 18, 66] as [number, number, number],
  orange: [232, 163, 61] as [number, number, number],
  green: [63, 165, 53] as [number, number, number],
  ink: [34, 24, 38] as [number, number, number],
  muted: [110, 100, 110] as [number, number, number],
  cream: [252, 248, 242] as [number, number, number],
  line: [220, 214, 210] as [number, number, number],
};

// Strip emoji and characters jsPDF default fonts cannot render.
const clean = (s: string | undefined) =>
  (s ?? "")
    // Pictographic emoji ranges
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}]/gu, "")
    // Variation selectors, ZWJ, regional indicators, combining marks leftovers
    .replace(/[\u{FE00}-\u{FE0F}\u{200D}\u{20D0}-\u{20FF}]/gu, "")
    // Bullets and other symbols Times can't render cleanly
    .replace(/[\u2022\u25CF\u25AA\u25A0]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const CROP_LABELS: Record<string, string> = {
  maracuya: "MARACUYÁ",
  camote: "CAMOTE",
  frijol: "FRIJOL",
  maiz: "MAÍZ",
  _suggestion: "SUGERENCIA",
  suggestion: "SUGERENCIA",
};
const cropLabel = (c: string) =>
  CROP_LABELS[c?.toLowerCase?.() ?? ""] ?? clean(c).toUpperCase();

// Use Times for titles (formal serif, embedded, renders cleanly).
// Helvetica bold has letter-spacing bugs in jsPDF — avoid it.
const TITLE = "times";
const BODY = "helvetica";

async function loadLogoDataUrl(): Promise<string> {
  const res = await fetch(logoUrl);
  const blob = await res.blob();
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function shortDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

export async function generateReportPdf(data: ReportData): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;

  let logoData = "";
  try {
    logoData = await loadLogoDataUrl();
  } catch {
    /* ignore */
  }

  const drawHeader = (pageNumber: number) => {
    // Top brand band
    doc.setFillColor(...BRAND.magenta);
    doc.rect(0, 0, pageW, 4, "F");
    doc.setFillColor(...BRAND.orange);
    doc.rect(0, 4, pageW, 1, "F");

    if (logoData) {
      try {
        doc.addImage(logoData, "PNG", margin, 9, 14, 14);
      } catch {
        /* ignore */
      }
    }
    doc.setFont(TITLE, "bold");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.magentaDark);
    doc.text("Sayariy CropGuard", margin + 18, 16);
    doc.setFont(BODY, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND.muted);
    doc.text("Reporte de estado · Pozos y Cultivos", margin + 18, 21);

    // Page indicator on the right (only after page 1 has the cover header style)
    if (pageNumber > 1) {
      doc.setFont(TITLE, "italic");
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.muted);
      doc.text("Cayalti · Lambayeque", pageW - margin, 16, { align: "right" });
    }

    doc.setDrawColor(...BRAND.line);
    doc.setLineWidth(0.2);
    doc.line(margin, 27, pageW - margin, 27);
  };

  const drawFooter = (page: number, total: number) => {
    doc.setDrawColor(...BRAND.line);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
    doc.setFont(BODY, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text(
      `Sayariy Resurgiendo · Generado el ${new Date().toLocaleString("es-PE")}`,
      margin,
      pageH - 7
    );
    doc.setFont(TITLE, "italic");
    doc.text(`${page} / ${total}`, pageW - margin, pageH - 7, { align: "right" });
  };

  const sectionTitle = (text: string, y: number) => {
    doc.setFont(TITLE, "bold");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.ink);
    doc.text(text, margin, y);
    // Accent underline
    const w = doc.getTextWidth(text);
    doc.setDrawColor(...BRAND.orange);
    doc.setLineWidth(0.8);
    doc.line(margin, y + 1.5, margin + Math.min(w, 50), y + 1.5);
    doc.setLineWidth(0.2);
    return y + 8;
  };

  const ensureSpace = (y: number, needed: number) => {
    if (y + needed > pageH - 18) {
      doc.addPage();
      drawHeader(doc.getNumberOfPages());
      return 34;
    }
    return y;
  };

  let y = 34;
  drawHeader(1);

  // ---- Cover ----
  doc.setFont(TITLE, "bold");
  doc.setFontSize(26);
  doc.setTextColor(...BRAND.ink);
  doc.text("Reporte integral de campo", margin, y + 6);
  y += 14;
  doc.setFont(TITLE, "italic");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.muted);
  doc.text(
    `Emitido el ${new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })}`,
    margin,
    y
  );
  y += 5;
  doc.setFont(BODY, "normal");
  doc.setFontSize(9.5);
  doc.text("Cobertura: Cayalti y comunidades vecinas, Lambayeque, Peru.", margin, y);
  y += 10;

  // ---- Status banner ----
  if (data.status) {
    const tl = data.status.traffic_light;
    const palette: Record<string, [number, number, number]> = {
      verde: BRAND.green,
      amarillo: BRAND.orange,
      rojo: [200, 50, 50],
    };
    const labels: Record<string, string> = {
      verde: "Estado favorable",
      amarillo: "Atencion requerida",
      rojo: "Riesgo elevado",
    };
    const c = palette[tl] ?? [120, 120, 120];
    const summary = clean(data.status.summary_es);
    const summaryLines = doc.splitTextToSize(summary, pageW - margin * 2 - 14);
    const boxH = 14 + summaryLines.length * 5;

    // Left color rail
    doc.setFillColor(...c);
    doc.rect(margin, y, 4, boxH, "F");
    // Card background
    doc.setFillColor(...BRAND.cream);
    doc.rect(margin + 4, y, pageW - margin * 2 - 4, boxH, "F");

    doc.setFont(TITLE, "bold");
    doc.setFontSize(12);
    doc.setTextColor(...c);
    doc.text(labels[tl] ?? tl.toUpperCase(), margin + 9, y + 7);

    doc.setFont(BODY, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND.ink);
    doc.text(summaryLines, margin + 9, y + 13);
    y += boxH + 8;
  }

  // ---- Indicators ----
  y = sectionTitle("Indicadores clave", y);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Indicador", "Valor", "Detalle"]],
    body: [
      [
        "Nivel del pozo",
        data.well?.pct_capacity != null ? `${data.well.pct_capacity.toFixed(1)} %` : "—",
        data.well?.static_m != null ? `${data.well.static_m.toFixed(2)} m de profundidad` : "—",
      ],
      [
        "Ultima medicion",
        fmtDate(data.well?.date),
        `Critico: ${data.well?.critical_m ?? "—"} m / Lleno: ${data.well?.full_m ?? "—"} m`,
      ],
      [
        "ICEN (Nino Costero)",
        data.enso ? `${data.enso.icen.anom_c.toFixed(2)} °C` : "—",
        clean(data.enso?.icen.label_es),
      ],
      [
        "ONI (Nino global)",
        data.enso ? `${data.enso.oni.anom_c.toFixed(2)} °C` : "—",
        data.enso?.oni.state ?? "—",
      ],
      [
        "Lluvia ultimos 3 dias",
        data.status?.rain_3d_mm != null ? `${data.status.rain_3d_mm.toFixed(1)} mm` : "—",
        "Fuente: Open-Meteo",
      ],
      [
        "Recomendacion de riego",
        data.irrigation?.decision?.toUpperCase() ?? "—",
        clean(data.irrigation?.text_es),
      ],
    ],
    styles: { font: BODY, fontSize: 9, cellPadding: 3, textColor: BRAND.ink, lineColor: BRAND.line, lineWidth: 0.1 },
    headStyles: { font: TITLE, fontStyle: "bold", fillColor: BRAND.magenta, textColor: 255, fontSize: 9.5 },
    alternateRowStyles: { fillColor: [250, 247, 244] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 48 }, 1: { cellWidth: 38 } },
  });
  // @ts-expect-error autotable adds lastAutoTable
  y = doc.lastAutoTable.finalY + 10;

  // ---- Forecast ----
  if (data.forecast?.length) {
    y = ensureSpace(y, 80);
    y = sectionTitle("Pronostico 7 dias", y);
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Fecha", "Lluvia", "ET0", "T max", "T min", "HR max", "HR min"]],
      body: data.forecast.map((d) => [
        shortDate(d.date),
        `${d.rain_mm.toFixed(1)} mm`,
        `${d.et0_mm.toFixed(1)} mm`,
        `${d.tmax_c.toFixed(1)} °C`,
        `${d.tmin_c.toFixed(1)} °C`,
        `${d.rh_max_pct} %`,
        `${d.rh_min_pct} %`,
      ]),
      styles: { font: BODY, fontSize: 9, cellPadding: 2.5, lineColor: BRAND.line, lineWidth: 0.1 },
      headStyles: { font: TITLE, fontStyle: "bold", fillColor: BRAND.magentaDark, textColor: 255 },
      alternateRowStyles: { fillColor: [250, 247, 244] },
    });
    // @ts-expect-error
    y = doc.lastAutoTable.finalY + 8;

    // Rain chart
    const totalRain = data.forecast.reduce((s, d) => s + d.rain_mm, 0);
    const maxRain = Math.max(2, ...data.forecast.map((d) => d.rain_mm));
    const chartH = 50;
    y = ensureSpace(y, chartH + 18);

    doc.setFont(TITLE, "bold");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.ink);
    doc.text(`Distribucion de lluvia`, margin, y);
    doc.setFont(BODY, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(`Total semanal: ${totalRain.toFixed(1)} mm`, pageW - margin, y, { align: "right" });
    y += 4;

    const chartX = margin;
    const chartY = y;
    const chartW = pageW - margin * 2;
    // Axis baseline
    doc.setDrawColor(...BRAND.line);
    doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);

    const n = data.forecast.length;
    const slotW = chartW / n;
    const barW = Math.min(14, slotW * 0.55);
    data.forecast.forEach((d, i) => {
      const h = (d.rain_mm / maxRain) * (chartH - 8);
      const cx = chartX + slotW * i + slotW / 2;
      const bx = cx - barW / 2;
      const by = chartY + chartH - Math.max(0.4, h);
      doc.setFillColor(...BRAND.magenta);
      doc.rect(bx, by, barW, Math.max(0.4, h), "F");
      // Value
      doc.setFont(BODY, "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND.ink);
      doc.text(`${d.rain_mm.toFixed(1)}`, cx, by - 1.5, { align: "center" });
      // Date label
      doc.setTextColor(...BRAND.muted);
      doc.text(shortDate(d.date), cx, chartY + chartH + 4, { align: "center" });
    });
    y = chartY + chartH + 10;
  }

  // ---- ENSO ----
  if (data.enso) {
    y = ensureSpace(y, 30);
    y = sectionTitle("Estado del clima (ENSO / Nino Costero)", y);
    doc.setFont(BODY, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND.ink);
    const txt = doc.splitTextToSize(
      `${clean(data.enso.icen.label_es)}. ${clean(data.enso.icen.risk_es)}`,
      pageW - margin * 2
    );
    doc.text(txt, margin, y);
    y += txt.length * 5 + 6;
  }

  // ---- Communities ----
  if (data.communities?.length) {
    y = ensureSpace(y, 50);
    y = sectionTitle("Comunidades monitoreadas", y);
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Comunidad", "NDVI", "NDWI", "EVI", "Estres", "Estado"]],
      body: data.communities.map((c) => [
        c.name,
        c.ndvi.toFixed(3),
        c.ndwi.toFixed(3),
        c.evi.toFixed(3),
        `${(c.stress_probability * 100).toFixed(0)} %`,
        c.status,
      ]),
      styles: { font: BODY, fontSize: 9, cellPadding: 2.5, lineColor: BRAND.line, lineWidth: 0.1 },
      headStyles: { font: TITLE, fontStyle: "bold", fillColor: BRAND.green, textColor: 255 },
      alternateRowStyles: { fillColor: [250, 247, 244] },
      columnStyles: { 0: { fontStyle: "bold" } },
    });
    // @ts-expect-error
    y = doc.lastAutoTable.finalY + 8;
  }

  // ---- Crops ----
  if (data.crops?.length) {
    doc.addPage();
    drawHeader(doc.getNumberOfPages());
    y = 34;
    y = sectionTitle("Recomendaciones por cultivo", y);

    data.crops.forEach((c) => {
      const accents: Record<string, [number, number, number]> = {
        green: BRAND.green,
        yellow: BRAND.orange,
        red: [200, 50, 50],
      };
      const accent = accents[c.severity] ?? [150, 150, 150];

      const title = clean(c.title_es);
      const body = clean(c.body_es);
      const action = clean(c.action_es);
      const titleLines = doc.splitTextToSize(title, pageW - margin * 2 - 12);
      const bodyLines = doc.splitTextToSize(body, pageW - margin * 2 - 12);
      const actionLines = doc.splitTextToSize(action, pageW - margin * 2 - 22);
      const blockH =
        10 + titleLines.length * 5 + bodyLines.length * 4.5 + actionLines.length * 4.5 + 10;

      y = ensureSpace(y, blockH + 4);

      // Card background
      doc.setFillColor(252, 250, 247);
      doc.setDrawColor(...BRAND.line);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, y, pageW - margin * 2, blockH, 2, 2, "FD");
      // Color rail
      doc.setFillColor(...accent);
      doc.rect(margin, y, 3, blockH, "F");

      // Crop tag
      doc.setFont(TITLE, "bold");
      doc.setFontSize(10);
      doc.setTextColor(...accent);
      doc.text(cropLabel(c.crop), margin + 7, y + 7);

      doc.setFont(TITLE, "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(...BRAND.ink);
      doc.text(titleLines, margin + 7, y + 13);

      doc.setFont(BODY, "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...BRAND.ink);
      const bodyY = y + 13 + titleLines.length * 5 + 1;
      doc.text(bodyLines, margin + 7, bodyY);

      const actionY = bodyY + bodyLines.length * 4.5 + 4;
      doc.setFont(TITLE, "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(...accent);
      doc.text("Accion:", margin + 7, actionY);
      doc.setFont(BODY, "normal");
      doc.setTextColor(...BRAND.ink);
      doc.text(actionLines, margin + 22, actionY);

      y += blockH + 5;
    });
  }

  // ---- Alerts ----
  if (data.alerts?.length) {
    y = ensureSpace(y, 40);
    y = sectionTitle("Avisos activos", y);
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Nivel", "Titulo", "Mensaje"]],
      body: data.alerts.map((a) => [a.level.toUpperCase(), clean(a.title), clean(a.message)]),
      styles: { font: BODY, fontSize: 9, cellPadding: 3, lineColor: BRAND.line, lineWidth: 0.1 },
      headStyles: { font: TITLE, fontStyle: "bold", fillColor: BRAND.orange, textColor: 255 },
      alternateRowStyles: { fillColor: [250, 247, 244] },
      columnStyles: { 0: { cellWidth: 24, fontStyle: "bold" }, 1: { cellWidth: 52 } },
    });
    // @ts-expect-error
    y = doc.lastAutoTable.finalY + 8;
  }

  // ---- Timeseries summary ----
  if (data.timeseries?.length) {
    doc.addPage();
    drawHeader(doc.getNumberOfPages());
    y = 34;
    y = sectionTitle("Serie temporal de estres por comunidad", y);
    doc.setFont(BODY, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(
      "Promedio, minimo y maximo de probabilidad de estres hidrico (Sentinel-2 + IA).",
      margin,
      y
    );
    y += 5;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Comunidad", "Puntos", "Estres prom.", "Min", "Max", "NDVI prom."]],
      body: data.timeseries.map((s) => {
        const stress = s.data.map((p) => p.stress_prob);
        const ndvi = s.data.map((p) => p.ndvi);
        const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
        return [
          s.name,
          String(s.data.length),
          `${(avg(stress) * 100).toFixed(0)} %`,
          stress.length ? `${(Math.min(...stress) * 100).toFixed(0)} %` : "—",
          stress.length ? `${(Math.max(...stress) * 100).toFixed(0)} %` : "—",
          avg(ndvi).toFixed(3),
        ];
      }),
      styles: { font: BODY, fontSize: 9, cellPadding: 2.5, lineColor: BRAND.line, lineWidth: 0.1 },
      headStyles: { font: TITLE, fontStyle: "bold", fillColor: BRAND.magenta, textColor: 255 },
      alternateRowStyles: { fillColor: [250, 247, 244] },
      columnStyles: { 0: { fontStyle: "bold" } },
    });
  }

  // Footers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawFooter(i, total);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`sayariy-cropguard-reporte-${stamp}.pdf`);
}
