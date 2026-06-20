import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@helios/blocks', '@helios/oui'],
  // 容器化部署:standalone 产出自包含 server,镜像更小
  output: 'standalone',
  serverExternalPackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

export default nextConfig;
