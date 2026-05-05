import React, { useState } from "react";
import { Text } from "ink";
import { ORBIT_SPINNER, HEADER_TICK_DIV, colorOrbitFrame } from "../style.js";
import { useInterval } from "../hooks/useInterval.js";

const ORBIT_TICK_MS = 80;

/**
 * Animated orbit glyph used as the header indicator while a frame is "running".
 * Advances one orbit frame every `HEADER_TICK_DIV` ticks (240 ms at 80 ms tick).
 */
export const HeaderSpinner: React.FC = () => {
  const [tick, setTick] = useState(0);
  useInterval(() => setTick((t) => t + 1), ORBIT_TICK_MS);
  const frame =
    ORBIT_SPINNER[
      Math.floor(tick / HEADER_TICK_DIV) % ORBIT_SPINNER.length
    ];
  return <Text>{colorOrbitFrame(frame)}</Text>;
};
