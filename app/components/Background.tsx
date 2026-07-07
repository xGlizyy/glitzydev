"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export default function Background() {
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.25);
  const springX = useSpring(pointerX, { stiffness: 35, damping: 22, mass: 0.6 });
  const springY = useSpring(pointerY, { stiffness: 35, damping: 22, mass: 0.6 });

  const glowLeft = useTransform(springX, [0, 1], ["15%", "85%"]);
  const glowTop = useTransform(springY, [0, 1], ["-10%", "50%"]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      pointerX.set(event.clientX / window.innerWidth);
      pointerY.set(event.clientY / window.innerHeight);
    }
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [pointerX, pointerY]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <div className="animate-blob absolute left-1/2 top-[-14rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-orange-500/15 blur-[130px]" />
      <div className="animate-blob animation-delay-4000 absolute bottom-[-16rem] left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-orange-400/10 blur-[130px]" />
      <motion.div
        className="absolute h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/10 blur-[110px]"
        style={{ left: glowLeft, top: glowTop }}
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
