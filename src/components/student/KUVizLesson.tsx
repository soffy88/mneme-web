'use client';

import SpeakButton from '@/components/shared/SpeakButton';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '@/lib/api-client';
import type { VizLessonRes } from '@/types/api';

// AetherViz 知识点互动课：后端按 KU 生成/缓存单文件 HTML，这里只放进 sandbox iframe
// （仅 allow-scripts，无 allow-same-origin：拿不到本站 cookie/token、不能发请求）。
// 课内小测验通过 postMessage 报给本页，本页再交后端 /v1/viz/quiz-answer，
// 由后端经 SubmitAnswer 写学习档案（页面自己不判掌握度）。

const POLL_MS = 5000;
const MAX_POLLS = 48; // ~4 分钟

type Props = { kuId: string; name: string; weakPoints?: string[] };

export default function KUVizLesson({ kuId, name, weakPoints }: Props) {
  const [open, setOpen] = useState(false);
  const [lesson, setLesson] = useState<VizLessonRes | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const [err, setErr] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement | null>(null);
  const alive = useRef(true);

  useEffect(() => () => { alive.current = false; }, []);

  const load = useCallback(async () => {
    setStatus('loading');
    setErr(null);
    for (let i = 0; i < MAX_POLLS && alive.current; i++) {
      const r = await api.generateKUVisualization(kuId, weakPoints);
      if (!alive.current) return;
      if (!r.ok) { setStatus('failed'); setErr(r.error); return; }
      if (r.data.status === 'ready') { setLesson(r.data); setStatus('ready'); return; }
      if (r.data.status === 'failed') { setStatus('failed'); setErr('互动课生成失败，请稍后再试'); return; }
      await new Promise((ok) => setTimeout(ok, POLL_MS));
    }
    if (alive.current) { setStatus('failed'); setErr('生成时间较长，请稍后再点一次'); }
  }, [kuId, weakPoints]);

  useEffect(() => {
    if (!lesson) return;
    const onMsg = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      const d = e.data as { source?: string; type?: string; quiz_id?: unknown; choice?: unknown } | null;
      if (!d || d.source !== 'mneme-viz' || d.type !== 'quiz-answer') return;
      const choice = Number(d.choice);
      if (!Number.isInteger(choice) || choice < 0 || choice > 5) return;
      void api.submitVizQuizAnswer({
        ku_id: lesson.ku_id, variant: lesson.variant, quiz_id: String(d.quiz_id ?? '').slice(0, 16), choice,
      });
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [lesson]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && status === 'idle') void load();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button type="button" className="mn-btn-secondary" onClick={toggle} style={{ alignSelf: 'flex-start', fontSize: 13 }}>
        {open ? '收起互动课' : `看「${name}」互动课`}
      </button>
      {open && status === 'loading' && (
        <span style={{ fontSize: 13, color: 'var(--mn-ink-3)' }}>正在准备互动课（首次生成约需半分钟到两分钟）…</span>
      )}
      {open && status === 'failed' && (
        <span style={{ fontSize: 13, color: 'var(--mn-red, #dc2626)' }}>
          {err}{' '}
          <button type="button" onClick={() => void load()} style={{ textDecoration: 'underline', background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}>重试</button>
        </span>
      )}
      {open && status === 'ready' && lesson?.html && (
        <SpeakButton label="朗读这节课" text={lessonText(lesson.html)} />
      )}
      {open && status === 'ready' && lesson?.html && (
        <iframe
          ref={frame}
          title={`${name} 互动课`}
          sandbox="allow-scripts"
          srcDoc={lesson.html}
          referrerPolicy="no-referrer"
          style={{ width: '100%', height: 640, border: '1px solid var(--mn-line, #e2e8f0)', borderRadius: 12, background: '#0f172a' }}
        />
      )}
    </div>
  );
}

/** 从互动课 HTML 提取可朗读的正文（去脚本/样式/测验选项），截断到 TTS 上限。 */
function lessonText(html: string): string {
  if (typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,svg,canvas,button,#mneme-quiz').forEach((n) => n.remove());
  const t = (doc.body?.textContent ?? '').replace(/\s+/g, ' ').trim();
  return t.slice(0, 580);
}
