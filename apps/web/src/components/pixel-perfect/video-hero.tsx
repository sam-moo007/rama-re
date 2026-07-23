"use client";

import React from "react";
import Link from "next/link";
import { AnimatedHeading } from "./animated-heading";
import { FadeIn } from "./fade-in";

interface VideoHeroProps {
  videoUrl?: string;
  logoText?: string;
  navLinks?: Array<{ label: string; href: string }>;
  headingText?: string;
  subheadingText?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  tagText?: string;
  locale?: string;
}

export function VideoHero({
  videoUrl = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4",
  logoText = "VEX",
  navLinks = [
    { label: "Story", href: "#story" },
    { label: "Investing", href: "#investing" },
    { label: "Building", href: "#building" },
    { label: "Advisory", href: "#advisory" },
  ],
  headingText = "Shaping tomorrow\nwith vision and action.",
  subheadingText = "We back visionaries and craft ventures that define what comes next.",
  primaryCtaText = "Start a Chat",
  secondaryCtaText = "Explore Now",
  tagText = "Investing. Building. Advisory.",
  locale = "en",
}: VideoHeroProps) {
  return (
    <section className="relative w-full h-screen min-h-[680px] overflow-hidden bg-black text-white flex flex-col justify-between">
      {/* 1. Full-Screen Background Video — No overlays */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src={videoUrl}
      />

      {/* 2. Top Navbar */}
      <header className="relative z-10 w-full px-6 md:px-12 lg:px-16 pt-6">
        <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between w-full border border-white/20">
          {/* Left Logo */}
          <Link
            href={`/${locale}`}
            className="text-2xl font-semibold tracking-tight text-white hover:opacity-90 transition-opacity"
          >
            {logoText}
          </Link>

          {/* Center Links (Hidden on mobile, visible md+) */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right CTA */}
          <a
            href="#chat"
            className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {primaryCtaText}
          </a>
        </nav>
      </header>

      {/* 3. Hero Content (Pushed to bottom of viewport) */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pb-12 lg:pb-16">
        <div className="w-full lg:grid lg:grid-cols-2 lg:items-end gap-8">
          
          {/* Left Column: Main animated content */}
          <div className="space-y-4">
            {/* Animated Character-by-Character Heading */}
            <AnimatedHeading text={headingText} />

            {/* FadeIn Subheading */}
            <FadeIn delay={800} duration={1000}>
              <p className="text-base md:text-lg text-gray-300 mb-5 max-w-xl">
                {subheadingText}
              </p>
            </FadeIn>

            {/* FadeIn Action Buttons Row */}
            <FadeIn delay={1200} duration={1000}>
              <div className="flex flex-wrap gap-4 pt-1">
                <a
                  href="#chat"
                  className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                >
                  {primaryCtaText}
                </a>
                <a
                  href="#explore"
                  className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-all duration-300 cursor-pointer inline-flex items-center justify-center"
                >
                  {secondaryCtaText}
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Tag Card */}
          <div className="flex items-end justify-start lg:justify-end mt-6 lg:mt-0">
            <FadeIn delay={1400} duration={1000}>
              <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                <p className="text-lg md:text-xl lg:text-2xl font-light text-white tracking-wide">
                  {tagText}
                </p>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}
