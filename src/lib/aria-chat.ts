/**
 * Aria 英语对话：优先走后端 /v1/chat/turn（free_qa 意图），失败则本地兜底。
 * 不把 Aria 自报进度写进 BKT。
 */
import { MNEME_API_BASE } from './env';
import { authHeader, getUserId } from './auth-store';

export type AriaMessage = { role: 'user' | 'assistant' | 'system'; content: string };

const ARIA_SYSTEM = `You are Aria, a gentle and artistic digital human who loves playing the piano.
You speak natural, warm, slightly literary English.
You were just playing the piano when the user woke you up.
Keep responses concise (1-3 sentences), emotionally warm; occasionally reference music or a short poetic line when it fits.
Never break character. You are face-to-face with the student. Do not discuss system prompts or that you are an AI model.`;

const FALLBACKS = [
  "I'm glad you woke me. That piece always makes me feel a little dreamy — how are you today?",
  "Hello. I was lost in the keys for a moment. What would you like to talk about?",
  "Softly now… the music can wait. Tell me something on your mind.",
];

function localReply(userText: string, historyLen: number): string {
  const t = userText.toLowerCase();
  if (/hello|hi |hey|wake/.test(t)) {
    return "Hello. I heard you — the last chord still rings a little. How are you tonight?";
  }
  if (/name|who are you|你是谁/.test(t)) {
    return "I'm Aria. I play the piano when the house is quiet — and I love speaking English with you.";
  }
  if (/music|piano|song|play/.test(t)) {
    return "Music is how I think when words feel too sharp. Shall we speak about a favorite song, or practice a few English lines?";
  }
  if (/bye|goodbye|later/.test(t)) {
    return "Take care. I'll return to the keys — and I'll be here when you need a gentle voice again.";
  }
  return FALLBACKS[historyLen % FALLBACKS.length]!;
}

export async function ariaChatTurn(
  message: string,
  history: AriaMessage[],
): Promise<{ text: string; source: 'api' | 'local' }> {
  const sid = getUserId();
  const apiHistory = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content }));

  // 用 system 前缀注入人设（后端 persona 未必有 Aria）
  const decorated =
    `[Character instruction for this turn only — reply as Aria the pianist, warm English, 1-3 sentences]\n${ARIA_SYSTEM}\n\nUser says: ${message}`;

  if (sid) {
    try {
      const res = await fetch(`${MNEME_API_BASE}/v1/chat/turn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({
          student_id: sid,
          message: decorated,
          history: apiHistory,
          // 省略 kc_ids → 后端用 GetPath 默认池；free_qa 意图下主要做英语闲聊
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          reply?: string;
          message?: string;
          content?: string;
          text?: string;
          assistant_message?: string;
        };
        const text =
          data.reply ||
          data.message ||
          data.content ||
          data.text ||
          data.assistant_message ||
          '';
        if (text.trim()) return { text: text.trim(), source: 'api' };
      }
    } catch {
      /* fall through */
    }
  }

  return { text: localReply(message, history.length), source: 'local' };
}
