import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const COLORS = ['#64ffda', '#a78bfa', '#f472b6', '#f59e0b', '#22d3ee'];

export default function Charts({ rows, hmpi }) {
  const allMetals = useMemo(() => ['Pb','Cd','As','Hg','Cr'], []);
  const [selected, setSelected] = useState(new Set(allMetals));

  const toggle = (metal) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(metal)) next.delete(metal); else next.add(metal);
      return next;
    });
  };

  const byMetalAll = useMemo(() => Object.values(rows.reduce((acc, r) => {
    acc[r.metal_type] = acc[r.metal_type] || { metal: r.metal_type, concentration: 0 };
    acc[r.metal_type].concentration += Number(r.concentration);
    return acc;
  }, {})), [rows]);

  const byMetal = byMetalAll.filter(d => selected.has(d.metal));

  const LIMITS = { Pb: 10, Cd: 3, As: 10, Hg: 6, Cr: 50 };
  const radarData = byMetal.map(d => ({
    metal: d.metal,
    percentOfLimit: Math.min(200, (d.concentration / (LIMITS[d.metal] || 1)) * 100),
  }));

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-4 md:col-span-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-semibold">Filter Metals</h3>
          <div className="flex flex-wrap gap-2">
            {allMetals.map(m => (
              <label key={m} className={`px-3 py-1 rounded-full border text-sm cursor-pointer ${selected.has(m) ? 'border-primary text-primary' : 'border-white/15 text-white/70'}`}>
                <input type="checkbox" className="hidden" checked={selected.has(m)} onChange={() => toggle(m)} />{m}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="card p-4 h-80">
        <h3 className="mb-3 font-semibold">Concentration by Metal</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byMetal}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
            <XAxis dataKey="metal" stroke="#e6edf3" />
            <YAxis stroke="#e6edf3" />
            <Tooltip />
            <Bar dataKey="concentration" fill="#64ffda" isAnimationActive animationBegin={200} animationDuration={600} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card p-4 h-80">
        <h3 className="mb-3 font-semibold">Metal Share</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={byMetal} dataKey="concentration" nameKey="metal" outerRadius={100} isAnimationActive animationBegin={200} animationDuration={600}>
              {byMetal.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="card p-4 h-96 md:col-span-2">
        <h3 className="mb-3 font-semibold">% of Standard Limit (Radar)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#ffffff22" />
            <PolarAngleAxis dataKey="metal" stroke="#e6edf3" />
            <PolarRadiusAxis angle={30} domain={[0, 200]} stroke="#e6edf3" />
            <Radar name="% of Limit" dataKey="percentOfLimit" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.5} />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
