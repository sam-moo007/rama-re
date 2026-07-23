"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function TextFade({
  children,
  className = "",
  staggerDelay = 0.05,
}: {
  children: string | ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const isString = typeof children === "string";

  // If it's a string, we split by word for staggered reveal
  if (isString) {
    const words = (children as string).split(" ");

    const container = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: staggerDelay, delayChildren: 0.1 },
      },
    };

    const item = {
      hidden: { opacity: 0, filter: "blur(4px)", y: 10 },
      show: {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: { type: "spring" as const, stiffness: 100, damping: 20 },
      },
    };

    return (
      <motion.span
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className={`inline-block ${className}`}
      >
        {words.map((word, i) => (
          <motion.span key={i} variants={item} className="inline-block mr-[0.25em] rtl:ml-[0.25em] rtl:mr-0 last:mr-0 last:rtl:ml-0">
            {word}
          </motion.span>
        ))}
      </motion.span>
    );
  }

  // If it's React nodes (like formatted text with <br/> and spans), we just fade the whole block
  return (
    <motion.span
      initial={{ opacity: 0, filter: "blur(6px)", y: 15 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  );
}
