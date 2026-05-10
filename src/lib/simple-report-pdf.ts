/**
 * PDF simplificado para agricultores.
 * Sin jerga técnica, emojis grandes, tipografía amplia y barras visuales.
 *
 * Filosofía: si un agricultor no sabe leer NDVI, debe entender el documento
 * solo viendo colores, iconos y números grandes.
 */
import jsPDF from "jspdf";
import logoUrl from "@/assets/sayariy-logo.png";
import type {
  CropRec,
  EnsoData,
  ForecastDay,
  IrrigationRec,
  StatusData,
  WellData,
  Alert,
} from "@/lib/cropguard-api";

export interface SimpleReportData {
  status?: StatusData;
  well?: WellData;
  forecast?: ForecastDay[];
  irrigation?: IrrigationRec;
  enso?: EnsoData;
  crops?: CropRec[];
  alerts?: Alert[];
}

const C = {
  ink: [30, 30, 30] as [number, number, number],
  muted: [110, 110, 115] as [number, number, number],
  green: [46, 160, 67] as [number, number, number],
  amber: [232, 163, 23] as [number, number, number],
  red: [210, 50, 45] as [number, number, number],
  blue: [54, 130, 220] as [number, number, number],
  teal: [50, 160, 160] as [number, number, number],
  magenta: [168, 25, 92] as [number, number, number],
  cream: [253, 248, 238] as [number, number, number],
  line: [220, 215, 210] as [number, number, number],
};

// Strip emoji & glyphs jsPDF default fonts cannot render.
const clean = (s?: string) =>
  (s ?? "")
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}]/gu, "")
    .replace(/[\u{FE00}-\u{FE0F}\u{200D}\u{20D0}-\u{20FF}]/gu, "")
    .replace(/[\u2022\u25CF\u25AA\u25A0]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const CROP_LABELS: Record<string, string> = {
  maracuya: "MARACUYA",
  camote: "CAMOTE",
  frijol: "FRIJOL",
  maiz: "MAIZ",
  _suggestion: "SUGERENCIA",
  suggestion: "SUGERENCIA",
};

const CROP_ICON_TEXT: Record<string, string> = {
  maracuya: "(F)",
  camote: "(R)",
  frijol: "(L)",
  maiz: "(M)",
  _suggestion: "(*)",
  suggestion: "(*)",
};

async function loadLogo(): Promise<string> {
  const res = await fetch(logoUrl);
  const blob = await res.blob();
  return await new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(blob);
  });
}

function shortDay(s?: string) {
  if (!s) return "";
  return new Date(s + "T12:00:00").toLocaleDateString("es-PE", { weekday: "short" });
}

// Map a forecast day to a simple text label (no emojis — jsPDF can't render them).
function weatherLabel(d: ForecastDay): { text: string; color: [number, number, number] } {
  if (d.rain_mm >= 5) return { text: "LLUVIA", color: C.blue };
  if (d.rain_mm >= 1) return { text: "LLOVIZNA", color: C.blue };
  if (d.tmax_c >= 30) return { text: "MUY SOL", color: C.amber };
  if (d.rh_max_pct >= 90) return { text: "NUBLADO", color: C.muted };
  return { text: "SOL", color: C.amber };
}

function tipForCrop(crop: string, status?: StatusData, enso?: EnsoData): string {
  const dry = (status?.rain_3d_mm ?? 0) < 2;
  const ninoActive = enso && enso.icen.state !== "Normal";
  const c = crop.toLowerCase();
  if (c === "maracuya")
    return ninoActive
      ? "Temporada seca, El Nino activo. Prepare drenajes y revise riego ya."
      : dry
        ? "Riegue de noche. Cuide flores y abeja polinizadora."
        : "Buen momento. Mantenga riego regular.";
  if (c === "camote")
    return dry ? "Riegue ligero cada 3 dias." : "Cuide hongos en hojas tras la lluvia.";
  if (c === "frijol")
    return ninoActive ? "Posponga siembra si hay aviso de lluvia fuerte." : "Buen momento para sembrar.";
  if (c === "maiz")
    return dry ? "Riegue al amanecer. Vigile estres en hojas." : "Bien. Revise plagas en mazorca.";
  return "Siga la guia del tecnico de campo.";
}

