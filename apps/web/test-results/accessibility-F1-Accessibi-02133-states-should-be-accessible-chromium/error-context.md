# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> F1: Accessibility >> Tier 2: Boundary/Edge Accessibility Tests >> 5. Form validation error states should be accessible
- Location: e2e\accessibility.spec.ts:70:9

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e6] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e7]:
      - img [ref=e8]
    - generic [ref=e11]:
      - button "Open issues overlay" [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: "0"
          - generic [ref=e15]: "1"
        - generic [ref=e16]: Issue
      - button "Collapse issues badge" [ref=e17]:
        - img [ref=e18]
  - main [ref=e20]:
    - paragraph [ref=e21]: RAMA / 404
    - heading "That decision record is not available." [level=1] [ref=e22]
    - paragraph [ref=e23]: The property may have expired, changed identifier, or not been published.
    - link "Open the sample property" [ref=e24] [cursor=pointer]:
      - /url: /en/properties/residence-1204
  - alert [ref=e25]
```