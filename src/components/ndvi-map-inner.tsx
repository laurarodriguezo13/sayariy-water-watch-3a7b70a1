import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Community } from "@/lib/cropguard-api";

const COMMUNITY_COORDS: Record<string, [number, number]> = {
  // [lng, lat]
  "cayalti":        [-79.5160, -6.9160],
  "victor-raul":    [-79.836, -6.775],
  "monsefu":        [-79.870, -6.892],
  "reque":          [-79.828, -6.878],
  "nueva-libertad": [-79.522, -6.948],
};

const HALF = 0.012;

// Real parcels in Las Lomas de Cayaltí (Sayariy field sites)
// Coordinates from ground-truth GPS survey (Nov 2025).
type Parcel = {
  id: string;
  crop: string;
  hectares: number;
  lng: number;
  lat: number;
};
const CAYALTI_PARCELS: Parcel[] = [
  { id: "p-maracuya",  crop: "Maracuyá",            hectares: 3.5, lat: -6.917167, lng: -79.515056 },
  { id: "p-frutales",  crop: "Frutales (pitahaya, naranja, mandarina, coco, uvas)", hectares: 3.0, lat: -6.913444, lng: -79.515028 },
  { id: "p-frijol",    crop: "Frijol",              hectares: 1.5, lat: -6.912889, lng: -79.514806 },
  { id: "p-papaya",    crop: "Papaya (Fundo Victoria)", hectares: 4.0, lat: -6.922750, lng: -79.516917 },
  { id: "p-cacao-maiz", crop: "Cacao y Maíz",       hectares: 3.0, lat: -6.916278, lng: -79.518111 },
];

// Approx half-side of a square parcel polygon in degrees, given hectares.
// 1 ha = 10,000 m²; 1° lat ≈ 111,320 m → half = sqrt(ha*10000)/2 / 111320.
function parcelHalfDeg(ha: number): number {
  const sideM = Math.sqrt(ha * 10000);
  return sideM / 2 / 111320;
}

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
  const features: GeoJSON.Feature[] = [];
  for (const c of communities) {
    const coords = COMMUNITY_COORDS[c.id];
    if (!coords) continue;
    const color =
      index === "ndwi" ? ndwiColor(c.ndwi)
      : index === "stress" ? stressColor(c.stress_probability)
      : ndviColor(c.ndvi);
    const val =
      index === "ndwi" ? c.ndwi.toFixed(3)
      : index === "stress" ? `${Math.round(c.stress_probability * 100)}%`
      : c.ndvi.toFixed(3);
    const label = index === "ndwi" ? "NDWI" : index === "stress" ? "Estrés" : "NDVI";
    const baseProps = {
      id: c.id,
      name: c.name,
      color,
      label,
      val,
      ndvi: c.ndvi.toFixed(3),
      ndwi: c.ndwi.toFixed(3),
      stress: `${Math.round(c.stress_probability * 100)}%`,
      parcel: "",
      hectares: "",
    };

    if (c.id === "cayalti") {
      for (const p of CAYALTI_PARCELS) {
        const h = parcelHalfDeg(p.hectares);
        features.push({
          type: "Feature",
          properties: {
            ...baseProps,
            name: `${c.name} — ${p.crop}`,
            parcel: p.crop,
            hectares: `${p.hectares} ha`,
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [p.lng - h, p.lat - h],
              [p.lng + h, p.lat - h],
              [p.lng + h, p.lat + h],
              [p.lng - h, p.lat + h],
              [p.lng - h, p.lat - h],
            ]],
          },
        });
      }
    } else {
      const [lng, lat] = coords;
      features.push({
        type: "Feature",
        properties: baseProps,
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
      });
    }
  }
  return { type: "FeatureCollection", features };
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
            maxzoom: 19,
            attribution: "Tiles &copy; Esri — Maxar, Earthstar Geographics",
          },
        },
        layers: [
          { id: "satellite", type: "raster", source: "satellite" },
        ],
      },
      center: [-79.69, -6.84],
      zoom: 10.5,
      maxZoom: 19,
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
        const parcelLine = p.parcel ? `<br/><em>${p.parcel} · ${p.hectares}</em>` : "";
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `<strong>${p.name}</strong>${parcelLine}<br/>${p.label}: <strong>${p.val}</strong><br/>NDVI: ${p.ndvi} · NDWI: ${p.ndwi}<br/>Estrés: ${p.stress}`
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
