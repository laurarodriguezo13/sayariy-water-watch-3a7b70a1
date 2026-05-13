import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { COLORS } from "../theme";

const display = loadDisplay("normal", { weights: ["600", "700"] }).fontFamily;
const body = loadBody("normal", { weights: ["400", "500", "600"] }).fontFamily;

const PILLARS = [
  { num: "01", title: "Satélite", desc: "Imágenes Sentinel-2 cada 5 días", color: COLORS.magenta },
  { num: "02", title: "IA", desc: "Modelos de estrés hídrico y NDVI", color: COLORS.orange },
  { num: "03", title: "Comunidad", desc: "Alertas tempranas en Lambayeque", color: COLORS.green },
];

export const ScenePillars: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowOp = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const titleY = spring({ frame: frame - 4, fps, config: { damping: 22, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ background: COLORS.cream }}>
      {/* Soft moving accents */}
      <div style={{
        position: "absolute", width: 700, height: 700, borderRadius: 9999,
        background: `radial-gradient(circle, ${COLORS.magenta}22 0%, transparent 65%)`,
        top: -200, right: -150,
        transform: `translateY(${Math.sin(frame / 30) * 20}px)`,
      }} />
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: 9999,
        background: `radial-gradient(circle, ${COLORS.green}22 0%, transparent 65%)`,
        bottom: -200, left: -120,
        transform: `translateY(${Math.cos(frame / 30) * 20}px)`,
      }} />

      <div style={{
        position: "absolute", left: 90, top: 110,
        fontFamily: body, fontSize: 22, fontWeight: 600, letterSpacing: 6, color: COLORS.magenta,
        opacity: eyebrowOp,
      }}>
        CÓMO FUNCIONA
      </div>

      <div style={{
        position: "absolute", left: 90, top: 160, maxWidth: 1300,
        fontFamily: display, fontSize: 110, fontWeight: 600, lineHeight: 1.02, letterSpacing: -2,
        color: COLORS.ink,
        transform: `translateY(${interpolate(titleY, [0, 1], [40, 0])}px)`,
        opacity: interpolate(frame, [4, 24], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        Tres capas, <span style={{ color: COLORS.magenta }}>una decisión</span>.
      </div>

      {/* Pillars */}
      <div style={{
        position: "absolute", left: 90, right: 90, top: 460,
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 50,
      }}>
        {PILLARS.map((p, i) => {
          const f = frame - (40 + i * 14);
          const s = spring({ frame: f, fps, config: { damping: 20, stiffness: 110 } });
          const op = interpolate(f, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const y = interpolate(s, [0, 1], [50, 0]);
          const lineW = interpolate(spring({ frame: f - 10, fps, config: { damping: 22 } }), [0, 1], [0, 100]);
          return (
            <div key={i} style={{
              opacity: op, transform: `translateY(${y}px)`,
              padding: "44px 40px", borderRadius: 28,
              background: "rgba(255,255,255,0.7)",
              border: `1px solid ${COLORS.ink}10`,
              backdropFilter: "none",
            }}>
              <div style={{ fontFamily: display, fontWeight: 700, fontSize: 28, color: p.color, marginBottom: 30 }}>
                {p.num}
              </div>
              <div style={{ width: `${lineW}%`, height: 3, background: p.color, marginBottom: 30, borderRadius: 2 }} />
              <div style={{ fontFamily: display, fontWeight: 600, fontSize: 64, color: COLORS.ink, marginBottom: 16, letterSpacing: -1 }}>
                {p.title}
              </div>
              <div style={{ fontFamily: body, fontSize: 26, color: COLORS.muted, lineHeight: 1.4 }}>
                {p.desc}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
