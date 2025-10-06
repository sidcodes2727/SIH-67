import { query } from "../db.js";
import { computeHMPI } from "./hmpiService.js";

export async function getRecentSamples(limit = 10) {
  const sql = `SELECT * FROM heavy_metal_data ORDER BY timestamp DESC LIMIT $1`;
  const r = await query(sql, [limit]);
  return r.rows;
}

export async function getLatestHMPIByLocation(lat, lon) {
  // 1) Try exact match, latest timestamp
  let latest = await query(
    `SELECT * FROM heavy_metal_data WHERE latitude=$1 AND longitude=$2 ORDER BY timestamp DESC LIMIT 1`,
    [lat, lon]
  );
  if (latest.rows[0]) {
    const row = latest.rows[0];
    const hcat = row.hmpi != null && row.category
      ? { hmpi: Number(row.hmpi), category: row.category }
      : computeHMPI(row);
    return { latitude: row.latitude, longitude: row.longitude, timestamp: row.timestamp, ...hcat };
  }

  // 2) Fallback: nearest location within a reasonable box, ordered by distance then timestamp
  const near = await query(
    `SELECT *, ((latitude - $1)^2 + (longitude - $2)^2) AS dist
     FROM heavy_metal_data
     WHERE latitude BETWEEN $1 - 0.1 AND $1 + 0.1
       AND longitude BETWEEN $2 - 0.1 AND $2 + 0.1
     ORDER BY dist ASC, timestamp DESC
     LIMIT 1`,
    [lat, lon]
  );
  if (near.rows[0]) {
    const row = near.rows[0];
    const hcat = row.hmpi != null && row.category
      ? { hmpi: Number(row.hmpi), category: row.category }
      : computeHMPI(row);
    return { latitude: row.latitude, longitude: row.longitude, timestamp: row.timestamp, ...hcat };
  }

  return null;
}

export async function getTopHazardousSites(limit = 5) {
  // Compute HMPI per latest sample per site in recent 365 days
  const recent = await query(
    `SELECT DISTINCT ON (latitude, longitude)
            latitude, longitude, timestamp, hmpi, category
       FROM heavy_metal_data
      WHERE timestamp > NOW() - INTERVAL '365 days'
      ORDER BY latitude, longitude, timestamp DESC`
  );
  const rows = recent.rows.map(r => {
    if (r.hmpi == null || !r.category) {
      const hcat = computeHMPI(r);
      return { ...r, ...hcat };
    }
    return { ...r, hmpi: Number(r.hmpi) };
  });
  rows.sort((a, b) => b.hmpi - a.hmpi);
  return rows.slice(0, limit);
}

export async function searchByMetal(metal, limit = 10) {
  // Map metal symbol to column in the new schema
  const col = ({ Pb: 'pb', Cd: 'cd', As: 'as_metal', Hg: 'hg', Cr: 'cr' })[metal];
  if (!col) return [];
  const r = await query(
    `SELECT * FROM heavy_metal_data WHERE ${col} IS NOT NULL ORDER BY ${col} DESC, timestamp DESC LIMIT $1`,
    [limit]
  );
  return r.rows;
}
