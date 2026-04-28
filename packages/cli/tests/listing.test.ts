import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startListing } from "../src/listing.js";

describe("Listing (plain mode)", () => {
  let output: string;

  beforeEach(() => {
    output = "";
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      output += typeof chunk === "string" ? chunk : chunk.toString();
      return true;
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("emits header on construction", () => {
    startListing("ix elements list", { isTTY: false });
    expect(output).toContain("ix elements list");
  });

  it("group + item render in body", () => {
    const list = startListing("ix elements list", { isTTY: false });
    list.group("github.com/agent-ix");
    list.item("typescript-react-lib", "TypeScript React libraries");
    expect(output).toContain("github.com/agent-ix");
    expect(output).toContain("typescript-react-lib");
    expect(output).toContain("TypeScript React libraries");
  });

  it("success emits the summary message", () => {
    const list = startListing("hdr", { isTTY: false });
    list.success("3 element type(s) available.");
    expect(output).toContain("3 element type(s) available.");
  });

  it("error emits the failure message", () => {
    const list = startListing("hdr", { isTTY: false });
    list.error("nope");
    expect(output).toContain("nope");
  });

  it("repeated finish calls are no-ops", () => {
    const list = startListing("hdr", { isTTY: false });
    list.success("first");
    const before = output.length;
    list.success("second");
    list.error("third");
    expect(output.length).toBe(before);
  });

  it("pause invokes the callback and returns its value", async () => {
    const list = startListing("hdr", { isTTY: false });
    const result = await list.pause(() => Promise.resolve("token"));
    expect(result).toBe("token");
    list.success("ok");
  });

  it("stop() is a no-op in plain mode", () => {
    const list = startListing("hdr", { isTTY: false });
    const before = output.length;
    list.stop();
    expect(output.length).toBe(before);
  });
});

describe("Listing (TTY mode)", () => {
  let output: string;
  let originalIsTTY: boolean | undefined;

  beforeEach(() => {
    output = "";
    originalIsTTY = process.stdout.isTTY;
    Object.defineProperty(process.stdout, "isTTY", {
      value: true,
      configurable: true,
    });
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      output += typeof chunk === "string" ? chunk : chunk.toString();
      return true;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(process.stdout, "isTTY", {
      value: originalIsTTY,
      configurable: true,
    });
  });

  it("draws header in-place with \\r and emits opener on first body write", () => {
    const list = startListing("ix elements list", { isTTY: true });
    expect(output).toContain("\r");
    expect(output).toContain("ix elements list");
    list.item("foo");
    expect(output).toContain("└──");
    list.success("done");
  });

  it("error finish writes the └──• tail prefix and the message", () => {
    const list = startListing("hdr", { isTTY: true });
    list.item("foo");
    list.error("boom");
    expect(output).toContain("└──");
    expect(output).toContain("boom");
  });

  it("stop() erases the in-place line and prevents further output", () => {
    const list = startListing("hdr", { isTTY: true });
    const before = output.length;
    list.stop();
    const stopOutput = output.slice(before);
    expect(stopOutput).toContain("\r");
    expect(stopOutput).toContain("\x1b[K");
    list.success("should not appear");
    expect(output).not.toContain("should not appear");
  });

  it("stop() after commit() is a no-op", () => {
    const list = startListing("hdr", { isTTY: true });
    list.commit();
    const before = output.length;
    list.stop();
    expect(output.length).toBe(before);
  });
});
