"use client";

import { useCallback, useEffect, useRef } from "react";

let activeCount = 0;

function syncBodyAttribute() {
  document.body.dataset.glowSuppressed = activeCount > 0 ? "true" : "false";
}

/**
 * Lets an element opt the cursor-tracking background glow out while the
 * pointer is over it (e.g. search bar, result cards) — a shared counter
 * handles overlapping regions so releasing one doesn't re-enable the glow
 * while another is still active.
 */
export function useGlowSuppression() {
  const isActiveRef = useRef(false);

  const onPointerEnter = useCallback(() => {
    if (isActiveRef.current) return;
    isActiveRef.current = true;
    activeCount++;
    syncBodyAttribute();
  }, []);

  const onPointerLeave = useCallback(() => {
    if (!isActiveRef.current) return;
    isActiveRef.current = false;
    activeCount = Math.max(0, activeCount - 1);
    syncBodyAttribute();
  }, []);

  useEffect(() => {
    return () => {
      onPointerLeave();
    };
  }, [onPointerLeave]);

  return { onPointerEnter, onPointerLeave };
}
