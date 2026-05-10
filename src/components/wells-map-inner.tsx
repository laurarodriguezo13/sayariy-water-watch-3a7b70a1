import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

const POZO1: [number, number] = [-79.516392, -6.916094]; // [lng, lat]
const POZO2: [number, number] = [-79.516274, -6.915342];

export default function WellsMapInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

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
            attribution:
              "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
          },
        },
        layers: [
          { id: "satellite", type: "raster", source: "satellite" },
        ],
      },
      center: [-79.5163, -6.9157],
      zoom: 16.5,
      maxZoom: 19,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      // Connecting line between wells
      map.addSource("well-line", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: [POZO1, POZO2] },
          properties: {},
        },
      });
      map.addLayer({
        id: "well-line",
        type: "line",
        source: "well-line",
        paint: {
          "line-color": "#60a5fa",
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      });
    });

    // Markers
    const mk = (lng: number, lat: number, color: string, html: string) => {
      const el = document.createElement("div");
      el.style.cssText = `width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 0 0 2px ${color}88;cursor:pointer;`;
      new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup({ offset: 14 }).setHTML(html))
        .addTo(map);
    };
    mk(
      POZO1[0],
      POZO1[1],
      "#2563eb",
      "<strong>Pozo 1 (principal)</strong><br/>Profundidad: 20.20 m<br/>Extracción: ~50,000 L/día"
    );
    mk(
      POZO2[0],
      POZO2[1],
      "#ea580c",
      "<strong>Pozo 2 ASR (respaldo)</strong><br/>Profundidad: 19.20 m<br/>Activado por la ONG si Pozo 1 falla"
    );

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: "300px", width: "100%", borderRadius: "12px", overflow: "hidden" }}
    />
  );
}
