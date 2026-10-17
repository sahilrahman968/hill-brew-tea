"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const LEAF_W = 36;
const LEAF_H = 52;
const EDGE_PAD = 48;
const IDLE_HIDE_MS = 900;
const EDGE_OFFSET = 2;

export default function ScrollbarOverlay() {
  const pathname = usePathname();
  const isAdminPanel =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  const railRef = useRef<HTMLDivElement>(null);
  const mistLayerRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const facingRef = useRef<HTMLDivElement>(null);
  const swayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdminPanel) return;

    const rail = railRef.current;
    const mistLayer = mistLayerRef.current;
    const leaf = leafRef.current;
    const facing = facingRef.current;
    const sway = swayRef.current;
    if (!rail || !mistLayer || !leaf || !facing || !sway) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let lastScroll = window.scrollY;
    let lastTime = performance.now();
    let posY = EDGE_PAD;
    let velocity = 0;
    let lean = 0;
    let bouncePhase = 0;
    let direction = 1;
    let lastMistAt = 0;
    let hideAt = 0;
    let visible = false;

    const ease = (dt: number, tau: number) => 1 - Math.exp(-dt / tau);
    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const spawnMist = (centerY: number, dir: number, intensity: number) => {
      if (mistLayer.childElementCount > 48) return;
      const puff = document.createElement("span");
      const size = rand(6, 12) + intensity * 0.12;
      puff.className = "tea-mist";
      puff.style.width = `${size}px`;
      puff.style.height = `${size}px`;
      puff.style.left = `${36 - size / 2 + rand(-4, 4)}px`;
      puff.style.top = `${centerY - dir * 18 - size / 2 + rand(-4, 4)}px`;
      puff.style.borderRadius = `${rand(40, 60)}% ${rand(40, 58)}% ${rand(45, 62)}% ${rand(
        38,
        55
      )}% / ${rand(42, 58)}% ${rand(45, 62)}% ${rand(40, 55)}% ${rand(45, 60)}%`;
      puff.style.setProperty("--dx", `${rand(-12, -36)}px`);
      puff.style.setProperty("--dy", `${-dir * rand(8, 28)}px`);
      puff.style.setProperty("--s", `${rand(1.6, 2.6)}`);
      puff.style.setProperty("--r", `${rand(-40, 40)}deg`);
      puff.style.setProperty("--o", `${rand(0.2, 0.38)}`);
      puff.style.animationDuration = `${rand(900, 1600)}ms`;
      puff.addEventListener("animationend", () => puff.remove());
      mistLayer.appendChild(puff);
    };

    const spawnMistTrail = (centerY: number, dir: number, intensity: number) => {
      const count = 2 + Math.round(Math.min(intensity, 36) / 18);
      for (let i = 0; i < count; i += 1) spawnMist(centerY, dir, intensity);
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);

      const dt = Math.min(0.08, Math.max(0.001, (time - lastTime) / 1000));
      lastTime = time;

      const scrollY = window.scrollY;
      const delta = scrollY - lastScroll;
      lastScroll = scrollY;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll < 40) {
        if (visible) {
          visible = false;
          rail.style.opacity = "0";
        }
        return;
      }

      velocity += (delta / dt - velocity) * ease(dt, 0.07);
      const absVelocity = Math.abs(velocity);
      const intensity = Math.min(absVelocity / 60, 40);

      if (Math.abs(delta) > 0.4) {
        hideAt = time + IDLE_HIDE_MS;
        if (!visible) {
          visible = true;
          rail.style.opacity = "1";
        }
      } else if (visible && time > hideAt) {
        visible = false;
        rail.style.opacity = "0";
      }

      if (velocity > 150) direction = 1;
      else if (velocity < -150) direction = -1;

      const travel = window.innerHeight - EDGE_PAD * 2;
      const targetY = EDGE_PAD + (scrollY / maxScroll) * travel;
      posY += (targetY - posY) * ease(dt, 0.055);
      leaf.style.transform = `translate3d(0, ${posY.toFixed(2)}px, 0)`;
      facing.style.transform =
        direction === 1 ? "rotate(0deg)" : "rotate(180deg)";

      if (reduceMotion) return;

      const leanTarget = Math.max(-10, Math.min(10, -velocity * 0.008));
      lean += (leanTarget - lean) * ease(dt, 0.12);
      bouncePhase += dt * (5 + absVelocity * 0.004);
      const bounce = Math.sin(bouncePhase) * Math.min(1.4, absVelocity * 0.001);
      sway.style.transform = `translateX(${bounce.toFixed(2)}px) rotate(${lean.toFixed(2)}deg)`;

      if (absVelocity > 60 && time - lastMistAt > Math.max(32, 110 - intensity * 2)) {
        lastMistAt = time;
        spawnMistTrail(posY, direction, intensity);
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isAdminPanel]);

  if (isAdminPanel) return null;

  return (
    <div ref={railRef} className="tea-rail" aria-hidden="true">
      <div ref={mistLayerRef} className="tea-mist-layer" />
      <div
        ref={leafRef}
        style={{
          position: "absolute",
          left: `calc(50% + ${EDGE_OFFSET}px)`,
          top: 0,
          width: LEAF_W,
          height: LEAF_H,
          marginLeft: -LEAF_W / 2,
          marginTop: -LEAF_H / 2,
        }}
      >
        <div
          ref={facingRef}
          style={{
            width: "100%",
            height: "100%",
            transition: "transform 320ms cubic-bezier(.4,0,.2,1)",
          }}
        >
          <div ref={swayRef} style={{ width: "100%", height: "100%" }}>
            <svg viewBox="0 0 36 52" width={LEAF_W} height={LEAF_H}>
              <defs>
                <linearGradient id="tea-leaf-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7a9e6e" />
                  <stop offset="45%" stopColor="#4f7348" />
                  <stop offset="100%" stopColor="#2f4a32" />
                </linearGradient>
                <linearGradient id="tea-leaf-edge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a227" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#8f7318" stopOpacity="0.25" />
                </linearGradient>
                <radialGradient id="tea-leaf-gloss" cx="32%" cy="28%" r="55%">
                  <stop offset="0%" stopColor="#d4e0c8" stopOpacity="0.35" />
                  <stop offset="55%" stopColor="#d4e0c8" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#d4e0c8" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Soft brass glow behind the leaf */}
              <ellipse
                className="tea-leaf-glow"
                cx="18"
                cy="26"
                rx="14"
                ry="20"
                fill="var(--primary)"
                opacity="0.12"
              />

              {/* Leaf body */}
              <path
                d="M18 2 C 28 10, 34 22, 30 36 C 27 44, 22 50, 18 50 C 14 50, 9 44, 6 36 C 2 22, 8 10, 18 2 Z"
                fill="url(#tea-leaf-fill)"
                stroke="url(#tea-leaf-edge)"
                strokeWidth="0.8"
              />

              {/* Gloss */}
              <path
                d="M18 4 C 26 11, 30 22, 28 34 C 26 42, 22 47, 18 48 C 18 48, 18 4, 18 4 Z"
                fill="url(#tea-leaf-gloss)"
              />

              {/* Midrib */}
              <path
                d="M18 6 C 18.4 18, 18.2 32, 18 48"
                fill="none"
                stroke="#d8c878"
                strokeOpacity="0.7"
                strokeWidth="1"
                strokeLinecap="round"
              />

              {/* Veins — left */}
              <g
                fill="none"
                stroke="#c9b86a"
                strokeOpacity="0.45"
                strokeWidth="0.6"
                strokeLinecap="round"
              >
                <path d="M17.6 14 C 13 16, 10 20, 8.5 24" />
                <path d="M17.7 22 C 13.5 24, 10.5 28, 9 33" />
                <path d="M17.8 32 C 14 34, 11.5 38, 10.5 42" />
              </g>

              {/* Veins — right */}
              <g
                fill="none"
                stroke="#c9b86a"
                strokeOpacity="0.45"
                strokeWidth="0.6"
                strokeLinecap="round"
              >
                <path d="M18.4 14 C 23 16, 26 20, 27.5 24" />
                <path d="M18.3 22 C 22.5 24, 25.5 28, 27 33" />
                <path d="M18.2 32 C 22 34, 24.5 38, 25.5 42" />
              </g>

              {/* Tip highlight */}
              <circle cx="18" cy="5" r="1.2" fill="#e8d9a0" opacity="0.55" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
