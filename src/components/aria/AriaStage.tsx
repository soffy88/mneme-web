'use client';

/**
 * Aria 数字人主舞台 — 3D VRM 骨骼动画（默认且唯一渲染路径）。
 *
 * 架构：
 *   Director (LLM) → action/utterance/emotion
 *   AriaWorld (Three.js + VRM) → 骨骼动画（走/坐/弹/聊/想/闲）
 *   TTS (edge-tts) → 语音播放
 *   用户可打断；闲时 Director tick 让她自主行动
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ThinkingOrb, type OrbState } from './ThinkingOrb';
import {
  createEnglishRecognizer,
  getAudioTime,
  speakAudioBase64,
  speakEnglish,
  stopSpeaking,
} from './speech';
import {
  createPianoAmbience,
  trackMeta,
  TRACK_COUNT,
} from './pianoAmbience';
import { AriaWorld } from './scene3d/AriaWorld';
import { actionToPose, type AvatarPose } from './nimAdapter';
import {
  fetchAriaRuntime,
  requestAriaAct,
  type AriaAction,
  type AriaRuntimeConfig,
  type DirectorCommand,
} from '@/lib/aria-director';
import { requestAriaTts, type VisemeCue } from '@/lib/aria-media';
import { AriaBrainWs, type BrainCommand } from '@/lib/aria-brain-ws';
import type { AriaMessage } from '@/lib/aria-chat';
import { getUserId, authHeader } from '@/lib/auth-store';
import { MNEME_API_BASE } from '@/lib/env';

type Props = { onOpenStudy?: () => void };

export function AriaStage({ onOpenStudy }: Props) {
  const [pose, setPose] = useState<AvatarPose>('play_piano');
  const [emotion, setEmotion] = useState('focused');
  const [mode, setMode] = useState<'playing' | 'conversation'>('playing');
  const [messages, setMessages] = useState<AriaMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [orb, setOrb] = useState<OrbState | null>(null);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('Aria is settling at the piano…');
  const [progress, setProgress] = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [lastAction, setLastAction] = useState<AriaAction>('play_piano');
  const [runtime, setRuntime] = useState<AriaRuntimeConfig | null>(null);
  const [autonomous, setAutonomous] = useState(true);

  const listRef = useRef<HTMLDivElement>(null);
  const ambienceRef = useRef<ReturnType<typeof createPianoAmbience> | null>(null);
  const audioUnlocked = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const acting = useRef(false);
  const visemesRef = useRef<VisemeCue[]>([]);
  const activeNotesRef = useRef<Map<number, number>>(new Map()); // midi → velocity
  const brainRef = useRef<AriaBrainWs | null>(null);
  const [brainConnected, setBrainConnected] = useState(false);

  const track = trackMeta(trackIdx);

  // 钢琴环境音 + MIDI note → finger driving
  useEffect(() => {
    const amb = createPianoAmbience();
    ambienceRef.current = amb;
    amb.onNote((ev) => {
      // Store active note; auto-expire after beat duration
      activeNotesRef.current.set(ev.midi, 90);
      const beatMs = (60 / ev.bpm) * 1000;
      setTimeout(() => activeNotesRef.current.delete(ev.midi), beatMs * 1.4);
    });
    void fetchAriaRuntime().then(setRuntime);
    return () => {
      amb.dispose();
      if (holdTimer.current) clearTimeout(holdTimer.current);
      stopSpeaking();
    };
  }, []);

  // 弹琴进度条
  useEffect(() => {
    if (pose !== 'play_piano') return;
    const t = setInterval(() => {
      setProgress(ambienceRef.current?.getProgress() ?? 0);
    }, 200);
    return () => clearInterval(t);
  }, [pose, trackIdx]);

  // P1: 上传场景感知
  useEffect(() => {
    const sid = getUserId();
    if (!sid) return;
    const hour = new Date().getHours();
    const timeOfDay = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const desc = `Grand piano in a warm music room. Bookshelf with sheet music nearby. ${timeOfDay} light through the window.`;
    void fetch(`${MNEME_API_BASE}/v1/aria/perception`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ student_id: sid, room_key: 'music_room', text_description: desc }),
    }).catch(() => undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, orb]);

  const unlockAudio = useCallback(() => {
    if (!audioUnlocked.current) {
      audioUnlocked.current = true;
      if (pose === 'play_piano') ambienceRef.current?.start();
    }
  }, [pose]);

  const applyPianoAudio = useCallback((next: AvatarPose) => {
    if (next === 'play_piano' && audioUnlocked.current) {
      ambienceRef.current?.start();
    } else {
      ambienceRef.current?.stop(next === 'speak' ? 900 : 500);
    }
  }, []);

  const speakAria = useCallback(async (text: string, emo?: string) => {
    setSpeaking(true);
    const end = () => { setSpeaking(false); visemesRef.current = []; };

    try {
      const tts = await requestAriaTts(text);
      if (tts.ok && tts.audioB64) {
        visemesRef.current = tts.visemes ?? [];
        speakAudioBase64(tts.audioB64, tts.mime || 'audio/mpeg', end);
        return;
      }
    } catch { /* fallthrough */ }
    visemesRef.current = [];
    speakEnglish(text, end);
  }, []);

  const executeCommand = useCallback(
    (cmd: DirectorCommand, opts?: { fromUser?: boolean }) => {
      const nextPose = actionToPose(cmd.action);
      setLastAction(cmd.action);
      setEmotion(cmd.emotion || 'gentle');
      setPose(nextPose);
      applyPianoAudio(nextPose);

      const act = cmd.action as AriaAction;
      if (act === 'play_piano' || act === 'return_to_piano') {
        setMode('playing');
      } else if (
        act === 'speak' || act === 'look_at_user' || act === 'think' ||
        (opts?.fromUser && act !== 'idle')
      ) {
        setMode('conversation');
      }

      if (cmd.utterance) {
        setMessages((m) => [...m, { role: 'assistant', content: cmd.utterance! }]);
        void speakAria(cmd.utterance, cmd.emotion);
      }

      const label =
        cmd.action === 'play_piano' ? 'She sits and plays on her own…'
        : cmd.action === 'look_at_user' ? 'She looks at you.'
        : cmd.action === 'speak' ? 'She is speaking with you.'
        : cmd.action === 'think' ? 'She is thinking…'
        : cmd.action === 'return_to_piano' ? 'She returns to the keys…'
        : 'Waiting softly…';
      setStatus(`Director · ${label}${cmd.source ? ` (${cmd.source})` : ''}`);

      if (cmd.action === 'think') setOrb('composing');
      else setOrb(null);

      return cmd.hold_ms || 3000;
    },
    [applyPianoAudio, speakAria],
  );

  // Phase 3: Aria Brain WebSocket（自主行为大脑）
  useEffect(() => {
    if (!getUserId()) return;
    const brain = new AriaBrainWs({
      onCommand: (cmd: BrainCommand) => {
        executeCommand({
          action: (cmd.action || 'idle') as AriaAction,
          utterance: cmd.utterance ?? null,
          emotion: cmd.emotion || 'gentle',
          hold_ms: cmd.hold_ms ?? 3000,
          reason: '',
          source: cmd.source || 'brain',
        });
      },
      onStatus: (s) => setBrainConnected(s === 'connected'),
    });
    brainRef.current = brain;
    brain.connect();
    brain.userEntered();
    return () => {
      brain.dispose();
      brainRef.current = null;
    };
  }, [executeCommand]);

  const runDirector = useCallback(
    async (event: 'tick' | 'wake' | 'user_message', message?: string) => {
      // When brain WS is connected, it handles autonomous ticks
      if (brainConnected && event === 'tick') return;

      if (acting.current && event === 'tick') return;
      acting.current = true;
      if (event !== 'tick') {
        setBusy(true);
        setOrb(event === 'user_message' ? 'composing' : 'listening');
      }

      // Notify brain WS of user messages (for its internal state)
      if (event === 'user_message' && message?.trim()) {
        brainRef.current?.userSpoke(message.trim());
      }

      try {
        const hist = messages.map((m) => ({ role: m.role, content: m.content }));
        const cmd = await requestAriaAct({
          event,
          message,
          history: hist,
          state: { mode, last_action: lastAction, emotion },
        });
        if (event === 'user_message' && message?.trim()) {
          setMessages((m) => [...m, { role: 'user', content: message.trim() }]);
        }
        const hold = executeCommand(cmd, { fromUser: event !== 'tick' });
        setBusy(false);
        setOrb(null);

        if (holdTimer.current) clearTimeout(holdTimer.current);
        holdTimer.current = setTimeout(() => {
          acting.current = false;
          // Only poll HTTP if brain WS is not handling autonomy
          if (autonomous && !busy && !brainRef.current?.connected) void runDirector('tick');
        }, hold);
      } catch {
        acting.current = false;
        setBusy(false);
        setOrb(null);
        setStatus('Director paused — try again.');
      }
    },
    [messages, mode, lastAction, emotion, executeCommand, autonomous, busy, brainConnected],
  );

  // 首屏：自主坐下弹琴
  useEffect(() => {
    const t = setTimeout(() => void runDirector('tick'), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wake = useCallback(() => {
    unlockAudio();
    stopSpeaking();
    setSpeaking(false);
    void runDirector('wake');
  }, [unlockAudio, runDirector]);

  const resumePiano = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
    setInput('');
    void runDirector('tick');
    setPose('play_piano');
    setMode('playing');
    applyPianoAudio('play_piano');
    setLastAction('play_piano');
    setStatus('She returns to the piano…');
  }, [runDirector, applyPianoAudio]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      unlockAudio();
      setInput('');
      await runDirector('user_message', trimmed);
    },
    [busy, runDirector, unlockAudio],
  );

  const startListen = useCallback(() => {
    unlockAudio();
    const rec = createEnglishRecognizer();
    if (!rec) { setStatus('Voice not available in this browser.'); return; }
    setListening(true);
    setOrb('listening');
    rec.onresult = (ev) => {
      const t = ev.results[0]?.[0]?.transcript ?? '';
      setListening(false);
      setOrb(null);
      if (!t) return;
      if (mode === 'playing' || pose === 'play_piano') {
        if (/hey aria|hello|wake|hi /i.test(t) || t.length > 1) {
          void runDirector('wake');
          const rest = t.replace(/hey aria|hello|wake up|hi aria/gi, '').trim();
          if (rest.length > 2) window.setTimeout(() => void runDirector('user_message', rest), 400);
        } else {
          void runDirector('user_message', t);
        }
      } else {
        void send(t);
      }
    };
    rec.onerror = () => { setListening(false); setOrb(null); };
    rec.onend = () => { setListening(false); setOrb(null); };
    try { rec.start(); } catch { setListening(false); setOrb(null); }
  }, [unlockAudio, mode, pose, runDirector, send]);

  const nextTrack = () => {
    const n = (trackIdx + 1) % TRACK_COUNT;
    setTrackIdx(n);
    ambienceRef.current?.setTrack(n);
    unlockAudio();
  };

  const loggedIn = typeof window !== 'undefined' && !!getUserId();
  const showChat = mode === 'conversation' || messages.length > 0;

  return (
    <div
      style={{
        margin: '-20px -16px 0',
        position: 'relative',
        minHeight: 'min(82vh, 720px)',
        aspectRatio: '3 / 4',
        maxHeight: '85vh',
        background: '#1a1410',
        color: '#f5f0e8',
        overflow: 'hidden',
      }}
      onPointerDown={unlockAudio}
    >
      {/* 3D VRM 数字人：骨骼动画（走/坐/弹/聊/想/闲）+ viseme 口型 + MIDI 手指 */}
      <AriaWorld
        pose={pose}
        speaking={speaking}
        emotion={emotion}
        visemesRef={visemesRef}
        getAudioTime={getAudioTime}
        activeNotesRef={activeNotesRef}
      />

      {/* 底部渐变遮罩 */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '32%',
        background: 'linear-gradient(180deg, transparent, rgba(8,6,5,0.5) 35%, rgba(8,6,5,0.94) 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* 右上控制 */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        display: 'flex', flexWrap: 'wrap', gap: 8, zIndex: 5,
        justifyContent: 'flex-end', maxWidth: '70%',
      }}>
        <button type="button" onClick={() => setAutonomous((v) => !v)}
          style={{ ...chipBtn, borderColor: autonomous ? 'rgba(245,200,120,0.5)' : 'rgba(255,255,255,0.18)' }}
          title="AI 自主行动（Director tick）">
          {autonomous ? '● 自主中' : '○ 已暂停自主'}
        </button>
        {pose !== 'play_piano' && (
          <button type="button" onClick={resumePiano} style={chipBtn}>♪ 让她弹琴</button>
        )}
        {onOpenStudy && (
          <button type="button" onClick={onOpenStudy} style={chipBtn}>学习中心</button>
        )}
      </div>

      {/* 曲目信息 */}
      {pose === 'play_piano' && (
        <div style={{ position: 'absolute', left: 16, bottom: 108, zIndex: 5, maxWidth: '70%' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', color: 'rgba(245,200,120,0.75)', marginBottom: 4 }}>
            SHE CHOSE TO PLAY · LIVE
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{track.title}</div>
          <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.55)', marginBottom: 8 }}>{track.subtitle}</div>
          <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #c9a66b, #f0d9a8)' }} />
          </div>
          <button type="button" onClick={nextTrack}
            style={{ marginTop: 8, fontSize: 11, color: 'rgba(245,240,232,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            换一首 ›
          </button>
        </div>
      )}

      {/* 对话流 */}
      {showChat && (
        <div ref={listRef} style={{
          position: 'absolute', left: 12, right: 12, bottom: 108,
          maxHeight: '34%', overflowY: 'auto', zIndex: 5,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%', padding: '10px 14px',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? 'rgba(45,90,158,0.85)' : 'rgba(30,24,18,0.82)',
              border: '1px solid rgba(255,255,255,0.08)', fontSize: 14, lineHeight: 1.5,
            }}>
              {m.content}
            </div>
          ))}
          {orb && (
            <div style={{
              alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 12, background: 'rgba(20,16,12,0.75)',
              fontSize: 12, color: 'rgba(245,240,232,0.7)',
            }}>
              <ThinkingOrb state={orb} size={28} />
              <span>Director thinking…</span>
            </div>
          )}
        </div>
      )}

      {/* 底部交互 */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6,
        padding: '12px 16px 16px',
        background: 'linear-gradient(180deg, transparent, rgba(8,6,5,0.92) 40%)',
      }}>
        <div style={{ fontSize: 11, color: 'rgba(245,200,120,0.65)', marginBottom: 8, textAlign: 'center' }}>
          {status}
        </div>

        {pose === 'play_piano' && messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)' }}>
              3D 数字人 · 骨骼动画 · 可走可坐可弹可聊
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 400 }}>
              <button type="button" onClick={wake} style={{
                flex: 1, padding: '14px 18px', borderRadius: 99,
                border: '1px solid rgba(245,200,120,0.45)',
                background: 'linear-gradient(180deg, #3a2a18, #1a120c)',
                color: '#f5e6c8', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>
                Talk to her
              </button>
              <button type="button" onClick={startListen} style={{
                width: 52, borderRadius: 99,
                border: '1px solid rgba(255,255,255,0.15)',
                background: listening ? 'rgba(45,90,158,0.6)' : 'rgba(255,255,255,0.08)',
                color: '#fff', fontSize: 20, cursor: 'pointer',
              }}>
                🎙
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <button type="button" onClick={startListen} disabled={busy} style={{
              width: 48, height: 48, borderRadius: 99,
              border: '1px solid rgba(255,255,255,0.15)',
              background: listening ? 'rgba(45,90,158,0.7)' : 'rgba(255,255,255,0.08)',
              color: '#fff', fontSize: 18, cursor: busy ? 'default' : 'pointer', flexShrink: 0,
            }}>
              🎙
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) void send(input); }}
              placeholder={loggedIn ? 'Speak English — she decides how to respond…' : 'Type English… (login for full Director LLM)'}
              disabled={busy}
              style={{
                flex: 1, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(20,16,12,0.85)', color: '#f5f0e8',
                padding: '12px 14px', fontSize: 14, outline: 'none',
              }}
            />
            <button type="button" onClick={() => void send(input)} disabled={busy || !input.trim()} style={{
              padding: '12px 16px', borderRadius: 16, border: 'none',
              background: busy || !input.trim() ? 'rgba(255,255,255,0.1)' : '#c9a66b',
              color: busy || !input.trim() ? 'rgba(255,255,255,0.4)' : '#1a120c',
              fontWeight: 700, fontSize: 14, cursor: busy || !input.trim() ? 'default' : 'pointer',
            }}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const chipBtn: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 99,
  border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(12,10,9,0.55)',
  color: 'rgba(245,240,232,0.9)', cursor: 'pointer', backdropFilter: 'blur(8px)',
};
