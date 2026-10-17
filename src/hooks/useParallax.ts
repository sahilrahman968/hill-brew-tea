"use client";

import {
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { RefObject } from "react";

type Edge = "start" | "end" | "center";
type ScrollOffset = `${Edge} ${Edge}`;

/**
 * Section-relative parallax in pixels.
 * Maps how far a container travels through the viewport to a Y range,
 * so image and copy stay locked to the same scroll progress.
 */
export function useSectionParallax(
  target: RefObject<HTMLElement | null>,
  range: [number, number] = [-80, 80],
  offset: [ScrollOffset, ScrollOffset] = ["start end", "end start"]
): MotionValue<number> {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target,
    offset,
  });

  return useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : range
  );
}
