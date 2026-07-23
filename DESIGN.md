# Design System

## Visual System

### Colors

- `--color-canvas`: `#FAF8F5` (Warm limestone canvas background)
- `--color-surface`: `#FFFFFF` (Clean surface background for cards and dialogs)
- `--color-surface-subtle`: `#F5F2ED` (Subtle secondary container fill)
- `--color-ink`: `#1A1A1A` (Primary typography and high-contrast headings)
- `--color-text`: `#3D3D3D` (Body text color hitting >=4.5:1 contrast)
- `--color-muted`: `#8A8279` (Caption and secondary metadata text)
- `--color-border`: `#E8E2D9` (Restrained structural dividers)

#### Brand Palette
- `--color-brand`: `#C4896B` (Copper primary brand tone)
- `--color-brand-hover`: `#B37A5D` (Dark copper hover state)
- `--color-brand-soft`: `#F0EBE3` (Soft copper background tint)

#### Semantic Status Palette
- `--color-positive`: `#7A9B7E` (Sage green for verified DLD data and low risk)
- `--color-positive-soft`: `#EEF2F0` (Soft sage background fill)
- `--color-caution`: `#8A7036` (Ochre for pending verification or caution)
- `--color-caution-soft`: `#F7F4EC` (Soft ochre background fill)
- `--color-critical`: `#8F3A2F` (Terracotta red for critical warnings and risk)
- `--color-critical-soft`: `#F9EBDF` (Soft terracotta background fill)

### Typography

- Primary font: Inter, sans-serif
- Headings font: Inter, sans-serif
- Type Scale:
  - Caption: `0.75rem` / 12px
  - Small: `0.875rem` / 14px
  - Body: `1rem` / 16px
  - Body Large / H4: `1.125rem` / 18px
  - H3: `1.25rem` / 20px
  - H2: `1.75rem` / 28px
  - H1: `2.25rem` / 36px
  - Display: `clamp(1.875rem, 3.5vw, 2.75rem)`
- Tracking: Heading tracking floor `-0.02em` to `-0.03em`. Body tracking normal.

### Radii Scale

- Small (`--radius-sm`): `6px` (tags, small badges)
- Medium (`--radius-md`): `8px` (inputs, buttons, cards)
- Large (`--radius-lg`): `12px` (modals, hero containers)

### Elevation & Shadows

- `--shadow-subtle`: `0 4px 16px rgba(60, 50, 40, 0.04)`
- `--shadow-floating`: `0 8px 32px rgba(60, 50, 40, 0.06)`

### Design System Rules

- Touch Targets: Control elements (buttons, inputs) must maintain a minimum height of 44px (`--control-sm`).
- Border & Shadow: Never pair 1px solid borders with heavy drop shadows (>16px blur). Use crisp 1px borders or subtle shadows, not both.
- Card Hierarchy: Avoid nested card containers. Flatten layout using clean dividers or subtle surface shifts.
- Motion: Intentional transitions using `180ms cubic-bezier(0.2, 0, 0, 1)`. Always respect `@media (prefers-reduced-motion: reduce)`.
