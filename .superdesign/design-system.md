# RAMA Real-Estate Design System

## Product context

RAMA is a bilingual, evidence-led Dubai residential real-estate marketplace and advisory workflow for buying, renting, and investing. It is not an inventory-maximizing portal. The interface must help a user verify claims, understand total cost and trade-offs, inspect a property remotely, and continue through viewing, offer, handover, and ownership without losing the decision record.

Primary users are first-time resident buyers, remote/non-resident investors, independently buying women, families with coupled constraints, People of Determination and older buyers, sustainability/operating-cost buyers, off-plan buyers nearing handover, and Arabic-first decision makers.

The initial product centers on 150–300 evidence-complete properties in 6–8 Dubai communities. The signature experience is the property decision room: fit summary, Trust Passport, exact-unit tour, full-cost scenarios, risks/unknowns, and advisor continuation.

## Design principles

1. Calm utility: show the next decision and the evidence it needs; remove decorative metrics, repeated CTAs, countdowns, and artificial urgency.
2. Functional honesty: unknown, stale, modelled, representative, and sponsored states remain explicit.
3. Inspectability: every important badge or score opens to source, method, scope, dates, confidence, and expiry.
4. Democratic access: Arabic and English parity, WCAG 2.2 AA, low-bandwidth Tier 0 media, keyboard operation, reduced motion, transcripts, and no XR dependency.
5. Dubai-specific warmth: use architectural rhythm, shade, stone, courtyards, thresholds, native planting, and diffused light. Avoid snow/pine Scandinavian clichés and generic cultural neutrality.
6. Decision continuity: discovery, comparison, questions, tour viewpoints, scenarios, tasks, and advisor handoffs all contribute to one visible decision record.

## Visual direction

Embrace a **Nordic Minimalist** aesthetic, prioritizing clarity, extensive whitespace, and functional typography over decoration. The interface should feel like a premium architectural magazine—clean, breathable, and highly structured without feeling clinical.

Avoid heavy gradients, drop shadows, glassmorphism, neon colors, and cluttered layouts. Prefer stark flat surfaces, ultra-thin borders, strict grid alignment, large high-quality imagery, and a tightly controlled monochromatic palette with very subtle, desaturated accents.

## Color tokens

- Canvas / Arctic White: `#FFFFFF`
- Surface / Snow: `#F9F9F9`
- Primary text / Obsidian: `#111111`
- Secondary text / Graphite: `#555555`
- Muted text / Ash: `#888888`
- Divider / Silver: `#E5E5E5`
- Strong divider / Steel: `#CCCCCC`
- Verified / Mint: `#85A894`
- Verified tint / Frost: `#F2F7F4`
- Action / Sandstone: `#D4B895`
- Action hover / Deep Sand: `#BA9C7A`
- Action tint / Pale Sand: `#F9F6F0`
- Review / Pale Ochre: `#C9AD7F`
- Review tint / Oat: `#FBF8F3`
- Unknown / Slate: `#8E9598`
- Unknown tint / Cloud: `#F4F6F7`
- Risk / Terracotta: `#C47C6F`
- Risk tint / Blush: `#FCF5F3`
- Tour chrome / Charcoal: `#222222`
- Focus ring / Slate Blue: `#4A6C88`

Color never acts alone. Every verified, review, unknown, stale, sponsored, or risk state includes a text label and icon or pattern.

## Typography

Use a licensed Arabic-compatible pairing selected and tested together in production that feels clean, geometric, and modern. Until licensing is resolved:

- Editorial display: `Public Sans` or `Inter` (Geometric, clean), with `Noto Kufi Arabic` or `Noto Sans Arabic` as the Arabic counterpart.
- UI/body/data: `Inter`, with `Noto Sans Arabic` for Arabic.
- Technical metadata and financial numerals: the UI sans with tabular numerals; do not rely on a Latin-only monospace face.

Display headings are sharp, spacious, and decisive. Body text is at least 16px on web with extensive line-height (e.g., 1.6 to 1.8) for maximum breathability. Financial tables use tabular numerals and explicit currency.

Suggested scale:

- Display: 56/60 desktop, 40/44 tablet, 34/40 mobile
- H1: 44/50 desktop, 34/40 mobile
- H2: 32/40
- H3: 24/32
- Body large: 18/30
- Body: 16/26
- Small: 14/21
- Metadata: 12/18, medium weight, modest tracking only for short Latin labels

Maximum reading line is 68 characters.

## Spacing, shape, and elevation

