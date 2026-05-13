import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { COLORS } from "../theme";

const display = loadDisplay("normal", { weights: ["600", "700"] }).fontFamily;
const body = loadBody("normal", { weights: ["400", "500", "600"] }).fontFamily;

// ───────── SIMPLE (Guía del agricultor) ─────────
const SimplePdfPage: React.FC<{ revealY: number }> = ({ revealY }) => (
  <div style={{
    width: 540, height: 700, background: "#FDF8EE",
    border: `1px solid ${COLORS.ink}15`,
    borderRadius: 6, overflow: "hidden",
    position: "relative",
    boxShadow: "0 30px 60px -10px rgba(20,10,5,0.3), 0 60px 120px -40px rgba(168,25,92,0.2)",
    fontFamily: body, color: COLORS.ink,
    padding: "32px 36px",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <Img src={staticFile("images/logo.png")} style={{ height: 40, width: "auto" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: COLORS.magenta }}>
          Guía del agricultor
        </div>
        <div style={{ fontSize: 12, color: COLORS.muted }}>Cayaltí · Lambayeque · 13 may 2026</div>
      </div>
    </div>
    <div style={{
      background: "#FFF7E2", border: "2px solid #E8A33D",
      borderRadius: 12, padding: "14px 16px", marginBottom: 18,
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 16, background: "#E8A33D" }} />
      <div>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#7a5b1a", letterSpacing: 1 }}>ATENCIÓN</div>
        <div style={{ fontSize: 12, color: "#7a5b1a" }}>Revise el pozo y el pronóstico esta semana.</div>
      </div>
    </div>
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Cuánta agua hay en el pozo</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 32, height: 80, border: "2px solid #76B5C5", borderRadius: 6, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "33%", background: "#E8A33D" }} />
        </div>
        <div>
          <div style={{ fontFamily: display, fontSize: 36, fontWeight: 700 }}>33%</div>
          <div style={{ fontSize: 12, color: COLORS.muted }}>Nivel medio — monitoree</div>
        </div>
      </div>
    </div>
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Pronóstico 7 días</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} style={{
            background: "#fff", border: "1px solid #E5DBCB", borderRadius: 8, padding: "10px 0",
            textAlign: "center", fontSize: 11,
          }}>
            <div style={{ fontWeight: 700, color: COLORS.muted }}>{d}</div>
            <div style={{
              fontSize: 9, fontWeight: 700, color: i % 3 === 0 ? "#3682dc" : "#E8A33D", marginTop: 4,
            }}>{i % 3 === 0 ? "LLUVIA" : "SOL"}</div>
            <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600 }}>{27 + i}°</div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Qué cuidar esta semana</div>
      {[
        { c: "MARACUYÁ", t: "Riegue cada 3 días, drenajes listos.", color: "#E8A33D" },
        { c: "FRIJOL", t: "Ventana ideal de siembra hasta sept.", color: "#3FA535" },
        { c: "MAÍZ", t: "Vigilar humedad del suelo.", color: COLORS.magenta },
      ].map((row, i) => (
        <div key={i} style={{
          display: "flex", gap: 10, padding: "10px 0",
          borderBottom: i < 2 ? "1px solid #EDE3D2" : "none",
        }}>
          <div style={{ width: 4, background: row.color, borderRadius: 2 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: 1, color: row.color }}>{row.c}</div>
            <div style={{ fontSize: 12, color: COLORS.ink }}>{row.t}</div>
          </div>
        </div>
      ))}
    </div>
    <div style={{
      position: "absolute", left: 0, right: 0, top: 0, height: revealY,
      background: "linear-gradient(180deg, rgba(253,248,238,0) 70%, rgba(253,248,238,1) 100%)",
      pointerEvents: "none",
    }} />
  </div>
);

