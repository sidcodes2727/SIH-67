import { useState } from 'react';
import { motion } from 'framer-motion';
import { createRecord, uploadFile } from '../api/data.js';

export default function UploadForm() {
  const [form, setForm] = useState({ 
    latitude: '', 
    longitude: '', 
    timestamp: '', 
    pb: '', 
    cd: '', 
    as_metal: '', 
    hg: '', 
    cr: '' 
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState(null);

  const submitForm = async (e) => {
    e.preventDefault();
    setMessage('');
    setDetails(null);
    try {
      const payload = {
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        timestamp: form.timestamp,
        pb: Number(form.pb) || 0,
        cd: Number(form.cd) || 0,
        as_metal: Number(form.as_metal) || 0,
        hg: Number(form.hg) || 0,
        cr: Number(form.cr) || 0
      };
      const res = await createRecord(payload);
      setMessage(`✅ Data saved successfully! HMPI: ${res.row?.hmpi} (${res.row?.category})`);
      // Reset form after successful submission
      setForm({ 
        latitude: '', longitude: '', timestamp: '', 
        pb: '', cd: '', as_metal: '', hg: '', cr: '' 
      });
    } catch (e) { 
      setMessage(`❌ Error: ${e?.response?.data?.message || 'Failed to save data'}`); 
    }
  };

  const submitFile = async (e) => {
    e.preventDefault();
    setMessage('');
    setDetails(null);
    try {
      if (!file) return setMessage('❌ Choose a CSV or XLSX file first');
      const res = await uploadFile(file);
      const skipped = res.skipped || 0;
      setMessage(`✅ Successfully uploaded ${res.inserted} record(s)${skipped > 0 ? `, skipped ${skipped}` : ''}`);
      if (skipped && res.invalid) setDetails(res.invalid.slice(0, 5));
      setFile(null); // Clear file input after successful upload
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (e) { 
      setMessage(`❌ Upload failed: ${e?.response?.data?.message || 'Unknown error'}`); 
    }
  };

  const isValidNumber = (v) => /^-?\d+(\.\d+)?$/.test(v);

  const metals = [
    { key: 'pb', name: 'Lead (Pb)', limit: '10 µg/L' },
    { key: 'cd', name: 'Cadmium (Cd)', limit: '3 µg/L' },
    { key: 'as_metal', name: 'Arsenic (As)', limit: '10 µg/L' },
    { key: 'hg', name: 'Mercury (Hg)', limit: '6 µg/L' },
    { key: 'cr', name: 'Chromium (Cr)', limit: '50 µg/L' }
  ];

  return (
    <div className="space-y-6">
      {/* Manual Data Entry Form */}
      <div className="card glass p-6">
        <h3 className="text-xl font-semibold mb-4">Manual Data Entry</h3>
        <p className="text-white/70 mb-6">Enter all metal concentrations for a single location and time.</p>
        
        <form onSubmit={submitForm} className="space-y-6">
          {/* Location and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Latitude <span className="text-red-400">*</span></label>
              <input 
                type="number" 
                step="any"
                className="input" 
                value={form.latitude} 
                onChange={(e)=>setForm({ ...form, latitude: e.target.value })} 
                placeholder="e.g., 19.0760"
                required 
              />
              {!isValidNumber(form.latitude) && form.latitude !== '' && (
                <p className="text-red-400 text-sm mt-1">Enter a valid latitude (-90 to 90)</p>
              )}
            </div>
            <div>
              <label className="label">Longitude <span className="text-red-400">*</span></label>
              <input 
                type="number" 
                step="any"
                className="input" 
                value={form.longitude} 
                onChange={(e)=>setForm({ ...form, longitude: e.target.value })} 
                placeholder="e.g., 72.8777"
                required 
              />
              {!isValidNumber(form.longitude) && form.longitude !== '' && (
                <p className="text-red-400 text-sm mt-1">Enter a valid longitude (-180 to 180)</p>
              )}
            </div>
            <div>
              <label className="label">Date & Time <span className="text-red-400">*</span></label>
              <input 
                type="datetime-local" 
                className="input" 
                value={form.timestamp} 
                onChange={(e)=>setForm({ ...form, timestamp: e.target.value })} 
                required 
              />
            </div>
          </div>

          {/* Metal Concentrations */}
          <div>
            <h4 className="font-semibold mb-3">Metal Concentrations (µg/L)</h4>
            <p className="text-white/60 text-sm mb-4">Enter 0 or leave blank if a metal was not measured. Standard limits shown for reference.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metals.map(metal => (
                <div key={metal.key}>
                  <label className="label">
                    {metal.name}
                    <span className="text-white/40 text-xs ml-2">limit: {metal.limit}</span>
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="input" 
                    value={form[metal.key]} 
                    onChange={(e)=>setForm({ ...form, [metal.key]: e.target.value })} 
                    placeholder="0.00"
                  />
                  {!isValidNumber(form[metal.key]) && form[metal.key] !== '' && (
                    <p className="text-red-400 text-sm mt-1">Enter a valid number ≥ 0</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <motion.button 
              whileTap={{ scale: 0.98 }} 
              className="btn btn-primary px-8" 
              type="submit"
            >
              💾 Save Measurement Data
            </motion.button>
          </div>
        </form>
      </div>

      {/* File Upload Section */}
      <div className="card glass p-6">
        <h3 className="text-xl font-semibold mb-4">Bulk Data Upload</h3>
        <p className="text-white/70 mb-4">
          Upload CSV or Excel files with columns: <code className="bg-white/10 px-2 py-1 rounded text-primary">latitude, longitude, timestamp, pb, cd, as_metal, hg, cr</code>
        </p>
        
        <form onSubmit={submitFile} className="space-y-4">
          <div>
            <label className="label">Choose File</label>
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              onChange={(e)=>setFile(e.target.files?.[0])} 
              className="input file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
            />
          </div>
          
          <div className="flex justify-end">
            <motion.button 
              whileTap={{ scale: 0.98 }} 
              className="btn btn-primary px-8" 
              type="submit"
              disabled={!file}
            >
              📄 Upload File
            </motion.button>
          </div>
        </form>
        
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
            'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {message}
          </div>
        )}
        
        {details && (
          <div className="mt-4 p-3 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg">
            <p className="font-semibold mb-2">Validation Issues (showing up to 5):</p>
            <ul className="list-disc ml-6 space-y-1 text-sm">
              {details.map((d, i) => (
                <li key={i}>Row {d.index + 1}: Invalid {d.errors.join(', ')}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
