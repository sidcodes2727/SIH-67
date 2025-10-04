import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
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

  const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
  const text = response?.text ?? "";
  return text.trim();
}