- Base unit: 4px
- Primary rhythm: 8, 12, 16, 24, 32, 48, 64
- Compact evidence rows: 12–16px vertical padding
- Cards and drawers: 20–32px padding depending on viewport
- Corners: 6px compact controls, 8px cards, 12px large panels
- Prefer borders and surface changes to shadows
- If elevation is required for a modal or floating tray, use one quiet shadow only: `0 12px 40px rgba(23,33,29,.12)`

## Grid and responsive layout

- Desktop: 12 columns, 24px gutters, max content width 1440px
- Tablet: 6 columns, 20px gutters
- Mobile: 4 columns, 16px gutters
- Breakpoints must follow content, not device brands
- Use logical CSS properties and direction-aware layout
- Mirror icons only when they are semantically directional
- Keep evidence status and critical unknowns above conversion actions

The property page order is fixed: fit summary, evidence status, key facts, tour, costs, building/area, risks/unknowns, advisor. Price and CTA never outrank uncertainty.

## Motion

- Standard UI transitions: 120–220ms
- Spatial transitions: no more than 450ms
- Use meaningful ease-out curves; never animate urgency
- Honor `prefers-reduced-motion`
- No pulsing tour hotspots
- Preserve context during drawer, plan, scene, and guided-tour transitions

## Imagery and illustration

Photography uses natural light, corrected verticals, an honest lens, consistent white balance, and an explicit exact-unit/same-type/representative/illustrative label. Retouching is disclosed and source originals are retained.

Illustrations use precise architectural line work with a soft mineral wash and optional subtle paper grain. Subjects include thresholds, shade, courtyards, routes, plans, measurements, and evidence artifacts. Copper is reserved for focal evidence or action.

AI imagery is labelled illustrative and never blended with property evidence.

## Signature components

### Evidence badge

Contains state, source class, observed/retrieved date, freshness/expiry, and an open-details action. Aggregate completion is evidence coverage, never a property-quality or legal-status score.

### Property card

Contains exact/representative media label, price, fit reason, failed constraint when relevant, evidence completion, freshness, and sponsorship disclosure. Card actions support shortlist and compare without hiding uncertainty.

### Trust Passport drawer

Shows claim value, source, method, scope, observed date, retrieved date, valid-to date, verifier, confidence, superseded history, linked artifact, and correction action.

### Cost waterfall

Groups money at reservation, transaction, ownership, and exit. Every amount shows applicability, assumption/source, effective date, currency, and editable status. Scenario outputs distinguish deterministic calculation from explanation.

### Tour hotspot

Represents a question, claim, measurement, defect, access note, or unknown. It has a keyboard target and transcript counterpart and can attach the current viewpoint to a question.

### Risk callout

Shows the observed issue, potential impact, source, confidence, and next verification step. Never display an alarmist score without details.

### Compare tray

Locks user-selected criteria, shows differences first, exposes missing data, and supports privacy-safe sharing and comments.

### Recommendation rationale

States why the property fits, which constraints fail, what is verified or assumed, whether compensation affected visibility, and which inputs the user can change.

## Tour interface

Use dark spatial chrome only inside the tour. Controls collapse to preserve the scene. The evidence drawer remains a light reading surface. Provide Tier 0 stills, ordered room list, plan, transcript, and evidence drawer before loading panorama or 3D. Do not cover key evidence with CTA overlays.

## Content rules

- Use plain language and define regulated terms.
- Preserve numbers, dates, source context, and defined terms across Arabic/English.
- “Verified” always says by whom, when, against what, and within what scope.
- “Exact unit,” “same type,” “representative finish,” and “artist impression” are media-level labels.
- Modelled values show method and inputs.
- Stale evidence visibly degrades.
- Sponsored content is separated and labelled.
- AI explanations cite retrieved facts and never invent rates, fees, eligibility, returns, or dates.

## Accessibility and quality tests

Every screen must communicate hierarchy in grayscale, at 200% zoom, with keyboard-only navigation, reduced motion, Arabic copy expansion, and imagery replaced by descriptive placeholders. Touch targets are at least 24px, with 44px preferred for primary mobile controls. Focus is always visible. Forms expose errors programmatically and do not use placeholder-only labels.

## Key product pages and flows

- Bilingual global navigation: Buy, Rent, Off-plan, Neighbourhoods, Saved, Ask RAMA, Language
- Guided brief and readiness assessment
- Search/map and curated collections
- Property decision room and Trust Passport
- Tiered property tour
- Compare and scenario lab
- Questions, viewing, and offer readiness
- Tasks, documents, advisor, handover, ownership
- Partner inventory/evidence portal
- Advisor and evidence-operations consoles

