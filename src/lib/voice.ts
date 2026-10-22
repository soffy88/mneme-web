/**
 * 朗读 + 语音会话客户端（自建，参考 Open-LLM-VTuber 的管线思路，未复用其代码）。
 * - speakText：POST /v1/tts（服务端 LaTeX→口语中文、自托管 TTS、按文本哈希缓存）→ 播放
 * - VoiceClient：WS /v1/voice。麦克风 → 16kHz PCM16 上行；服务端 VAD+ASR → tutor_loop → 逐句 TTS 下行；
 *   播放期间本地能量检测到学生开口 → 停播 + interrupt（打断）。播放音量包络供头像口型。
 */
import { MNEME_API_BASE } from './env';
import { getToken } from './auth-store';

// ── 朗读 ──────────────────────────────────────────────
let current: HTMLAudioElement | null = null;
let currentUrl: string | null = null;

export function stopSpeaking(): void {
  if (current) { current.pause(); current = null; }
  if (currentUrl) { URL.revokeObjectURL(currentUrl); currentUrl = null; }
}

export async function speakText(text: string, onEnd?: () => void): Promise<void> {
  stopSpeaking();
  const res = await fetch(`${MNEME_API_BASE}/v1/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    body: JSON.stringify({ text: text.slice(0, 600) }),
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('朗读暂不可用');
  const url = URL.createObjectURL(await res.blob());
  const a = new Audio(url);
  current = a; currentUrl = url;
  a.onended = () => { if (current === a) stopSpeaking(); onEnd?.(); };
  await a.play();
}

// ── 语音会话 ──────────────────────────────────────────
export type VoiceMode = 'tutor' | 'companion';
export type VoiceEvent = { type: string; [k: string]: unknown };

const TARGET_SR = 16000;
const BARGE_RMS = 0.05; // 播放期间需要更大的声音才算学生开口（避免把扬声器回声当打断）

function downsample(buf: Float32Array, inRate: number): Int16Array {
  const ratio = inRate / TARGET_SR;
  const n = Math.floor(buf.length / ratio);
  const out = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, buf[Math.floor(i * ratio)]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function b64ToBuf(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u.buffer;
}

export class VoiceClient {
  private ws: WebSocket | null = null;
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private proc: ScriptProcessorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private queue: ArrayBuffer[] = [];
  private playing: AudioBufferSourceNode | null = null;
  private micOn = false;
  onEvent: (e: VoiceEvent) => void = () => {};
  onClose: (code: number) => void = () => {};

  constructor(private mode: VoiceMode) {}

  get speaking(): boolean { return !!this.playing; }

  level(): number {
    if (!this.analyser || !this.playing) return 0;
    const d = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(d);
    let sum = 0;
    for (const v of d) { const x = (v - 128) / 128; sum += x * x; }
    return Math.min(1, Math.sqrt(sum / d.length) * 4);
  }

  async connect(): Promise<void> {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.connect(this.ctx.destination);
    const url = MNEME_API_BASE.replace(/^http/, 'ws') + '/v1/voice';
    const ws = new WebSocket(url);
    this.ws = ws;
    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => { ws.send(JSON.stringify({ type: 'auth', token: getToken() ?? '', mode: this.mode })); resolve(); };
      ws.onerror = () => reject(new Error('连接失败'));
    });
    ws.onmessage = (m) => {
      let ev: VoiceEvent;
      try { ev = JSON.parse(String(m.data)); } catch { return; }
      if (ev.type === 'audio' && typeof ev.data === 'string') { this.queue.push(b64ToBuf(ev.data)); void this.pump(); }
      if (ev.type === 'interrupted') this.stopPlayback();
      this.onEvent(ev);
    };
    ws.onclose = (e) => { this.teardownMic(); this.onClose(e.code); };
  }

  private async pump(): Promise<void> {
    if (this.playing || !this.ctx || !this.analyser) return;
    const next = this.queue.shift();
    if (!next) return;
    try {
      const buf = await this.ctx.decodeAudioData(next);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.analyser);
      this.playing = src;
      src.onended = () => { if (this.playing === src) this.playing = null; void this.pump(); };
      src.start();
    } catch { this.playing = null; void this.pump(); }
  }

  stopPlayback(): void {
    this.queue = [];
    if (this.playing) { try { this.playing.stop(); } catch { /* */ } this.playing = null; }
  }

  interrupt(): void {
    this.stopPlayback();
    this.ws?.send(JSON.stringify({ type: 'interrupt' }));
  }

  async startMic(): Promise<void> {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
    });
    const src = this.ctx.createMediaStreamSource(this.stream);
    const proc = this.ctx.createScriptProcessor(4096, 1, 1);
    const rate = this.ctx.sampleRate;
    proc.onaudioprocess = (e) => {
      if (!this.micOn || this.ws?.readyState !== WebSocket.OPEN) return;
      const input = e.inputBuffer.getChannelData(0);
      if (this.playing) {
        let s = 0;
        for (let i = 0; i < input.length; i++) s += input[i] * input[i];
        if (Math.sqrt(s / input.length) < BARGE_RMS) return; // 播放中的小声多半是回声，不上行
        this.interrupt(); // 学生开口 → 打断
      }
      this.ws.send(downsample(input, rate).buffer);
    };
    src.connect(proc);
    proc.connect(this.ctx.destination);
    this.proc = proc;
    this.micOn = true;
  }

  stopMic(): void {
    this.micOn = false;
    this.ws?.send(JSON.stringify({ type: 'audio_end' }));
    this.teardownMic();
  }

  private teardownMic(): void {
    this.micOn = false;
    this.proc?.disconnect(); this.proc = null;
    this.stream?.getTracks().forEach((t) => t.stop()); this.stream = null;
  }

  async unlockAudio(): Promise<void> { if (this.ctx?.state === 'suspended') await this.ctx.resume(); }

  sendText(text: string): void { this.ws?.send(JSON.stringify({ type: 'text', text })); }
  startPractice(): void { this.ws?.send(JSON.stringify({ type: 'start_practice' })); }

  close(): void {
    this.stopPlayback();
    this.teardownMic();
    this.ws?.close();
    this.ws = null;
    void this.ctx?.close();
    this.ctx = null;
  }
}
