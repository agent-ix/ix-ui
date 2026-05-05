import { useEffect, useState } from "react";
import { execa } from "execa";

export interface HookStatus {
  jobName: string;
  phase: "pending" | "running" | "succeeded" | "failed";
  message?: string;
}

export interface UseHelmHookWatcherOptions {
  intervalMs?: number;
  enabled?: boolean;
}

interface JobItem {
  metadata?: { name?: string; namespace?: string };
  status?: {
    succeeded?: number;
    failed?: number;
    active?: number;
    conditions?: { type: string; status: string; message?: string }[];
  };
}

interface JobList {
  items?: JobItem[];
}

function parseStatus(stdout: string): HookStatus[] {
  let parsed: JobList;
  try {
    parsed = JSON.parse(stdout) as JobList;
  } catch {
    return [];
  }
  const items = parsed.items ?? [];
  return items.map((j) => {
    const name = j.metadata?.name ?? "(unnamed)";
    const succeeded = j.status?.succeeded ?? 0;
    const failed = j.status?.failed ?? 0;
    const active = j.status?.active ?? 0;
    let phase: HookStatus["phase"] = "pending";
    if (failed > 0) phase = "failed";
    else if (succeeded > 0) phase = "succeeded";
    else if (active > 0) phase = "running";
    const failureCondition = j.status?.conditions?.find(
      (c) => c.type === "Failed" && c.status === "True",
    );
    return {
      jobName: name,
      phase,
      message: failureCondition?.message,
    };
  });
}

export function useHelmHookWatcher(
  release: { namespace: string; name: string },
  opts: UseHelmHookWatcherOptions = {},
): HookStatus[] {
  const { intervalMs = 1000, enabled = true } = opts;
  const [statuses, setStatuses] = useState<HookStatus[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const label = `helm.sh/hook,helm.sh/release-name=${release.name}`;

    const poll = async () => {
      try {
        const r = await execa(
          "kubectl",
          ["get", "jobs", "-n", release.namespace, "-l", label, "-o", "json"],
          { reject: false },
        );
        if (cancelled) return;
        if (typeof r.stdout === "string" && r.exitCode === 0) {
          setStatuses(parseStatus(r.stdout));
        }
      } catch {
        // keep previous
      } finally {
        if (!cancelled) timer = setTimeout(poll, intervalMs);
      }
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [enabled, intervalMs, release.namespace, release.name]);

  return statuses;
}
