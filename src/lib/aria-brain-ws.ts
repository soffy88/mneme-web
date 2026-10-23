/**
 * Aria Brain WebSocket client (Phase 3).
 *
 * Connects to /v1/aria/ws, authenticates, receives autonomous brain commands,
 * sends user events. Falls back gracefully if WS is unavailable.
 */
import { MNEME_API_BASE } from './env';
import { getToken } from './auth-store';

export type BrainCommand = {
  action: string;
  utterance?: string;
  emotion?: string;
  hold_ms?: number;
  source?: string;
};

type BrainWsCallbacks = {
  onCommand: (cmd: BrainCommand) => void;
  onStatus?: (status: 'connected' | 'disconnected' | 'error') => void;
};

export class AriaBrainWs {
  private ws: WebSocket | null = null;
  private cbs: BrainWsCallbacks;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;
  private url: string;

  constructor(callbacks: BrainWsCallbacks) {
    this.cbs = callbacks;
    // Convert http(s) to ws(s)
    const base = MNEME_API_BASE.replace(/^http/, 'ws');
    this.url = `${base}/v1/aria/ws`;
  }

  connect(): void {
    if (this.disposed) return;
    const token = getToken();
    if (!token) {
      this.cbs.onStatus?.('error');
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      // Authenticate
      this.ws?.send(JSON.stringify({ type: 'auth', token }));
    };

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string);
        if (msg.type === 'connected') {
          this.cbs.onStatus?.('connected');
        } else if (msg.error) {
          this.cbs.onStatus?.('error');
          this.ws?.close();
        } else if (msg.action) {
          this.cbs.onCommand(msg as BrainCommand);
        }
      } catch {
        /* ignore malformed */
      }
    };

    this.ws.onclose = () => {
      this.cbs.onStatus?.('disconnected');
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.cbs.onStatus?.('error');
    };
  }

  /** Send a user event to the brain. */
  sendEvent(kind: string, text = ''): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ kind, text }));
    }
  }

  /** Notify brain that user entered the room. */
  userEntered(): void {
    this.sendEvent('user_entered');
  }

  /** Notify brain that user spoke. */
  userSpoke(text: string): void {
    this.sendEvent('user_spoke', text);
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

  private scheduleReconnect(): void {
    if (this.disposed) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), 5000);
  }
}
