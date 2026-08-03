'use client';

/**
 * 数字人视图：按 Director 姿态切换场景（弹琴 / 看向你 / 说话 / 思考）。
 * 这是「可自由行动」的行为可视化层；真 3D/NIM 流可替换此组件内部实现。
 */
import type { AvatarPose } from './nimAdapter';

type Props = {
  pose: AvatarPose;
  speaking: boolean;
  emotion: string;
  backend: 'nim' | 'mock_scene';
  nimStreamUrl?: string | null;
};

const POSE_MEDIA: Record<
  AvatarPose,
  { img: string; label: string; objectPosition: string }
> = {
  play_piano: {
    img: '/aria/playing.jpg',
    label: 'Playing the piano',
    objectPosition: 'center 55%',
  },
  look_at_user: {
    img: '/aria/conversation.jpg',
    label: 'Looking at you',
    objectPosition: 'center 50%',
  },
  speak: {
    img: '/aria/conversation.jpg',
    label: 'Speaking with you',
    objectPosition: 'center 48%',
  },
  think: {
    img: '/aria/conversation.jpg',
    label: 'Thinking…',
    objectPosition: 'center 50%',
  },
  idle: {
    img: '/aria/conversation.jpg',
    label: 'Near the piano',
    objectPosition: 'center 52%',
  },
};

export function DigitalHumanView({
  pose,
  speaking,
  emotion,
  backend,
  nimStreamUrl,
}: Props) {
  const media = POSE_MEDIA[pose];
  const anim =
    pose === 'play_piano'
      ? 'aria-dh-play 14s ease-in-out infinite alternate'
      : speaking
        ? 'aria-dh-speak 0.32s ease-in-out infinite'
        : pose === 'think'
          ? 'aria-dh-think 2.8s ease-in-out infinite'
          : 'aria-dh-idle 5s ease-in-out infinite';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes aria-dh-play {
          from { transform: scale(1) translate(0,0); }
          to { transform: scale(1.03) translate(0, -0.8%); }
        }
        @keyframes aria-dh-idle {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.012) translateY(-0.35%); }
        }
        @keyframes aria-dh-speak {
          0%, 100% { transform: scale(1.01); filter: brightness(1); }
          50% { transform: scale(1.025); filter: brightness(1.05); }
        }
        @keyframes aria-dh-think {
          0%, 100% { filter: brightness(0.96) saturate(0.95); }
          50% { filter: brightness(1.02) saturate(1.05); }
        }
        @keyframes aria-dh-lip {
          0%, 100% { opacity: 0.12; transform: translate(-50%,-50%) scaleY(0.9); }
          50% { opacity: 0.38; transform: translate(-50%,-50%) scaleY(1.2); }
        }
        @keyframes aria-keys-glow {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.55; }
        }
      `}</style>

      {backend === 'nim' && nimStreamUrl ? (
        // NIM 视频/WebRTC 流占位
        <video
          src={nimStreamUrl}
          autoPlay
          playsInline
          muted={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.img}
          alt={media.label}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: media.objectPosition,
            animation: anim,
            transition: 'opacity 0.6s ease',
          }}
        />
      )}

      {/* 弹琴时：琴键区微光，强化「正在弹」 */}
      {pose === 'play_piano' && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '8%',
            right: '8%',
            bottom: '8%',
            height: '22%',
            background:
              'linear-gradient(180deg, transparent, rgba(255,220,160,0.08) 40%, rgba(255,200,120,0.14))',
            animation: 'aria-keys-glow 1.1s ease-in-out infinite',
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
            left: '50%',
            top: '36%',
            width: '12%',
            height: '5%',
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at center, rgba(255,200,160,0.35), transparent 70%)',
            animation: 'aria-dh-lip 0.28s ease-in-out infinite',
            pointerEvents: 'none',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* 姿态 HUD —— 让用户看见「AI 在自主行动」而非静态图 */}
      <div
        style={{
          position: 'absolute',
          left: 12,
          top: 12,
          zIndex: 4,
          padding: '6px 10px',
          borderRadius: 99,
          background: 'rgba(8,6,5,0.55)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: 11,
          letterSpacing: '0.04em',
          color: 'rgba(245,230,200,0.9)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {backend === 'nim' ? 'NIM RUNTIME' : 'AI DIRECTOR'} · {media.label}
        {emotion ? ` · ${emotion}` : ''}
      </div>
    </div>
  );
}
