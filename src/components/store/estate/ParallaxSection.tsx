"use client";

import { motion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import ParallaxImage from "@/components/store/estate/ParallaxImage";
import { useSectionParallax } from "@/hooks/useParallax";

type Edge = "start" | "end" | "center";
type ScrollOffset = `${Edge} ${Edge}`;

type ParallaxSectionProps = {
  id?: string;
  src: string;
  alt: string;
  priority?: boolean;
  /** Background pixel travel across the section. */
  imageTravel?: number;
  /**
   * Foreground pixel travel — opposite direction, smaller distance.
   * Same scroll progress as the image keeps both layers in sync.
   */
  contentTravel?: number;
  offset?: [ScrollOffset, ScrollOffset];
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  children: ReactNode;
};

/**
 * Coordinated parallax scene: one scroll progress drives both layers.
 */
export default function ParallaxSection({
  id,
  src,
  alt,
  priority = false,
  imageTravel = 110,
  contentTravel = 28,
  offset = ["start end", "end start"],
  className = "",
  overlayClassName = "",
  contentClassName = "",
  children,
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentY = useSectionParallax(
    sectionRef,
    [contentTravel, -contentTravel],
    offset
  );

  return (
    <section id={id} ref={sectionRef} className={`relative overflow-hidden ${className}`}>
      <ParallaxImage
        src={src}
        alt={alt}
        priority={priority}
        travel={imageTravel}
        scrollTarget={sectionRef}
        offset={offset}
        overlayClassName={overlayClassName}
      />
      {/*
        Layout shell keeps section height stable. Transform lives on an inner
        layer so parallax never collapses min-height / flex sizing.
      */}
      <div className={`relative z-10 ${contentClassName}`}>
        <motion.div className="will-change-transform" style={{ y: contentY }}>
          {children}
        </motion.div>
      </div>
    </section>
  );
}
