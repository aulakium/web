import "server-only";

// Traducción vía Gemini (Google AI Studio, free tier sin tarjeta).
// Modelo configurable con GEMINI_MODEL; por defecto un Flash (barato/gratis).
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const LANG_LABEL: Record<string, string> = {
  "pt-BR": "portugués de Brasil",
  pt: "portugués",
  en: "inglés",
  ko: "coreano",
  "zh-CN": "chino simplificado",
  ja: "japonés",
};

export interface Translated {
  title: string;
  body: string;
}

/** Traduce título + cuerpo de un aviso al idioma destino. Devuelve null si falla. */
export async function geminiTranslate(
  title: string,
  body: string,
  targetLang: string,
): Promise<Translated | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("[translate] falta GEMINI_API_KEY");
    return null;
  }
  const lang = LANG_LABEL[targetLang] ?? targetLang;
  const prompt =
    `Traducí este aviso escolar del español al ${lang}. ` +
    `Mantené un tono institucional, claro y natural; no agregues ni quites información. ` +
    `Devolvé EXCLUSIVAMENTE un JSON con las claves "title" y "body".\n\n` +
    `Título: ${title || "(sin título)"}\n` +
    `Cuerpo: ${body}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: { title: { type: "STRING" }, body: { type: "STRING" } },
              required: ["title", "body"],
            },
          },
        }),
      },
    );
    if (!res.ok) {
      console.error("[translate] Gemini", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const parsed = JSON.parse(text) as Translated;
    if (typeof parsed.title !== "string" || typeof parsed.body !== "string") return null;
    return parsed;
  } catch (e) {
    console.error("[translate] error:", e);
    return null;
  }
}
