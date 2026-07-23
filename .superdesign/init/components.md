# Shared UI Primitives

## Button (`apps/web/src/components/ui/button.tsx`)
```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-brand,#896548)] text-white hover:bg-[var(--color-brand-hover,#73533a)]",
        destructive: "bg-[var(--color-critical,#984d44)] text-white hover:bg-red-700",
        outline: "border border-[var(--color-border,#d9ddd8)] bg-white hover:bg-[var(--color-surface-subtle,#efeee9)] text-[var(--color-ink,#1e211f)]",
        secondary: "bg-[var(--color-surface-subtle,#efeee9)] text-[var(--color-ink,#1e211f)] hover:bg-[var(--color-border,#d9ddd8)]",
        ghost: "hover:bg-[var(--color-surface-subtle,#efeee9)] text-[var(--color-ink,#1e211f)]",
        link: "text-[var(--color-brand,#896548)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Card (`apps/web/src/components/ui/card.tsx`)
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border border-[var(--color-border,#d9ddd8)] bg-white text-[var(--color-ink,#1e211f)] shadow-sm", className)} {...props} />
))
```

## Input (`apps/web/src/components/ui/input.tsx`)
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => (
  <input type={type} className={cn("flex h-10 w-full rounded-md border border-[var(--color-border,#d9ddd8)] bg-white px-3 py-2 text-sm text-[var(--color-ink,#1e211f)] placeholder:text-[var(--color-muted,#6b726d)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand,#896548)]", className)} ref={ref} {...props} />
))
```

## Badge (`apps/web/src/components/ui/badge.tsx`)
```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold transition-colors", {
  variants: {
    variant: {
      default: "bg-[var(--color-brand,#896548)] text-white",
      secondary: "bg-[var(--color-surface-subtle,#efeee9)] text-[var(--color-ink,#1e211f)] border border-[var(--color-border,#d9ddd8)]",
      outline: "text-[var(--color-ink,#1e211f)] border border-[var(--color-border,#d9ddd8)]",
      positive: "bg-[var(--color-positive-soft,#e7ede9)] text-[var(--color-positive,#4f6b5c)] border border-[var(--color-positive,#4f6b5c)]/20",
      critical: "bg-[var(--color-critical-soft,#f5e7e5)] text-[var(--color-critical,#984d44)] border border-[var(--color-critical,#984d44)]/20",
    },
  },
})
```
