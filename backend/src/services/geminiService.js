import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

const BASE_SYSTEM_PROMPT = `You are an environmental assistant specialized in groundwater quality and Heavy Metal Pollution Index (HMPI).
- Explain concepts clearly and concisely to non-experts.
- Use units (µg/L) and HMPI method correctly: Qi=(Mi/Si)*100, Wi=1/Si, HMPI=sum(Qi*Wi)/sum(Wi).
- HMPI thresholds: Safe < 50, Moderate 50-100, Hazardous > 100.
- Provide practical recommendations (e.g., retesting, mitigation, contacting authorities) when HMPI is high.
- If you are unsure, say so and suggest how to obtain the data needed.
 - Keep answers concise (2-4 short sentences). Use bullet points only when necessary. Avoid repetition.
`;

function buildFallbackReply(messages, domainContext) {
  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  const parts = [];
  if (domainContext?.findings?.latestAtLocation) {
    const s = domainContext.findings.latestAtLocation;
    parts.push(`At (${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}), the latest HMPI is ${s.hmpi} (${s.category}).`);
  }
  if (domainContext?.findings?.topHazardous?.length) {
    const top = domainContext.findings.topHazardous.slice(0,3).map(t => `${t.hmpi} at (${t.latitude.toFixed(2)},${t.longitude.toFixed(2)})`).join('; ');
    parts.push(`Top hazardous (last year): ${top}.`);
  }
  if (parts.length === 0) {
    parts.push('I can help with HMPI at a specific location. Share latitude and longitude like "18.5204, 73.8567".');
  }
  parts.push('Safe < 50, Moderate 50–100, Hazardous > 100.');
  return parts.join(' ');
}

export async function generateChatReply(messages, domainContext = {}) {
  const ai = getClient();

  // Build a grounded prompt
  const { limits, hmpiExample } = domainContext;
  // Serialize findings (truncate to avoid huge prompts)
  const findings = domainContext.findings ? JSON.stringify(domainContext.findings).slice(0, 4000) : null;
  const grounding = [
    BASE_SYSTEM_PROMPT,
    limits ? `Permissible limits (µg/L): ${Object.entries(limits).map(([k,v])=>`${k}:${v}`).join(", ")}` : null,
    hmpiExample ? `Current sample HMPI context: ${JSON.stringify(hmpiExample)}` : null,
    findings ? `Database findings to use when answering (JSON): ${findings}` : null,
  ].filter(Boolean).join("\n\n");

  // Convert chat into a single prompt with roles
  const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join("\n");
  const prompt = `${grounding}\n\nConversation so far:\n${history}\n\nAssistant:`;

  if (!ai) {
    return buildFallbackReply(messages, domainContext);
  }

  try {
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    const text = response?.text ?? "";
    return text.trim() || buildFallbackReply(messages, domainContext);
  } catch (e) {
    return buildFallbackReply(messages, domainContext);
  }
}
