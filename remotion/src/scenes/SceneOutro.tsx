import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { COLORS } from "../theme";

const display = loadDisplay("normal", { weights: ["600", "700"] }).fontFamily;
const body = loadBody("normal", { weights: ["400", "500", "600"] }).fontFamily;

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSp = spring({ frame, fps, config: { damping: 18, stiffness: 110 } });
  const logoOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const logoScale = interpolate(logoSp, [0, 1], [0.7, 1]);

  const lineW = interpolate(spring({ frame: frame - 18, fps, config: { damping: 22 } }), [0, 1], [0, 100]);
  const tagOp = interpolate(frame, [26, 42], [0, 1], { extrapolateRight: "clamp" });
  const urlOp = interpolate(frame, [46, 64], [0, 1], { extrapolateRight: "clamp" });

  // gentle breathing
  const breath = Math.sin(frame / 20) * 4;

  return (
    <AbsoluteFill style={{ background: COLORS.cream }}>
      {/* Big magenta arc */}
      <div style={{
        position: "absolute", width: 1400, height: 1400, borderRadius: 9999,
        background: `radial-gradient(circle, ${COLORS.magenta}25 0%, transparent 60%)`,
        top: -400, left: -300,
        transform: `translateY(${breath}px)`,
      }} />
      <div style={{
        position: "absolute", width: 1100, height: 1100, borderRadius: 9999,
        background: `radial-gradient(circle, ${COLORS.orange}30 0%, transparent 65%)`,
        bottom: -350, right: -200,
        transform: `translateY(${-breath}px)`,
      }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <Img src={staticFile("images/logo.png")} style={{
          height: 180, width: "auto",
          opacity: logoOp,
          transform: `scale(${logoScale})`,
        }} />

        <div style={{
          width: `${lineW * 4}px`, maxWidth: 400, height: 4, background: COLORS.orange,
          marginTop: 36, marginBottom: 36, borderRadius: 2,
        }} />

        <div style={{
          fontFamily: display, fontSize: 96, fontWeight: 600, color: COLORS.ink, letterSpacing: -2,
          textAlign: "center", lineHeight: 1.05,
          opacity: tagOp,
          transform: `translateY(${interpolate(tagOp, [0, 1], [20, 0])}px)`,
        }}>
          Tecnología que <span style={{ color: COLORS.magenta }}>cuida</span> a quienes
          <br/> cuidan la tierra.
        </div>

        <div style={{
          marginTop: 60, display: "flex", gap: 40, alignItems: "center",
          fontFamily: body, fontSize: 28, color: COLORS.muted,
          opacity: urlOp,
        }}>
          <span style={{ color: COLORS.magenta, fontWeight: 600 }}>cropguard.sayariy.pe</span>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: COLORS.green }} />
          <span>Lambayeque · Perú</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
