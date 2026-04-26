import pc from "picocolors";
import { intro, outro, spinner, log, isCancel } from "@clack/prompts";

export { intro, outro, spinner, log, isCancel };

export function introCommand(name: string): void {
  intro(pc.bgCyan(pc.black(` ${name} `)));
}

export function outroSuccess(msg: string): void {
  outro(pc.green(msg));
}

export function outroError(msg: string): void {
  outro(pc.red(msg));
}
