# Advisor handoff accessibility verification

Verified: 18 July 2026

## Scope

- customer `/en/advisor` at 1440 x 1000 and `/ar/advisor` at 390 x 844
- advisor `/en/advisor/cases` at 1440 x 1000 and `/ar/advisor/cases` at 390 x 844
- consent amendment, case request, minimized advisor context, advisor claim, customer assignment state and consent withdrawal
- shadcn `Button`, `Select`, `Checkbox`, `Card`, `Badge` and `Alert` controls from preset `b2czZ8JLSS`

## Results

- axe WCAG 2.0/2.1/2.2 A/AA violations: **0** in all four tested route/viewport states
- document horizontal overflow: **none** in all four states
- English route scope: `dir="ltr"`, `lang="en"`
- Arabic route scope: `dir="rtl"`, `lang="ar"`
- property and topic selections use labelled native checkbox semantics
- select triggers have programmatic labels
- case queue selection exposes current state, and status/SLA information is textual rather than color-only
- minimized context is a labelled definition list with a textual privacy explanation and non-advice disclaimer
- initial eyebrow contrast was detected below 4.5:1 and corrected before the passing scan
- forced-colors and reduced-motion adaptations are present

## Workflow and security checks

- an explicit advisor-contact checkbox amended a submitted brief without reopening it
- the created case stored the exact brief and shortlist versions, an exact four-hour SLA and exact 180-day retention
- the privacy audit exercised request, claim and withdrawal-driven cancellation; close remains covered by service, controller and browser regression checks
- after closure, the customer can create a later handoff rather than being trapped on a historical case
- after withdrawal, the advisor queue contained zero cases and a stale context request returned `404`
- advisor queue/context payloads contained no owner subject, advisor subject, actor ID, household composition, available-cash or comfortable-payment fields
- browser mutation requests exposed no bearer, RAMA user or RAMA role headers
- mutation without same-origin evidence returned `403`
- direct advisor access without identity returned `401`
- customer access to the advisor queue and advisor access to customer cases returned `403`

The repeatable check is `pnpm --filter @rama/web audit:advisor` and uses the locally installed Chrome. Screen-reader verification with NVDA and VoiceOver, 200% zoom and production identity-provider sessions remain pilot-release gates.
