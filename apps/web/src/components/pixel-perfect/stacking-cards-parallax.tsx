"use client";

/**
 * A scroll-driven stacking card parallax — sticky cards pin and scale down as later cards scroll up over them, building a layered depth stack.
 */

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

function findScroller(el: HTMLElement): HTMLElement | undefined {
  let node = el.parentElement;
  while (node) {
    if (node.hasAttribute("data-lenis-prevent")) return node;
    const oy = getComputedStyle(node).overflowY;
    if (
      (oy === "auto" || oy === "scroll") &&
      node.scrollHeight > node.clientHeight
    )
      return node;
    node = node.parentElement;
  }
  return undefined;
}

export type ParallaxCardData = {
  id: string | number;
  title: string;
  description: string;
  color: string;
  content?: ReactNode;
};

type CardProps = {
  i: number;
  title: string;
  description: string;
  color: string;
  content?: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
};

const Card = ({
  i,
  title,
  description,
  color,
  content,
  progress,
  range,
  targetScale,
}: CardProps) => {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div className="sticky top-0 flex h-screen items-center justify-center">
      <motion.div
        style={{
          backgroundColor: color,
          scale,
          top: `calc(-5vh + ${i * 25}px)`,
        }}
        className="relative flex min-h-[500px] lg:h-[500px] w-[90%] max-w-[1000px] flex-col border border-border shadow-sm p-10 lg:p-14 text-ink [transform-origin:top] overflow-y-auto"
      >
        <h2 className="m-0 text-center text-3xl font-serif font-light tracking-tight">{title}</h2>
        <div className="mt-10 flex h-full gap-8 lg:gap-12 flex-col lg:flex-row items-center lg:items-start">
          <div className="relative lg:top-[10%] lg:w-2/5 flex flex-col justify-center">
            <p className="text-[15px] leading-relaxed font-light text-ink/80">{description}</p>
          </div>

          <div className="relative h-full w-full lg:w-3/5 overflow-hidden bg-black/5 flex items-center justify-center">
            {content}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Stack = ({ scroller, cards }: { scroller: HTMLElement; cards: ParallaxCardData[] }) => {
  const scrollerRef = useRef<HTMLElement>(scroller);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: scrollerRef,
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={containerRef}>
      {cards.map((card, i) => {
        const targetScale = 1 - (cards.length - i) * 0.05;
        return (
          <Card
            key={card.id}
            i={i}
            {...card}
            progress={scrollYProgress}
            range={[i * (1 / cards.length), 1]}
            targetScale={targetScale}
          />
        );
      })}
    </div>
  );
};

export function StackingCardsParallax({ cards, className }: { cards: ParallaxCardData[]; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scroller, setScroller] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (rootRef.current) {
      // In Next.js app router, the document body or html is usually the scroller
      // But findScroller tries to find a specific overflow container.
      // If none found, fallback to the window/document.
      const found = findScroller(rootRef.current);
      if (found) {
        setScroller(found);
      } else {
        // Fallback to the body
        setScroller(document.body);
      }
    }
  }, []);

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      {scroller && <Stack scroller={scroller} cards={cards} />}
    </div>
  );
}
