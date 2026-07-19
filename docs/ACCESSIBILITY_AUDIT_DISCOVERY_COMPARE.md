# Discovery, shortlist and compare accessibility verification

Verified: 18 July 2026

## Scope

- `/en/discover` at 1440 × 1000, including shortlist and two-property comparison
- `/ar/discover` at 390 × 844
- filter form, result evidence states, save/compare controls, compare tray and differences table
- shadcn `Button`, `Input`, `Select`, `Checkbox`, `Card`, `Badge`, `Alert` and `Progress` primitives from preset `b2czZ8JLSS`

## Results

- Axe WCAG 2.0/2.1/2.2 A/AA violations: **0** in tested English and Arabic states
- document horizontal overflow: **none** at 390px
- Arabic root: `dir="rtl"`, `lang="ar"`; rendered Arabic text verified in-browser
- every input/select has a programmatic label
- evidence progress bars have accessible names containing their percentage
- compare checkboxes use property-card context and remain keyboard operable
- unknown evidence is textual and icon-supported, not color-only
- compare table exposes table, row, column-header, row-header and cell semantics
- compare tray is absent until the customer selects a property, avoiding persistent mobile obstruction
- forced-colors and reduced-motion adaptations are present

## Workflow and security checks

- a minimum-two-bedroom filter returned three records: two known matches plus the record with unknown bedroom evidence; the known one-bedroom record was excluded
- two sequential shortlist writes produced two saved controls and optimistic versions
- comparison refreshed through the same-origin BFF and rendered differing/unknown fields first
- browser mutation requests exposed no bearer, user or role headers
- unauthenticated direct search returned `401`; advisor access to a customer shortlist returned `403`
- shortlist mutation without same-origin request evidence returned `403`

Screen-reader verification with NVDA and VoiceOver, 200% zoom and grayscale review remain pilot-release gates.

