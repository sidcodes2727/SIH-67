import { query } from '../db.js';
import { parseCSV, parseXLSX } from '../services/csvService.js';
import { computeHMPI } from '../services/hmpiService.js';

export async function createData(req, res, next) {
  try {
    const { metal_type, concentration, latitude, longitude, timestamp } = req.body;
    const insert = await query(
      `INSERT INTO heavy_metal_data (metal_type, concentration, latitude, longitude, timestamp)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [metal_type, concentration, latitude, longitude, timestamp]
    );

    // compute aggregated HMPI for same location/time
    const agg = await aggregateForGroup(latitude, longitude, timestamp);
    return res.status(201).json({ row: insert.rows[0], group: agg });
  } catch (err) { next(err); }
}

export async function uploadFile(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const ext = (req.file.originalname.split('.').pop() || '').toLowerCase();
    let records = [];
    if (ext === 'csv') records = parseCSV(req.file.buffer);
    else if (ext === 'xlsx' || ext === 'xls') records = parseXLSX(req.file.buffer);
    else return res.status(400).json({ message: 'Unsupported file type' });

    // Basic validation per row
    const allowed = new Set(['Pb', 'Cd', 'As', 'Hg', 'Cr']);
    const valid = [];
    const invalid = [];
    for (const [i, r] of records.entries()) {
      const errs = [];
      if (!allowed.has(String(r.metal_type))) errs.push('metal_type');
      if (!(Number.isFinite(r.concentration) && r.concentration >= 0)) errs.push('concentration');
      if (!(Number.isFinite(r.latitude) && r.latitude >= -90 && r.latitude <= 90)) errs.push('latitude');
      if (!(Number.isFinite(r.longitude) && r.longitude >= -180 && r.longitude <= 180)) errs.push('longitude');
      const ts = new Date(r.timestamp);
      if (!(ts instanceof Date && !isNaN(ts))) errs.push('timestamp');
      if (errs.length) invalid.push({ index: i, errors: errs, row: r });
      else valid.push({ ...r, timestamp: ts });
    }

    const client = await (await import('../db.js')).getClient();
    try {
      await client.query('BEGIN');
      for (const r of valid) {
        await client.query(
          `INSERT INTO heavy_metal_data (metal_type, concentration, latitude, longitude, timestamp)
           VALUES ($1,$2,$3,$4,$5)`,
          [r.metal_type, r.concentration, r.latitude, r.longitude, r.timestamp]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    // Aggregate HMPI preview for the first valid group
    const first = valid[0];
    const agg = first ? await aggregateForGroup(first.latitude, first.longitude, first.timestamp) : null;
    return res.status(201).json({ inserted: valid.length, skipped: invalid.length, invalid, previewGroup: agg });
  } catch (err) { next(err); }
}

export async function getAllData(req, res, next) {
  try {
    const result = await query('SELECT * FROM heavy_metal_data ORDER BY timestamp DESC, id DESC');
    res.json(result.rows);
  } catch (err) { next(err); }
}

export async function getDataById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM heavy_metal_data WHERE id=$1', [id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

export async function aggregateForGroup(lat, lng, ts) {
  const result = await query(
    `SELECT * FROM heavy_metal_data WHERE latitude=$1 AND longitude=$2 AND timestamp=$3`,
    [lat, lng, ts]
  );
  const { hmpi, category } = computeHMPI(result.rows);
  // store hmpi/category back on each row
  if (result.rows.length) {
    await query(
      `UPDATE heavy_metal_data SET hmpi=$1, category=$2 WHERE latitude=$3 AND longitude=$4 AND timestamp=$5`,
      [hmpi, category, lat, lng, ts]
    );
  }
  return { latitude: lat, longitude: lng, timestamp: ts, hmpi, category, count: result.rows.length };
}
