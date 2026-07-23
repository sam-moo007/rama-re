"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  charDelay?: number; // 30ms
  initialDelay?: number; // 200ms
  duration?: number; // 500ms
}

export function AnimatedHeading({
  text,
  className,
  charDelay = 30,
  initialDelay = 200,
  duration = 500,
}: AnimatedHeadingProps) {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [initialDelay]);

  // Split text by \n into lines
  const lines = text.split("\n");

  return (
    <h1
      className={cn(
        "text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4 text-white leading-tight",
        className
      )}
      style={{ letterSpacing: "-0.04em" }}
    >
      {lines.map((line, lineIndex) => {
        const lineLength = line.length;
        return (
          <React.Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            <span className="inline-block">
              {line.split("").map((char, charIndex) => {
                const calculatedDelay =
                  lineIndex * lineLength * charDelay + charIndex * charDelay;

                return (
                  <span
                    key={charIndex}
                    className="inline-block transition-all ease-out"
                    style={{
                      opacity: isAnimated ? 1 : 0,
                      transform: isAnimated
                        ? "translateX(0px)"
                        : "translateX(-18px)",
                      transitionDuration: `${duration}ms`,
                      transitionDelay: `${calculatedDelay}ms`,
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                );
              })}
            </span>
          </React.Fragment>
        );
      })}
    </h1>
  );
}
