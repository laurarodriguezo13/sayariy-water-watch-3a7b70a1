import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Rectangle, Popup } from "react-leaflet";
import type { Community } from "@/lib/cropguard-api";

const COMMUNITY_COORDS: Record<string, [number, number]> = {
  "cayalti":        [-6.916, -79.516],
  "victor-raul":    [-6.775, -79.836],
  "monsefu":        [-6.892, -79.870],
  "reque":          [-6.878, -79.828],
  "nueva-libertad": [-6.948, -79.522],
};

function ndviColor(ndvi: number): string {
  if (ndvi >= 0.65) return "#2d6a2d";
  if (ndvi >= 0.55) return "#5aaa3a";
  if (ndvi >= 0.45) return "#a8c83a";
  if (ndvi >= 0.35) return "#d4b800";
  if (ndvi >= 0.25) return "#e07020";
  return "#cc2200";
}

function stressColor(stress: number): string {
  if (stress <= 0.3) return "#2d6a2d";
  if (stress <= 0.45) return "#a8c83a";
  if (stress <= 0.6) return "#e07020";
  return "#cc2200";
}

function ndwiColor(ndwi: number): string {
  if (ndwi >= 0.1) return "#1a6fa8";
  if (ndwi >= 0.0) return "#5aa8d4";
  if (ndwi >= -0.1) return "#a8cce0";
  if (ndwi >= -0.2) return "#e0c87a";
  return "#d45a2a";
}

const HALF = 0.012;

interface NdviMapInnerProps {
  communities: Community[];
  index: "ndvi" | "ndwi" | "stress";
}

export default function NdviMapInner({ communities, index }: NdviMapInnerProps) {
  return (
    <MapContainer
      center={[-6.84, -79.69]}
      zoom={11}
      style={{ height: "340px", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {communities.map((c) => {
        const coords = COMMUNITY_COORDS[c.id];
        if (!coords) return null;
        const [lat, lon] = coords;
        const bounds: [[number, number], [number, number]] = [
          [lat - HALF, lon - HALF],
          [lat + HALF, lon + HALF],
        ];
        const color =
          index === "ndwi"
            ? ndwiColor(c.ndwi)
            : index === "stress"
            ? stressColor(c.stress_probability)
            : ndviColor(c.ndvi);

        const val =
          index === "ndwi"
            ? c.ndwi.toFixed(3)
            : index === "stress"
            ? `${Math.round(c.stress_probability * 100)}%`
            : c.ndvi.toFixed(3);

        const label = index === "ndwi" ? "NDWI" : index === "stress" ? "Estrés" : "NDVI";

        return (
          <Rectangle
            key={c.id}
            bounds={bounds}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 2 }}
          >
            <Popup>
              <strong>{c.name}</strong><br />
              {label}: <strong>{val}</strong><br />
              NDVI: {c.ndvi.toFixed(3)} · NDWI: {c.ndwi.toFixed(3)}<br />
              Estrés: {Math.round(c.stress_probability * 100)}%
            </Popup>
          </Rectangle>
        );
      })}
    </MapContainer>
  );
}
