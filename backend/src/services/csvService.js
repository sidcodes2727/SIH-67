import { parse } from 'csv-parse/sync';
import xlsx from 'xlsx';

export function parseCSV(buffer) {
  const text = buffer.toString('utf-8');
  const records = parse(text, { columns: true, skip_empty_lines: true });
  return normalize(records);
}

export function parseXLSX(buffer) {
  const wb = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const json = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
  return normalize(json);
}

function normalize(records) {
  // Expect columns: metal_type, concentration, latitude, longitude, timestamp
  return records.map((r) => ({
    metal_type: String(r.metal_type || r.METAL || r.metal || '').trim(),
    concentration: Number(r.concentration || r.value || r.Concentration || 0),
    latitude: Number(r.latitude || r.lat || r.Latitude),
    longitude: Number(r.longitude || r.lng || r.long || r.Longitude),
    timestamp: new Date(r.timestamp || r.time || r.Timestamp || Date.now()),
  }));
}
