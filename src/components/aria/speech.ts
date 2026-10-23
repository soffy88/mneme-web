/** 浏览器 Web Speech：ASR + TTS 兜底（优先服务端 edge-tts via aria-media）。 */

let activeAudio: HTMLAudioElement | null = null;

export function speakEnglish(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.92;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /en-US|en_US/.test(v.lang) && /female|samantha|zira|google|aria/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (preferred) u.voice = preferred;
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  } catch {
    onEnd?.();
  }
}

/** 服务端 mp3 base64；失败时调用方应再 speakEnglish */
export function speakAudioBase64(b64: string, mime = 'audio/mpeg', onEnd?: () => void): void {
  if (typeof window === 'undefined') {
    onEnd?.();
    return;
  }
  try {
    window.speechSynthesis?.cancel();
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
    const audio = new Audio(url);
    activeAudio = audio;
    const done = () => {
      URL.revokeObjectURL(url);
      if (activeAudio === audio) activeAudio = null;
      onEnd?.();
    };
    audio.onended = done;
    audio.onerror = done;
    void audio.play().catch(done);
  } catch {
    onEnd?.();
  }
}

/** Current playback time (seconds) of the active server-TTS audio, or -1 if none. */
export function getAudioTime(): number {
  return activeAudio && !activeAudio.paused ? activeAudio.currentTime : -1;
}

/** Check if active audio is currently playing. */
export function isSpeaking(): boolean {
  return activeAudio !== null && !activeAudio.paused;
}

/** Play audio from a URL; sets activeAudio so getAudioTime() tracks it. */
export function speakUrl(url: string, onEnd?: () => void): void {
  if (typeof window === 'undefined') { onEnd?.(); return; }
  try {
    window.speechSynthesis?.cancel();
    if (activeAudio) { activeAudio.pause(); activeAudio = null; }
    const audio = new Audio(url);
    activeAudio = audio;
    const done = () => { if (activeAudio === audio) activeAudio = null; onEnd?.(); };
    audio.onended = done;
    audio.onerror = done;
    void audio.play().catch(done);
  } catch { onEnd?.(); }
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
  if (activeAudio) {
    try {
      activeAudio.pause();
    } catch {
      /* ignore */
    }
    activeAudio = null;
  }
}

type Rec = {
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript: string } }; isFinal?: boolean; length: number }; length: number }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
};

export function createEnglishRecognizer(): Rec | null {
  if (typeof window === 'undefined') return null;
  const SR =
    (window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec })
      .SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => Rec }).webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.lang = 'en-US';
  rec.continuous = false;
  rec.interimResults = false;
  return rec;
}
