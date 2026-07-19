import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@rama/contracts"],
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }
    ],
    localPatterns: [
      {
        pathname: "/images/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' https://iewfpyoxhxkmbwwcmavz.supabase.co https://*.supabase.co https://api.mapbox.com https://events.mapbox.com; img-src 'self' blob: data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-ancestors 'none';",
          }
        ],
      },
    ];
  },
  output: "standalone",
  turbopack: {},
};

// @ts-expect-error - next-pwa is not fully typed for Next.js 15
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
  publicExcludes: ['!noprecache/**/*']
});

export default withPWA(nextConfig);
