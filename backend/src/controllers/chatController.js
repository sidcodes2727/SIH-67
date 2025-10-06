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
      const r = await query("SELECT * FROM heavy_metal_data WHERE id=$1", [rowId]);
      const row = r.rows[0];
      if (row) {
        const hcat = row.hmpi != null && row.category ? { hmpi: Number(row.hmpi), category: row.category } : computeHMPI(row);
        domainContext.hmpiExample = {
          latitude: row.latitude,
          longitude: row.longitude,
          timestamp: row.timestamp,
          ...hcat,
          sampleCount: 1,
        };
      }
    }

    // Lightweight intent detection on the latest user message
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    const q = (lastUser?.content || '').toLowerCase();
    const findings = {};

    // Parse coordinates in flexible formats
    // Patterns supported:
    //  - "18.5204, 73.8567" or "18.5204 73.8567"
    //  - "lat 18.5204 lon 73.8567" or "latitude: 18.5204, longitude: 73.8567"
    let latParsed = null, lonParsed = null;
    const pairMatch = q.match(/(-?\d{1,2}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/);
    if (pairMatch) {
      latParsed = parseFloat(pairMatch[1]);
      lonParsed = parseFloat(pairMatch[2]);
    } else {
      const latMatch = q.match(/\b(lat|latitude)[:\s]+(-?\d{1,2}(?:\.\d+)?)/);
      const lonMatch = q.match(/\b(lon|long|longitude)[:\s]+(-?\d{1,3}(?:\.\d+)?)/);
      if (latMatch) latParsed = parseFloat(latMatch[2]);
      if (lonMatch) lonParsed = parseFloat(lonMatch[2]);
    }

    if (latParsed !== null || lonParsed !== null) {
      // If only one coordinate provided, short-circuit with a helpful reply
      if (latParsed === null || lonParsed === null || Number.isNaN(latParsed) || Number.isNaN(lonParsed)) {
        return res.json({ reply: 'Please provide both latitude and longitude (e.g., 18.5204, 73.8567) to look up HMPI from the database.' });
      }

      // Coordinates present: try to fetch latest HMPI/category from DB
      const site = await getLatestHMPIByLocation(latParsed, lonParsed);
      if (site) {
        const msg = `At (${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)}) on ${new Date(site.timestamp).toISOString().slice(0,10)}, HMPI is ${Number(site.hmpi).toFixed(2)} (${site.category}). Safe < 50, Moderate 50–100, Hazardous > 100.`;
        return res.json({ reply: msg });
      } else {
        return res.json({ reply: `No data available for (${latParsed.toFixed(4)}, ${lonParsed.toFixed(4)}) in the database.` });
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
