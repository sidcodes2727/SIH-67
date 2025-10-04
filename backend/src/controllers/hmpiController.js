import { query } from '../db.js';
import { computeHMPI } from '../services/hmpiService.js';

export async function getHMPIByRowContext(req, res, next) {
  try {
    const { id } = req.params;
    const row = await query('SELECT * FROM heavy_metal_data WHERE id=$1', [id]);
    if (!row.rows[0]) return res.status(404).json({ message: 'Not found' });
    const { latitude, longitude, timestamp } = row.rows[0];
    const group = await query(
      `SELECT * FROM heavy_metal_data WHERE latitude=$1 AND longitude=$2 AND timestamp=$3`,
      [latitude, longitude, timestamp]
    );
    const { hmpi, category } = computeHMPI(group.rows);
    res.json({ latitude, longitude, timestamp, hmpi, category, count: group.rows.length });
  } catch (err) { next(err); }
}
