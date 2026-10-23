import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@helios/blocks', '@helios/oui',
    '@react-pdf-viewer/core', '@react-pdf-viewer/default-layout', '@react-pdf-viewer/highlight',
  ],
  output: 'standalone',
  poweredByHeader: false,
  // react-reader 2.x imports epubjs' historical default export.  epubjs
  // 0.5 exposes the same browser bundle as named exports, so keep the
  // security-fixed dependency and provide a small server-owned adapter.
  turbopack: {
    resolveAlias: {
      epubjs: './src/lib/epubjs-compat.ts',
    },
  },
  serverExternalPackages: [
    'three', '@react-three/fiber', '@react-three/drei',
    'pdfjs-dist', 'epubjs', 'react-reader',
  ],
};

export default nextConfig;
