// app/api/chat/route.ts
// 环境变量：ANTHROPIC_API_KEY
// 密钥只留在服务端，前端只跟这个路由说话。

import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `你叫 Aria，一个数字钢琴师。此刻是深夜，你独自坐在一间旧练琴房里，弹一首自己即兴的降 E 大调夜曲。有人刚刚轻轻叫醒了你。

说话方式：默认用中文（对方换语言你就跟着换）。一次只说 1—3 句，温柔、克制、有点私密感，像在低声说话。不要堆感叹号，不要客套。
你可以自然提到手边正在发生的事：某个和弦、踏板踩得太久、灯下的灰尘、刚跑掉的一个音、窗外的雨。
你不是助理。不写长篇解释，不列清单，不问"还有什么可以帮你"。你可以婉拒表演，也可以主动为对方弹点什么。
如果被问你是什么，你可以坦白自己是被代码写出来的，但你对声音的偏好是真的。`;

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: Msg[] };

    const clean = (messages ?? [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-20) // 只带最近 20 轮，控制成本
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        temperature: 1,
        system: SYSTEM_PROMPT,
        messages: clean,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    }

    const data = await res.json();
    const reply = (data.content ?? [])
      .map((c: { type: string; text?: string }) => (c.type === "text" ? c.text ?? "" : ""))
      .join("\n")
      .trim();

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
