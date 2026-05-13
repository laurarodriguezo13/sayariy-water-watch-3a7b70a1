import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { COLORS } from "../theme";
import { BrowserFrame } from "../components/BrowserFrame";

const display = loadDisplay("normal", { weights: ["600", "700"] }).fontFamily;
const body = loadBody("normal", { weights: ["400", "500", "600"] }).fontFamily;

interface Props {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  url: string;
  src: string;
  /** Optional bullet callouts shown on the side */
  callouts?: string[];
  accentColor?: string;
  /** Pan the screenshot down over scene to reveal more content */
  panFrom?: number;
  panTo?: number;
  /** Scale of screenshot inside frame */
  scale?: number;
}

export const SceneAppTour: React.FC<Props> = ({
  eyebrow, title, titleAccent, subtitle, url, src, callouts = [], accentColor = COLORS.magenta,
  panFrom = 0, panTo = -300, scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleSp = spring({ frame: frame - 4, fps, config: { damping: 22, stiffness: 100 } });
  const titleOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [16, 32], [0, 1], { extrapolateRight: "clamp" });

  // Browser frame entrance
  const frameSp = spring({ frame: frame - 14, fps, config: { damping: 26, stiffness: 90 } });
  const frameOp = interpolate(frame, [14, 34], [0, 1], { extrapolateRight: "clamp" });
  const frameY = interpolate(frameSp, [0, 1], [80, 0]);
  const frameScale = interpolate(frameSp, [0, 1], [0.92, 1]);

  // Subtle pan (most screenshots fit fully now)
  const pan = interpolate(frame, [10, 130], [panFrom, panTo], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.cream }}>
      {/* Soft accent blob */}
      <div style={{
        position: "absolute", width: 700, height: 700, borderRadius: 9999,
        background: `radial-gradient(circle, ${accentColor}22 0%, transparent 65%)`,
        top: -200, right: -200,
      }} />

      {/* Left text column */}
      <div style={{ position: "absolute", left: 90, top: 130, width: 720 }}>
        <div style={{
          fontFamily: body, fontSize: 22, fontWeight: 600, letterSpacing: 6, color: accentColor,
          opacity: eyebrowOp,
        }}>
          {eyebrow}
        </div>

        <div style={{
          fontFamily: display, fontSize: 96, fontWeight: 600, lineHeight: 1.02, letterSpacing: -2,
          color: COLORS.ink, marginTop: 22,
          opacity: titleOp, transform: `translateY(${interpolate(titleSp, [0, 1], [40, 0])}px)`,
        }}>
          {title}{" "}
          <span style={{ color: accentColor }}>{titleAccent}</span>
        </div>

        <div style={{
          fontFamily: body, fontSize: 28, color: COLORS.muted, marginTop: 30, lineHeight: 1.5,
          opacity: subOp,
        }}>
          {subtitle}
        </div>

        {/* Callouts */}
        <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 22 }}>
          {callouts.map((c, i) => {
            const f = frame - (40 + i * 12);
            const op = interpolate(f, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const x = interpolate(spring({ frame: f, fps, config: { damping: 22 } }), [0, 1], [-30, 0]);
            return (
              <div key={i} style={{
                display: "flex", gap: 18, alignItems: "center",
                opacity: op, transform: `translateX(${x}px)`,
                fontFamily: body, fontSize: 24, color: COLORS.ink,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 16, background: `${accentColor}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: 5, background: accentColor }} />
                </div>
                <span>{c}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right browser frame — sized to screenshot aspect ratio so no blank space */}
      <div style={{
        position: "absolute", right: 90, top: "50%",
        width: 980,
        // 1246/762 image + 44px title bar => ~644px tall
        height: 644,
        marginTop: -322,
        opacity: frameOp,
        transform: `translateY(${frameY}px) scale(${frameScale})`,
        transformOrigin: "center",
      }}>
        <BrowserFrame src={src} url={url} panY={pan} scale={scale} />
      </div>
    </AbsoluteFill>
  );
};
