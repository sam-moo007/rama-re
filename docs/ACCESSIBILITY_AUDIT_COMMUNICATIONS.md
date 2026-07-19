# Protected communications accessibility verification

Verified: 18 July 2026

## Scope

- customer contact settings at `/en/settings/contact` (1440 x 1000) and `/ar/settings/contact` (390 x 844)
- private inbox at `/en/notifications` (1440 x 1000) and `/ar/notifications` (390 x 844)
- advisor message composer at `/en/advisor/cases` (1440 x 1000)
- contact save, verification, external-channel preference, structured advisor send and inbox delivery audit
- shadcn `Alert`, `Badge`, `Button`, `Card`, `Checkbox`, `Input` and `Select` controls from preset `b2czZ8JLSS`

## Results

- axe WCAG 2.0/2.1/2.2 A/AA violations: **0** in all five tested route/viewport states
- document horizontal overflow: **none** in all five states
- English route scope: `dir="ltr"`, `lang="en"`
- Arabic route scope: `dir="rtl"`, `lang="ar"`
- contact inputs have persistent programmatic labels and appropriate email, telephone and numeric input semantics
- verification and delivery states include textual labels and do not rely on color alone
- queued, retry-scheduled, delivered, in-app fallback and failed outcomes have bilingual textual labels
- preference checkboxes expose accessible names; the required in-app preference is visibly and semantically disabled
- structured-template selection has a programmatic label
- forced-colors and reduced-motion adaptations are present

## Privacy and authorization checks

- contact API and advisor delivery responses contained no plaintext contact, owner/advisor subjects, ciphertext or verification hashes
- customer and advisor page text contained no plaintext contact after save
- browser mutation requests exposed no bearer, RAMA user or RAMA role headers
- direct API access without identity returned `401`
- cross-role contact and advisor-message access returned `403`
- both customer and advisor BFF mutations without same-origin evidence returned `403`
- the advisor received only requested channel, delivered channel, status and reason

The repeatable check is `pnpm --filter @rama/web audit:communications` and uses the locally installed Chrome. Screen-reader verification with NVDA and VoiceOver, 200% zoom, real email/SMS providers and production identity-provider sessions remain pilot-release gates.
