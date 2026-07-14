import React from "react";

/**
 * Gradient Dots (21st.dev) — a hexagonal dot field with coloured gradients panning
 * behind it and a slow hue cycle.
 *
 * Ported from the framer-motion original to pure CSS. The animation is only
 * background-position + hue-rotate, so it needs no JS and no ~50KB motion bundle on
 * the homepage (CLAUDE.md: keep the bundle light, target Lighthouse 95+). The visual
 * result is identical, and it now also honours prefers-reduced-motion.
 *
 * Layering matches the original: the dot mask sits ON TOP — it paints the background
 * colour everywhere except tiny circular holes — and the colour gradients pan beneath,
 * showing through as dots.
 */
export type GradientDotsProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Dot size (default: 8) */
  dotSize?: number;
  /** Spacing between dots (default: 10) */
  spacing?: number;
  /** Pan duration in seconds (default: 30) */
  duration?: number;
  /** Colour cycle duration in seconds (default: 6) */
  colorCycleDuration?: number;
  /** Background colour (default: 'var(--bg)') */
  backgroundColor?: string;
};

export function GradientDots({
  dotSize = 8,
  spacing = 10,
  duration = 30,
  colorCycleDuration = 6,
  backgroundColor = "var(--bg)",
  className = "",
  style,
  ...props
}: GradientDotsProps) {
  const hexSpacing = spacing * 1.732; // hexagonal row offset

  return (
    <div
      aria-hidden
      className={`qx-gdots ${className}`}
      style={
        {
          "--gd-bg": backgroundColor,
          "--gd-dot": `${dotSize}px`,
          "--gd-space": `${spacing}px`,
          "--gd-hex": `${hexSpacing}px`,
          "--gd-dur": `${duration}s`,
          "--gd-cycle": `${colorCycleDuration}s`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
