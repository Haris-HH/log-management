import { describe, it, expect, beforeEach } from "vitest";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";

beforeEach(() => {
  clearAccessToken();
});

describe("tokenStore", () => {
  it("starts empty", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("stores and returns the token that was set", () => {
    setAccessToken("tok-123");
    expect(getAccessToken()).toBe("tok-123");
  });

  it("clearAccessToken resets to null", () => {
    setAccessToken("tok-123");
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});
