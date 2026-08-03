'use client';

/**
 * Hybrid B 数字人：3D 可行动身体 + 照片级真人脸贴图。
 * 接口与姿态目标保持稳定，便于日后换 VRM/NIM 脸流。
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { AvatarPose } from '../nimAdapter';

export type HumanoidGoal = {
  pose: AvatarPose;
  target: [number, number, number];
  faceYaw: number;
  speaking?: boolean;
};

const SKIN = '#e6c4a8';
const HAIR = '#14100e';
const DRESS = '#121014';
const DRESS_HL = '#2a2228';

function PhotoFace({
  speaking,
  playing,
}: {
  speaking: boolean;
  playing: boolean;
}) {
  const front = useTexture('/aria/face-front.jpg');
  const play = useTexture('/aria/face-play.jpg');
  const faceMat = useRef<THREE.MeshStandardMaterial>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useEffect(() => {
    for (const tex of [front, play]) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
    }
  }, [front, play]);

  useFrame((_, dt) => {
    t.current += dt;
    if (faceMat.current) {
      // 说话时轻微明暗 = 简易口型驱动感
      const pulse = speaking ? 0.06 * Math.sin(t.current * 14) : 0;
      faceMat.current.emissiveIntensity = speaking ? 0.08 + Math.abs(pulse) : 0.02;
    }
    if (mouth.current) {
      const open = speaking ? 0.012 + Math.abs(Math.sin(t.current * 16)) * 0.018 : 0.002;
      mouth.current.scale.y = open / 0.012;
      mouth.current.scale.x = speaking ? 1.15 : 0.6;
      (mouth.current.material as THREE.MeshBasicMaterial).opacity = speaking ? 0.35 : 0.05;
    }
  });

  const map = playing ? play : front;
  // 弹琴侧脸图偏侧面构图，略放大；正脸填满圆角平面
  const faceScale: [number, number] = playing ? [0.34, 0.4] : [0.3, 0.36];

  return (
    <group position={[0, 0.02, 0.11]}>
      {/* 照片脸 — 圆角近似：圆形平面 + 深度微球垫底 */}
      <mesh castShadow>
        <circleGeometry args={[0.145, 48]} />
        <meshStandardMaterial
          ref={faceMat}
          map={map}
          roughness={0.55}
          metalness={0.02}
          emissive="#3a2818"
          emissiveIntensity={0.02}
          transparent
          alphaTest={0.15}
        />
      </mesh>
      {/* 略放大的照片矩形，补全发际/耳，圆形裁切感由前后层叠 */}
      <mesh position={[0, 0, -0.002]} scale={[faceScale[0] / 0.28, faceScale[1] / 0.28, 1]}>
        <planeGeometry args={[0.28, 0.34]} />
        <meshStandardMaterial
          map={map}
          roughness={0.55}
          metalness={0.02}
          transparent
          opacity={0.98}
        />
      </mesh>
      {/* 简易口型椭圆（说话时放大） */}
      <mesh ref={mouth} position={[0, -0.055, 0.012]}>
        <planeGeometry args={[0.06, 0.012]} />
        <meshBasicMaterial color="#4a2018" transparent opacity={0.05} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function AriaHumanoid({ goal }: { goal: HumanoidGoal }) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const lArm = useRef<THREE.Group>(null);
  const rArm = useRef<THREE.Group>(null);
  const lFore = useRef<THREE.Group>(null);
  const rFore = useRef<THREE.Group>(null);
  const lLeg = useRef<THREE.Group>(null);
  const rLeg = useRef<THREE.Group>(null);
  const t = useRef(0);
  const pos = useRef(new THREE.Vector3(0, 0, 1.8));
  const yaw = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    if (!root.current) return;
    t.current += dt;
    const playing = goal.pose === 'play_piano';
    const speaking = !!(goal.speaking || goal.pose === 'speak');
    const walking = !playing && pos.current.distanceTo(tmp.set(...goal.target)) > 0.08;

    const speed = walking ? 1.4 : 0;
    if (walking) {
      tmp.set(...goal.target);
      const dir = tmp.clone().sub(pos.current);
      dir.y = 0;
      const dist = dir.length();
      if (dist > 0.001) {
        dir.normalize();
        pos.current.addScaledVector(dir, Math.min(dist, speed * dt));
        yaw.current = Math.atan2(dir.x, dir.z);
      }
    } else {
      let d = goal.faceYaw - yaw.current;
      d = ((d + Math.PI) % (Math.PI * 2)) - Math.PI;
      yaw.current += d * Math.min(1, dt * 4);
      pos.current.lerp(tmp.set(...goal.target), Math.min(1, dt * 3));
    }

    const sitY = playing ? 0.4 : 0;
    const bob = walking ? Math.abs(Math.sin(t.current * 8)) * 0.035 : 0;
    root.current.position.set(pos.current.x, sitY + bob, pos.current.z);
    root.current.rotation.y = yaw.current;

    if (lLeg.current && rLeg.current) {
      if (walking) {
        lLeg.current.rotation.x = Math.sin(t.current * 8) * 0.55;
        rLeg.current.rotation.x = Math.sin(t.current * 8 + Math.PI) * 0.55;
      } else if (playing) {
        lLeg.current.rotation.x = -1.2;
        rLeg.current.rotation.x = -1.2;
      } else {
        lLeg.current.rotation.x = THREE.MathUtils.lerp(lLeg.current.rotation.x, 0, dt * 6);
        rLeg.current.rotation.x = THREE.MathUtils.lerp(rLeg.current.rotation.x, 0, dt * 6);
      }
    }

    if (lArm.current && rArm.current) {
      if (playing) {
        lArm.current.rotation.set(-0.95 + Math.sin(t.current * 9) * 0.12, 0, 0.35);
        rArm.current.rotation.set(-0.9 + Math.sin(t.current * 9 + 1.1) * 0.14, 0, -0.35);
        if (lFore.current) lFore.current.rotation.x = -0.55 + Math.sin(t.current * 11) * 0.1;
        if (rFore.current) rFore.current.rotation.x = -0.5 + Math.sin(t.current * 10 + 0.5) * 0.12;
      } else if (walking) {
        lArm.current.rotation.set(Math.sin(t.current * 8 + Math.PI) * 0.4, 0, 0.12);
        rArm.current.rotation.set(Math.sin(t.current * 8) * 0.4, 0, -0.12);
        if (lFore.current) lFore.current.rotation.x = -0.2;
        if (rFore.current) rFore.current.rotation.x = -0.2;
      } else if (speaking) {
        lArm.current.rotation.set(-0.3, 0.1, 0.2);
        rArm.current.rotation.set(-0.45 + Math.sin(t.current * 5) * 0.1, -0.05, -0.25);
        if (lFore.current) lFore.current.rotation.x = -0.35;
        if (rFore.current) rFore.current.rotation.x = -0.4;
      } else {
        lArm.current.rotation.x = THREE.MathUtils.lerp(lArm.current.rotation.x, -0.2, dt * 4);
        rArm.current.rotation.x = THREE.MathUtils.lerp(rArm.current.rotation.x, -0.2, dt * 4);
        lArm.current.rotation.z = THREE.MathUtils.lerp(lArm.current.rotation.z, 0.12, dt * 4);
        rArm.current.rotation.z = THREE.MathUtils.lerp(rArm.current.rotation.z, -0.12, dt * 4);
      }
    }

    if (head.current) {
      if (playing) {
        head.current.rotation.x = 0.28;
        head.current.rotation.y = 0.15;
      } else if (goal.pose === 'look_at_user' || speaking) {
        head.current.rotation.x = -0.04 + Math.sin(t.current * 1.8) * 0.015;
        head.current.rotation.y = Math.sin(t.current * 1.1) * 0.04;
      } else if (goal.pose === 'think') {
        head.current.rotation.x = 0.12;
        head.current.rotation.y = -0.22;
      } else {
        head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, 0, dt * 3);
        head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, 0, dt * 3);
      }
    }

    if (torso.current) {
      torso.current.rotation.x = playing ? 0.18 : speaking ? 0.04 : 0;
    }
  });

  const playing = goal.pose === 'play_piano';
  const speaking = !!(goal.speaking || goal.pose === 'speak');

  return (
    <group ref={root}>
      {/* 裙摆 / 髋 */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.32, 0.55, 16]} />
        <meshStandardMaterial color={DRESS} roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.17, 20, 16]} />
        <meshStandardMaterial color={DRESS} roughness={0.4} metalness={0.12} />
      </mesh>

      {/* 躯干 */}
      <group ref={torso} position={[0, 1.12, 0]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.22, 8, 16]} />
          <meshStandardMaterial color={DRESS} roughness={0.32} metalness={0.18} />
        </mesh>
        {/* 肩带感 */}
        <mesh position={[-0.1, 0.38, 0.02]} rotation={[0, 0, 0.35]} castShadow>
          <boxGeometry args={[0.03, 0.16, 0.02]} />
          <meshStandardMaterial color={DRESS_HL} metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0.1, 0.38, 0.02]} rotation={[0, 0, -0.35]} castShadow>
          <boxGeometry args={[0.03, 0.16, 0.02]} />
          <meshStandardMaterial color={DRESS_HL} metalness={0.4} roughness={0.3} />
        </mesh>
        {/* 颈 */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.055, 0.1, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>

        {/* 头 + 照片脸 */}
        <group ref={head} position={[0, 0.52, 0]}>
          {/* 颅底（侧/后可见皮肤） */}
          <mesh castShadow position={[0, 0, -0.02]}>
            <sphereGeometry args={[0.125, 28, 28]} />
            <meshStandardMaterial color={SKIN} roughness={0.55} />
          </mesh>
          {/* 发 */}
          <mesh position={[0, 0.05, -0.03]} castShadow>
            <sphereGeometry args={[0.135, 24, 24]} />
            <meshStandardMaterial color={HAIR} roughness={0.75} />
          </mesh>
          {/* 发髻 */}
          <mesh position={[0.02, 0.08, -0.1]} castShadow>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={HAIR} roughness={0.8} />
          </mesh>
          <PhotoFace speaking={speaking} playing={playing} />
        </group>

        {/* 左臂 */}
        <group ref={lArm} position={[-0.2, 0.28, 0]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.04, 0.16, 4, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.55} />
          </mesh>
          <group ref={lFore} position={[0, -0.26, 0]}>
            <mesh position={[0, -0.1, 0]} castShadow>
              <capsuleGeometry args={[0.035, 0.14, 4, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.55} />
            </mesh>
            {/* 手 */}
            <mesh position={[0, -0.2, 0.02]} castShadow>
              <sphereGeometry args={[0.038, 10, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.55} />
            </mesh>
          </group>
        </group>
        {/* 右臂 */}
        <group ref={rArm} position={[0.2, 0.28, 0]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.04, 0.16, 4, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.55} />
          </mesh>
          <group ref={rFore} position={[0, -0.26, 0]}>
            <mesh position={[0, -0.1, 0]} castShadow>
              <capsuleGeometry args={[0.035, 0.14, 4, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.2, 0.02]} castShadow>
              <sphereGeometry args={[0.038, 10, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.55} />
            </mesh>
          </group>
        </group>
      </group>

      {/* 腿 */}
      <group ref={lLeg} position={[-0.09, 0.72, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <capsuleGeometry args={[0.05, 0.36, 4, 10]} />
          <meshStandardMaterial color={DRESS} roughness={0.4} />
        </mesh>
      </group>
      <group ref={rLeg} position={[0.09, 0.72, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <capsuleGeometry args={[0.05, 0.36, 4, 10]} />
          <meshStandardMaterial color={DRESS} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/** 姿态 → 世界目标与朝向 */
export function goalForPose(pose: AvatarPose): HumanoidGoal {
  const pianoSeat: [number, number, number] = [1.15, 0, 0.55];
  const talkSpot: [number, number, number] = [0.15, 0, 1.55];
  const idleSpot: [number, number, number] = [-0.55, 0, 0.85];

  switch (pose) {
    case 'play_piano':
      return { pose, target: pianoSeat, faceYaw: -0.5 };
    case 'look_at_user':
    case 'speak':
      return { pose, target: talkSpot, faceYaw: 0, speaking: pose === 'speak' };
    case 'think':
      return { pose, target: talkSpot, faceYaw: 0.25 };
    case 'idle':
    default:
      return { pose, target: idleSpot, faceYaw: 0.15 };
  }
}
