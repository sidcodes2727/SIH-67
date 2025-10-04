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
  // Expect columns: latitude, longitude, timestamp, pb/Pb, cd/Cd, as_metal/As, hg/Hg, cr/Cr
  return records.map((r) => ({
    latitude: Number(r.latitude || r.lat || r.Latitude),
    longitude: Number(r.longitude || r.lng || r.long || r.Longitude),
    timestamp: r.timestamp || r.time || r.Timestamp,
    // Handle both uppercase and lowercase column names for metals
    Pb: Number(r.Pb || r.pb) || 0,
    Cd: Number(r.Cd || r.cd) || 0,
    As: Number(r.As || r.as_metal) || 0,
    Hg: Number(r.Hg || r.hg) || 0,
    Cr: Number(r.Cr || r.cr) || 0,
  }));
}
