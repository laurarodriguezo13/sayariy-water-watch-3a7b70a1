import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet default icon URLs broken by bundlers
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const defaultIcon = L.icon({ iconUrl, iconRetinaUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
const orangeIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const POZO1: [number, number] = [-6.916094, -79.516392];
const POZO2: [number, number] = [-6.915342, -79.516274];

export default function WellsMapInner() {
  return (
    <MapContainer
      center={[-6.9157, -79.5163]}
      zoom={16}
      style={{ height: "300px", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={POZO1} icon={defaultIcon}>
        <Popup>
          <strong>Pozo 1 (principal)</strong><br />
          Profundidad: 20.20 m<br />
          Extracción: ~50,000 L/día
        </Popup>
      </Marker>
      <Marker position={POZO2} icon={orangeIcon}>
        <Popup>
          <strong>Pozo 2 ASR (respaldo)</strong><br />
          Profundidad: 19.20 m<br />
          Activado por la ONG si Pozo 1 falla
        </Popup>
      </Marker>
      <Polyline positions={[POZO1, POZO2]} color="#2563eb" weight={2} dashArray="6 4" />
    </MapContainer>
  );
}
