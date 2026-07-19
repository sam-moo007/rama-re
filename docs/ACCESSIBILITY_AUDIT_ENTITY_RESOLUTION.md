# Entity-resolution accessibility audit

Audit date: 18 July 2026  
Scope: `/en/operations/resolution` and `/ar/operations/resolution`  
Target: WCAG 2.2 AA for the bilingual web operator journey

## Result

- Automated accessibility score: 100/100 using the project scoring convention (zero detected violations)
- Automated scan: axe-core, WCAG 2.0/2.1/2.2 A and AA tags
- Viewports: 1440 × 1000 English and 390 × 844 Arabic/RTL
- Violations after remediation: 0
- Horizontal overflow: 0px at both tested widths
- Client/runtime errors: 0 after hydration

The first scan identified six serious color-contrast nodes in muted labels and selected queue metadata. Those labels were darkened from the muted token to the stronger secondary-ink token. The re-scan returned zero violations.

## Manual checks

- Logical keyboard order across brand/navigation, status filters, refresh and queue items
- Visible 3px focus indicator on every sampled focus target
- Buttons are native shadcn/Base UI button primitives and activate by keyboard
- One `h1`, ordered section headings, navigation landmark and main landmark
- Canonical-property and decision-reason controls have programmatic labels
- Errors use `role="alert"`; successful transitions use `role="status"`
- Status is communicated with localized text in addition to color
- Arabic content is scoped with `lang="ar"` and `dir="rtl"`
- Mobile content reflows to one column with no clipped source payload or form controls
- Reduced-motion and increased-contrast media preferences have explicit CSS handling

## Workflow verified

The browser selected a pending partner identity, entered a decision reason, matched it to `residence-1204`, observed the success live region, and confirmed the queue changed from Pending 1 / Matched 0 to Pending 0 / Matched 1 with work-item version 2.

## Remaining release evidence

Before a public release, repeat the journey with NVDA/Chrome and VoiceOver/Safari, verify 200% zoom and Windows High Contrast interactively, and run the same axe scan in CI. Automated scanning and semantic inspection do not replace an assistive-technology session with a user.
