/**
 * Fay WebSocket client — connects to Fay's HumanServer (port 10002).
 * Receives audio + viseme + action signals from the Fay brain.
 *
 * Fay protocol:
 *   Send: {"Username": "user1"} to identify
 *   Receive: {"Topic": "human", "Data": {"Key": "audio"|"question"|"log", ...}, "robot": "..."}
 */

export type FayAudioMsg = {
  audioUrl: string; // HTTP URL to audio file
  text: string;
  duration: number; // seconds
  lips?: FayViseme[]; // lip sync data
  action?: FayAction | null;
  isFirst?: boolean;
  isEnd?: boolean;
};

export type FayViseme = {
  // Fay's OVR lipsync format: [viseme_name, weight, time_offset]
  [key: string]: number;
};

export type FayAction = {
  code: string;
  behavior: string;
  affect: string;
  intensity: number;
};

export type FayStateMsg = {
  robot: string; // URL to state image (Speaking.jpg, Thinking.jpg, Normal.gif)
  log?: string;
};

type FayCallbacks = {
  onAudio: (msg: FayAudioMsg) => void;
  onState?: (msg: FayStateMsg) => void;
  onQuestion?: (text: string) => void;
  onStatus?: (status: 'connected' | 'disconnected' | 'error') => void;
};

export class FayClient {
  private ws: WebSocket | null = null;
  private cbs: FayCallbacks;
  private url: string;
  private username: string;
  private disposed = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(callbacks: FayCallbacks, opts?: { host?: string; username?: string }) {
    this.cbs = callbacks;
    this.username = opts?.username || 'aria_viewer';

    if (opts?.host) {
      this.url = `ws://${opts.host}`;
    } else if (typeof window !== 'undefined') {
      const loc = window.location;
      // Public domain → same-origin /fay-ws (Caddy proxies to Fay 10002)
      if (loc.hostname.includes('sxueji.com') || loc.hostname.includes('xueji')) {
        const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
        this.url = `${proto}//${loc.host}/fay-ws`;
      } else {
        // Local dev → direct to Fay container port
        this.url = `ws://${loc.hostname}:10002`;
      }
    } else {
      this.url = 'ws://localhost:10002';
    }
  }

  connect(): void {
    if (this.disposed) return;
    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      // Identify to Fay
      this.ws?.send(JSON.stringify({ Username: this.username }));
      this.cbs.onStatus?.('connected');
    };

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string);
        this.handleMessage(msg);
      } catch { /* ignore malformed */ }
    };

    this.ws.onclose = () => {
      this.cbs.onStatus?.('disconnected');
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.cbs.onStatus?.('error');
    };
  }

  /** Send a text message to Fay (user speaks). */
  sendText(text: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        Topic: 'human',
        Data: { Key: 'question', Value: text },
        Username: this.username,
      }));
    }
  }

  dispose(): void {
    this.disposed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private handleMessage(msg: Record<string, unknown>): void {
    if (msg.Topic !== 'human') return;
    const data = msg.Data as Record<string, unknown> | undefined;
    if (!data) return;

    const key = data.Key as string;

    if (key === 'audio') {
      this.cbs.onAudio({
        audioUrl: (data.HttpValue as string) || (data.Value as string) || '',
        text: (data.Text as string) || '',
        duration: (data.Time as number) || 0,
        lips: data.Lips as FayViseme[] | undefined,
        action: data.Action as FayAction | null | undefined,
        isFirst: data.IsFirst === 1,
        isEnd: data.IsEnd === 1,
      });
    } else if (key === 'question') {
      this.cbs.onQuestion?.((data.Value as string) || '');
    } else if (key === 'log') {
      this.cbs.onState?.({
        robot: (msg.robot as string) || '',
        log: (data.Value as string) || '',
      });
    }

    // State image update
    if (msg.robot) {
      this.cbs.onState?.({
        robot: msg.robot as string,
        log: (data.Value as string) || '',
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.disposed) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), 4000);
  }
}
