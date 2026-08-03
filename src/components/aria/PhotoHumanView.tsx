'use client';

/**
 * 写真级全景主视觉（产品默认）。
 * 人 + 三角钢琴 + 双手在键 — 禁止裁成大头像，禁止木偶 3D。
 */
import { useEffect, useState } from 'react';
import type { AvatarPose } from './nimAdapter';

type Props = {
  pose: AvatarPose;
  speaking: boolean;
  emotion?: string;
};

const POSE_CFG: Record<
  AvatarPose,
  { src: string; label: string; position: string }
> = {
  // v=4 换图强刷缓存
  play_piano: {
    src: '/aria/playing.jpg?v=4',
    label: 'At the piano',
    position: '58% 52%',
  },
  look_at_user: {
    src: '/aria/conversation.jpg?v=4',
    label: 'Looking at you',
    position: '42% 38%',
  },
  speak: {
    src: '/aria/conversation.jpg?v=4',
    label: 'Speaking',
    position: '42% 36%',
  },
  think: {
    src: '/aria/conversation.jpg?v=4',
    label: 'Thinking',
    position: '42% 38%',
  },
  idle: {
    src: '/aria/conversation.jpg?v=4',
    label: 'With you',
    position: '42% 40%',
  },
};

export function PhotoHumanView({ pose, speaking, emotion }: Props) {
  const cfg = POSE_CFG[pose] ?? POSE_CFG.play_piano;
  const [displaySrc, setDisplaySrc] = useState(cfg.src);
  const [fade, setFade] = useState(1);

  // 姿态切换时柔和交叉淡入
  useEffect(() => {
    if (cfg.src === displaySrc) return;
    setFade(0);
    const t = window.setTimeout(() => {
      setDisplaySrc(cfg.src);
      setFade(1);
    }, 220);
    return () => window.clearTimeout(t);
  }, [cfg.src, displaySrc]);

  const anim =
    pose === 'play_piano'
      ? 'aria-photo-play 18s ease-in-out infinite alternate'
      : speaking
        ? 'aria-photo-speak 0.36s ease-in-out infinite'
        : 'aria-photo-breathe 6s ease-in-out infinite';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0c0a09' }}>
      <style>{`
        @keyframes aria-photo-play {
          from { transform: scale(1.0) translate(0, 0); }
          to { transform: scale(1.045) translate(-0.4%, -0.8%); }
        }
        @keyframes aria-photo-breathe {
          0%, 100% { transform: scale(1.0); }
          50% { transform: scale(1.018); }
        }
        @keyframes aria-photo-speak {
          0%, 100% { transform: scale(1.01); filter: brightness(1); }
          50% { transform: scale(1.025); filter: brightness(1.05); }
        }
        @keyframes aria-photo-lip {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.28; }
        }
        @keyframes aria-vignette-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displaySrc}
        alt={`Aria — ${cfg.label}`}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: cfg.position,
          animation: anim,
          opacity: fade,
          transition: 'opacity 0.35s ease',
          filter: 'contrast(1.04) saturate(1.05)',
        }}
      />

      {/* 电影暗角，压住边缘 UI */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(8,6,5,0.45) 100%)',
          pointerEvents: 'none',
          animation: pose === 'play_piano' ? 'aria-vignette-pulse 8s ease-in-out infinite' : undefined,
        }}
      />

      {pose === 'play_piano' && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '4%',
            right: '4%',
            bottom: '4%',
            height: '28%',
            background:
              'linear-gradient(180deg, transparent, rgba(255,210,150,0.05) 40%, rgba(255,200,120,0.1))',
            pointerEvents: 'none',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {speaking && (pose === 'speak' || pose === 'look_at_user') && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '48%',
            top: '34%',
            width: '14%',
            height: '6%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at center, rgba(255,200,160,0.25), transparent 70%)',
            animation: 'aria-photo-lip 0.28s ease-in-out infinite',
            pointerEvents: 'none',
            mixBlendMode: 'screen',
          }}
        />
      )}

      <div
        style={{
          position: 'absolute',
          left: 12,
          top: 12,
          zIndex: 4,
          padding: '6px 10px',
          borderRadius: 99,
          background: 'rgba(8,6,5,0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: 11,
          letterSpacing: '0.04em',
          color: 'rgba(245,230,200,0.92)',
          backdropFilter: 'blur(8px)',
        }}
      >
        ARIA · {cfg.label}
        {emotion ? ` · ${emotion}` : ''}
      </div>
    </div>
  );
}
