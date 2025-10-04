import { useEffect, useMemo, useState } from 'react';
import { getAll } from '../api/data.js';
import DataTable from '../components/DataTable.jsx';
import Charts from '../components/Charts.jsx';
import MapView from '../components/MapView.jsx';
import HMPIBadge from '../components/HMPIBadge.jsx';
import { SkeletonCard, SkeletonLine } from '../components/Skeleton.jsx';

export default function Dashboard() {
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

  const groups = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const key = `${r.latitude}|${r.longitude}|${new Date(r.timestamp).toISOString()}`;
      const arr = map.get(key) || [];
      arr.push(r);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([key, items]) => ({ key, items, sample: items[0] }));
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        {loading && <span className="text-white/60">Loading…</span>}
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard lines={1} />
          <SkeletonCard lines={3} height={160} />
        </div>
      ) : rows.length > 0 ? (
        <DataTable rows={rows} />
      ) : (
        <div className="card p-8 text-center">
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">📄</div>
          <h3 className="text-lg font-semibold">No data yet</h3>
          <p className="text-white/60 mt-1">Upload measurements to see charts and maps here.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {(loading ? Array.from({ length: 2 }).map((_, i) => (
          <SkeletonCard key={i} lines={4} height={220} />
        )) : groups.slice(0, 2)).map(g => (
          <div key={g.key} className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">Group: {g.sample?.latitude}, {g.sample?.longitude}</h3>
              {g.sample?.hmpi && <HMPIBadge value={g.sample.hmpi} category={g.sample.category} />}
            </div>
            {!loading && <Charts rows={g.items} hmpi={g.sample?.hmpi} />}
          </div>
        ))}
      </div>

      {!loading && (
        <MapView points={groups.map(g => ({ latitude: g.sample.latitude, longitude: g.sample.longitude, hmpi: g.sample.hmpi, category: g.sample.category }))} />
      )}
    </div>
  );
}
