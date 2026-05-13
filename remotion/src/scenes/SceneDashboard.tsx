import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { COLORS } from "../theme";

const display = loadDisplay("normal", { weights: ["600", "700"] }).fontFamily;
const body = loadBody("normal", { weights: ["400", "500", "600"] }).fontFamily;

export const SceneDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = spring({ frame, fps, config: { damping: 20, stiffness: 90 } });
  const titleOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  const stats = [
    { label: "NDVI promedio", value: 0.62, suffix: "", color: COLORS.green },
    { label: "Estrés hídrico", value: 18, suffix: "%", color: COLORS.orange },
    { label: "Alertas activas", value: 4, suffix: "", color: COLORS.magenta },
    { label: "Comunidades", value: 12, suffix: "", color: COLORS.ink },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.cream }}>
      {/* Eyebrow + title */}
      <div style={{
        position: "absolute", left: 90, top: 110,
        fontFamily: body, fontSize: 22, fontWeight: 600, letterSpacing: 6, color: COLORS.magenta,
        opacity: titleOp,
      }}>
        PANEL EN VIVO
      </div>
      <div style={{
        position: "absolute", left: 90, top: 160, maxWidth: 1500,
        fontFamily: display, fontSize: 110, fontWeight: 600, lineHeight: 1.02, letterSpacing: -2,
        color: COLORS.ink,
        opacity: titleOp,
        transform: `translateY(${interpolate(titleY, [0, 1], [40, 0])}px)`,
      }}>
        Decisiones con <span style={{ color: COLORS.magenta }}>datos vivos</span>.
      </div>

      {/* Stat cards */}
      <div style={{
        position: "absolute", left: 90, right: 90, top: 460,
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28,
      }}>
        {stats.map((s, i) => {
          const f = frame - (24 + i * 8);
          const sp = spring({ frame: f, fps, config: { damping: 22, stiffness: 110 } });
          const op = interpolate(f, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const y = interpolate(sp, [0, 1], [40, 0]);
          const counted = interpolate(f, [10, 50], [0, s.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const display1 = s.value < 1 ? counted.toFixed(2) : Math.round(counted).toString();
          return (
            <div key={i} style={{
              opacity: op, transform: `translateY(${y}px)`,
              padding: "36px 32px", borderRadius: 24,
              background: "#fff", border: `1px solid ${COLORS.ink}10`,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}22`, marginBottom: 24 }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, background: s.color, margin: "12px" }} />
              </div>
              <div style={{
                fontFamily: display, fontSize: 86, fontWeight: 700, lineHeight: 1, color: COLORS.ink, letterSpacing: -2,
              }}>
                {display1}{s.suffix}
              </div>
              <div style={{ fontFamily: body, fontSize: 22, color: COLORS.muted, marginTop: 14 }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart strip */}
      <div style={{
        position: "absolute", left: 90, right: 90, bottom: 110,
        height: 200, borderRadius: 24, background: "#fff", border: `1px solid ${COLORS.ink}10`,
        padding: "28px 36px",
        opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" }),
        overflow: "hidden",
      }}>
        <div style={{ fontFamily: body, fontSize: 20, color: COLORS.muted, marginBottom: 12 }}>
          NDVI · últimos 60 días
        </div>
        <svg width="100%" height="120" viewBox="0 0 1000 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={COLORS.green} stopOpacity="0.45" />
              <stop offset="100%" stopColor={COLORS.green} stopOpacity="0" />
            </linearGradient>
          </defs>
          {(() => {
            const pts = Array.from({ length: 30 }, (_, i) => {
              const x = (i / 29) * 1000;
              const base = 70 + Math.sin(i * 0.5) * 18 + Math.cos(i * 0.3) * 12;
              return [x, base];
            });
            const reveal = interpolate(frame, [55, 110], [0, 1000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const visible = pts.filter(([x]) => x <= reveal);
            const path = visible.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
            const area = path + ` L${visible.at(-1)?.[0] ?? 0},120 L0,120 Z`;
            return (
              <>
                <path d={area} fill="url(#g)" />
                <path d={path} stroke={COLORS.green} strokeWidth={3} fill="none" />
                {visible.length > 0 && (
                  <circle cx={visible.at(-1)![0]} cy={visible.at(-1)![1]} r={6} fill={COLORS.magenta} />
                )}
              </>
            );
          })()}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
