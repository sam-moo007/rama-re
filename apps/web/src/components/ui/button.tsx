import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-base font-medium whitespace-nowrap transition-all duration-180 outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border-border bg-white text-ink hover:bg-muted hover:text-ink",
        secondary:
          "bg-secondary text-ink hover:bg-secondary/80",
        ghost:
          "hover:bg-muted hover:text-ink",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default:
          "min-h-[44px] h-11 gap-2 px-4 py-2 text-sm has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
        xs: "min-h-[32px] h-8 gap-1 rounded-md px-3 text-xs",
        sm: "min-h-[36px] h-9 gap-1.5 rounded-md px-3 text-sm",
        lg: "h-11 gap-2.5 px-8 text-base",
        icon: "size-10",
        "icon-xs": "size-8",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const isNative = nativeButton ?? (props.render ? false : undefined);

  return (
    <ButtonPrimitive
      data-slot="button"
      nativeButton={isNative}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
