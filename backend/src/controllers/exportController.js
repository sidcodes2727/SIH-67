import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { query } from '../db.js';
import { computeHMPI } from '../services/hmpiService.js';

export async function exportCSV(req, res, next) {
  try {
    const { latitude, longitude, timestamp } = req.query;
    const rows = await fetchGroup(latitude, longitude, timestamp);
    const { hmpi, category } = computeHMPI(rows);
    const parser = new Parser({ fields: ['id','metal_type','concentration','latitude','longitude','timestamp','hmpi','category'] });
    const csv = parser.parse(rows.map(r => ({ ...r, hmpi, category })));
    res.header('Content-Type', 'text/csv');
    res.attachment('hmpi_export.csv');
    return res.send(csv);
  } catch (err) { next(err); }
}

export async function exportPDF(req, res, next) {
  try {
    const { latitude, longitude, timestamp } = req.query;
    const rows = await fetchGroup(latitude, longitude, timestamp);
    const { hmpi, category } = computeHMPI(rows);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="hmpi_report.pdf"');
    doc.pipe(res);

    doc.fontSize(18).text('Heavy Metal Pollution Index (HMPI) Report', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Location: (${latitude}, ${longitude})`);
    doc.text(`Timestamp: ${new Date(timestamp).toISOString()}`);
    doc.text(`HMPI: ${hmpi}  Category: ${category}`);
    doc.moveDown();
    doc.text('Measurements:');
    rows.forEach(r => {
      doc.text(`- ${r.metal_type}: ${r.concentration}`);
    });

    doc.end();
  } catch (err) { next(err); }
}

async function fetchGroup(lat, lng, ts) {
  const result = await query(
    `SELECT * FROM heavy_metal_data WHERE latitude=$1 AND longitude=$2 AND timestamp=$3 ORDER BY metal_type`,
    [lat, lng, ts]
  );
  return result.rows;
}
