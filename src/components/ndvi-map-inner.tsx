import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Community } from "@/lib/cropguard-api";

const COMMUNITY_COORDS: Record<string, [number, number]> = {
  // [lng, lat]
  "cayalti":        [-79.516, -6.916],
  "victor-raul":    [-79.836, -6.775],
  "monsefu":        [-79.870, -6.892],
  "reque":          [-79.828, -6.878],
  "nueva-libertad": [-79.522, -6.948],
};

const HALF = 0.012;

function ndviColor(v: number): string {
  if (v >= 0.65) return "#2d6a2d";
  if (v >= 0.55) return "#5aaa3a";
  if (v >= 0.45) return "#a8c83a";
  if (v >= 0.35) return "#d4b800";
  if (v >= 0.25) return "#e07020";
  return "#cc2200";
}
function stressColor(v: number): string {
  if (v <= 0.3) return "#2d6a2d";
  if (v <= 0.45) return "#a8c83a";
  if (v <= 0.6) return "#e07020";
  return "#cc2200";
}
function ndwiColor(v: number): string {
  if (v >= 0.1) return "#1a6fa8";
  if (v >= 0.0) return "#5aa8d4";
  if (v >= -0.1) return "#a8cce0";
  if (v >= -0.2) return "#e0c87a";
  return "#d45a2a";
}

interface Props {
  communities: Community[];
  index: "ndvi" | "ndwi" | "stress";
}

const SOURCE_ID = "communities-src";
const FILL_ID = "communities-fill";
const LINE_ID = "communities-line";

function buildFC(communities: Community[], index: Props["index"]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: communities
      .map((c) => {
        const coords = COMMUNITY_COORDS[c.id];
        if (!coords) return null;
        const [lng, lat] = coords;
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
        return {
          type: "Feature",
          properties: {
            id: c.id,
            name: c.name,
            color,
            label,
            val,
            ndvi: c.ndvi.toFixed(3),
            ndwi: c.ndwi.toFixed(3),
            stress: `${Math.round(c.stress_probability * 100)}%`,
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [lng - HALF, lat - HALF],
              [lng + HALF, lat - HALF],
              [lng + HALF, lat + HALF],
              [lng - HALF, lat + HALF],
              [lng - HALF, lat - HALF],
            ]],
          },
        } as GeoJSON.Feature;
      })
      .filter((f): f is GeoJSON.Feature => f !== null),
  };
}

export default function NdviMapInner({ communities, index }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          satellite: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution: "Tiles &copy; Esri — Maxar, Earthstar Geographics",
          },
          labels: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
          },
        },
        layers: [
          { id: "satellite", type: "raster", source: "satellite" },
          { id: "labels", type: "raster", source: "labels" },
        ],
      },
      center: [-79.69, -6.84],
      zoom: 10.5,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      map.addSource(SOURCE_ID, { type: "geojson", data: buildFC(communities, index) });
      map.addLayer({
        id: FILL_ID,
        type: "fill",
        source: SOURCE_ID,
        paint: { "fill-color": ["get", "color"], "fill-opacity": 0.55 },
      });
      map.addLayer({
        id: LINE_ID,
        type: "line",
        source: SOURCE_ID,
        paint: { "line-color": ["get", "color"], "line-width": 2 },
      });

      map.on("click", FILL_ID, (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const p = f.properties as Record<string, string>;
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `<strong>${p.name}</strong><br/>${p.label}: <strong>${p.val}</strong><br/>NDVI: ${p.ndvi} · NDWI: ${p.ndwi}<br/>Estrés: ${p.stress}`
          )
          .addTo(map);
      });
      map.on("mouseenter", FILL_ID, () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", FILL_ID, () => (map.getCanvas().style.cursor = ""));

      loadedRef.current = true;
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, []);

  // Update data when communities or index changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    src?.setData(buildFC(communities, index));
  }, [communities, index]);

  return (
    <div
      ref={containerRef}
      style={{ height: "340px", width: "100%", borderRadius: "12px", overflow: "hidden" }}
    />
  );
}
