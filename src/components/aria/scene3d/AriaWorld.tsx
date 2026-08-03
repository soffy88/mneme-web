'use client';

import { Suspense, useMemo, type MutableRefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Room } from './Room';
import { GrandPiano } from './GrandPiano';
import { goalForPose } from './AriaHumanoid';
import { AriaAvatar } from './AriaAvatar';
import type { AvatarPose } from '../nimAdapter';
import type { VisemeCue } from '@/lib/aria-media';

export type AriaDriveRefs = {
  visemesRef: MutableRefObject<VisemeCue[]>;
  getAudioTime: () => number;
  activeNotesRef: MutableRefObject<Map<number, number>>;
};

type Props = {
  pose: AvatarPose;
  speaking: boolean;
  emotion?: string;
} & AriaDriveRefs;

function Scene({ pose, speaking, drive }: { pose: AvatarPose; speaking: boolean; drive: AriaDriveRefs }) {
  const goal = goalForPose(pose);
  if (speaking) goal.speaking = true;
  const playing = pose === 'play_piano';
  const talk = speaking || pose === 'speak' || pose === 'look_at_user';

  const cam = useMemo(() => {
    if (playing) return { pos: [2.85, 1.9, 3.55] as const, target: [1.05, 0.95, 0.4] as const };
    if (talk) return { pos: [0.85, 1.55, 2.95] as const, target: [0.15, 1.35, 1.4] as const };
    return { pos: [2.4, 1.8, 3.8] as const, target: [0.3, 1.0, 0.5] as const };
  }, [playing, talk]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[...cam.pos]} fov={40} />
      <OrbitControls
        enablePan={false}
        minPolarAngle={0.55}
        maxPolarAngle={1.4}
        minDistance={2.2}
        maxDistance={6.5}
        target={[...cam.target]}
        enableDamping
        dampingFactor={0.08}
      />
      <Room />
      <GrandPiano playing={playing} />
      <Suspense fallback={null}>
        <AriaAvatar goal={goal} drive={drive} />
      </Suspense>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={12} blur={2.2} far={4} />
      <fog attach="fog" args={['#1a1410', 7, 15]} />
      <color attach="background" args={['#1a1410']} />
    </>
  );
}

/** Hybrid B：3D 身体自由行动 + 照片真人脸 + viseme 口型 + MIDI 手指 */
export function AriaWorld({ pose, speaking, emotion, visemesRef, getAudioTime, activeNotesRef }: Props) {
  const drive: AriaDriveRefs = { visemesRef, getAudioTime, activeNotesRef };
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Canvas shadows dpr={[1, 1.75]} gl={{ antialias: true, alpha: false }}>
        <Scene pose={pose} speaking={speaking} drive={drive} />
      </Canvas>
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
          pointerEvents: 'none',
        }}
      >
        VRM · 真人脸 · {pose.replace(/_/g, ' ')}
        {emotion ? ` · ${emotion}` : ''}
        {speaking ? ' · speaking' : ''}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 12,
          bottom: 100,
          zIndex: 4,
          fontSize: 10,
          color: 'rgba(245,240,232,0.4)',
          pointerEvents: 'none',
        }}
      >
        拖拽旋转 · VRM 可走可弹可聊
      </div>
    </div>
  );
}