// ───────── TECHNICAL (Reporte técnico) ─────────
const TechnicalPdfPage: React.FC<{ revealY: number }> = ({ revealY }) => {
  const TIMES = "'Times New Roman', Times, serif";
  return (
    <div style={{
      width: 540, height: 700, background: "#ffffff",
      border: `1px solid ${COLORS.ink}15`,
      borderRadius: 4, overflow: "hidden",
      position: "relative",
      boxShadow: "0 30px 60px -10px rgba(20,10,5,0.3), 0 60px 120px -40px rgba(0,0,0,0.2)",
      fontFamily: body, color: COLORS.ink,
      padding: "26px 30px",
    }}>
      {/* Magenta header bar */}
      <div style={{
        background: COLORS.magenta, color: "#fff",
        padding: "10px 16px", borderRadius: 3,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 18,
      }}>
        <div>
          <div style={{ fontFamily: TIMES, fontSize: 18, fontWeight: 700, letterSpacing: 0.5 }}>
            REPORTE TÉCNICO AGRONÓMICO
          </div>
          <div style={{ fontSize: 10, opacity: 0.85 }}>Cayaltí · Lambayeque · 13 may 2026 · v2.4</div>
        </div>
        <div style={{ fontSize: 9, textAlign: "right", opacity: 0.85 }}>
          SAYARIY · CROPGUARD<br/>Página 1 / 4
        </div>
      </div>

      {/* Two-column metric strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { k: "ICEN", v: "+1.52°C", s: "FUERTE", c: "#c0392b" },
          { k: "ONI", v: "+0.80°C", s: "WARM", c: "#E8A33D" },
          { k: "POZO", v: "33%", s: "MEDIO", c: "#3682dc" },
        ].map((m, i) => (
          <div key={i} style={{
            border: "1px solid #DCD6D2", borderTop: `3px solid ${m.c}`,
            padding: "8px 10px", borderRadius: 2,
          }}>
            <div style={{ fontSize: 8, letterSpacing: 1, color: COLORS.muted, fontWeight: 700 }}>{m.k}</div>
            <div style={{ fontFamily: TIMES, fontSize: 18, fontWeight: 700 }}>{m.v}</div>
            <div style={{ fontSize: 8, color: m.c, fontWeight: 700, letterSpacing: 0.5 }}>{m.s}</div>
          </div>
        ))}
      </div>

      {/* Section title */}
      <div style={{
        fontFamily: TIMES, fontSize: 13, fontWeight: 700, color: COLORS.magenta,
        borderBottom: `1px solid ${COLORS.magenta}55`, paddingBottom: 4, marginBottom: 8,
        letterSpacing: 0.5,
      }}>
        1. SERIE TEMPORAL — NDVI / NDWI (90d)
      </div>

      {/* Mini chart */}
      <div style={{ height: 100, position: "relative", marginBottom: 14, border: "1px solid #ECECEC", padding: 6 }}>
        <svg width="100%" height="100%" viewBox="0 0 480 88" preserveAspectRatio="none">
          {/* gridlines */}
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1="0" y1={i * 22} x2="480" y2={i * 22} stroke="#EFEFEF" strokeWidth="1" />
          ))}
          {/* NDVI line */}
          <polyline fill="none" stroke={COLORS.green} strokeWidth="1.6"
            points="0,60 40,55 80,48 120,52 160,42 200,38 240,44 280,30 320,34 360,28 400,32 440,26 480,30" />
          {/* NDWI line */}
          <polyline fill="none" stroke="#3682dc" strokeWidth="1.6" strokeDasharray="3 2"
            points="0,40 40,46 80,52 120,48 160,55 200,60 240,58 280,64 320,62 360,68 400,65 440,72 480,68" />
        </svg>
        <div style={{ position: "absolute", top: 8, right: 10, fontSize: 8, display: "flex", gap: 10 }}>
          <span><span style={{ color: COLORS.green }}>━</span> NDVI</span>
          <span><span style={{ color: "#3682dc" }}>┄</span> NDWI</span>
        </div>
      </div>

      {/* Data table */}
      <div style={{
        fontFamily: TIMES, fontSize: 13, fontWeight: 700, color: COLORS.magenta,
        borderBottom: `1px solid ${COLORS.magenta}55`, paddingBottom: 4, marginBottom: 6,
        letterSpacing: 0.5,
      }}>
        2. RECOMENDACIONES POR PARCELA
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
        <thead>
          <tr style={{ background: "#F4EFE8" }}>
            {["CULTIVO", "ÁREA", "NDVI", "ESTRÉS", "ACCIÓN"].map(h => (
              <th key={h} style={{ padding: "5px 6px", textAlign: "left", fontWeight: 700, letterSpacing: 0.5, borderBottom: "1px solid #DCD6D2" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ["Maracuyá", "2.4 ha", "0.62", "18%", "Riego 3d"],
            ["Frijol", "1.8 ha", "0.71", "9%", "Siembra"],
            ["Maíz", "3.1 ha", "0.55", "24%", "Drenaje"],
            ["Camote", "0.9 ha", "0.68", "12%", "Monitor."],
          ].map((row, i) => (
            <tr key={i} style={{ background: i % 2 ? "#FAFAFA" : "#fff" }}>
              {row.map((c, j) => (
                <td key={j} style={{ padding: "4px 6px", borderBottom: "1px solid #ECECEC", fontWeight: j === 0 ? 700 : 400 }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* footer note */}
      <div style={{
        position: "absolute", left: 30, right: 30, bottom: 14,
        fontSize: 8, color: COLORS.muted, borderTop: "1px solid #EEE", paddingTop: 6,
        display: "flex", justifyContent: "space-between",
      }}>
        <span>Datos: Sentinel-2, ENFEN, ANA, INDECI</span>
        <span>cropguard.sayariy.pe</span>
      </div>

      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, height: revealY,
        background: "linear-gradient(180deg, rgba(255,255,255,0) 70%, rgba(255,255,255,1) 100%)",
        pointerEvents: "none",
      }} />
    </div>
  );
};

interface Props {
  variant?: "simple" | "technical";
}

export const ScenePdf: React.FC<Props> = ({ variant = "simple" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isSimple = variant === "simple";
  const accent = isSimple ? COLORS.magenta : COLORS.magenta;

  const eyebrowOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleSp = spring({ frame: frame - 4, fps, config: { damping: 22, stiffness: 100 } });
  const titleOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [16, 32], [0, 1], { extrapolateRight: "clamp" });

  const btnSp = spring({ frame: frame - 30, fps, config: { damping: 18, stiffness: 110 } });
  const btnOp = interpolate(frame, [28, 44], [0, 1], { extrapolateRight: "clamp" });
  const btnY = interpolate(btnSp, [0, 1], [30, 0]);
  const click = interpolate(frame, [56, 60, 64], [1, 0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cursorX = interpolate(frame, [22, 56], [-200, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cursorY = interpolate(frame, [22, 56], [-100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const pdfSp = spring({ frame: frame - 64, fps, config: { damping: 22, stiffness: 90 } });
  const pdfOp = interpolate(frame, [64, 84], [0, 1], { extrapolateRight: "clamp" });
  const pdfY = interpolate(pdfSp, [0, 1], [120, 0]);
  const pdfRot = interpolate(pdfSp, [0, 1], isSimple ? [-8, -3] : [8, 3]);

  const reveal = interpolate(frame, [70, 130], [700, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const eyebrow = isSimple ? "UN TOQUE Y LISTO" : "TAMBIÉN, PARA EL EQUIPO TÉCNICO";
  const titleA = isSimple ? "La guía del agricultor," : "Y el reporte";
  const titleB = isSimple ? "en PDF." : "técnico completo.";
  const sub = isSimple
    ? "Resumen visual sin jerga: estado del día, pozo, clima de 7 días y qué cuidar por cultivo. Listo para imprimir y llevar al campo."
    : "Datos densos para el agrónomo: series temporales NDVI/NDWI, métricas ENSO, tabla de recomendaciones por parcela y fuentes citadas.";
  const btnLabel = isSimple ? "Descargar guía simple" : "Descargar reporte técnico";

  return (
    <AbsoluteFill style={{ background: COLORS.cream }}>
      <div style={{
        position: "absolute", width: 800, height: 800, borderRadius: 9999,
        background: `radial-gradient(circle, ${accent}1c 0%, transparent 65%)`,
        top: -250, left: isSimple ? -200 : undefined, right: isSimple ? undefined : -200,
      }} />

      {/* Left text */}
      <div style={{ position: "absolute", left: 90, top: 130, width: 760 }}>
        <div style={{
          fontFamily: body, fontSize: 22, fontWeight: 600, letterSpacing: 6, color: accent,
          opacity: eyebrowOp,
        }}>
          {eyebrow}
        </div>
        <div style={{
          fontFamily: display, fontSize: 96, fontWeight: 600, lineHeight: 1.02, letterSpacing: -2,
          color: COLORS.ink, marginTop: 22,
          opacity: titleOp, transform: `translateY(${interpolate(titleSp, [0, 1], [40, 0])}px)`,
        }}>
          {titleA} <span style={{ color: accent }}>{titleB}</span>
        </div>
        <div style={{
          fontFamily: body, fontSize: 28, color: COLORS.muted, marginTop: 30, lineHeight: 1.5,
          opacity: subOp, maxWidth: 660,
        }}>
          {sub}
        </div>

        <div style={{
          marginTop: 70, position: "relative", width: 520,
          opacity: btnOp, transform: `translateY(${btnY}px)`,
        }}>
          <div style={{
            background: accent, color: "#fff",
            padding: "22px 28px", borderRadius: 14,
            fontFamily: body, fontSize: 24, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 14,
            transform: `scale(${click})`,
            boxShadow: `0 20px 40px -10px ${accent}55`,
          }}>
            <span style={{ fontSize: 26 }}>↓</span>
            <span>{btnLabel}</span>
          </div>
          <div style={{
            position: "absolute", left: 360 + cursorX, top: 30 + cursorY,
            width: 28, height: 28, pointerEvents: "none",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24">
              <path d="M3 2 L20 12 L13 13 L17 21 L14 22 L10 14 L4 18 Z"
                fill="#fff" stroke="#1B1410" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* PDF preview right */}
      <div style={{
        position: "absolute", right: 130, top: 90, bottom: 90,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: pdfOp,
        transform: `translateY(${pdfY}px)`,
      }}>
        <div style={{
          position: "absolute", width: 540, height: 700,
          background: "#fff", borderRadius: 6,
          transform: `rotate(${pdfRot + (isSimple ? 6 : -6)}deg) translate(${isSimple ? 40 : -40}px, 30px)`,
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)",
          opacity: 0.5,
        }} />
        <div style={{ transform: `rotate(${pdfRot}deg)` }}>
          {isSimple ? <SimplePdfPage revealY={reveal} /> : <TechnicalPdfPage revealY={reveal} />}
        </div>
      </div>
    </AbsoluteFill>
  );
};
