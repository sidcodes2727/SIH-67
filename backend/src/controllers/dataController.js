import { query } from '../db.js';
import { parseCSV, parseXLSX } from '../services/csvService.js';
import { computeHMPI } from '../services/hmpiService.js';

export async function createData(req, res, next) {
  try {
    const { latitude, longitude, timestamp, pb, cd, as_metal, hg, cr } = req.body;
    
    // Insert the row
    const insert = await query(
      `INSERT INTO heavy_metal_data (latitude, longitude, timestamp, pb, cd, as_metal, hg, cr)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [latitude, longitude, timestamp, pb || 0, cd || 0, as_metal || 0, hg || 0, cr || 0]
    );

    // Calculate and update HMPI for this row
    const newRow = insert.rows[0];
    const { hmpi, category } = computeHMPI(newRow);
    
    await query(
      `UPDATE heavy_metal_data SET hmpi=$1, category=$2 WHERE id=$3`,
      [hmpi, category, newRow.id]
    );
    
    newRow.hmpi = hmpi;
    newRow.category = category;
    
    return res.status(201).json({ row: newRow });
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

    // Basic validation per row - expecting columns: latitude, longitude, timestamp, Pb/pb, Cd/cd, As/as_metal, Hg/hg, Cr/cr
    const valid = [];
    const invalid = [];
    for (const [i, r] of records.entries()) {
      const errs = [];
      
      // Validate coordinates
      if (!(Number.isFinite(r.latitude) && r.latitude >= -90 && r.latitude <= 90)) errs.push('latitude');
      if (!(Number.isFinite(r.longitude) && r.longitude >= -180 && r.longitude <= 180)) errs.push('longitude');
      
      // Validate timestamp
      const ts = new Date(r.timestamp);
      if (!(ts instanceof Date && !isNaN(ts))) errs.push('timestamp');
      
      // Validate metal concentrations (allow 0 or positive numbers)
      // Handle both uppercase and lowercase column names
      const pb = Number(r.Pb || r.pb) || 0;
      const cd = Number(r.Cd || r.cd) || 0;
      const as_metal = Number(r.As || r.as_metal) || 0;
      const hg = Number(r.Hg || r.hg) || 0;
      const cr = Number(r.Cr || r.cr) || 0;
      
      if (pb < 0) errs.push('Pb');
      if (cd < 0) errs.push('Cd');
      if (as_metal < 0) errs.push('As');
      if (hg < 0) errs.push('Hg');
      if (cr < 0) errs.push('Cr');
      
      if (errs.length) {
        invalid.push({ index: i, errors: errs, row: r });
      } else {
        valid.push({ 
          latitude: r.latitude, 
          longitude: r.longitude, 
          timestamp: ts, 
          pb, cd, as_metal, hg, cr 
        });
      }
    }

    // Insert valid records
    const client = await (await import('../db.js')).getClient();
    const insertedRows = [];
    
    try {
      await client.query('BEGIN');
      for (const r of valid) {
        const result = await client.query(
          `INSERT INTO heavy_metal_data (latitude, longitude, timestamp, pb, cd, as_metal, hg, cr)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
          [r.latitude, r.longitude, r.timestamp, r.pb, r.cd, r.as_metal, r.hg, r.cr]
        );
        
        // Calculate HMPI for this row
        const newRow = result.rows[0];
        const { hmpi, category } = computeHMPI(newRow);
        
        await client.query(
          `UPDATE heavy_metal_data SET hmpi=$1, category=$2 WHERE id=$3`,
          [hmpi, category, newRow.id]
        );
        
        insertedRows.push({ ...newRow, hmpi, category });
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    
    return res.status(201).json({ 
      inserted: insertedRows.length, 
      skipped: invalid.length, 
      invalid,
      sampleRows: insertedRows.slice(0, 3) // Show first 3 rows
    });
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

export async function getDataByLocationRange(req, res, next) {
  try {
    const { latitude, longitude, range } = req.query;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rangeKm = parseFloat(range) || 10; // default 10km
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Valid latitude and longitude are required' });
    }
    
    // Calculate approximate coordinate bounds (rough conversion: 1 degree ≈ 111km)
    const latRange = rangeKm / 111;
    const lngRange = rangeKm / (111 * Math.cos(lat * Math.PI / 180));
    
    const result = await query(
      `SELECT * FROM heavy_metal_data 
       WHERE latitude BETWEEN $1 AND $2 
       AND longitude BETWEEN $3 AND $4 
       ORDER BY timestamp ASC`,
      [lat - latRange, lat + latRange, lng - lngRange, lng + lngRange]
    );
    
    res.json(result.rows);
  } catch (err) { next(err); }
}

