import { query } from "../db.js";
import { computeHMPI } from "./hmpiService.js";

export async function getRecentSamples(limit = 10) {
  const sql = `SELECT * FROM heavy_metal_data ORDER BY timestamp DESC LIMIT $1`;
  const r = await query(sql, [limit]);
  return r.rows;
}

export async function getLatestHMPIByLocation(lat, lon) {
  // find latest timestamp for exact lat/lon, then compute HMPI across metals for that timestamp
  const latest = await query(
    `SELECT timestamp FROM heavy_metal_data WHERE latitude=$1 AND longitude=$2 ORDER BY timestamp DESC LIMIT 1`,
    [lat, lon]
  );
  if (!latest.rows[0]) return null;
  const ts = latest.rows[0].timestamp;
  const group = await query(
    `SELECT * FROM heavy_metal_data WHERE latitude=$1 AND longitude=$2 AND timestamp=$3`,
    [lat, lon, ts]
  );
  const { hmpi, category } = computeHMPI(group.rows);
  return { latitude: lat, longitude: lon, timestamp: ts, hmpi, category, sampleCount: group.rows.length };
}

export async function getTopHazardousSites(limit = 5) {
  // Compute HMPI per site (lat,lon,timestamp) on recent data and return top by HMPI
  const recent = await query(
    `SELECT latitude, longitude, timestamp FROM heavy_metal_data 
     WHERE timestamp > NOW() - INTERVAL '365 days'
     GROUP BY latitude, longitude, timestamp
     ORDER BY timestamp DESC LIMIT 200`
  );
  const results = [];
  for (const row of recent.rows) {
    const group = await query(
      `SELECT * FROM heavy_metal_data WHERE latitude=$1 AND longitude=$2 AND timestamp=$3`,
      [row.latitude, row.longitude, row.timestamp]
    );
    const { hmpi, category } = computeHMPI(group.rows);
    results.push({ latitude: row.latitude, longitude: row.longitude, timestamp: row.timestamp, hmpi, category });
  }
  results.sort((a, b) => b.hmpi - a.hmpi);
  return results.slice(0, limit);
}

export async function searchByMetal(metal, limit = 10) {
  const r = await query(
    `SELECT * FROM heavy_metal_data WHERE metal_type=$1 ORDER BY timestamp DESC LIMIT $2`,
    [metal, limit]
  );
  return r.rows;
}
