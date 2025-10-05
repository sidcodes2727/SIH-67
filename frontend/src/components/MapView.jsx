import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

export default function MapView({ points }) {
  const center = points[0] ? [points[0].latitude, points[0].longitude] : [20.5937, 78.9629];
  return (
    <div className="card p-2 h-full w-full">
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <DynamicPoints points={points} />
      </MapContainer>
    </div>
  );
}

function DynamicPoints({ points }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoomend', onZoom);
    // initialize in case map changes programmatically
    onZoom();
    return () => {
      map.off('zoomend', onZoom);
    };
  }, [map]);

  const maxZoom = map.getMaxZoom?.() ?? 19;
  const minZoom = map.getMinZoom?.() ?? 0;

  const radiusForZoom = (z) => {
    const minR = 3; // when fully zoomed out
    const maxR = 8; // keep same at full zoom in
    const clamped = Math.min(Math.max(z, minZoom), maxZoom);
    const t = (clamped - minZoom) / Math.max(1, (maxZoom - minZoom));
    return Math.round(minR + t * (maxR - minR));
  };

  const r = radiusForZoom(zoom);

  return (
    <>
      {points.map((p, i) => (
        <CircleMarker key={i} center={[p.latitude, p.longitude]} radius={r} pathOptions={{ color: categoryColor(p.category) }}>
          <Popup>
            <div>
              <div><b>HMPI:</b> {p.hmpi ?? '-'}</div>
              <div><b>Category:</b> {p.category ?? '-'}</div>
              <div><b>Lat/Lng:</b> {p.latitude}, {p.longitude}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

function categoryColor(cat) {
  if (cat === 'Hazardous') return 'red';
  if (cat === 'Moderate') return 'orange';
  return 'green';
}
