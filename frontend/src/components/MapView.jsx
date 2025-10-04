import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

export default function MapView({ points }) {
  const center = points[0] ? [points[0].latitude, points[0].longitude] : [20.5937, 78.9629];
  return (
    <div className="card p-2 h-96">
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p, i) => (
          <CircleMarker key={i} center={[p.latitude, p.longitude]} radius={8} pathOptions={{ color: categoryColor(p.category) }}>
            <Popup>
              <div>
                <div><b>HMPI:</b> {p.hmpi ?? '-'}</div>
                <div><b>Category:</b> {p.category ?? '-'}</div>
                <div><b>Lat/Lng:</b> {p.latitude}, {p.longitude}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

function categoryColor(cat) {
  if (cat === 'Hazardous') return 'red';
  if (cat === 'Moderate') return 'orange';
  return 'green';
}
