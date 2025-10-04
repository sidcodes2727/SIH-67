import { useEffect, useMemo, useState } from 'react';
import { getAll } from '../api/data.js';
import MapView from '../components/MapView.jsx';

export default function WorldMap() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getAll();
      setRows(data);
      setLoading(false);
    })();
  }, []);

  // Group unique points by lat/lon -> first sample provides hmpi/category if present
  const points = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const key = `${r.latitude}|${r.longitude}`;
      if (!map.has(key)) map.set(key, { latitude: r.latitude, longitude: r.longitude, hmpi: r.hmpi, category: r.category });
    }
    return Array.from(map.values());
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">World Map</h2>
        {loading && <span className="text-white/60">Loading…</span>}
      </div>
      <div className="card p-2">
        <div className="h-[70vh] w-full">
          {!loading && <MapView points={points} />}
          {loading && <div className="p-6 text-white/60">Loading map…</div>}
        </div>
      </div>
    </div>
  );
}
