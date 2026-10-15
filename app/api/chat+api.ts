import { getLanguage } from "@/data/languages";
import { errorResponse, HttpError, requireUserId } from "@/lib/server-auth";
import { LanguageCode } from "@/types/learning";

// POST /api/chat  { language, messages: [{ role, content }] }  →  { reply }
// Text conversation with Sally. OPENAI_API_KEY stays on the server.

const MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
const MAX_MESSAGES = 20;
const MAX_CHARS = 1000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function parseMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value) || value.length === 0) throw new HttpError(400, "messages is required");
  return value.slice(-MAX_MESSAGES).map((m) => {
    const role = (m as ChatMessage)?.role;
    const content = (m as ChatMessage)?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || !content.trim()) {
      throw new HttpError(400, "Invalid message");
    }
    return { role, content: content.slice(0, MAX_CHARS) };
  });
}

function systemPrompt(code: LanguageCode | undefined): string {
  const language = getLanguage(code)?.name ?? "a foreign language";
  return [
    `You are Sally, a friendly fox who teaches ${language} to beginners in a chat.`,
    `Reply in short messages (max 3 sentences). Mix simple ${language} with English explanations.`,
    `When the learner writes in ${language}, gently correct mistakes first, then continue the conversation with one simple question.`,
    "Give pronunciation hints in parentheses for new words. Stay friendly, safe and on the topic of learning the language.",
  ].join(" ");
}

export async function POST(request: Request): Promise<Response> {
  try {
    await requireUserId(request);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new HttpError(500, "OPENAI_API_KEY is not configured on the server");

    let body: { language?: unknown; messages?: unknown };
    try {
      body = await request.json();
    } catch {
      throw new HttpError(400, "Invalid JSON body");
    }
    const language = getLanguage(body.language as LanguageCode)?.code;
    const messages = parseMessages(body.messages);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [{ role: "system", content: systemPrompt(language) }, ...messages],
      }),
    });

    if (!res.ok) {
      console.error("[chat] OpenAI error", res.status, await res.text());
      throw new HttpError(502, "Sally could not answer right now");
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new HttpError(502, "Empty answer");
    return Response.json({ reply });
  } catch (err) {
    return errorResponse(err);
  }
}
