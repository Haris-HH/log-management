import { describe, it, expect } from "vitest";

import { resolvePermission } from "./usePermission";
import type { Permissions } from "../types/common";

const permission = (
  overrides: Partial<NonNullable<Permissions["ui"]>[string]> = {}
): Permissions => ({
  ui: {
    "log-management": {
      enabled: true,
      groups: {
        "statistic-access-log": "edit",
        "overall-map": "active",
        "overall-report": "none",
      },
      prints: {
        "statistic-access-log": true,
        "overall-map": true,
        "overall-report": true,
      },
      ...overrides,
    },
  },
});

describe("resolvePermission", () => {
  it('grants view and edit on "edit"', () => {
    const result = resolvePermission(permission(), "statistic-access-log");

    expect(result).toMatchObject({
      mode: "edit",
      canView: true,
      canEdit: true,
      isReadOnly: false,
      noPermission: false,
    });
  });

  it('grants view but not edit on "active"', () => {
    const result = resolvePermission(permission(), "overall-map");

    expect(result).toMatchObject({
      mode: "active",
      canView: true,
      canEdit: false,
      isReadOnly: true,
      noPermission: false,
    });
  });

  it('denies everything on "none"', () => {
    const result = resolvePermission(permission(), "overall-report");

    expect(result).toMatchObject({
      canView: false,
      canEdit: false,
      canPrint: false,
      noPermission: true,
    });
  });

  it("treats a key the server never sent as none", () => {
    const result = resolvePermission(permission(), "chart-top-users");

    expect(result.mode).toBe("none");
    expect(result.canView).toBe(false);
    expect(result.noPermission).toBe(true);
  });

  it("keeps printing independent of edit — a read-only page can export", () => {
    expect(resolvePermission(permission(), "overall-map").canPrint).toBe(true);
  });

  it("withholds printing when the page is not in prints", () => {
    const withoutPrints = permission({ prints: {} });

    expect(
      resolvePermission(withoutPrints, "statistic-access-log").canPrint
    ).toBe(false);
    // The page itself is still reachable — only the export button goes.
    expect(resolvePermission(withoutPrints, "statistic-access-log").canView).toBe(
      true
    );
  });

  it("denies everything when the service is disabled, whatever the grants say", () => {
    const disabled = permission({ enabled: false });

    expect(resolvePermission(disabled, "statistic-access-log")).toMatchObject({
      canView: false,
      canEdit: false,
      canPrint: false,
      noPermission: true,
    });
  });

  it("denies everything for a missing or empty permission tree", () => {
    for (const value of [null, undefined, {}, { ui: {} }]) {
      expect(resolvePermission(value, "overall-map").canView).toBe(false);
    }
  });

  it("reads only this service's entry, never a sibling console's", () => {
    const other: Permissions = {
      ui: {
        "user-management": {
          enabled: true,
          groups: { "overall-map": "edit" },
          prints: { "overall-map": true },
        },
      },
    };

    expect(resolvePermission(other, "overall-map").canView).toBe(false);
  });
});
