# Theme & Design Tokens

## Framework & CSS Architecture
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Design System**: RAMA 2.0 Nordic Design System

## Global Tokens (`apps/web/src/app/tokens.css`)

```css
:root {
  /* RAMA 2.0 Nordic Color Palette */
  --limestone: #f6f5f1;
  --bone: #ffffff;
  --ink: #1e211f;
  --ink-soft: #6b726d;
  --copper: #896548;
  --copper-hover: #73533a;
  --copper-tint: #f4eee9;
  --sage: #4f6b5c;
  --sage-soft: #e7ede9;
  --line: #d9ddd8;

  --background: var(--limestone);
  --foreground: var(--ink);
  --card: var(--bone);
  --card-foreground: var(--ink);
  --primary: var(--copper);
  --primary-foreground: var(--bone);
  --secondary: #efeee9;
  --secondary-foreground: var(--ink);
  --muted: #efeee9;
  --muted-foreground: var(--ink-soft);
  --accent: var(--sage-soft);
  --accent-foreground: var(--sage);
  --destructive: #984d44;
  --destructive-foreground: var(--bone);
  --border: var(--line);

  /* Typography Scale */
  --font-size-caption: 0.75rem;   /* 12px */
  --font-size-small: 0.875rem;    /* 14px */
  --font-size-body: 1rem;         /* 16px */
  --font-size-body-lg: 1.125rem;  /* 18px */
  --font-size-h4: 1.125rem;      /* 18px */
  --font-size-h3: 1.25rem;       /* 20px */
  --font-size-h2: 1.75rem;       /* 28px */
  --font-size-h1: 2.25rem;       /* 36px */
  --font-size-display: clamp(1.875rem, 3.5vw, 2.75rem);

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius: var(--radius-md);

  /* Maximum Container Width */
  --max: 1280px;
}
```

## Global Styles (`apps/web/src/app/globals.css`)

```css
* { box-sizing: border-box; }
html { scroll-behavior: smooth; max-width: 100vw; overflow-x: hidden; }
body {
  margin: 0;
  max-width: 100vw;
  overflow-x: hidden;
  background: var(--limestone);
  color: var(--ink);
  font-family: var(--font-sans), "Noto Sans Arabic", "Segoe UI", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  text-rendering: optimizeLegibility;
}
```
