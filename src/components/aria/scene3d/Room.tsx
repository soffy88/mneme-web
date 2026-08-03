'use client';

/** 室内空间：地板、墙、窗光 */
export function Room() {
  return (
    <group>
      {/* 地板 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#3d3228" roughness={0.85} />
      </mesh>
      {/* 地毯 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0.01, 0.2]} receiveShadow>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
      </mesh>
      {/* 后墙 */}
      <mesh position={[0, 1.6, -3.2]} receiveShadow>
        <boxGeometry args={[12, 3.4, 0.12]} />
        <meshStandardMaterial color="#2a221c" roughness={0.9} />
      </mesh>
      {/* 左墙 */}
      <mesh position={[-4.5, 1.6, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3.4, 8]} />
        <meshStandardMaterial color="#2c241e" roughness={0.9} />
      </mesh>
      {/* 右墙 + 窗 */}
      <mesh position={[4.5, 1.6, 0]} receiveShadow>
        <boxGeometry args={[0.12, 3.4, 8]} />
        <meshStandardMaterial color="#2c241e" roughness={0.9} />
      </mesh>
      {/* 窗发光 */}
      <mesh position={[4.42, 1.7, -0.8]}>
        <planeGeometry args={[0.05, 1.6]} />
        <meshBasicMaterial color="#ffd9a0" />
      </mesh>
      <pointLight position={[4.2, 1.7, -0.8]} intensity={0.8} color="#ffcc88" distance={8} />
      {/* 落地灯 */}
      <mesh position={[-2.8, 0.9, -2.2]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 1.8, 8]} />
        <meshStandardMaterial color="#c9a66b" metalness={0.4} />
      </mesh>
      <mesh position={[-2.8, 1.85, -2.2]}>
        <coneGeometry args={[0.35, 0.4, 16]} />
        <meshStandardMaterial color="#f5e6c8" emissive="#f0d9a8" emissiveIntensity={0.35} />
      </mesh>
      <pointLight position={[-2.8, 1.7, -2.2]} intensity={0.55} color="#ffe0b0" distance={6} />
      {/* 天花暖光 */}
      <ambientLight intensity={0.28} color="#d4c4b0" />
      <directionalLight
        position={[2, 5, 2]}
        intensity={0.65}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </group>
  );
}
