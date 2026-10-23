'use client';

/**
 * VRM 身体 + 可选照片脸叠加（Hybrid B 升级）。
 * Phase 2: viseme 口型驱动 + MIDI 手指弹琴。
 * 加载失败时由父级回退到程序化 AriaHumanoid。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm';
import type { HumanoidGoal } from './AriaHumanoid';
import type { AriaDriveRefs } from './AriaWorld';
import type { VisemeCue } from '@/lib/aria-media';

const VRM_URL = '/aria/aria.vrm';

function bone(vrm: VRM, name: string): THREE.Object3D | null {
  return vrm.humanoid?.getNormalizedBoneNode(name as never) ?? null;
}

/** Look up the active viseme at a given time from the timeline. */
function visemeAt(cues: VisemeCue[], time: number): string {
  for (let i = cues.length - 1; i >= 0; i--) {
    const c = cues[i]!;
    if (time >= c.t && time < c.t + c.d) return c.v;
  }
  return 'sil';
}

/** VRM expression weights for each viseme (aa/ih/ou/ee/oh/sil). */
const VISEME_WEIGHTS: Record<string, { aa: number; ih: number; ou: number; ee: number; oh: number }> = {
  aa: { aa: 0.9, ih: 0, ou: 0, ee: 0, oh: 0 },
  ih: { aa: 0.15, ih: 0.6, ou: 0, ee: 0, oh: 0 },
  ou: { aa: 0, ih: 0, ou: 0.85, ee: 0, oh: 0.2 },
  ee: { aa: 0.1, ih: 0.2, ou: 0, ee: 0.8, oh: 0 },
  oh: { aa: 0.1, ih: 0, ou: 0.3, ee: 0, oh: 0.8 },
  sil: { aa: 0, ih: 0, ou: 0, ee: 0, oh: 0 },
};

/**
 * Map MIDI note (0-127) to finger bone names.
 * Piano range ~21-108; left hand covers low notes, right hand high.
 * Simple 5-finger assignment per hand based on note position in hand span.
 */
const FINGER_BONES_R = [
  'rightThumbProximal', 'rightIndexProximal', 'rightMiddleProximal',
  'rightRingProximal', 'rightLittleProximal',
] as const;
const FINGER_BONES_L = [
  'leftLittleProximal', 'leftRingProximal', 'leftMiddleProximal',
  'leftIndexProximal', 'leftThumbProximal',
] as const;

function fingerForNote(midi: number): { boneName: string; hand: 'L' | 'R' } | null {
  // Split: < 60 = left hand, >= 60 = right hand
  const hand = midi >= 60 ? 'R' : 'L';
  const bones = hand === 'R' ? FINGER_BONES_R : FINGER_BONES_L;
  // Map note within an octave to finger index (0-4)
  const posInOctave = midi % 12;
  const fingerIdx = Math.min(4, Math.floor(posInOctave / 2.4));
  return { boneName: bones[fingerIdx]!, hand };
}

function PhotoFaceOverlay({
  speaking,
  playing,
}: {
  speaking: boolean;
  playing: boolean;
}) {
  const front = useTexture('/aria/face-front.jpg');
  const play = useTexture('/aria/face-play.jpg');
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
    if (!mouth.current) return;
    const open = speaking ? 0.01 + Math.abs(Math.sin(t.current * 16)) * 0.016 : 0.002;
    mouth.current.scale.y = Math.max(0.2, open / 0.01);
    mouth.current.scale.x = speaking ? 1.2 : 0.5;
    (mouth.current.material as THREE.MeshBasicMaterial).opacity = speaking ? 0.32 : 0.04;
  });

  const map = playing ? play : front;

  return (
    <group position={[0, 0.02, 0.09]} scale={0.95}>
      <mesh>
        <circleGeometry args={[0.11, 40]} />
        <meshStandardMaterial map={map} roughness={0.5} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[0.2, 0.24]} />
        <meshStandardMaterial map={map} roughness={0.5} transparent opacity={0.95} />
      </mesh>
      <mesh ref={mouth} position={[0, -0.04, 0.01]}>
        <planeGeometry args={[0.045, 0.01]} />
        <meshBasicMaterial color="#4a2018" transparent opacity={0.04} depthWrite={false} />
      </mesh>
    </group>
  );
}

