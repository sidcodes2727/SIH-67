import { useEffect, useMemo, useState } from 'react';
import { getAll } from '../api/data.js';
import MapView from '../components/MapView.jsx';

export default function WorldMap() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getAll();
      setRows(data);
      setLoading(false);
    })();
  }, []);

  // Build sorted unique YEARS from timestamps for the slider (avoids timezone/day issues)
  const uniqueYears = useMemo(() => {
    const set = new Set();
    for (const r of rows) {
      if (!r.timestamp) continue;
      const d = new Date(r.timestamp);
      // use local year for consistency with getFullYear in display
      set.add(d.getFullYear());
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [rows]);

  // Ensure slider index stays within bounds when data loads
  useEffect(() => {
    if (uniqueYears.length > 0) {
      setSliderIndex(uniqueYears.length - 1);
    }
  }, [uniqueYears.length]);

  // Format year for display (or 'All' when showing all data)
  const displayLabel = useMemo(() => {
    if (showAll) return 'All';
    if (!uniqueYears.length) return '-';
    const year = uniqueYears[Math.min(sliderIndex, uniqueYears.length - 1)];
    return String(year);
  }, [uniqueYears, sliderIndex, showAll]);

  // Points at or before selected YEAR end (unless showAll), grouping by lat/lon and choosing latest sample
  const points = useMemo(() => {
    if (!rows.length) return [];
    // cutoff = 23:59:59.999 of selected year (local time)
    const cutoff = showAll
      ? Infinity
      : (uniqueYears.length
          ? new Date(uniqueYears[Math.min(sliderIndex, uniqueYears.length - 1)], 11, 31, 23, 59, 59, 999).getTime()
          : Infinity);
    const map = new Map();
    for (const r of rows) {
      const ts = r.timestamp ? new Date(r.timestamp).getTime() : NaN;
      if (!showAll && uniqueYears.length && (!Number.isFinite(ts) || ts > cutoff)) continue;
      const key = `${r.latitude}|${r.longitude}`;
      const prev = map.get(key);
      if (!prev || (Number.isFinite(ts) && ts > prev._ts)) {
        map.set(key, {
          latitude: r.latitude,
          longitude: r.longitude,
          hmpi: r.hmpi,
          category: r.category,
          timestamp: r.timestamp,
          _ts: ts
        });
      }
    }
    return Array.from(map.values()).map(({ _ts, ...rest }) => rest);
  }, [rows, uniqueYears, sliderIndex, showAll]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">World Map</h2>
        {loading && <span className="text-white/60">Loading…</span>}
      </div>
      {/* Timeline Controls */
      }
      <div className="card p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Year:</span>
            <button
              type="button"
              className="text-white/80 hover:text-primary underline-offset-2 hover:underline"
              title={showAll ? 'Click to switch to year filter' : 'Click to show all data'}
              onClick={() => setShowAll((v) => !v)}
            >
              {displayLabel}
            </button>
          </div>
          {/* Explicit Show All toggle */}
          <div className="flex items-center gap-2">
            <input
              id="showAllToggle"
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }}
            />
            <label htmlFor="showAllToggle" className="text-sm text-white/80 select-none">
              Show all data
            </label>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, uniqueYears.length - 1)}
            step={1}
            value={Math.min(sliderIndex, Math.max(0, uniqueYears.length - 1))}
            onChange={(e) => setSliderIndex(Number(e.target.value))}
            className="range"
            disabled={showAll}
          />
          <div className="flex justify-between text-xs text-white/60">
            <span>{uniqueYears.length ? uniqueYears[0] : '-'}</span>
            <span>{uniqueYears.length ? uniqueYears[uniqueYears.length - 1] : '-'}</span>
          </div>
        </div>
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

