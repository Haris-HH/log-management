import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";

import { useColumn } from "./useColumn";
import { useStatusOptions } from "./useStatusOptions";
import { useDockItems } from "./useDockItems";
import usePageTitle from "./usePageTitle";

describe("useColumn", () => {
  it("returns every checkpoint column enabled by default", () => {
    const { result } = renderHook(() => useColumn());

    expect(result.current).toHaveLength(9);
    expect(result.current.every((c) => c.checked)).toBe(true);
    expect(result.current.map((c) => c.key)).toEqual([
      "camera",
      "station",
      "area",
      "province",
      "district",
      "subdistrict",
      "road",
      "route",
      "project",
    ]);
  });

  it("memoises the list across re-renders", () => {
    const { result, rerender } = renderHook(() => useColumn());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});

describe("useStatusOptions", () => {
  it("returns the five device statuses in severity order", () => {
    const { result } = renderHook(() => useStatusOptions());

    expect(result.current.map((s) => s.key)).toEqual([
      "offline",
      "suspended",
      "others",
      "maintenance",
      "online",
    ]);
    expect(result.current.map((s) => s.id)).toEqual([1, 2, 3, 4, 5]);
  });

  it("maps every status onto a theme CSS variable rather than a literal colour", () => {
    const { result } = renderHook(() => useStatusOptions());
    for (const status of result.current) {
      expect(status.color).toMatch(/^var\(--status-[a-z-]+\)$/);
    }
  });
});

describe("useDockItems", () => {
  it("builds the navigation tree", () => {
    const { result } = renderHook(() => useDockItems());

    expect(result.current[0].path).toBe("/");
    expect(result.current.length).toBeGreaterThan(1);
  });

  it("gives every leaf an absolute route", () => {
    const { result } = renderHook(() => useDockItems());

    for (const item of result.current) {
      if (item.path) expect(item.path.startsWith("/")).toBe(true);
      for (const sub of item.subMenu ?? []) {
        expect(sub.path.startsWith("/")).toBe(true);
      }
    }
  });

  it("exposes no duplicate routes", () => {
    const { result } = renderHook(() => useDockItems());
    const paths = result.current.flatMap((item) => [
      ...(item.path ? [item.path] : []),
      ...(item.subMenu ?? []).map((s) => s.path),
    ]);

    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe("usePageTitle", () => {
  it("suffixes the project title", () => {
    renderHook(() => usePageTitle("pages.statistic-access-log"));
    expect(document.title).toBe("pages.statistic-access-log | project.title");
  });

  it("uses the project title alone when given an empty title", () => {
    renderHook(() => usePageTitle(""));
    expect(document.title).toBe("project.title");
  });

  it("updates when the title changes", () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: "a" },
    });
    expect(document.title).toBe("a | project.title");

    rerender({ title: "b" });
    expect(document.title).toBe("b | project.title");
  });
});
