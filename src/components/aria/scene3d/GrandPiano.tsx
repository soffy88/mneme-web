'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';

/** 三角钢琴（几何体，可被角色走过去弹） */
export function GrandPiano({ playing = false }: { playing?: boolean }) {
  const keysRef = useRef<Group>(null);
  const tRef = useRef(0);

  useFrame((_, dt) => {
    if (!keysRef.current || !playing) return;
    tRef.current += dt;
    keysRef.current.children.forEach((ch, i) => {
      const m = ch as Mesh;
      const press = Math.sin(tRef.current * 8 + i * 0.7) > 0.55 ? 0.012 : 0;
      m.position.y = -press;
    });
  });

  // 钢琴放在房间一侧，琴键朝 +Z（角色从前方接近）
  return (
    <group position={[1.4, 0, -0.6]} rotation={[0, -0.35, 0]}>
      {/* 琴身 */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.28, 1.5]} />
        <meshStandardMaterial color="#1a1410" metalness={0.55} roughness={0.35} />
      </mesh>
      {/* 琴盖（半开） */}
      <mesh position={[0, 0.72, -0.35]} rotation={[-0.55, 0, 0]} castShadow>
        <boxGeometry args={[1.55, 0.04, 1.1]} />
        <meshStandardMaterial color="#120e0c" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* 琴腿 */}
      {[
        [-0.65, 0.16, 0.55],
        [0.65, 0.16, 0.55],
        [0, 0.16, -0.55],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 0.32, 8]} />
          <meshStandardMaterial color="#1a1410" />
        </mesh>
      ))}
      {/* 键盘底板 */}
      <mesh position={[0, 0.56, 0.72]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.06, 0.28]} />
        <meshStandardMaterial color="#0d0b0a" />
      </mesh>
      {/* 白键 */}
      <group ref={keysRef} position={[-0.58, 0.6, 0.72]}>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={i} position={[i * 0.09, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 0.025, 0.22]} />
            <meshStandardMaterial color="#f4f0e8" roughness={0.45} />
          </mesh>
        ))}
      </group>
      {/* 琴凳 */}
      <mesh position={[0, 0.28, 1.15]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.08, 0.32]} />
        <meshStandardMaterial color="#2a221c" />
      </mesh>
      <mesh position={[0, 0.12, 1.15]} castShadow>
        <boxGeometry args={[0.08, 0.24, 0.08]} />
        <meshStandardMaterial color="#1a1410" />
      </mesh>
    </group>
  );
}
