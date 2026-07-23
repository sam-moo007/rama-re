# SEO & Redirect Mapping Strategy

**Context**: As part of the Nordic Pivot, we are changing several core routes to align with our plain-language terminology. To preserve search rankings and prevent broken links in existing marketing emails/saved bookmarks, we will implement **permanent 301 redirects** in Next.js middleware or `next.config.ts`.

## Route Mapping

| Old Route | New Route | HTTP Status | Notes |
|-----------|-----------|-------------|-------|
| `/discover` | `/homes` | 301 | Primary discovery entry point. |
| `/cost-engine` | `/costs` | 301 | Standalone calculator. |
| `/decision-room/:slug` | `/homes/:slug` | 301 | The property detail page. |
| `/brief` | `/plan` | 301 | User onboarding/requirements form. |

## Implementation in `next.config.ts`

```typescript
module.exports = {
  async redirects() {
    return [
      {
        source: '/discover',
        destination: '/homes',
        permanent: true,
      },
      {
        source: '/cost-engine',
        destination: '/costs',
        permanent: true,
      },
      {
        source: '/decision-room/:slug',
        destination: '/homes/:slug',
        permanent: true,
      },
      {
        source: '/brief',
        destination: '/plan',
        permanent: true,
      },
    ]
  },
}
```

## Maintenance Window
These redirects will be maintained for a minimum of **6 months** post-launch to allow search engines to re-index the site fully and for active user sessions to expire naturally.

## Meta & Schema Updates
- **Title Tags**: Replace "Discover properties" with "Find homes". Remove references to "TrustPassport" in meta descriptions.
- **OG Images**: Regenerate Open Graph images to use the new Nordic visual aesthetic (no gamified badges).
