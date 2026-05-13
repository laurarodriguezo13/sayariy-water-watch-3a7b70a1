import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { COLORS } from "../theme";

const display = loadDisplay("normal", { weights: ["600", "700"] }).fontFamily;
const body = loadBody("normal", { weights: ["400", "500", "600"] }).fontFamily;

const IMAGES = [
  { src: "images/farmers.jpg", label: "Comunidades" },
  { src: "images/geofisica.jpg", label: "Geofísica" },
  { src: "images/pozo.jpg", label: "Pozo" },
  { src: "images/zanja.jpg", label: "Tendido" },
];

export const SceneImpact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const titleY = spring({ frame, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{ background: COLORS.ink }}>
      <div style={{
        position: "absolute", left: 90, top: 110,
        fontFamily: body, fontSize: 22, fontWeight: 600, letterSpacing: 6, color: COLORS.orange,
        opacity: titleOp,
      }}>
        IMPACTO REAL
      </div>
      <div style={{
        position: "absolute", left: 90, top: 160, maxWidth: 1500,
        fontFamily: display, fontSize: 110, fontWeight: 600, lineHeight: 1.02, letterSpacing: -2,
        color: COLORS.cream,
        opacity: titleOp,
        transform: `translateY(${interpolate(titleY, [0, 1], [40, 0])}px)`,
      }}>
        Del píxel al <span style={{ color: COLORS.orange }}>campo</span>.
      </div>

      <div style={{
        position: "absolute", left: 90, right: 90, top: 460,
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
      }}>
        {IMAGES.map((img, i) => {
          const f = frame - (24 + i * 8);
          const sp = spring({ frame: f, fps, config: { damping: 22, stiffness: 100 } });
          const op = interpolate(f, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const y = interpolate(sp, [0, 1], [50, 0]);
          const zoom = 1 + (frame / 1000);
          return (
            <div key={i} style={{
              opacity: op, transform: `translateY(${y}px)`,
              borderRadius: 20, overflow: "hidden", aspectRatio: "3 / 4",
              border: `1px solid ${COLORS.cream}20`,
              position: "relative",
            }}>
              <Img src={staticFile(img.src)} style={{
                width: "100%", height: "100%", objectFit: "cover",
                transform: `scale(${zoom})`,
              }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)",
              }} />
              <div style={{
                position: "absolute", bottom: 22, left: 22,
                fontFamily: body, fontSize: 24, fontWeight: 600, color: COLORS.cream,
              }}>{img.label}</div>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div style={{
        position: "absolute", left: 90, right: 90, bottom: 90,
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        opacity: interpolate(frame, [70, 95], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        {[
          { v: "12", l: "comunidades" },
          { v: "5×", l: "más rápido" },
          { v: "0 S/", l: "para el agricultor" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 18, alignItems: "baseline" }}>
            <span style={{ fontFamily: display, fontSize: 100, fontWeight: 700, color: COLORS.orange, letterSpacing: -3 }}>
              {s.v}
            </span>
            <span style={{ fontFamily: body, fontSize: 24, color: COLORS.cream, opacity: 0.7 }}>{s.l}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
