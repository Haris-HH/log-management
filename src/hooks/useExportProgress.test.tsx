import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";

import useExportProgress from "./useExportProgress";

const IDLE = { text: "", current: 0, total: 0, percent: 0 };

describe("useExportProgress", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useExportProgress());
    expect(result.current.exportLoading).toBe(false);
    expect(result.current.exportProgress).toEqual(IDLE);
  });

  it("flags loading when an export starts", () => {
    const { result } = renderHook(() => useExportProgress());
    act(() => result.current.startExportLoading());
    expect(result.current.exportLoading).toBe(true);
  });

  it("records chunk progress", () => {
    const { result } = renderHook(() => useExportProgress());

    act(() => {
      result.current.startExportLoading();
      result.current.updateExportProgress("text.exporting", 2, 5, 40);
    });

    expect(result.current.exportProgress).toEqual({
      text: "text.exporting",
      current: 2,
      total: 5,
      percent: 40,
    });
  });

  it("resets progress when the export stops so the next run starts clean", () => {
    const { result } = renderHook(() => useExportProgress());

    act(() => {
      result.current.startExportLoading();
      result.current.updateExportProgress("text.exporting", 5, 5, 100);
    });
    act(() => result.current.stopExportLoading());

    expect(result.current.exportLoading).toBe(false);
    expect(result.current.exportProgress).toEqual(IDLE);
  });

  it("exposes stable callbacks so effect deps do not churn", () => {
    const { result, rerender } = renderHook(() => useExportProgress());
    const before = {
      start: result.current.startExportLoading,
      stop: result.current.stopExportLoading,
      update: result.current.updateExportProgress,
    };

    rerender();

    expect(result.current.startExportLoading).toBe(before.start);
    expect(result.current.stopExportLoading).toBe(before.stop);
    expect(result.current.updateExportProgress).toBe(before.update);
  });
});
