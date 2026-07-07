"use client";

import { useEffect, useState } from "react";

type Tag = "p" | "h1" | "h2" | "span";

export default function Typewriter({
  text,
  className,
  speed = 26,
  as = "p",
}: {
  text: string;
  className?: string;
  speed?: number;
  as?: Tag;
}) {
  const [count, setCount] = useState(0);
  const Element = as;

  useEffect(() => {
    setCount(0);
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <Element className={className}>
      {text.slice(0, count)}
      <span className="text-orange-400">{count < text.length ? "▍" : ""}</span>
    </Element>
  );
}
