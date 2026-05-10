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
} from "@/lib/cropguard-api";

export interface ReportData {
  status?: StatusData;
  well?: WellData;
  forecast?: ForecastDay[];
  irrigation?: IrrigationRec;
  enso?: EnsoData;
  crops?: CropRec[];
  communities?: Community[];
  alerts?: Alert[];
  timeseries?: { id: string; name: string; data: TimeseriesPoint[] }[];
}

// Strip emoji / non-latin1 characters that jsPDF's default fonts cannot render.
const clean = (s: string | undefined) =>
  (s ?? "")
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

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

export async function generateReportPdf(data: ReportData): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;

  let logoData = "";
  try {
    logoData = await loadLogoDataUrl();
  } catch {
    /* ignore */
  }

  const drawHeader = () => {
    if (logoData) {
      try {
        doc.addImage(logoData, "PNG", margin, 10, 18, 18);
      } catch {
        /* ignore */
      }
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20, 83, 45);
    doc.text("Sayariy CropGuard", margin + 22, 17);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Reporte de estado — Pozos y Cultivos", margin + 22, 23);
    doc.setDrawColor(200);
    doc.line(margin, 32, pageW - margin, 32);
  };

  const drawFooter = (page: number, total: number) => {
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `Sayariy Resurgiendo · Cayalti, Lambayeque, Peru · Generado ${new Date().toLocaleString("es-PE")}`,
      margin,
      pageH - 8
    );
    doc.text(`Pagina ${page} / ${total}`, pageW - margin, pageH - 8, { align: "right" });
  };

  let y = 38;
  drawHeader();

  // Cover summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text("Reporte integral de campo", margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`Fecha de generacion: ${new Date().toLocaleString("es-PE")}`, margin, y);
  y += 5;
  doc.text("Cobertura: Cayalti y comunidades vecinas (Lambayeque, Peru)", margin, y);
  y += 10;

  // Status box
  if (data.status) {
    const tl = data.status.traffic_light;
    const colors: Record<string, [number, number, number]> = {
      verde: [34, 197, 94],
      amarillo: [245, 158, 11],
      rojo: [239, 68, 68],
    };
    const c = colors[tl] ?? [100, 100, 100];
    doc.setFillColor(...c);
    doc.roundedRect(margin, y, pageW - margin * 2, 22, 3, 3, "F");
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Estado general: ${tl.toUpperCase()}`, margin + 4, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(clean(data.status.summary_es), pageW - margin * 2 - 8);
    doc.text(lines, margin + 4, y + 14);
    y += 28;
  }

  // Key indicators table
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Indicadores clave", margin, y);
  y += 3;

  autoTable(doc, {
    startY: y + 2,
    margin: { left: margin, right: margin },
    head: [["Indicador", "Valor", "Detalle"]],
    body: [
      [
        "Nivel del pozo",
        data.well?.pct_capacity != null ? `${data.well.pct_capacity.toFixed(1)} %` : "—",
        data.well?.static_m != null ? `${data.well.static_m.toFixed(2)} m de profundidad` : "—",
      ],
      [
        "Ultima medicion del pozo",
        fmtDate(data.well?.date),
        `Critico: ${data.well?.critical_m ?? "—"} m / Lleno: ${data.well?.full_m ?? "—"} m`,
      ],
      [
        "ICEN (Nino Costero)",
        data.enso ? `${data.enso.icen.anom_c.toFixed(2)} C` : "—",
        clean(data.enso?.icen.label_es),
      ],
      [
        "ONI (Nino global)",
        data.enso ? `${data.enso.oni.anom_c.toFixed(2)} C` : "—",
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
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [20, 83, 45], textColor: 255 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 45 }, 1: { cellWidth: 35 } },
  });
  // @ts-expect-error autotable adds lastAutoTable
  y = doc.lastAutoTable.finalY + 8;

  // Forecast 7 days
  if (data.forecast?.length) {
    if (y > pageH - 70) {
      doc.addPage();
      drawHeader();
      y = 38;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("Pronostico 7 dias", margin, y);
    y += 3;
    autoTable(doc, {
      startY: y + 2,
      margin: { left: margin, right: margin },
      head: [["Fecha", "Lluvia (mm)", "ET0 (mm)", "T max", "T min", "HR max", "HR min"]],
      body: data.forecast.map((d) => [
        fmtDate(d.date),
        d.rain_mm.toFixed(1),
        d.et0_mm.toFixed(1),
        `${d.tmax_c.toFixed(1)} C`,
        `${d.tmin_c.toFixed(1)} C`,
        `${d.rh_max_pct} %`,
        `${d.rh_min_pct} %`,
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
    });
    // @ts-expect-error
    y = doc.lastAutoTable.finalY + 4;

    // Simple rain bar chart
    const totalRain = data.forecast.reduce((s, d) => s + d.rain_mm, 0);
    const maxRain = Math.max(2, ...data.forecast.map((d) => d.rain_mm));
    const chartW = pageW - margin * 2;
    const barH = 6;
    const gap = 2;
    if (y + (barH + gap) * data.forecast.length + 12 > pageH - 20) {
      doc.addPage();
      drawHeader();
      y = 38;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Distribucion de lluvia (total ${totalRain.toFixed(1)} mm)`, margin, y);
    y += 4;
    data.forecast.forEach((d) => {
      const w = (d.rain_mm / maxRain) * (chartW - 50);
      doc.setFillColor(96, 165, 250);
      doc.rect(margin + 28, y, Math.max(0.2, w), barH, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);
      doc.text(fmtDate(d.date).slice(0, 6), margin, y + 4.5);
      doc.text(`${d.rain_mm.toFixed(1)} mm`, margin + 28 + Math.max(0.2, w) + 2, y + 4.5);
      y += barH + gap;
    });
    y += 6;
  }

  // ENSO detail
  if (data.enso) {
    if (y > pageH - 50) {
      doc.addPage();
      drawHeader();
      y = 38;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("Estado del clima (ENSO / Nino Costero)", margin, y);
    y += 5;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    const txt = doc.splitTextToSize(
      `${clean(data.enso.icen.label_es)}. ${clean(data.enso.icen.risk_es)}`,
      pageW - margin * 2
    );
    doc.text(txt, margin, y);
    y += txt.length * 5 + 6;
  }

  // Communities table
  if (data.communities?.length) {
    if (y > pageH - 60) {
      doc.addPage();
      drawHeader();
      y = 38;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("Comunidades monitoreadas", margin, y);
    autoTable(doc, {
      startY: y + 3,
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
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [20, 83, 45], textColor: 255 },
    });
    // @ts-expect-error
    y = doc.lastAutoTable.finalY + 8;
  }

  // Crops
  if (data.crops?.length) {
    doc.addPage();
    drawHeader();
    y = 38;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text("Recomendaciones por cultivo", margin, y);
    y += 8;
    data.crops.forEach((c) => {
      const colors: Record<string, [number, number, number]> = {
        green: [220, 252, 231],
        yellow: [254, 243, 199],
        red: [254, 226, 226],
      };
      const border: Record<string, [number, number, number]> = {
        green: [34, 197, 94],
        yellow: [245, 158, 11],
        red: [239, 68, 68],
      };
      const bg = colors[c.severity] ?? [240, 240, 240];
      const bd = border[c.severity] ?? [180, 180, 180];

      const title = clean(c.title_es);
      const body = clean(c.body_es);
      const action = clean(c.action_es);
      const titleLines = doc.splitTextToSize(title, pageW - margin * 2 - 8);
      const bodyLines = doc.splitTextToSize(body, pageW - margin * 2 - 8);
      const actionLines = doc.splitTextToSize(`Accion: ${action}`, pageW - margin * 2 - 8);
      const blockH = 8 + titleLines.length * 5 + bodyLines.length * 4.5 + actionLines.length * 4.5 + 6;

      if (y + blockH > pageH - 20) {
        doc.addPage();
        drawHeader();
        y = 38;
      }
      doc.setFillColor(...bg);
      doc.setDrawColor(...bd);
      doc.roundedRect(margin, y, pageW - margin * 2, blockH, 2.5, 2.5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 30, 50);
      doc.text(`${c.crop.toUpperCase()}`, margin + 4, y + 6);
      doc.setFontSize(10);
      doc.text(titleLines, margin + 4, y + 12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60);
      doc.text(bodyLines, margin + 4, y + 12 + titleLines.length * 5);
      doc.setFont("helvetica", "bold");
      doc.text(
        actionLines,
        margin + 4,
        y + 12 + titleLines.length * 5 + bodyLines.length * 4.5 + 2
      );
      y += blockH + 4;
    });
  }

  // Alerts
  if (data.alerts?.length) {
    if (y > pageH - 60) {
      doc.addPage();
      drawHeader();
      y = 38;
    } else {
      y += 4;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("Avisos activos", margin, y);
    autoTable(doc, {
      startY: y + 3,
      margin: { left: margin, right: margin },
      head: [["Nivel", "Titulo", "Mensaje"]],
      body: data.alerts.map((a) => [a.level.toUpperCase(), clean(a.title), clean(a.message)]),
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [120, 53, 15], textColor: 255 },
      columnStyles: { 0: { cellWidth: 22, fontStyle: "bold" }, 1: { cellWidth: 50 } },
    });
  }

  // Timeseries summary
  if (data.timeseries?.length) {
    doc.addPage();
    drawHeader();
    y = 38;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text("Serie temporal de estres por comunidad", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(
      "Promedio, minimo y maximo de probabilidad de estres hidrico observados (Sentinel-2 + IA).",
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
          `${(Math.min(...stress) * 100).toFixed(0)} %`,
          `${(Math.max(...stress) * 100).toFixed(0)} %`,
          avg(ndvi).toFixed(3),
        ];
      }),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [20, 83, 45], textColor: 255 },
    });
  }

  // Footer on every page
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawFooter(i, total);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`sayariy-cropguard-reporte-${stamp}.pdf`);
}
