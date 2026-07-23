# Key Page Dependency Trees

## / (Landing Page)
Entry: `apps/web/src/app/[locale]/page.tsx`
Dependencies:
- `apps/web/src/components/app-header.tsx`
  - `apps/web/src/components/ui/badge.tsx`
- `@rama/contracts` (catalogueFixtures)

## /homes (Verified Homes Discovery)
Entry: `apps/web/src/app/[locale]/homes/page.tsx`
Dependencies:
- `apps/web/src/features/discovery/components/discovery-experience.tsx`
  - `apps/web/src/components/app-header.tsx`
  - `apps/web/src/components/ui/card.tsx`
  - `apps/web/src/components/ui/button.tsx`
  - `apps/web/src/components/ui/input.tsx`
  - `apps/web/src/components/ui/badge.tsx`
  - `apps/web/src/features/search/search-map.tsx`

## /homes/[slug] (Property Decision Room)
Entry: `apps/web/src/app/[locale]/homes/[slug]/page.tsx`
Dependencies:
- `apps/web/src/features/property/components/property-decision-room.tsx`
  - `apps/web/src/features/property/components/property-hero.tsx`
  - `apps/web/src/features/property/components/trust-passport.tsx`
  - `apps/web/src/components/app-header.tsx`
  - `apps/web/src/components/ui/card.tsx`
  - `apps/web/src/components/ui/badge.tsx`
