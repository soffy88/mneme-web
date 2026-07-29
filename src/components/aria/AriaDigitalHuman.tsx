'use client';

/**
 * 独立数字人：房间固定 + 人像层由 Director.layout / hands 驱动。
 * LLM 可自动（及用户纠偏）调整位置与手部动作。
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { AvatarPose } from './nimAdapter';
import type { LipsyncMedia } from './AriaCinemaLayer';
import type { AriaHands, AriaLayout, HandChoreoParams } from '@/lib/aria-director';
import { handsForAction, layoutForAction } from '@/lib/aria-director';
import { AriaHands as AriaHandsOverlay } from './AriaHands';

type Props = {
  pose: AvatarPose;
  speaking: boolean;
  emotion?: string;
  playingAudio: boolean;
  lipsync?: LipsyncMedia | null;
  layout?: AriaLayout | null;
  hands?: AriaHands | null;
  action?: string;
  /** P2: 手部编排参数（GSAP 动画用） */
  handChoreo?: HandChoreoParams | null;
  /** P3: EchoMimic 驱动视频 URL（base64 data URI 或 mp4 URL） */
  echoVideoUrl?: string | null;
};

const ASSETS = {
  roomPlay: '/aria/dh/room_play.jpg?v=1',
  roomTalk: '/aria/dh/room_talk.jpg?v=1',
  personPlay: '/aria/dh/person_play.png?v=2',
  personTalk: '/aria/dh/person_talk.png?v=2',
};

function isTalk(pose: AvatarPose): boolean {
  return pose === 'speak' || pose === 'look_at_user' || pose === 'think' || pose === 'idle';
}

