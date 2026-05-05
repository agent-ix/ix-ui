import React, { createContext, useContext, useEffect, useRef } from "react";
import { render as inkRender, useApp } from "ink";

export interface RenderOptions {
  plain?: boolean;
  exitOnCtrlC?: boolean;
  stdout?: NodeJS.WriteStream;
  stdin?: NodeJS.ReadStream;
}

export interface RenderResult<T> {
  cancelled: boolean;
  result?: T;
}

interface RenderContextValue {
  setResult: (value: unknown) => void;
  cancel: () => void;
  exit: () => void;
}

const RenderContext = createContext<RenderContextValue | null>(null);

export function useRenderResult<T>(): {
  setResult: (value: T) => void;
  exit: () => void;
} {
  const ctx = useContext(RenderContext);
  if (!ctx) {
    throw new Error(
      "useRenderResult() must be used inside a tree mounted by ix-ui-cli render()",
    );
  }
  return {
    setResult: (value: T) => ctx.setResult(value),
    exit: () => ctx.exit(),
  };
}

const InkBridge: React.FC<{
  cancel: () => void;
  cancelRef: { current: boolean };
}> = ({ cancel, cancelRef }) => {
  const { exit } = useApp();
  const exitRef = useRef(exit);
  useEffect(() => {
    exitRef.current = exit;
  }, [exit]);
  useEffect(() => {
    const onSigterm = () => {
      cancelRef.current = true;
      cancel();
      exitRef.current();
    };
    process.once("SIGTERM", onSigterm);
    return () => {
      process.removeListener("SIGTERM", onSigterm);
    };
  }, [cancel, cancelRef]);
  return null;
};

let activeRender = false;

/**
 * Mount an Ink tree, return a Promise that resolves on unmount. Handles
 * SIGTERM, Ctrl-C, EPIPE, and concurrent-render protection. (FR-008)
 */
export async function render<T = void>(
  element: React.ReactElement,
  opts: RenderOptions = {},
): Promise<RenderResult<T>> {
  if (activeRender) {
    throw new Error("ix-ui-cli render() is already active");
  }
  activeRender = true;

  const cancelRef = { current: false };
  let resultBox: { value?: T } = {};

  return new Promise<RenderResult<T>>((resolve, reject) => {
    let unmountFn: (() => void) | null = null;
    let resolved = false;

    const finish = (err?: Error) => {
      if (resolved) return;
      resolved = true;
      activeRender = false;
      if (err) reject(err);
      else resolve({ cancelled: cancelRef.current, result: resultBox.value });
    };

    const cancel = () => {
      cancelRef.current = true;
    };

    const ctx: RenderContextValue = {
      setResult: (v) => {
        resultBox = { value: v as T };
      },
      cancel,
      exit: () => {
        if (unmountFn) unmountFn();
      },
    };

    const wrapped = (
      <RenderContext.Provider value={ctx}>
        <InkBridge cancel={cancel} cancelRef={cancelRef} />
        {element}
      </RenderContext.Provider>
    );

    let app;
    try {
      app = inkRender(wrapped, {
        stdout: opts.stdout ?? process.stdout,
        stdin: opts.stdin ?? process.stdin,
        exitOnCtrlC: opts.exitOnCtrlC ?? true,
        patchConsole: false,
      });
    } catch (e) {
      activeRender = false;
      reject(e instanceof Error ? e : new Error(String(e)));
      return;
    }

    unmountFn = () => {
      try {
        app.unmount();
      } catch {
        /* already unmounted */
      }
    };

    // EPIPE on stdout is swallowed — render() resolves cleanly per FR-001-AC-10.
    const onPipeError = (err: NodeJS.ErrnoException) => {
      if (err.code === "EPIPE") {
        unmountFn?.();
        finish();
      }
    };
    process.stdout.on("error", onPipeError);

    app.waitUntilExit().then(
      () => {
        process.stdout.off("error", onPipeError);
        finish();
      },
      (err) => {
        process.stdout.off("error", onPipeError);
        finish(err instanceof Error ? err : new Error(String(err)));
      },
    );
  });
}
