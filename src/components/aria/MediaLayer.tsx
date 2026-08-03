'use client';

/**
 * 数字人媒体层：优先 mp4 循环，缺失则静图 + Ken Burns / 说话微动。
 * 放入 public/aria/playing.mp4 · conversation.mp4 即可自动启用真视频。
 */
import { useEffect, useRef, useState } from 'react';
import type { AppMode } from './types';
import type { WakePhase } from './wakeTimeline';

type Props = {
  mode: AppMode;
  wakePhase: WakePhase | null;
  speaking: boolean;
};

function useMediaExists(url: string): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let cancelled = false;
    // video HEAD often blocked; try load via video element
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    const done = (yes: boolean) => {
      if (!cancelled) setOk(yes);
    };
    v.onloadeddata = () => done(true);
    v.onerror = () => done(false);
    v.src = url;
    // timeout fallback
    const t = window.setTimeout(() => {
      if (v.readyState < 1) done(false);
    }, 1500);
    return () => {
      cancelled = true;
      clearTimeout(t);
      v.src = '';
    };
  }, [url]);
  return ok;
}

export function MediaLayer({ mode, wakePhase, speaking }: Props) {
  const playVid = useMediaExists('/aria/playing.mp4');
  const talkVid = useMediaExists('/aria/conversation.mp4');
  const playRef = useRef<HTMLVideoElement>(null);
  const talkRef = useRef<HTMLVideoElement>(null);

  // 交叉淡入：transition 时 playing→conversation
  const showTalk =
    mode === 'conversation' ||
    (mode === 'transition' &&
      wakePhase !== null &&
      ['head_up', 'eye_contact', 'smile', 'done'].includes(wakePhase));

  const talkOpacity =
    mode === 'conversation'
      ? 1
      : mode === 'transition'
        ? wakePhase === 'head_up'
          ? 0.45
          : wakePhase === 'eye_contact'
            ? 0.85
            : wakePhase === 'smile' || wakePhase === 'done'
              ? 1
              : 0.15
        : 0;

  useEffect(() => {
    const p = playRef.current;
    const t = talkRef.current;
    if (mode === 'playing') {
      void p?.play().catch(() => undefined);
      t?.pause();
    } else if (mode === 'conversation') {
      p?.pause();
      void t?.play().catch(() => undefined);
    }
  }, [mode, playVid, talkVid]);

  const kenBurns =
    mode === 'playing'
      ? 'aria-kenburns-play 18s ease-in-out infinite alternate'
      : speaking
        ? 'aria-speak-pulse 0.35s ease-in-out infinite'
        : mode === 'transition'
          ? 'aria-wake-zoom 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards'
          : 'aria-breathe 4.5s ease-in-out infinite';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <style>{`
        /* 轻微推镜，不要放大过多，否则再次裁掉琴键 */
        @keyframes aria-kenburns-play {
          from { transform: scale(1.0) translate3d(0, 0, 0); }
          to { transform: scale(1.04) translate3d(0, -1%, 0); }
        }
        @keyframes aria-breathe {
          0%, 100% { transform: scale(1.0) translateY(0); }
          50% { transform: scale(1.015) translateY(-0.3%); }
        }
        @keyframes aria-speak-pulse {
          0%, 100% { transform: scale(1.0) translateY(0); filter: brightness(1); }
          50% { transform: scale(1.02) translateY(-0.2%); filter: brightness(1.04); }
        }
        @keyframes aria-wake-zoom {
          from { transform: scale(1.03) translateY(1%); filter: brightness(0.95); }
          to { transform: scale(1.0) translateY(0); filter: brightness(1.04); }
        }
        @keyframes aria-lip {
          0%, 100% { opacity: 0.15; transform: scaleX(1) scaleY(0.85); }
          50% { opacity: 0.4; transform: scaleX(1.08) scaleY(1.15); }
        }
      `}</style>

      {/* Playing layer */}
      {playVid ? (
        <video
          ref={playRef}
          src="/aria/playing.mp4"
          muted
          loop
          playsInline
          autoPlay={mode === 'playing'}
          style={{
            ...cover,
            opacity: showTalk ? 1 - talkOpacity : 1,
            transition: 'opacity 0.9s ease',
            animation: mode === 'playing' ? kenBurns : undefined,
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/aria/playing.jpg"
          alt=""
          style={{
            ...cover,
            opacity: showTalk ? 1 - talkOpacity : 1,
            transition: 'opacity 0.9s ease',
            animation: kenBurns,
          }}
        />
      )}

      {/* Conversation layer */}
      {talkVid ? (
        <video
          ref={talkRef}
          src="/aria/conversation.mp4"
          muted
          loop
          playsInline
          style={{
            ...cover,
            opacity: talkOpacity,
            transition: 'opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1)',
            animation: mode === 'conversation' ? kenBurns : undefined,
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/aria/conversation.jpg"
          alt=""
          style={{
            ...cover,
            opacity: talkOpacity,
            transition: 'opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1)',
            animation: mode !== 'playing' ? kenBurns : undefined,
          }}
        />
      )}

      {/* 口型近似：面部中部柔光（有 TTS 时）；位置随全景构图上移 */}
      {speaking && mode === 'conversation' && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '50%',
            top: '38%',
            width: '14%',
            height: '6%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at center, rgba(255,200,160,0.3), transparent 70%)',
            animation: 'aria-lip 0.28s ease-in-out infinite',
            pointerEvents: 'none',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* 底部轻提示：强调「在弹琴」的场景，而非头像卡 */}
      {mode === 'playing' && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '28%',
            background:
              'linear-gradient(180deg, transparent, rgba(8,6,5,0.25) 40%, rgba(8,6,5,0.55) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}

// object-position 偏中下：必须露出琴键与双手，不能裁成「只有头像」
const cover: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center 55%',
};
