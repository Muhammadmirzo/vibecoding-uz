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
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async headers() {
    const securityHeaders = [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=()',
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org https://oauth.telegram.org",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: blob: https:",
          "connect-src 'self' https://api.telegram.org",
          "frame-src https://oauth.telegram.org https://telegram.org",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
    ];
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
