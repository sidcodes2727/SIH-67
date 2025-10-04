import { query } from "../db.js";
import { computeHMPI } from "../services/hmpiService.js";
import { generateChatReply } from "../services/geminiService.js";
import { getLatestHMPIByLocation, getTopHazardousSites, getRecentSamples, searchByMetal } from "../services/retrievalService.js";

// POST /api/chat
// body: { messages: [{role:'user'|'assistant', content:string}], rowId?: number }
export async function chat(req, res, next) {
  try {
    const { messages = [], rowId } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "messages array is required" });
    }

    let domainContext = {
      limits: { Pb: 10, Cd: 3, As: 10, Hg: 6, Cr: 50 },
    };

    if (rowId) {
      const row = await query("SELECT * FROM heavy_metal_data WHERE id=$1", [rowId]);
      if (row.rows[0]) {
        const { latitude, longitude, timestamp } = row.rows[0];
        const group = await query(
          `SELECT * FROM heavy_metal_data WHERE latitude=$1 AND longitude=$2 AND timestamp=$3`,
          [latitude, longitude, timestamp]
        );
        const { hmpi, category } = computeHMPI(group.rows);
        domainContext.hmpiExample = {
          latitude,
          longitude,
          timestamp,
          hmpi,
          category,
          sampleCount: group.rows.length,
        };
      }
    }

    // Lightweight intent detection on the latest user message
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    const q = (lastUser?.content || '').toLowerCase();
    const findings = {};

    // Parse coordinates: e.g., "at 18.52, 73.85" or "lat 18.52 lon 73.85"
    const coordMatch = q.match(/(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        const site = await getLatestHMPIByLocation(lat, lon);
        if (site) findings.latestAtLocation = site;
      }
    }

    // Ask for top hazardous sites
    if (/top|highest|hazardous|worst/.test(q)) {
      findings.topHazardous = await getTopHazardousSites(5);
    }

    // Ask for recent or latest samples
    if (/recent|latest|newest/.test(q)) {
      findings.recentSamples = await getRecentSamples(10);
    }

    // Metal specific queries
    const metalMatch = q.match(/\b(pb|lead|cd|cadmium|as|arsenic|hg|mercury|cr|chromium)\b/);
    if (metalMatch) {
      const norm = {
        lead: 'Pb', pb: 'Pb', cadmium: 'Cd', cd: 'Cd', arsenic: 'As', as: 'As', mercury: 'Hg', hg: 'Hg', chromium: 'Cr', cr: 'Cr'
      }[metalMatch[1]];
      if (norm) findings.byMetal = { metal: norm, rows: await searchByMetal(norm, 10) };
    }

    if (Object.keys(findings).length > 0) {
      domainContext.findings = findings;
    }

    const text = await generateChatReply(messages, domainContext);
    res.json({ reply: text });
  } catch (err) {
    next(err);
  }
}
