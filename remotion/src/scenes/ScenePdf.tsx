import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { COLORS } from "../theme";

const display = loadDisplay("normal", { weights: ["600", "700"] }).fontFamily;
const body = loadBody("normal", { weights: ["400", "500", "600"] }).fontFamily;

// Renders a fake "PDF preview" page mimicking the simple-report-pdf design
const PdfPage: React.FC<{ revealY: number }> = ({ revealY }) => (
  <div style={{
    width: 540, height: 700, background: "#FDF8EE",
    border: `1px solid ${COLORS.ink}15`,
    borderRadius: 6, overflow: "hidden",
    position: "relative",
    boxShadow: "0 30px 60px -10px rgba(20,10,5,0.3), 0 60px 120px -40px rgba(168,25,92,0.2)",
    fontFamily: body, color: COLORS.ink,
    padding: "32px 36px",
  }}>
    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <Img src={staticFile("images/logo.png")} style={{ height: 40, width: "auto" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: COLORS.magenta }}>
          Guía del agricultor
        </div>
        <div style={{ fontSize: 12, color: COLORS.muted }}>Cayaltí · Lambayeque · 13 may 2026</div>
      </div>
    </div>

    {/* Status banner */}
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

    {/* Pozo bar */}
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

    {/* Forecast row */}
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

    {/* Crops */}
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

    {/* Reveal mask (animates from top down) */}
    <div style={{
      position: "absolute", left: 0, right: 0, top: 0, height: revealY,
      background: "linear-gradient(180deg, rgba(253,248,238,0) 70%, rgba(253,248,238,1) 100%)",
      pointerEvents: "none",
    }} />
  </div>
);

export const ScenePdf: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleSp = spring({ frame: frame - 4, fps, config: { damping: 22, stiffness: 100 } });
  const titleOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [16, 32], [0, 1], { extrapolateRight: "clamp" });

  // Button "click" pulse
  const btnSp = spring({ frame: frame - 30, fps, config: { damping: 18, stiffness: 110 } });
  const btnOp = interpolate(frame, [28, 44], [0, 1], { extrapolateRight: "clamp" });
  const btnY = interpolate(btnSp, [0, 1], [30, 0]);
  // pulse on click
  const click = interpolate(frame, [56, 60, 64], [1, 0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Cursor moves to button then clicks
  const cursorX = interpolate(frame, [22, 56], [-200, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cursorY = interpolate(frame, [22, 56], [-100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // PDF emerges
  const pdfSp = spring({ frame: frame - 64, fps, config: { damping: 22, stiffness: 90 } });
  const pdfOp = interpolate(frame, [64, 84], [0, 1], { extrapolateRight: "clamp" });
  const pdfY = interpolate(pdfSp, [0, 1], [120, 0]);
  const pdfRot = interpolate(pdfSp, [0, 1], [-8, -3]);

  // Reveal content of PDF
  const reveal = interpolate(frame, [70, 130], [700, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.cream }}>
      <div style={{
        position: "absolute", width: 800, height: 800, borderRadius: 9999,
        background: `radial-gradient(circle, ${COLORS.magenta}1c 0%, transparent 65%)`,
        top: -250, left: -200,
      }} />

      {/* Left text */}
      <div style={{ position: "absolute", left: 90, top: 130, width: 760 }}>
        <div style={{
          fontFamily: body, fontSize: 22, fontWeight: 600, letterSpacing: 6, color: COLORS.magenta,
          opacity: eyebrowOp,
        }}>
          UN TOQUE Y LISTO
        </div>
        <div style={{
          fontFamily: display, fontSize: 96, fontWeight: 600, lineHeight: 1.02, letterSpacing: -2,
          color: COLORS.ink, marginTop: 22,
          opacity: titleOp, transform: `translateY(${interpolate(titleSp, [0, 1], [40, 0])}px)`,
        }}>
          La guía del agricultor, <span style={{ color: COLORS.magenta }}>en PDF</span>.
        </div>
        <div style={{
          fontFamily: body, fontSize: 28, color: COLORS.muted, marginTop: 30, lineHeight: 1.5,
          opacity: subOp, maxWidth: 660,
        }}>
          Resumen visual sin jerga: estado del día, pozo, clima de 7 días y qué cuidar por cultivo.
          Listo para imprimir y llevar al campo.
        </div>

        {/* Mock download button + cursor */}
        <div style={{
          marginTop: 70, position: "relative", width: 460,
          opacity: btnOp, transform: `translateY(${btnY}px)`,
        }}>
          <div style={{
            background: COLORS.magenta, color: "#fff",
            padding: "22px 28px", borderRadius: 14,
            fontFamily: body, fontSize: 24, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 14,
            transform: `scale(${click})`,
            boxShadow: `0 20px 40px -10px ${COLORS.magenta}55`,
          }}>
            <span style={{ fontSize: 26 }}>↓</span>
            <span>Descargar guía simple</span>
          </div>
          {/* cursor */}
          <div style={{
            position: "absolute", left: 320 + cursorX, top: 30 + cursorY,
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
        {/* Back page (paper stack) */}
        <div style={{
          position: "absolute", width: 540, height: 700,
          background: "#fff", borderRadius: 6,
          transform: `rotate(${pdfRot + 6}deg) translate(40px, 30px)`,
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)",
          opacity: 0.5,
        }} />
        <div style={{
          transform: `rotate(${pdfRot}deg)`,
        }}>
          <PdfPage revealY={reveal} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
