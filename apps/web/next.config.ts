import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@rama/contracts"],
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }
    ],
    localPatterns: [
      {
        pathname: "/**",
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
  async redirects() {
    return [
      {
        source: '/:locale(en|ar)/discover',
        destination: '/:locale/homes',
        permanent: true,
      },
      {
        source: '/discover',
        destination: '/en/homes',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/cost-engine',
        destination: '/:locale/costs',
        permanent: true,
      },
      {
        source: '/cost-engine',
        destination: '/en/costs',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/decision-room/:slug',
        destination: '/:locale/homes/:slug',
        permanent: true,
      },
      {
        source: '/decision-room/:slug',
        destination: '/en/homes/:slug',
        permanent: true,
      },
      {
        source: '/:locale(en|ar)/brief',
        destination: '/:locale/plan',
        permanent: true,
      },
      {
        source: '/brief',
        destination: '/en/plan',
        permanent: true,
      },
    ];
  },
  output: "standalone",
  turbopack: {},
};

// @ts-expect-error - next-pwa is not fully typed for Next.js 15
import withPWAInit from "next-pwa";
// @ts-expect-error - cache types missing
import defaultCache from "next-pwa/cache";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
  publicExcludes: ['!noprecache/**/*'],
  runtimeCaching: [
    {
      urlPattern: /^\/api\//,
      handler: 'NetworkOnly',
    },
    ...defaultCache.filter((c: any) => c.options?.cacheName !== "apis" && c.options?.cacheName !== "others")
  ],
});

export default withPWA(nextConfig);
