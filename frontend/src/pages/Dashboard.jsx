import { useRef, useState } from 'react';
import { getDataByLocationRange } from '../api/data.js';
import LocationForm from '../components/LocationForm.jsx';
import MineralTrendsChart from '../components/MineralTrendsChart.jsx';
import { SkeletonCard } from '../components/Skeleton.jsx';

export default function Dashboard() {
  const [searchData, setSearchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [selectedMetals, setSelectedMetals] = useState(['pb', 'cd', 'as_metal', 'hg', 'cr']);
  const printRef = useRef(null);

  const handleSearch = async (params) => {
    setLoading(true);
    setError(null);
    setSearchParams(params);
    
    try {
      const data = await getDataByLocationRange(params.latitude, params.longitude, params.range);
      setSearchData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      setSearchData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMetalToggle = (metal) => {
    setSelectedMetals(prev => {
      const newSelection = prev.includes(metal) 
        ? prev.filter(m => m !== metal)
        : [...prev, metal];
      
      // Ensure at least one metal is always selected
      return newSelection.length > 0 ? newSelection : [metal];
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Mineral Trends Dashboard</h2>
          <p className="text-white/60 mt-1">Analyze heavy metal concentration patterns over time by location</p>
        </div>
        <div className="flex items-center gap-2">
          {searchData && searchParams && !loading && (
            <button
              className="px-3 py-2 rounded-lg border border-white/15 hover:border-white/30 hover:bg-white/5 transition-colors"
              onClick={() => window.print()}
              title="Export results to PDF"
            >
              Export to PDF
            </button>
          )}
        </div>
      </div>

      <LocationForm onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="card p-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              ⚠️
            </div>
            <div>
              <h3 className="font-semibold text-red-400">Search Error</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <SkeletonCard lines={2} height={100} />
          <SkeletonCard lines={4} height={400} />
        </div>
      )}

      {searchData && searchParams && !loading && (
        <div ref={printRef} className="space-y-6 print-area">
          {/* Search Summary */}
          <div className="card p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                📍
              </div>
              <div>
                <h3 className="font-semibold">Search Results</h3>
                <p className="text-white/80 text-sm">
                  Found {searchData.length} data points within {searchParams.range}km of coordinates 
                  ({searchParams.latitude.toFixed(4)}, {searchParams.longitude.toFixed(4)})
                </p>
              </div>
            </div>
          </div>

          {searchData.length > 0 ? (
            <MineralTrendsChart 
              data={searchData} 
              selectedMetals={selectedMetals}
              onMetalToggle={handleMetalToggle}
            />
          ) : (
            <div className="card p-8 text-center">
              <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">🔍</div>
              <h3 className="text-lg font-semibold">No data found</h3>
              <p className="text-white/60 mt-1">
                No mineral measurements were found in this location range. 
                Try expanding your search range or searching a different location.
              </p>
            </div>
          )}
        </div>
      )}

      {!searchData && !loading && !error && (
        <div className="card p-8 text-center">
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">🌍</div>
          <h3 className="text-lg font-semibold">Ready to Explore</h3>
          <p className="text-white/60 mt-1">
            Enter coordinates above to view mineral concentration trends for any location.
          </p>
        </div>
      )}
    </div>
  );
}
