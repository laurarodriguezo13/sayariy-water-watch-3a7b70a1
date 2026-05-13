import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { COLORS } from "../theme";

const display = loadDisplay("normal", { weights: ["600", "700"] }).fontFamily;
const body = loadBody("normal", { weights: ["400", "500", "600"] }).fontFamily;

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Image zoom (Ken Burns)
  const zoom = interpolate(frame, [0, 120], [1.05, 1.18]);
  const imgOpacity = interpolate(frame, [0, 18], [0, 0.55], { extrapolateRight: "clamp" });

  // Logo
  const logoY = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 110 } });
  const logoOpacity = interpolate(frame, [6, 22], [0, 1], { extrapolateRight: "clamp" });

  // Eyebrow
  const eyebrowOpacity = interpolate(frame, [22, 36], [0, 1], { extrapolateRight: "clamp" });
  const eyebrowX = interpolate(spring({ frame: frame - 22, fps, config: { damping: 22 } }), [0, 1], [-30, 0]);

  // Headline word reveals
  const words = ["Anticipamos", "el estrés hídrico", "antes de que", "sea visible."];
  const wordStart = 32;

  // Underline
  const underline = spring({ frame: frame - 95, fps, config: { damping: 22, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ background: COLORS.cream, overflow: "hidden" }}>
      {/* Background image */}
      <AbsoluteFill style={{ opacity: imgOpacity }}>
        <Img
          src={staticFile("images/hero.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }}
        />
        <AbsoluteFill style={{
          background: `linear-gradient(110deg, ${COLORS.cream} 30%, rgba(250,246,238,0.55) 60%, rgba(168,25,92,0.15) 100%)`,
        }} />
      </AbsoluteFill>

      {/* Logo top-left */}
      <div style={{
        position: "absolute", top: 70, left: 90, display: "flex", alignItems: "center", gap: 18,
        opacity: logoOpacity, transform: `translateY(${interpolate(logoY, [0, 1], [20, 0])}px)`,
      }}>
        <Img src={staticFile("images/logo.png")} style={{ height: 70, width: "auto" }} />
        <div style={{ width: 1, height: 36, background: COLORS.ink, opacity: 0.2 }} />
        <span style={{ fontFamily: body, fontWeight: 600, fontSize: 28, color: COLORS.magenta, letterSpacing: 0.5 }}>
          CropGuard
        </span>
      </div>

      {/* Eyebrow */}
      <div style={{
        position: "absolute", left: 90, top: 320,
        fontFamily: body, fontWeight: 600, fontSize: 22, letterSpacing: 6, color: COLORS.magenta,
        opacity: eyebrowOpacity, transform: `translateX(${eyebrowX}px)`,
      }}>
        SENTINEL-2 · IA · SAYARIY PERÚ
      </div>

      {/* Headline */}
      <div style={{
        position: "absolute", left: 90, top: 380, maxWidth: 1500,
        fontFamily: display, fontWeight: 600, fontSize: 150, lineHeight: 1.02,
        color: COLORS.ink, letterSpacing: -3,
      }}>
        {words.map((w, i) => {
          const f = frame - (wordStart + i * 10);
          const s = spring({ frame: f, fps, config: { damping: 18, stiffness: 90 } });
          const op = interpolate(f, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const y = interpolate(s, [0, 1], [40, 0]);
          const isAccent = i === 1 || i === 2;
          return (
            <div key={i} style={{
              display: "block",
              opacity: op,
              transform: `translateY(${y}px)`,
              color: isAccent ? COLORS.magenta : COLORS.ink,
              position: "relative",
              width: "fit-content",
            }}>
              {w}
              {i === 3 && (
                <span style={{
                  position: "absolute", left: 0, bottom: -10, height: 8,
                  width: `${interpolate(underline, [0, 1], [0, 100])}%`,
                  background: COLORS.orange, borderRadius: 4,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom meta */}
      <div style={{
        position: "absolute", left: 90, bottom: 80,
        fontFamily: body, fontSize: 22, color: COLORS.muted,
        opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp" }),
        display: "flex", gap: 32, alignItems: "center",
      }}>
        <span>Lambayeque · Perú</span>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: COLORS.green }} />
        <span>2026</span>
      </div>
    </AbsoluteFill>
  );
};