export function AriaDigitalHuman({
  pose,
  speaking,
  emotion,
  playingAudio,
  lipsync,
  layout: layoutProp,
  hands: handsProp,
  action,
  handChoreo,
  echoVideoUrl,
}: Props) {
  const talk = isTalk(pose);
  const act = action || (talk ? 'speak' : 'play_piano');
  const layout = layoutProp ?? layoutForAction(act);
  const hands = handsProp ?? handsForAction(act);

  const personRef = useRef<HTMLDivElement>(null);
  const personImgRef = useRef<HTMLImageElement>(null);
  const armsRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const mouthRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<HTMLDivElement>(null);
  const bodyTl = useRef<gsap.core.Timeline | null>(null);
  const handsTl = useRef<gsap.core.Timeline | null>(null);
  const lipVideoRef = useRef<HTMLVideoElement>(null);
  const echoVideoRef = useRef<HTMLVideoElement>(null); // P3

  // 应用 LLM 布局（平滑过渡）
  useEffect(() => {
    const el = personRef.current;
    const img = personImgRef.current;
    if (!el) return;
    gsap.to(el, {
      left: `${layout.left_pct}%`,
      bottom: `${layout.bottom_pct}%`,
      width: `${layout.width_pct}%`,
      height: `${layout.height_pct}%`,
      scale: layout.scale,
      duration: 0.55,
      ease: 'power2.out',
      transformOrigin: '50% 100%',
    });
    if (img) {
      gsap.set(img, {
        objectPosition: `${layout.anchor_x_pct}% ${layout.anchor_y_pct}%`,
      });
    }
  }, [layout]);

  // 躯干呼吸（弱）
  useEffect(() => {
    bodyTl.current?.kill();
    const person = personRef.current;
    const head = headRef.current;
    if (!person) return;
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(person, {
      y: -2.5 * (0.5 + hands.intensity * 0.5),
      duration: 1.6 / Math.max(0.4, hands.rate * 0.5 + 0.5),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
    });
    if (head && (speaking || pose === 'speak')) {
      tl.to(
        head,
        {
          rotation: 2.2,
          y: -1,
          duration: 0.32 / Math.max(0.4, hands.rate),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: 5,
        },
        0,
      );
    } else if (head && pose === 'think') {
      tl.to(head, { rotation: -5, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
    }
    bodyTl.current = tl;
    return () => {
      tl.kill();
    };
  }, [speaking, pose, hands.intensity, hands.rate]);

  // 手部动作：由 hands.style / intensity / rate / reach 驱动
  useEffect(() => {
    handsTl.current?.kill();
    const arms = armsRef.current;
    if (!arms) return;

    gsap.set(arms, {
      left: `${28 + hands.reach_x_pct}%`,
      top: `${40 + hands.reach_y_pct}%`,
      transformOrigin: '50% 10%',
    });

    const inten = hands.intensity;
    const rate = Math.max(0.3, hands.rate);
    const tl = gsap.timeline({ repeat: -1 });

    if (hands.style === 'play' && playingAudio && !talk) {
      // 模拟在键上起落
      tl.to(arms, {
        y: 6 * inten,
        x: -4 * inten,
        rotation: -3 * inten,
        duration: 0.18 / rate,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: 1,
      })
        .to(arms, {
          y: 3 * inten,
          x: 5 * inten,
          rotation: 2.5 * inten,
          duration: 0.16 / rate,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: 1,
        })
        .to(arms, {
          y: 7 * inten,
          x: -2 * inten,
          rotation: -1.5 * inten,
          duration: 0.14 / rate,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: 1,
        });
    } else if (hands.style === 'gesture' || speaking) {
      tl.to(arms, {
        y: -4 * inten,
        x: 6 * inten,
        rotation: 4 * inten,
        duration: 0.45 / rate,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      }).to(arms, {
        y: 2 * inten,
        x: -3 * inten,
        rotation: -2 * inten,
        duration: 0.5 / rate,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      });
    } else if (hands.style === 'rest') {
      tl.to(arms, { y: 1, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: 1 });
    } else {
      tl.to(arms, {
        y: 2 * inten,
        duration: 1.8 / rate,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      });
    }

    handsTl.current = tl;
    return () => {
      tl.kill();
    };
  }, [hands, playingAudio, talk, speaking]);

  // 琴键
  useEffect(() => {
    const root = keysRef.current;
    if (!root) return;
    const keys = root.querySelectorAll('[data-key]');
    if (!playingAudio || talk || hands.style !== 'play') {
      gsap.set(keys, { y: 0, opacity: 0.25 });
      return;
    }
    const tl = gsap.timeline({ repeat: -1 });
    const rate = Math.max(0.4, hands.rate);
    keys.forEach((el, i) => {
      tl.to(
        el,
        {
          y: (3 + (i % 3)) * hands.intensity,
          opacity: 0.35 + 0.55 * hands.intensity,
          duration: 0.1 / rate,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut',
        },
        i * (0.055 / rate),
      );
    });
    tl.to({}, { duration: 0.28 / rate });
    return () => {
      tl.kill();
    };
  }, [playingAudio, talk, hands]);

  useEffect(() => {
    const v = lipVideoRef.current;
    if (!v) return;
    if (lipsync?.mode === 'video' && lipsync.videoUrl && speaking) {
      v.src = lipsync.videoUrl;
      void v.play().catch(() => undefined);
    } else {
      v.pause();
      v.removeAttribute('src');
      v.load();
    }
  }, [lipsync, speaking]);

  // P3: EchoMimic 驱动视频控制
  useEffect(() => {
    const v = echoVideoRef.current;
    if (!v) return;
    if (echoVideoUrl) {
      v.src = echoVideoUrl;
      void v.play().catch(() => undefined);
    } else {
      v.pause();
      v.removeAttribute('src');
      v.load();
    }
  }, [echoVideoUrl]);

  useEffect(() => {
    const m = mouthRef.current;
    if (!m) return;
    if (speaking && talk) {
      gsap.to(m, {
        scaleY: 1.35,
        scaleX: 1.1,
        opacity: 0.42,
        duration: 0.11,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    } else {
      gsap.killTweensOf(m);
      gsap.set(m, { scaleY: 0.3, scaleX: 0.7, opacity: 0.05 });
    }
  }, [speaking, talk]);

  const showLipVideo = speaking && lipsync?.mode === 'video' && !!lipsync.videoUrl;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#0c0a09',
      }}
    >
      {/* 房间：永不随 layout 动 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={talk ? ASSETS.roomTalk : ASSETS.roomPlay}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: talk ? '55% 40%' : '40% 50%',
          zIndex: 0,
        }}
      />

      {/* 人像：layout 由 LLM/Director 控制 */}
      <div
        ref={personRef}
        style={{
          position: 'absolute',
          zIndex: 2,
          left: `${layout.left_pct}%`,
          bottom: `${layout.bottom_pct}%`,
          width: `${layout.width_pct}%`,
          height: `${layout.height_pct}%`,
          transform: `scale(${layout.scale})`,
          transformOrigin: '50% 100%',
          pointerEvents: 'none',
          willChange: 'transform, left, bottom, width, height',
        }}
      >
        {/* P3: EchoMimic 驱动视频（优先于静态 PNG） */}
        {echoVideoUrl ? (
          <video
            ref={echoVideoRef}
            src={echoVideoUrl}
            muted
            loop
            playsInline
            autoPlay
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: `${layout.anchor_x_pct}% ${layout.anchor_y_pct}%`,
              filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.45))',
            }}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            ref={personImgRef}
            src={talk ? ASSETS.personTalk : ASSETS.personPlay}
            alt="Aria digital human"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: `${layout.anchor_x_pct}% ${layout.anchor_y_pct}%`,
              filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.45))',
            }}
          />
        )}

        {/* 手部驱动层：半透明高亮区 + GSAP（示意/驱动锚点） */}
        <div
          ref={armsRef}
          style={{
            position: 'absolute',
            left: '28%',
            top: '40%',
            width: talk ? '42%' : '48%',
            height: '26%',
            pointerEvents: 'none',
          }}
        >
          {/* 可视“手势能量”：弹琴时轻微光斑随 intensity */}
          {!talk && hands.style === 'play' && (
            <div
              style={{
                position: 'absolute',
                left: '10%',
                right: '10%',
                bottom: '8%',
                height: '40%',
                borderRadius: '40%',
                background: `radial-gradient(ellipse at center, rgba(255,220,160,${0.08 + hands.intensity * 0.18}), transparent 70%)`,
                filter: 'blur(2px)',
              }}
            />
          )}
        </div>

        <div
          ref={headRef}
          style={{
            position: 'absolute',
            left: talk ? '36%' : '50%',
            top: talk ? '6%' : '4%',
            width: talk ? '30%' : '26%',
            height: talk ? '24%' : '22%',
            pointerEvents: 'none',
          }}
        >
          {showLipVideo ? (
            <video
              ref={lipVideoRef}
              muted
              playsInline
              loop
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
                opacity: 0.92,
              }}
            />
          ) : (
            <div
              ref={mouthRef}
              style={{
                position: 'absolute',
                left: '50%',
                top: '70%',
                width: '28%',
                height: '10%',
                marginLeft: '-14%',
                borderRadius: '50%',
                background:
                  'radial-gradient(ellipse at center, rgba(60,20,18,0.55), transparent 70%)',
                opacity: 0.05,
                transform: 'scaleY(0.3)',
              }}
            />
          )}
        </div>

        {/* P2: SVG 手部叠加层 */}
        <AriaHandsOverlay
          choreo={handChoreo}
          playing={playingAudio && !talk}
          speaking={speaking}
        />
      </div>

      {!talk && (
        <div
          ref={keysRef}
          aria-hidden
          style={{
            position: 'absolute',
            left: '8%',
            width: '52%',
            bottom: '17%',
            height: 22,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 2,
            zIndex: 3,
            pointerEvents: 'none',
            opacity: playingAudio ? 1 : 0.3,
          }}
        >
          {Array.from({ length: 16 }).map((_, i) => {
            const black = [1, 3, 6, 8, 10].includes(i % 12);
            return (
              <div
                key={i}
                data-key
                style={{
                  flex: black ? 0.5 : 1,
                  height: black ? 14 : 22,
                  borderRadius: 1,
                  background: black
                    ? 'linear-gradient(180deg,#2a221c,#0c0a08)'
                    : 'linear-gradient(180deg,rgba(255,250,240,0.9),rgba(230,220,200,0.7))',
                  opacity: 0.35,
                }}
              />
            );
          })}
        </div>
      )}

      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(8,6,5,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 12,
          top: 12,
          zIndex: 5,
          padding: '6px 10px',
          borderRadius: 99,
          background: 'rgba(8,6,5,0.55)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: 11,
          letterSpacing: '0.04em',
          color: 'rgba(245,230,200,0.92)',
          backdropFilter: 'blur(8px)',
        }}
      >
        ARIA · DH · L{Math.round(layout.left_pct)} B{Math.round(layout.bottom_pct)} ×
        {layout.scale.toFixed(2)}
        {hands.style === 'play' ? ' · hands:play' : ` · hands:${hands.style}`}
        {handChoreo ? ` · ${handChoreo.pattern_label}` : ''}
        {echoVideoUrl ? ' · echo' : ''}
        {speaking ? ' · viseme' : ''}
        {emotion ? ` · ${emotion}` : ''}
      </div>
    </div>
  );
}
