import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RAMA — Evidence-First Real Estate',
    short_name: 'RAMA',
    description: "Dubai's most trusted, evidence-backed real estate platform.",
    start_url: '/en/discover',
    display: 'standalone',
    background_color: '#17211d',
    theme_color: '#b56f49',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
      }
    ],
  };
}
