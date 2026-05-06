import { useEffect, useState } from "react";
import { execa } from "execa";

export interface RolloutStatus {
  ready: number;
  total: number;
  raw: string;
}

export interface UseKubectlRolloutOptions {
  intervalMs?: number;
  enabled?: boolean;
}

interface PodConditionItem {
  status: { conditions?: { type: string; status: string }[] };
}

interface PodList {
  items?: PodConditionItem[];
}

function parseRollout(stdout: string): RolloutStatus | null {
  let parsed: PodList;
  try {
    parsed = JSON.parse(stdout) as PodList;
  } catch {
    return null;
  }
  const items = parsed.items ?? [];
  const total = items.length;
  let ready = 0;
  for (const pod of items) {
    const cond = pod.status?.conditions?.find((c) => c.type === "Ready");
    if (cond?.status === "True") ready++;
  }
  return { ready, total, raw: `${ready}/${total}` };
}

export function useKubectlRollout(
  selector: { name: string; namespace: string; label: string },
  opts: UseKubectlRolloutOptions = {},
): RolloutStatus | null {
  const { intervalMs = 1000, enabled = true } = opts;
  const [status, setStatus] = useState<RolloutStatus | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const r = await execa(
          "kubectl",
          [
            "get",
            "pods",
            "-n",
            selector.namespace,
            "-l",
            selector.label,
            "-o",
            "json",
          ],
          { reject: false },
        );
        if (cancelled) return;
        if (typeof r.stdout === "string" && r.exitCode === 0) {
          const parsed = parseRollout(r.stdout);
          if (parsed) setStatus(parsed);
        }
      } catch {
        // swallow per FR-007-AC-10 — keep previous status
      } finally {
        if (!cancelled) {
          timer = setTimeout(poll, intervalMs);
        }
      }
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [enabled, intervalMs, selector.namespace, selector.label, selector.name]);

  return status;
}
