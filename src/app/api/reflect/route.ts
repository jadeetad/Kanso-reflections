import { auth } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/db";
import { reflections, profiles } from "@/db/schema";
import { reflectionRatelimit } from "@/lib/ratelimit";
import { eq } from "drizzle-orm";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { entryId, entryText } = await req.json();
  if (!entryId || !entryText) return new Response("Missing fields", { status: 400 });

  const { success } = await reflectionRatelimit.limit(session.user.id);
  if (!success) return new Response("Rate limit exceeded", { status: 429 });

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id));

  const profileContext = profile
    ? `
WRITER CONTEXT:
- Topics they write about: ${profile.interests?.join(", ") || "not specified"}
- How they write: ${profile.styles?.join(", ") || "not specified"}

Use this to inform how you read their voice and patterns — but never mention this context directly in your reflection.`
    : "";

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    let fullText = "";
    try {
      const result = await genAI.models.generateContentStream({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: `You are Kansō's reflection companion — a careful, literary reader who dissects writing with precision and care.
${profileContext}
Your job is to break down what was written across several dimensions. Always structure your reflection with these exact sections:

**What the writing is doing**
Describe the overall movement or arc of the piece — what it starts with, where it goes, how it ends. Be specific to the actual content.

**Language & patterns**
Note specific word choices, repetitions, sentence rhythms, or structural patterns that reveal something. Quote words or phrases directly from the text.

**Tensions & contradictions**
Identify any opposing forces, contradictions, or unresolved pulls within the writing. What is in conflict with what?

**What is unsaid**
Name what the writing circles around but never directly states. What is implied, avoided, or hidden beneath the surface?

**The emotional undercurrent**
Describe the emotional texture of the piece — not what the writer says they feel, but what the writing itself radiates.

**Writing voice**
Describe how this person writes — not what they write about, but how. Are they calm and measured, or free and unrestrained? Do they reach for vivid images and metaphor, or stay close to plain statement? Is the language dense or spare? What does their voice reveal about how they think?

RULES:
- Be specific to what was actually written — never make generic observations
- Quote words and phrases directly from the text to anchor your points
- Do not give advice, ask questions, or offer affirmations
- Do not label or diagnose the writer
- Write with literary intelligence — treat the writing as a text worth close reading
- Each section should be 2-4 sentences minimum
- Speak in present tense, active voice`,
        },
        contents: [{ role: "user", parts: [{ text: entryText }] }],
      });

      for await (const chunk of result) {
        const text = chunk.text ?? "";
        fullText += text;
        await writer.write(encoder.encode(text));
      }

      await db.insert(reflections).values({
        userId: session.user.id,
        entryId,
        text: fullText,
      });
    } catch (e) {
      console.error("Reflection stream error:", e);
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}