import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useTranslation } from "react-i18next";

import { useColumn } from "./useColumn";
import { useStatusOptions } from "./useStatusOptions";
import { useDockItems } from "./useDockItems";
import usePageTitle from "./usePageTitle";

import AuthUserReducer from "../features/auth-user/api/AuthUserSlice";
import DropdownReducer from "../features/dropdown/api/DropdownSlice";
import { PAGE_PERMISSIONS } from "../constants/permissions";
import type { PermissionMode, Permissions } from "../types/common";

/*
  The navigation is permission-filtered, so these render against a store rather
  than bare. `grantAll` mirrors the shape the API returns for a user who may
  reach every page.
*/
const permissionOf = (mode: PermissionMode): Permissions => ({
  ui: {
    "log-management": {
      enabled: true,
      groups: Object.fromEntries(
        Object.values(PAGE_PERMISSIONS).map((key) => [key, mode])
      ),
      prints: {},
    },
  },
});

const renderDockItems = (permission: Permissions | null) => {
  const store = configureStore({
    reducer: { authUser: AuthUserReducer, dropdown: DropdownReducer },
    preloadedState: {
      authUser: {
        user: {
          user_id: "u1",
          hash_id: "h1",
          title_name_th: "",
          title_name_en: "",
          first_name: "",
          last_name: "",
          image_url: "",
          permission,
        },
      },
    },
  });

  return renderHook(() => useDockItems(), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

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
    const { result } = renderDockItems(permissionOf("edit"));

    expect(result.current[0].path).toBe("/");
    expect(result.current.length).toBeGreaterThan(1);
  });

  it("gives every leaf an absolute route", () => {
    const { result } = renderDockItems(permissionOf("edit"));

    for (const item of result.current) {
      if (item.path) expect(item.path.startsWith("/")).toBe(true);
      for (const sub of item.subMenu ?? []) {
        expect(sub.path.startsWith("/")).toBe(true);
      }
    }
  });

  it("exposes no duplicate routes", () => {
    const { result } = renderDockItems(permissionOf("edit"));
    const paths = result.current.flatMap((item) => [
      ...(item.path ? [item.path] : []),
      ...(item.subMenu ?? []).map((s) => s.path),
    ]);

    expect(new Set(paths).size).toBe(paths.length);
  });

  it('shows a page granted "active" — read-only still reaches the menu', () => {
    const { result } = renderDockItems(permissionOf("active"));

    const paths = result.current.flatMap((item) =>
      (item.subMenu ?? []).map((s) => s.path)
    );

    expect(paths).toContain("/statistic-access-log");
  });

  it('hides a page granted "none" and collapses the group it empties', () => {
    const { result } = renderDockItems({
      ui: {
        "log-management": {
          enabled: true,
          groups: {
            "overall-map": "active",
            "overall-report": "none",
            "overall-checkpoints": "none",
          },
          prints: {},
        },
      },
    });

    const overview = result.current.find((item) =>
      item.subMenu?.some((sub) => sub.path === "/overall-map")
    );

    expect(overview?.subMenu?.map((sub) => sub.path)).toEqual(["/overall-map"]);

    // Every other group lost all of its entries and must be gone entirely.
    expect(result.current.map((item) => item.path)).toEqual(["/", undefined]);
  });

  it("hides everything gated when the service itself is disabled", () => {
    const { result } = renderDockItems({
      ui: {
        "log-management": {
          ...permissionOf("edit").ui!["log-management"],
          enabled: false,
        },
      },
    });

    expect(result.current.map((item) => item.path)).toEqual(["/"]);
  });

  it("keeps Home but nothing else when no permissions were sent", () => {
    const { result } = renderDockItems(null);

    expect(result.current.map((item) => item.path)).toEqual(["/"]);
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

  it("updates once translations resolve, with the title unchanged", () => {
    // The XHR backend resolves after first paint in a build, so the first `t`
    // echoes keys and a later one translates. Only `t` changes here.
    const mocked = vi.mocked(useTranslation);
    const original = mocked.getMockImplementation()!;
    const i18n = { language: "th", changeLanguage: vi.fn() };

    mocked.mockReturnValue({ t: (key: string) => key, i18n } as never);
    const { rerender } = renderHook(() => usePageTitle("pages.statistic-access-log"));
    expect(document.title).toBe("pages.statistic-access-log | project.title");

    mocked.mockReturnValue({
      t: (key: string) => (key === "project.title" ? "NSB Log Management" : key),
      i18n,
    } as never);
    rerender();
    expect(document.title).toBe("pages.statistic-access-log | NSB Log Management");

    mocked.mockImplementation(original);
  });
});
