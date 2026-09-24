/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'academy.mirzo.uz' },
      { protocol: 'https', hostname: 'chatla.uz' },
      { protocol: 'https', hostname: 'edubaza.uz' },
      { protocol: 'https', hostname: 'fastform.uz' },
      { protocol: 'https', hostname: 'imkonday.uz' },
      { protocol: 'https', hostname: 'legalbot.uz' },
      { protocol: 'https', hostname: 'shopspeed.uz' },
      { protocol: 'https', hostname: 'viberesume.uz' },
      { protocol: 'https', hostname: '*.vercel.app' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      {
        source: '/icons/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
  // Security headers (Content-Security-Policy, X-Frame-Options, Strict-Transport-Security) and nonce-based CSP are applied centrally in middleware.
};

export default nextConfig;
