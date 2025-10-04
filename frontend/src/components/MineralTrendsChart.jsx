import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = {
  pb: '#64ffda',   // Cyan - Lead
  cd: '#a78bfa',   // Purple - Cadmium
  as_metal: '#f472b6',   // Pink - Arsenic
  hg: '#f59e0b',   // Amber - Mercury
  cr: '#22d3ee'    // Sky blue - Chromium
};

const METAL_NAMES = {
  pb: 'Lead (Pb)',
  cd: 'Cadmium (Cd)',
  as_metal: 'Arsenic (As)',
  hg: 'Mercury (Hg)',
  cr: 'Chromium (Cr)'
};

export default function MineralTrendsChart({ data, selectedMetals, onMetalToggle }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // With new schema, each row already contains all metal concentrations
    // So we just need to format the data for the chart
    return data.map(row => {
      const timestamp = new Date(row.timestamp);
      return {
        date: timestamp.toISOString().split('T')[0],
        timestamp: timestamp,
        displayDate: timestamp.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short', 
          day: 'numeric'
        }),
        pb: parseFloat(row.pb) || 0,
        cd: parseFloat(row.cd) || 0,
        as_metal: parseFloat(row.as_metal) || 0,
        hg: parseFloat(row.hg) || 0,
        cr: parseFloat(row.cr) || 0,
        hmpi: parseFloat(row.hmpi) || 0,
        category: row.category
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);

  const allMetals = Object.keys(COLORS);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry) => (
          entry.value !== null && (
            <p key={entry.dataKey} style={{ color: entry.color }} className="text-sm">
              {METAL_NAMES[entry.dataKey]}: {entry.value} µg/L
            </p>
          )
        ))}
      </div>
    );
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">📊</div>
        <h3 className="text-lg font-semibold">No data available</h3>
        <p className="text-white/60 mt-1">Try adjusting your location or range parameters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metal Filter Controls */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-semibold">Select Minerals to Display:</h3>
          <div className="flex flex-wrap gap-2">
            {allMetals.map(metal => (
              <label 
                key={metal} 
                className={`px-3 py-1 rounded-full border text-sm cursor-pointer transition-colors ${
                  selectedMetals.includes(metal) 
                    ? 'border-primary text-primary bg-primary/10' 
                    : 'border-white/15 text-white/70 hover:border-white/30'
                }`}
              >
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={selectedMetals.includes(metal)} 
                  onChange={() => onMetalToggle(metal)} 
                />
                {METAL_NAMES[metal]}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="card p-4">
        <h3 className="mb-4 font-semibold text-lg">Mineral Concentration Trends Over Time</h3>
        <div style={{ width: '100%', height: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
              <XAxis 
                dataKey="displayDate" 
                stroke="#e6edf3" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                stroke="#e6edf3" 
                label={{ value: 'Concentration (µg/L)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {selectedMetals.map(metal => (
                <Line
                  key={metal}
                  type="monotone"
                  dataKey={metal}
                  stroke={COLORS[metal]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[metal], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: COLORS[metal], strokeWidth: 2, fill: COLORS[metal] }}
                  name={METAL_NAMES[metal]}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}