type Props = {
  goal: HumanoidGoal;
  /** 失败时通知父级回退 */
  onError?: (err: Error) => void;
  /** 在 VRM 头上叠照片脸（Hybrid B） */
  photoFace?: boolean;
  /** Phase 2: viseme 口型 + MIDI 手指驱动 */
  drive?: AriaDriveRefs;
};

export function AriaVRM({ goal, onError, photoFace = true, drive }: Props) {
  const root = useRef<THREE.Group>(null);
  const headAttach = useRef<THREE.Group>(null);
  const vrmRef = useRef<VRM | null>(null);
  const [loaded, setLoaded] = useState(false);
  const t = useRef(0);
  const pos = useRef(new THREE.Vector3(0, 0, 1.8));
  const yaw = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    let disposed = false;
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      VRM_URL,
      (gltf) => {
        if (disposed) return;
        const vrm = gltf.userData.vrm as VRM | undefined;
        if (!vrm) {
          onError?.(new Error('no_vrm_in_gltf'));
          return;
        }
        try {
          VRMUtils.removeUnnecessaryVertices(gltf.scene);
          // combineSkeletons may not exist on all versions — guard
          const utils = VRMUtils as unknown as {
            combineSkeletons?: (s: THREE.Object3D) => void;
            rotateVRM0?: (v: VRM) => void;
          };
          utils.combineSkeletons?.(gltf.scene);
          utils.rotateVRM0?.(vrm);
        } catch {
          /* non-fatal */
        }

        vrm.scene.traverse((obj) => {
          obj.castShadow = true;
          obj.receiveShadow = true;
          // 略提对比，室内暖光下更清晰
          const m = (obj as THREE.Mesh).material;
          if (m && 'roughness' in (m as THREE.MeshStandardMaterial)) {
            const sm = m as THREE.MeshStandardMaterial;
            sm.envMapIntensity = 0.6;
          }
        });

        // 统一身高约 1.55m 量级
        const box = new THREE.Box3().setFromObject(vrm.scene);
        const size = box.getSize(new THREE.Vector3());
        const scale = size.y > 0.01 ? 1.55 / size.y : 1;
        vrm.scene.scale.setScalar(scale);

        // 脚底贴地
        box.setFromObject(vrm.scene);
        vrm.scene.position.y = -box.min.y;

        if (root.current) {
          root.current.add(vrm.scene);
        }
        vrmRef.current = vrm;
        setLoaded(true);
      },
      undefined,
      (err) => {
        if (!disposed) onError?.(err instanceof Error ? err : new Error(String(err)));
      },
    );

    return () => {
      disposed = true;
      const vrm = vrmRef.current;
      if (vrm) {
        vrm.scene.removeFromParent();
        try {
          VRMUtils.deepDispose(vrm.scene);
        } catch {
          /* ignore */
        }
        vrmRef.current = null;
      }
    };
  }, [onError]);

  // 把头附挂点挂到 head bone
  useEffect(() => {
    if (!loaded || !vrmRef.current || !headAttach.current) return;
    const head = bone(vrmRef.current, 'head');
    if (head) {
      head.add(headAttach.current);
    }
    return () => {
      headAttach.current?.removeFromParent();
    };
  }, [loaded]);

  useFrame((_, dt) => {
    const vrm = vrmRef.current;
    if (!vrm || !root.current) return;
    t.current += dt;

    const playing = goal.pose === 'play_piano';
    const speaking = !!(goal.speaking || goal.pose === 'speak');
    const walking = !playing && pos.current.distanceTo(tmp.set(...goal.target)) > 0.08;

    if (walking) {
      tmp.set(...goal.target);
      const dir = tmp.clone().sub(pos.current);
      dir.y = 0;
      const dist = dir.length();
      if (dist > 0.001) {
        dir.normalize();
        pos.current.addScaledVector(dir, Math.min(dist, 1.35 * dt));
        yaw.current = Math.atan2(dir.x, dir.z);
      }
    } else {
      let d = goal.faceYaw - yaw.current;
      d = ((d + Math.PI) % (Math.PI * 2)) - Math.PI;
      yaw.current += d * Math.min(1, dt * 4);
      pos.current.lerp(tmp.set(...goal.target), Math.min(1, dt * 3));
    }

    const sitY = playing ? 0.38 : 0;
    const bob = walking ? Math.abs(Math.sin(t.current * 8)) * 0.03 : 0;
    root.current.position.set(pos.current.x, sitY + bob, pos.current.z);
    // VRM 默认常朝 -Z；与场景相机一致时用 yaw
    root.current.rotation.y = yaw.current + Math.PI;

    // —— 骨骼姿态 ——
    const lUpper = bone(vrm, 'leftUpperArm');
    const rUpper = bone(vrm, 'rightUpperArm');
    const lLower = bone(vrm, 'leftLowerArm');
    const rLower = bone(vrm, 'rightLowerArm');
    const lUpLeg = bone(vrm, 'leftUpperLeg');
    const rUpLeg = bone(vrm, 'rightUpperLeg');
    const lLowLeg = bone(vrm, 'leftLowerLeg');
    const rLowLeg = bone(vrm, 'rightLowerLeg');
    const spine = bone(vrm, 'spine');
    const chest = bone(vrm, 'chest');
    const head = bone(vrm, 'head');
    const hips = bone(vrm, 'hips');

    const lerpR = (node: THREE.Object3D | null, x: number, y: number, z: number, k = 8) => {
      if (!node) return;
      node.rotation.x = THREE.MathUtils.lerp(node.rotation.x, x, Math.min(1, dt * k));
      node.rotation.y = THREE.MathUtils.lerp(node.rotation.y, y, Math.min(1, dt * k));
      node.rotation.z = THREE.MathUtils.lerp(node.rotation.z, z, Math.min(1, dt * k));
    };

    if (walking) {
      const s = Math.sin(t.current * 8);
      lerpR(lUpLeg, s * 0.55, 0, 0);
      lerpR(rUpLeg, -s * 0.55, 0, 0);
      lerpR(lLowLeg, Math.max(0, -s) * 0.4, 0, 0);
      lerpR(rLowLeg, Math.max(0, s) * 0.4, 0, 0);
      lerpR(lUpper, -s * 0.4, 0, 1.1);
      lerpR(rUpper, s * 0.4, 0, -1.1);
      lerpR(spine, 0, 0, 0);
      lerpR(head, 0, 0, 0);
    } else if (playing) {
      // 坐姿 + 前倾 + 弹琴手
      lerpR(lUpLeg, -1.25, 0.1, 0.15);
      lerpR(rUpLeg, -1.25, -0.1, -0.15);
      lerpR(lLowLeg, 1.35, 0, 0);
      lerpR(rLowLeg, 1.35, 0, 0);
      const finger = Math.sin(t.current * 10);
      lerpR(lUpper, -0.85 + finger * 0.08, 0.2, 0.9);
      lerpR(rUpper, -0.8 + Math.sin(t.current * 10 + 1) * 0.1, -0.15, -0.9);
      lerpR(lLower, -0.9 + finger * 0.12, 0, 0);
      lerpR(rLower, -0.85 + Math.sin(t.current * 9 + 0.5) * 0.14, 0, 0);
      lerpR(spine, 0.25, 0.05, 0);
      lerpR(chest, 0.1, 0, 0);
      lerpR(head, 0.35, 0.12, 0);
      if (hips) hips.position.y = THREE.MathUtils.lerp(hips.position.y, -0.05, dt * 4);
    } else if (speaking || goal.pose === 'look_at_user') {
      lerpR(lUpLeg, 0, 0, 0.05);
      lerpR(rUpLeg, 0, 0, -0.05);
      lerpR(lLowLeg, 0, 0, 0);
      lerpR(rLowLeg, 0, 0, 0);
      lerpR(lUpper, -0.25, 0.1, 1.0);
      lerpR(rUpper, -0.4 + Math.sin(t.current * 5) * 0.08, -0.1, -1.05);
      lerpR(lLower, -0.35, 0, 0);
      lerpR(rLower, -0.5, 0, 0);
      lerpR(spine, 0.05, 0, 0);
      lerpR(head, -0.05 + Math.sin(t.current * 1.5) * 0.02, Math.sin(t.current * 1.1) * 0.04, 0);
    } else if (goal.pose === 'think') {
      lerpR(lUpper, -0.5, 0.3, 0.8);
      lerpR(rUpper, -0.9, -0.2, -0.6);
      lerpR(rLower, -1.2, 0, 0);
      lerpR(head, 0.15, -0.25, 0);
    } else {
      lerpR(lUpLeg, 0, 0, 0);
      lerpR(rUpLeg, 0, 0, 0);
      lerpR(lUpper, 0.05, 0, 1.05);
      lerpR(rUpper, 0.05, 0, -1.05);
      lerpR(spine, 0, 0, 0);
      lerpR(head, 0, 0, 0);
    }

    // ── 表情 / 口型（VRM Expression）── Phase 2: viseme 驱动 ──
    const em = vrm.expressionManager;
    if (em) {
      let weights = VISEME_WEIGHTS['sil']!;
      if (speaking && drive) {
        const audioT = drive.getAudioTime();
        if (audioT >= 0 && drive.visemesRef.current.length > 0) {
          const vis = visemeAt(drive.visemesRef.current, audioT);
          weights = VISEME_WEIGHTS[vis] ?? weights;
        } else {
          // Fallback: gentle sine if no viseme data (Web Speech path)
          const aa = 0.25 + Math.abs(Math.sin(t.current * 14)) * 0.45;
          weights = { aa, ih: 0, ou: aa * 0.2, ee: 0, oh: aa * 0.3 };
        }
      }
      // Smooth interpolation to target weights
      const k = Math.min(1, dt * 18);
      em.setValue('aa', THREE.MathUtils.lerp(em.getValue('aa') ?? 0, weights.aa, k));
      em.setValue('ih', THREE.MathUtils.lerp(em.getValue('ih') ?? 0, weights.ih, k));
      em.setValue('ou', THREE.MathUtils.lerp(em.getValue('ou') ?? 0, weights.ou, k));
      em.setValue('ee', THREE.MathUtils.lerp(em.getValue('ee') ?? 0, weights.ee, k));
      em.setValue('oh', THREE.MathUtils.lerp(em.getValue('oh') ?? 0, weights.oh, k));
      em.setValue('happy', speaking || goal.pose === 'look_at_user' ? 0.35 : playing ? 0.05 : 0.15);
      em.setValue('blink', Math.sin(t.current * 0.7) > 0.96 ? 1 : 0);
    }

    // ── Phase 2: MIDI 手指弹琴驱动 ──
    if (playing && drive) {
      const notes = drive.activeNotesRef.current;
      // Reset all fingers to relaxed curl
      for (const bn of [...FINGER_BONES_R, ...FINGER_BONES_L]) {
        const node = bone(vrm, bn);
        if (node) {
          node.rotation.x = THREE.MathUtils.lerp(node.rotation.x, -0.3, Math.min(1, dt * 10));
        }
      }
      // Drive active note fingers: press down (rotate x toward -1.2)
      for (const [midi] of notes) {
        const f = fingerForNote(midi);
        if (!f) continue;
        const node = bone(vrm, f.boneName);
        if (node) {
          node.rotation.x = THREE.MathUtils.lerp(node.rotation.x, -1.1, Math.min(1, dt * 22));
        }
      }
    }

    vrm.update(dt);
  });

  return (
    <group ref={root}>
      {/* 照片脸挂在 head bone（loaded 后 attach） */}
      <group ref={headAttach}>
        {loaded && photoFace && (
          <PhotoFaceOverlay
            speaking={!!(goal.speaking || goal.pose === 'speak')}
            playing={goal.pose === 'play_piano'}
          />
        )}
      </group>
    </group>
  );
}
