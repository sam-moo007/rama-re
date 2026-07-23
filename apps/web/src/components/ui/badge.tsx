import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-none px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        confirmed: "bg-[var(--sage-tint,#e7ede9)] text-[var(--sage,#4f6b5c)] border border-[var(--sage,#4f6b5c)]/30",
        caution: "bg-[var(--ochre-tint,#f2eddf)] text-[var(--ochre,#866c38)] border border-[var(--ochre,#866c38)]/30",
        critical: "bg-[var(--risk-tint,#f5e7e5)] text-[var(--risk,#984d44)] border border-[var(--risk,#984d44)]/30",
        unknown: "bg-[var(--unknown-tint,#eef0ee)] text-[var(--unknown,#6b726d)] border border-[var(--line,#d9ddd8)]",
        neutral: "bg-white text-[var(--ink-soft,#343936)] border border-[var(--line,#d9ddd8)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
