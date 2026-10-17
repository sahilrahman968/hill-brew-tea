"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, type RefObject } from "react";
import { useSectionParallax } from "@/hooks/useParallax";

type Edge = "start" | "end" | "center";
type ScrollOffset = `${Edge} ${Edge}`;

type ParallaxImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  /** Pixel travel of the image across the section's scroll progress. */
  travel?: number;
  scrollTarget?: RefObject<HTMLElement | null>;
  offset?: [ScrollOffset, ScrollOffset];
  className?: string;
  overlayClassName?: string;
};

/**
 * Full-bleed background that drifts relative to a section —
 * not the whole page — so it stays in sync with foreground copy.
 */
export default function ParallaxImage({
  src,
  alt,
  priority = false,
  travel = 100,
  scrollTarget,
  offset = ["start end", "end start"],
  className = "",
  overlayClassName = "",
}: ParallaxImageProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const target = scrollTarget ?? localRef;
  // Oversized layer absorbs the pixel travel so edges never flash empty.
  const y = useSectionParallax(target, [-travel, travel], offset);

  return (
    <div ref={localRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-x-0 -top-[25%] h-[150%] w-full will-change-transform"
        style={{ y }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          priority={priority}
          className="object-cover object-center"
        />
      </motion.div>
      {overlayClassName ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${overlayClassName}`}
        />
      ) : null}
    </div>
  );
}
