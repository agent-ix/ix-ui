import { useEffect, useRef } from "react";

/**
 * Fires `cb` every `delay` ms while the component is mounted. Pass `delay = null`
 * to pause without unmounting. The callback is referenced via a ref so changing
 * `cb` between renders does not reset the interval (FR-007-AC-2).
 */
export function useInterval(cb: () => void, delay: number | null): void {
  const ref = useRef(cb);
  useEffect(() => {
    ref.current = cb;
  }, [cb]);

  useEffect(() => {
    if (delay == null) return;
    const id = setInterval(() => ref.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
