import pc from "picocolors";
import {
  intro,
  outro,
  spinner,
  log,
  isCancel,
  password,
  text,
  select,
  confirm,
  multiselect,
} from "@clack/prompts";

export {
  intro,
  outro,
  spinner,
  log,
  isCancel,
  password,
  text,
  select,
  confirm,
  multiselect,
};

export function introCommand(name: string): void {
  intro(pc.bgCyan(pc.black(` ${name} `)));
}

export function outroSuccess(msg: string): void {
  outro(pc.green(msg));
}

export function outroError(msg: string): void {
  outro(pc.red(msg));
}

export function outroWarning(msg: string): void {
  outro(pc.yellow(msg));
}

export function outroInfo(msg: string): void {
  outro(pc.cyan(msg));
}
