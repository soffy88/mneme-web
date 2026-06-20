import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@helios/blocks', '@helios/oui',
    '@react-pdf-viewer/core', '@react-pdf-viewer/default-layout', '@react-pdf-viewer/highlight',
  ],
  output: 'standalone',
  serverExternalPackages: [
    'three', '@react-three/fiber', '@react-three/drei',
    'pdfjs-dist', 'epubjs', 'react-reader',
  ],
};

export default nextConfig;