export async function generateSimpleReportPdf(data: SimpleReportData): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 14;

  let logoData = "";
  try {
    logoData = await loadLogo();
  } catch {
    /* ignore */
  }

  const drawHeader = () => {
    // Top color band
    doc.setFillColor(...C.magenta);
    doc.rect(0, 0, pageW, 6, "F");
    doc.setFillColor(...C.amber);
    doc.rect(0, 6, pageW, 1.5, "F");

    if (logoData) {
      try {
        doc.addImage(logoData, "PNG", M, 11, 16, 16);
      } catch {
        /* ignore */
      }
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...C.ink);
    doc.text("Guia del agricultor", M + 20, 19);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...C.muted);
    doc.text("Lo que importa hoy en Cayalti", M + 20, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text(
      new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" }),
      pageW - M,
      19,
      { align: "right" }
    );
  };

  const ensure = (y: number, need: number) => {
    if (y + need > pageH - 18) {
      doc.addPage();
      drawHeader();
      return 36;
    }
    return y;
  };

  drawHeader();
  let y = 36;

  // ── 1. Traffic light card (BIG) ─────────────────────────────────────────────
  if (data.status) {
    const tl = data.status.traffic_light;
    const palette = { verde: C.green, amarillo: C.amber, rojo: C.red } as const;
    const labels = {
      verde: "TODO BIEN",
      amarillo: "ATENCION",
      rojo: "ALERTA",
    } as const;
    const messages = {
      verde: "Puede trabajar con normalidad.",
      amarillo: "Cuide el agua y revise sus cultivos.",
      rojo: "Tome precauciones. Use solo el agua necesaria.",
    } as const;
    const c = palette[tl] ?? C.muted;

    const boxH = 38;
    doc.setFillColor(...c);
    doc.roundedRect(M, y, pageW - M * 2, boxH, 4, 4, "F");

    // Big circle
    doc.setFillColor(255, 255, 255);
    doc.circle(M + 18, y + boxH / 2, 11, "F");
    doc.setFillColor(...c);
    doc.circle(M + 18, y + boxH / 2, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(labels[tl] ?? tl.toUpperCase(), M + 36, y + 17);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(messages[tl] ?? "", M + 36, y + 26);

    const summary = clean(data.status.summary_es);
    if (summary) {
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(summary, pageW - M * 2 - 40);
      doc.text(lines.slice(0, 1), M + 36, y + 33);
    }
    y += boxH + 8;
  }

  // ── 2. Well water level (visual tank) ──────────────────────────────────────
  if (data.well?.available && data.well.pct_capacity != null) {
    y = ensure(y, 50);
    const pct = data.well.pct_capacity;
    const tankColor = pct > 60 ? C.teal : pct > 30 ? C.amber : C.red;
    const tankLabel = pct > 60 ? "Nivel bueno" : pct > 30 ? "Nivel medio" : "Nivel bajo";
    const advice =
      pct > 60
        ? "Hay agua suficiente para regar."
        : pct > 30
          ? "Riegue solo lo necesario. Vigile el nivel."
          : "Use el agua con mucho cuidado. Solo lo esencial.";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...C.ink);
    doc.text("Agua del pozo", M, y);
    y += 4;

    const tankX = M;
    const tankY = y + 2;
    const tankW = 22;
    const tankH = 36;
    // Tank outline
    doc.setDrawColor(...C.line);
    doc.setLineWidth(0.6);
    doc.roundedRect(tankX, tankY, tankW, tankH, 2, 2, "S");
    // Fill
    const fillH = (pct / 100) * (tankH - 2);
    doc.setFillColor(...tankColor);
    doc.roundedRect(tankX + 1, tankY + tankH - fillH - 1, tankW - 2, fillH, 1, 1, "F");

    // Big percent
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    doc.setTextColor(...tankColor);
    doc.text(`${Math.round(pct)}%`, tankX + tankW + 6, tankY + 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...C.ink);
    doc.text(tankLabel, tankX + tankW + 6, tankY + 26);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...C.muted);
    const adviceLines = doc.splitTextToSize(advice, pageW - tankX - tankW - 12 - M);
    doc.text(adviceLines, tankX + tankW + 6, tankY + 33);

    y = tankY + tankH + 8;
  }

  // ── 3. Should I irrigate today? ────────────────────────────────────────────
  if (data.irrigation) {
    y = ensure(y, 28);
    const decision = data.irrigation.decision?.toLowerCase() ?? "";
    const isYes = decision.includes("regar") && !decision.includes("no");
    const isPartial = decision.includes("parcial") || decision.includes("ligero");
    const color = isYes && !isPartial ? C.green : isPartial ? C.amber : C.red;
    const label = isYes && !isPartial ? "SI, RIEGUE HOY" : isPartial ? "RIEGO LIGERO" : "NO RIEGUE HOY";

    doc.setFillColor(...C.cream);
    doc.setDrawColor(...C.line);
    doc.roundedRect(M, y, pageW - M * 2, 24, 3, 3, "FD");

    // Color rail
    doc.setFillColor(...color);
    doc.rect(M, y, 3, 24, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.muted);
    doc.text("HAY QUE REGAR HOY?", M + 8, y + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...color);
    doc.text(label, M + 8, y + 15);

    const txt = clean(data.irrigation.text_es);
    if (txt) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.ink);
      const lines = doc.splitTextToSize(txt, pageW - M * 2 - 12);
      doc.text(lines.slice(0, 1), M + 8, y + 21);
    }
    y += 30;
  }

  // ── 4. Weather next 7 days (visual strip) ──────────────────────────────────
  if (data.forecast?.length) {
    y = ensure(y, 48);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...C.ink);
    doc.text("El tiempo esta semana", M, y);
    y += 4;

    const stripY = y + 2;
    const stripH = 36;
    const days = data.forecast.slice(0, 7);
    const slotW = (pageW - M * 2) / days.length;

    days.forEach((d, i) => {
      const x = M + slotW * i;
      doc.setFillColor(...C.cream);
      doc.setDrawColor(...C.line);
      doc.roundedRect(x + 1, stripY, slotW - 2, stripH, 2, 2, "FD");

      // Day name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text(shortDay(d.date).toUpperCase(), x + slotW / 2, stripY + 5, { align: "center" });

      // Weather label
      const w = weatherLabel(d);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...w.color);
      doc.text(w.text, x + slotW / 2, stripY + 14, { align: "center" });

      // Temp
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.ink);
      doc.text(`${Math.round(d.tmax_c)}/${Math.round(d.tmin_c)}C`, x + slotW / 2, stripY + 21, {
        align: "center",
      });

      // Rain mm
      if (d.rain_mm > 0.4) {
        doc.setTextColor(...C.blue);
        doc.setFont("helvetica", "bold");
        doc.text(`${d.rain_mm.toFixed(1)} mm`, x + slotW / 2, stripY + 30, { align: "center" });
      } else {
        doc.setTextColor(...C.muted);
        doc.text("sin lluvia", x + slotW / 2, stripY + 30, { align: "center" });
      }
    });
    y = stripY + stripH + 8;
  }

  // ── 5. Crop tips (super simple one-liner per crop) ─────────────────────────
  if (data.crops?.length) {
    y = ensure(y, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...C.ink);
    doc.text("Que hacer en sus cultivos", M, y);
    y += 5;

    data.crops.forEach((c) => {
      const cropKey = (c.crop ?? "").toLowerCase();
      const tip = tipForCrop(cropKey, data.status, data.enso);
      const sevColor =
        c.severity === "green" ? C.green : c.severity === "yellow" ? C.amber : C.red;
      const sevText =
        c.severity === "green" ? "BIEN" : c.severity === "yellow" ? "CUIDADO" : "RIESGO";

      const cropLabel = CROP_LABELS[cropKey] ?? clean(c.crop).toUpperCase();
      const icon = CROP_ICON_TEXT[cropKey] ?? "[*]";

      const tipLines = doc.splitTextToSize(tip, pageW - M * 2 - 14);
      const blockH = 8 + tipLines.length * 4.5 + 4;
      y = ensure(y, blockH + 2);

      doc.setFillColor(...C.cream);
      doc.setDrawColor(...C.line);
      doc.roundedRect(M, y, pageW - M * 2, blockH, 2.5, 2.5, "FD");

      // Color rail
      doc.setFillColor(...sevColor);
      doc.rect(M, y, 3, blockH, "F");

      // Crop name + status pill
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...C.ink);
      doc.text(`${icon}  ${cropLabel}`, M + 7, y + 7);

      // Status pill (right side)
      const pillW = 22;
      const pillX = pageW - M - pillW - 2;
      doc.setFillColor(...sevColor);
      doc.roundedRect(pillX, y + 3, pillW, 6, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(sevText, pillX + pillW / 2, y + 7, { align: "center" });

      // Tip
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...C.ink);
      doc.text(tipLines, M + 7, y + 13);

      y += blockH + 4;
    });
  }

  // ── 6. Alerts (simple) ─────────────────────────────────────────────────────
  if (data.alerts?.length) {
    y = ensure(y, 22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...C.ink);
    doc.text("Avisos importantes", M, y);
    y += 4;

    data.alerts.slice(0, 4).forEach((a) => {
      const color = a.level === "alto" ? C.red : a.level === "medio" ? C.amber : C.green;
      const tag = a.level === "alto" ? "URGENTE" : a.level === "medio" ? "AVISO" : "INFO";
      const title = clean(a.title);
      const msg = clean(a.message);
      const titleLines = doc.splitTextToSize(title, pageW - M * 2 - 30);
      const msgLines = doc.splitTextToSize(msg, pageW - M * 2 - 8);
      const h = 6 + titleLines.length * 4.5 + msgLines.length * 4 + 6;
      y = ensure(y, h + 2);

      doc.setFillColor(...C.cream);
      doc.setDrawColor(...C.line);
      doc.roundedRect(M, y, pageW - M * 2, h, 2, 2, "FD");
      doc.setFillColor(...color);
      doc.rect(M, y, 3, h, "F");

      // Tag
      doc.setFillColor(...color);
      doc.roundedRect(M + 6, y + 3, 22, 5.5, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(tag, M + 17, y + 6.8, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...C.ink);
      doc.text(titleLines, M + 32, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C.muted);
      doc.text(msgLines, M + 6, y + 8 + titleLines.length * 4.5);

      y += h + 3;
    });
  }

  // ── Footer on every page ───────────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(...C.line);
    doc.line(M, pageH - 12, pageW - M, pageH - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(
      `Sayariy Resurgiendo - Guia del agricultor - ${new Date().toLocaleDateString("es-PE")}`,
      M,
      pageH - 7
    );
    doc.text(`Pag. ${i} / ${total}`, pageW - M, pageH - 7, { align: "right" });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`sayariy-guia-agricultor-${stamp}.pdf`);
}
