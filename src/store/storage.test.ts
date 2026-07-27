import { describe, it, expect } from "vitest";

import storage from "./storage";

describe("redux-persist storage adapter", () => {
  it("round-trips a value through localStorage", async () => {
    await storage.setItem("persist:root", '{"authUser":"{}"}');
    await expect(storage.getItem("persist:root")).resolves.toBe(
      '{"authUser":"{}"}'
    );
    expect(localStorage.getItem("persist:root")).toBe('{"authUser":"{}"}');
  });

  it("resolves null for a missing key", async () => {
    await expect(storage.getItem("nope")).resolves.toBeNull();
  });

  it("removes a key", async () => {
    await storage.setItem("k", "v");
    await storage.removeItem("k");
    await expect(storage.getItem("k")).resolves.toBeNull();
  });

  it("returns promises so redux-persist can await it", () => {
    expect(storage.getItem("k")).toBeInstanceOf(Promise);
    expect(storage.setItem("k", "v")).toBeInstanceOf(Promise);
    expect(storage.removeItem("k")).toBeInstanceOf(Promise);
  });
});
