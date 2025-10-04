import { useState } from 'react';

export default function LocationForm({ onSearch, loading }) {
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    range: '10'
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    const range = parseFloat(formData.range);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }
    
    if (isNaN(range) || range <= 0 || range > 1000) {
      newErrors.range = 'Range must be between 0 and 1000 km';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSearch({
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        range: parseFloat(formData.range)
      });
    }
  };

  const presetLocations = [
    { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi, India', lat: 28.7041, lng: 77.1025 },
    { name: 'Bangalore, India', lat: 12.9716, lng: 77.5946 },
    { name: 'Chennai, India', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata, India', lat: 22.5726, lng: 88.3639 }
  ];

  const usePreset = (location) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat.toString(),
      longitude: location.lng.toString()
    }));
    setErrors({});
  };

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-4">Search Mineral Data by Location</h3>
      <p className="text-white/60 mb-6">Enter coordinates and search range to view mineral concentration trends over time in that area.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Latitude <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="e.g., 19.0760"
              step="any"
              min="-90"
              max="90"
              className={`w-full px-3 py-2 rounded-lg bg-white/5 border transition-colors ${
                errors.latitude 
                  ? 'border-red-400 focus:border-red-400' 
                  : 'border-white/15 focus:border-primary'
              } focus:outline-none focus:ring-2 focus:ring-primary/20`}
              required
            />
            {errors.latitude && (
              <p className="text-red-400 text-sm mt-1">{errors.latitude}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Longitude <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="e.g., 72.8777"
              step="any"
              min="-180"
              max="180"
              className={`w-full px-3 py-2 rounded-lg bg-white/5 border transition-colors ${
                errors.longitude 
                  ? 'border-red-400 focus:border-red-400' 
                  : 'border-white/15 focus:border-primary'
              } focus:outline-none focus:ring-2 focus:ring-primary/20`}
              required
            />
            {errors.longitude && (
              <p className="text-red-400 text-sm mt-1">{errors.longitude}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Search Range (km) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            name="range"
            value={formData.range}
            onChange={handleChange}
            placeholder="e.g., 10"
            step="0.1"
            min="0.1"
            max="1000"
            className={`w-full px-3 py-2 rounded-lg bg-white/5 border transition-colors ${
              errors.range 
                ? 'border-red-400 focus:border-red-400' 
                : 'border-white/15 focus:border-primary'
            } focus:outline-none focus:ring-2 focus:ring-primary/20`}
            required
          />
          {errors.range && (
            <p className="text-red-400 text-sm mt-1">{errors.range}</p>
          )}
          <p className="text-white/40 text-sm mt-1">
            Data will be searched within {formData.range || '10'}km radius of the specified coordinates
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Searching...
            </div>
          ) : (
            '🔍 Search Mineral Data'
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/10">
        <h4 className="font-medium mb-3">Quick Select - Major Indian Cities:</h4>
        <div className="flex flex-wrap gap-2">
          {presetLocations.map((location) => (
            <button
              key={location.name}
              type="button"
              onClick={() => usePreset(location)}
              className="px-3 py-1 text-sm rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 transition-colors"
            >
              {location.name}
            </button>
          ))}
        </div>
        <p className="text-white/40 text-xs mt-2">
          Click any city to auto-fill coordinates
        </p>
      </div>
    </div>
  );
}