import { useState } from 'react';
import { motion } from 'framer-motion';
import { createRecord, uploadFile } from '../api/data.js';

export default function UploadForm() {
  const [form, setForm] = useState({ metal_type: 'Pb', concentration: '', latitude: '', longitude: '', timestamp: '' });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState(null);

  const submitForm = async (e) => {
    e.preventDefault();
    setMessage('');
    setDetails(null);
    try {
      const payload = { ...form, concentration: Number(form.concentration), latitude: Number(form.latitude), longitude: Number(form.longitude) };
      const res = await createRecord(payload);
      setMessage(`Saved. Group HMPI: ${res.group?.hmpi} (${res.group?.category})`);
    } catch (e) { setMessage(e?.response?.data?.message || 'Error'); }
  };

  const submitFile = async (e) => {
    e.preventDefault();
    setMessage('');
    setDetails(null);
    try {
      if (!file) return setMessage('Choose a CSV or XLSX file first');
      const res = await uploadFile(file);
      const skipped = res.skipped || 0;
      setMessage(`Inserted ${res.inserted} row(s), Skipped ${skipped}. Preview HMPI: ${res.previewGroup?.hmpi ?? '-'} (${res.previewGroup?.category ?? '-'})`);
      if (skipped && res.invalid) setDetails(res.invalid.slice(0, 5));
    } catch (e) { setMessage(e?.response?.data?.message || 'Error'); }
  };

  const isValidNumber = (v) => /^-?\d+(\.\d+)?$/.test(v);

  return (
    <div className="card glass p-6">
      <form onSubmit={submitForm} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Metal Type</label>
          <select className="input" value={form.metal_type} onChange={(e)=>setForm({ ...form, metal_type: e.target.value })}>
            {['Pb','Cd','As','Hg','Cr'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Concentration (µg/L)</label>
          <input className="input" value={form.concentration} onChange={(e)=>setForm({ ...form, concentration: e.target.value })} required />
          {!isValidNumber(form.concentration) && form.concentration !== '' && (<p className="text-red-400 text-sm mt-1">Enter a valid number</p>)}
        </div>
        <div>
          <label className="label">Latitude</label>
          <input className="input" value={form.latitude} onChange={(e)=>setForm({ ...form, latitude: e.target.value })} required />
          {!isValidNumber(form.latitude) && form.latitude !== '' && (<p className="text-red-400 text-sm mt-1">Enter a valid latitude</p>)}
        </div>
        <div>
          <label className="label">Longitude</label>
          <input className="input" value={form.longitude} onChange={(e)=>setForm({ ...form, longitude: e.target.value })} required />
          {!isValidNumber(form.longitude) && form.longitude !== '' && (<p className="text-red-400 text-sm mt-1">Enter a valid longitude</p>)}
        </div>
        <div>
          <label className="label">Timestamp</label>
          <input type="datetime-local" className="input" value={form.timestamp} onChange={(e)=>setForm({ ...form, timestamp: e.target.value })} required />
        </div>
        <div className="flex items-end">
          <motion.button whileTap={{ scale: 0.98 }} className="btn" type="submit">Submit Record</motion.button>
        </div>
      </form>

      <div className="mt-6">
        <form onSubmit={submitFile} className="flex items-center gap-3">
          <input type="file" accept=".csv,.xlsx" onChange={(e)=>setFile(e.target.files?.[0])} />
          <motion.button whileTap={{ scale: 0.98 }} className="btn" type="submit">Upload File</motion.button>
        </form>
        {message && <p className="mt-3 text-white/80">{message}</p>}
        {details && (
          <div className="mt-2 text-white/60 text-sm">
            Showing up to 5 skipped rows:
            <ul className="list-disc ml-6">
              {details.map((d, i) => (
                <li key={i}>Row {d.index + 1}: invalid {d.errors.join(', ')}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
