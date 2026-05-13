import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme";

interface Props {
  src: string;
  /** Window title shown in top bar */
  url: string;
  /** Frame the scene starts (for entrance anim within scene) */
  scale?: number;
  panY?: number;
}

export const BrowserFrame: React.FC<Props> = ({ src, url, scale = 1, panY = 0 }) => {
  return (
    <div style={{
      width: "100%", height: "100%",
      borderRadius: 22, overflow: "hidden",
      background: "#fff",
      boxShadow: "0 50px 100px -20px rgba(20,10,5,0.35), 0 30px 60px -30px rgba(168,25,92,0.25)",
      border: `1px solid ${COLORS.ink}10`,
      display: "flex", flexDirection: "column",
    }}>
      {/* Title bar */}
      <div style={{
        height: 44, background: "#F2EDE4",
        borderBottom: `1px solid ${COLORS.ink}10`,
        display: "flex", alignItems: "center", padding: "0 18px", gap: 10,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#F25F58" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#FBBE2E" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#5BC95A" }} />
        </div>
        <div style={{
          marginLeft: 18, padding: "6px 16px", borderRadius: 8, background: "#fff",
          fontFamily: "Inter, sans-serif", fontSize: 16, color: COLORS.muted,
          minWidth: 380, textAlign: "center",
        }}>
          {url}
        </div>
      </div>
      {/* Screenshot */}
      <div style={{ flex: 1, overflow: "hidden", background: "#fff" }}>
        <Img src={staticFile(src)} style={{
          width: "100%",
          display: "block",
          transform: `scale(${scale}) translateY(${panY}px)`,
          transformOrigin: "top center",
        }} />
      </div>
    </div>
  );
};
