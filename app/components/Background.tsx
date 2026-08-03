"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export default function Background() {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const fastX = useSpring(pointerX, { stiffness: 120, damping: 20, mass: 0.4 });
  const fastY = useSpring(pointerY, { stiffness: 120, damping: 20, mass: 0.4 });
  const trailX = useSpring(pointerX, { stiffness: 40, damping: 24, mass: 0.8 });
  const trailY = useSpring(pointerY, { stiffness: 40, damping: 24, mass: 0.8 });

  useEffect(() => {
    pointerX.set(window.innerWidth / 2);
    pointerY.set(window.innerHeight / 3);

    function handlePointerMove(event: PointerEvent) {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
    }
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [pointerX, pointerY]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <div className="animate-blob absolute left-1/2 top-[-14rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-orange-500/15 blur-[130px]" />
      <div className="animate-blob animation-delay-4000 absolute bottom-[-16rem] left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-orange-400/10 blur-[130px]" />

      {/* Soft trailing glow: lags slightly behind the pointer for a fluid feel */}
      <motion.div
        className="cursor-glow pointer-events-none absolute h-[34rem] w-[34rem] rounded-full bg-orange-500/10 blur-[120px]"
        style={{ left: trailX, top: trailY, translateX: "-50%", translateY: "-50%" }}
      />
      {/* Sharper glow that tracks the cursor closely */}
      <motion.div
        className="cursor-glow pointer-events-none absolute h-[22rem] w-[22rem] rounded-full bg-orange-400/20 blur-[90px] mix-blend-screen"
        style={{ left: fastX, top: fastY, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        className="cursor-glow pointer-events-none absolute h-[6rem] w-[6rem] rounded-full bg-orange-300/30 blur-[40px] mix-blend-screen"
        style={{ left: fastX, top: fastY, translateX: "-50%", translateY: "-50%" }}
      />

      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
    </div>
  );
}
