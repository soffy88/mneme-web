'use client';

/**
 * AriaHands — P2 SVG 手部叠加组件
 *
 * 在人像层上叠加半透明手部轮廓，由 GSAP 驱动：
 * - 左手 / 右手 / 双手独立动画
 * - finger_spread 控制手指张开程度
 * - wrist_bounce 控制手腕弹跳
 * - attack_intensity 控制触键力度（光晕）
 * - transition_ms 控制动画过渡时间
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { HandChoreoParams } from '@/lib/aria-director';

type Props = {
  choreo: HandChoreoParams | null | undefined;
  playing: boolean;
  speaking: boolean;
};

/** 默认 idle 参数 */
const IDLE_CHOREO: HandChoreoParams = {
  left_x_pct: 40,
  left_y_pct: 72,
  left_rotation: -10,
  left_scale: 0.95,
  right_x_pct: 60,
  right_y_pct: 72,
  right_rotation: 10,
  right_scale: 0.95,
  finger_spread: 0.15,
  wrist_bounce: 0.05,
  attack_intensity: 0.1,
  transition_ms: 400,
  active_hand: 'both',
  pattern_label: 'idle',
};

/**
 * SVG 手部轮廓：手掌 + 5 指
 * 原点 (0,0) 在手腕中心，手指向 +y 方向
 */
function HandSVG({
  side,
  scale,
  rotation,
  fingerSpread,
  glowIntensity,
}: {
  side: 'left' | 'right';
  scale: number;
  rotation: number;
  fingerSpread: number;
  glowIntensity: number;
}) {
  const flip = side === 'right' ? -1 : 1;
  // 手指张开角度（degree）
  const spread = fingerSpread * 25;

  return (
    <svg
      viewBox="-30 -60 60 80"
      width="100%"
      height="100%"
      style={{
        overflow: 'visible',
        transform: `scaleX(${flip}) scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: 'center bottom',
      }}
    >
      {/* 光晕（触键时显示） */}
      {glowIntensity > 0.3 && (
        <ellipse
          cx={0}
          cy={-25}
          rx={20 + glowIntensity * 10}
          ry={15 + glowIntensity * 8}
          fill={`rgba(255, 220, 160, ${glowIntensity * 0.15})`}
          style={{ filter: 'blur(4px)' }}
        />
      )}

      {/* 手掌 */}
      <ellipse
        cx={0}
        cy={-10}
        rx={14}
        ry={18}
        fill="rgba(255, 240, 220, 0.06)"
        stroke="rgba(255, 240, 220, 0.25)"
        strokeWidth={0.8}
      />

      {/* 拇指 */}
      <line
        x1={-12 * flip}
        y1={-5}
        x2={(-20 - spread * 0.3) * flip}
        y2={-18}
        stroke="rgba(255, 240, 220, 0.3)"
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* 食指 */}
      <line
        x1={-6}
        y1={-26}
        x2={-6 - spread * 0.15}
        y2={-48 - fingerSpread * 6}
        stroke="rgba(255, 240, 220, 0.3)"
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* 中指 */}
      <line
        x1={0}
        y1={-28}
        x2={0}
        y2={-52 - fingerSpread * 5}
        stroke="rgba(255, 240, 220, 0.3)"
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* 无名指 */}
      <line
        x1={6}
        y1={-26}
        x2={6 + spread * 0.12}
        y2={-48 - fingerSpread * 4}
        stroke="rgba(255, 240, 220, 0.3)"
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* 小指 */}
      <line
        x1={11}
        y1={-22}
        x2={11 + spread * 0.2}
        y2={-40 - fingerSpread * 3}
        stroke="rgba(255, 240, 220, 0.25)"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AriaHands({ choreo, playing, speaking }: Props) {
  const c = choreo ?? IDLE_CHOREO;
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // 位置动画（GSAP 驱动）
  useEffect(() => {
    tlRef.current?.kill();
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;

    const dur = c.transition_ms / 1000;
    const tl = gsap.timeline({ repeat: -1 });

    const showLeft = c.active_hand === 'left' || c.active_hand === 'both';
    const showRight = c.active_hand === 'right' || c.active_hand === 'both';

    // 基础位置
    gsap.to(left, {
      left: `${c.left_x_pct}%`,
      top: `${c.left_y_pct}%`,
      opacity: showLeft ? 0.7 : 0.15,
      duration: dur,
      ease: 'power2.out',
    });
    gsap.to(right, {
      left: `${c.right_x_pct}%`,
      top: `${c.right_y_pct}%`,
      opacity: showRight ? 0.7 : 0.15,
      duration: dur,
      ease: 'power2.out',
    });

    // 弹琴时的弹跳动画
    if (playing && c.pattern_label !== 'idle') {
      const bounceY = c.wrist_bounce * 8;
      const bounceDur = 0.25 / Math.max(0.3, c.attack_intensity);

      if (showLeft) {
        tl.to(left, {
          y: -bounceY,
          duration: bounceDur,
          ease: 'power2.out',
          yoyo: true,
          repeat: -1,
        });
      }
      if (showRight) {
        tl.to(
          right,
          {
            y: -bounceY,
            duration: bounceDur * 0.9, // 略微错开
            ease: 'power2.out',
            yoyo: true,
            repeat: -1,
          },
          0.05,
        );
      }
    }

    tlRef.current = tl;
    return () => {
      tl.kill();
    };
  }, [c, playing]);

  // 说话时的手势微动
  useEffect(() => {
    if (!speaking) return;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(left, {
      y: -3,
      rotation: -3,
      duration: 0.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
    }).to(
      right,
      {
        y: -4,
        rotation: 4,
        duration: 0.55,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      },
      0.1,
    );

    return () => {
      tl.kill();
    };
  }, [speaking]);

  return (
    <>
      {/* 左手 */}
      <div
        ref={leftRef}
        style={{
          position: 'absolute',
          left: `${c.left_x_pct}%`,
          top: `${c.left_y_pct}%`,
          width: '12%',
          height: '18%',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        <HandSVG
          side="left"
          scale={c.left_scale}
          rotation={c.left_rotation}
          fingerSpread={c.finger_spread}
          glowIntensity={playing ? c.attack_intensity : 0}
        />
      </div>

      {/* 右手 */}
      <div
        ref={rightRef}
        style={{
          position: 'absolute',
          left: `${c.right_x_pct}%`,
          top: `${c.right_y_pct}%`,
          width: '12%',
          height: '18%',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        <HandSVG
          side="right"
          scale={c.right_scale}
          rotation={c.right_rotation}
          fingerSpread={c.finger_spread}
          glowIntensity={playing ? c.attack_intensity : 0}
        />
      </div>
    </>
  );
}
