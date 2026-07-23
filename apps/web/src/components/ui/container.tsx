import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const containerVariants = cva(
  "mx-auto w-full px-6 sm:px-8 lg:px-12",
  {
    variants: {
      size: {
        narrow: "max-w-[640px]",   /* Forms, auth, single-column text */
        medium: "max-w-[900px]",   /* Checklists, articles, reading */
        wide: "max-w-[1200px]",    /* Most pages: landing, property detail */
        full: "max-w-[1400px]",    /* Discovery, comparison (needs more width) */
      },
    },
    defaultVariants: {
      size: "wide",
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export function Container({
  className,
  size,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(containerVariants({ size }), className)}
      {...props}
    />
  );
}
