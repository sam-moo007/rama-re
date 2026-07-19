# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> F1: Accessibility >> Tier 1: Core Accessibility Tests >> 1. Home page should not have any automatically detectable accessibility issues
- Location: e2e\accessibility.spec.ts:6:9

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 58

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#eef0eb",
+               "contrastRatio": 4.19,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#6c746f",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 4.19 (foreground color: #6c746f, background color: #eef0eb, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"discoverApp\" dir=\"ltr\" lang=\"en\">",
+                 "target": Array [
+                   ".discoverApp",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 4.19 (foreground color: #6c746f, background color: #eef0eb, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-sm text-muted-foreground\">rama.catalogue.phase1.v2</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-sm.text-muted-foreground",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to discovery results" [ref=e3] [cursor=pointer]:
      - /url: "#results"
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "RAMA" [ref=e6] [cursor=pointer]:
          - /url: /en/discover
          - generic [ref=e7]: R
          - text: RAMA
        - generic [ref=e8]:
          - img [ref=e9]
          - text: Private discovery workspace
        - navigation "Private discovery workspace" [ref=e13]:
          - link "Household brief" [ref=e14] [cursor=pointer]:
            - /url: /en/brief
          - link "Advisor handoff" [ref=e15] [cursor=pointer]:
            - /url: /en/advisor
          - link "العربية" [ref=e16] [cursor=pointer]:
            - /url: /ar/discover
    - main [ref=e17]:
      - region "Discover homes without filtering unknowns out of sight." [ref=e18]:
        - generic [ref=e19]:
          - paragraph [ref=e20]: RAMA / DISCOVER
          - heading "Discover homes without filtering unknowns out of sight." [level=1] [ref=e21]
        - generic [ref=e22]:
          - paragraph [ref=e23]: Results use your latest saved brief, then show exactly where evidence matches, needs review, or is unavailable.
          - generic [ref=e24]:
            - img [ref=e25]
            - text: Fit is decision support—not a property-quality score or investment recommendation.
      - generic [ref=e27]:
        - generic [ref=e28]:
          - img [ref=e29]
          - generic [ref=e30]: Search and filters
        - generic [ref=e32]:
          - generic [ref=e33]:
            - generic [ref=e34]: Property or community
            - textbox "Property or community" [ref=e35]
          - generic [ref=e36]:
            - generic [ref=e37]: Community
            - combobox "Community Any community" [ref=e38]:
              - generic [ref=e39]: Any community
              - img: ▼
            - textbox [ref=e40]: all
          - generic [ref=e41]:
            - generic [ref=e42]: Travel destination
            - combobox "Travel destination No travel-time filter" [ref=e43]:
              - generic [ref=e44]: No travel-time filter
              - img: ▼
            - textbox [ref=e45]: all
          - generic [ref=e46]:
            - generic [ref=e47]: Travel mode
            - combobox "Travel mode Drive" [disabled] [ref=e48]:
              - generic [ref=e49]: Drive
              - img: ▼
            - textbox [disabled] [ref=e50]: drive
          - generic [ref=e51]:
            - generic [ref=e52]: Maximum travel time (minutes)
            - spinbutton "Maximum travel time (minutes)" [disabled]
          - generic [ref=e53]:
            - generic [ref=e54]: Infrastructure evidence
            - combobox "Infrastructure evidence Any evidence state" [disabled] [ref=e55]:
              - generic [ref=e56]: Any evidence state
              - img: ▼
            - textbox [disabled] [ref=e57]: all
          - generic [ref=e58]:
            - generic [ref=e59]: Minimum price (AED)
            - spinbutton "Minimum price (AED)" [ref=e60]
          - generic [ref=e61]:
            - generic [ref=e62]: Maximum price (AED)
            - spinbutton "Maximum price (AED)" [ref=e63]
          - generic [ref=e64]:
            - generic [ref=e65]: Minimum bedrooms
            - combobox "Minimum bedrooms Any bedroom count" [ref=e66]:
              - generic [ref=e67]: Any bedroom count
              - img: ▼
            - textbox [ref=e68]: all
          - generic [ref=e69]:
            - generic [ref=e70]: Tenure
            - combobox "Tenure Any tenure" [ref=e71]:
              - generic [ref=e72]: Any tenure
              - img: ▼
            - textbox [ref=e73]: all
          - generic [ref=e74]:
            - generic [ref=e75]: Minimum evidence coverage
            - combobox "Minimum evidence coverage Any coverage" [ref=e76]:
              - generic [ref=e77]: Any coverage
              - img: ▼
            - textbox [ref=e78]: all
          - generic [ref=e79]:
            - generic [ref=e80]: Evidence freshness
            - combobox "Evidence freshness Any freshness" [ref=e81]:
              - generic [ref=e82]: Any freshness
              - img: ▼
            - textbox [ref=e83]: all
          - generic [ref=e84]:
            - generic [ref=e85]: Sort results
            - combobox "Sort results Best brief fit" [ref=e86]:
              - generic [ref=e87]: Best brief fit
              - img: ▼
            - textbox [ref=e88]: fit_desc
          - generic [ref=e89]:
            - button "Apply filters" [ref=e90]:
              - img
              - text: Apply filters
            - button "Reset" [ref=e91]:
              - img
              - text: Reset
      - region "0 homes in the current result set" [ref=e92]:
        - generic [ref=e93]:
          - generic [ref=e94]:
            - paragraph [ref=e95]: RAMA / MATCH SET
            - heading "0 homes in the current result set" [level=2] [ref=e96]
          - generic [ref=e97]:
            - generic [ref=e98]:
              - button "List" [ref=e99]:
                - img
                - text: List
              - button "Map" [ref=e100]:
                - img
                - text: Map
            - generic [ref=e101]:
              - generic [ref=e102]: No brief applied
              - generic [ref=e103]: rama.catalogue.phase1.v2
        - alert [ref=e104]:
          - img [ref=e105]
          - generic [ref=e108]: No known matches
          - generic [ref=e109]: Widen a known filter. RAMA never converts unavailable evidence into a confirmed absence.
  - button "Open Next.js Dev Tools" [ref=e115] [cursor=pointer]:
    - img [ref=e116]
  - alert [ref=e119]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | 
  4  | test.describe('F1: Accessibility', () => {
  5  |   test.describe('Tier 1: Core Accessibility Tests', () => {
  6  |     test('1. Home page should not have any automatically detectable accessibility issues', async ({ page }) => {
  7  |       await page.goto('/en/discover');
  8  |       const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
> 9  |       expect(accessibilityScanResults.violations).toEqual([]);
     |                                                   ^ Error: expect(received).toEqual(expected) // deep equality
  10 |     });
  11 | 
  12 |     test('2. Property details page should be accessible', async ({ page }) => {
  13 |       await page.goto('/en/property/residence-1204');
  14 |       const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  15 |       expect(accessibilityScanResults.violations).toEqual([]);
  16 |     });
  17 | 
  18 |     test('3. Panorama viewer should be accessible', async ({ page }) => {
  19 |       await page.goto('/en/property/residence-1204/panorama');
  20 |       const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  21 |       expect(accessibilityScanResults.violations).toEqual([]);
  22 |     });
  23 | 
  24 |     test('4. Commute routing widget should be accessible', async ({ page }) => {
  25 |       await page.goto('/en/property/residence-1204?tab=commute');
  26 |       const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  27 |       expect(accessibilityScanResults.violations).toEqual([]);
  28 |     });
  29 | 
  30 |     test('5. DLD transaction table should be accessible', async ({ page }) => {
  31 |       await page.goto('/en/property/residence-1204?tab=dld');
  32 |       const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  33 |       expect(accessibilityScanResults.violations).toEqual([]);
  34 |     });
  35 |   });
  36 | 
  37 |   test.describe('Tier 2: Boundary/Edge Accessibility Tests', () => {
  38 |     test('1. Extremely large DLD table should remain accessible', async ({ page }) => {
  39 |       await page.goto('/en/property/residence-1204?tab=dld&size=large');
  40 |       const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  41 |       expect(accessibilityScanResults.violations).toEqual([]);
  42 |     });
  43 | 
  44 |     test('2. Empty state (no data) for commute routing should be accessible', async ({ page }) => {
  45 |       await page.goto('/en/property/invalid?tab=commute');
  46 |       const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  47 |       expect(accessibilityScanResults.violations).toEqual([]);
  48 |     });
  49 | 
  50 |     test('3. Mobile viewport accessibility', async ({ page }) => {
  51 |       await page.setViewportSize({ width: 375, height: 667 });
  52 |       await page.goto('/en/discover');
  53 |       const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  54 |       expect(accessibilityScanResults.violations).toEqual([]);
  55 |     });
  56 | 
  57 |     test('4. Focus trapping on modal dialogues', async ({ page }) => {
  58 |       await page.goto('/en/property/residence-1204');
  59 |       try {
  60 |         await page.click('text="Contact Agent"', { timeout: 2000 });
  61 |         // Wait for modal
  62 |         await expect(page.locator('.modal')).toBeVisible({ timeout: 2000 });
  63 |       } catch (e) {
  64 |         // Ignore if modal not implemented yet
  65 |       }
  66 |       const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  67 |       expect(accessibilityScanResults.violations).toEqual([]);
  68 |     });
  69 | 
  70 |     test('5. Form validation error states should be accessible', async ({ page }) => {
  71 |       await page.goto('/en/property/residence-1204');
  72 |       // We wrap these inside a try-catch to prevent a failing element check from breaking a11y tests,
  73 |       // since the primary goal is a11y checking.
  74 |       try {
  75 |         await page.click('text="Contact Agent"');
  76 |         await page.click('text="Submit"');
  77 |         await expect(page.locator('.error-message')).toBeVisible({ timeout: 2000 });
  78 |       } catch (e) {
  79 |         // Ignore if modal or form is not implemented yet in the mock UI
  80 |       }
  81 |       const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  82 |       expect(accessibilityScanResults.violations).toEqual([]);
  83 |     });
  84 |   });
  85 | });
  86 | 
```