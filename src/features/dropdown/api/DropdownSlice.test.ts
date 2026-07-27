import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./DropdownApi", () => ({
  getArea: vi.fn(),
  getAgency: vi.fn(),
  getBh: vi.fn(),
  getBk: vi.fn(),
  getOrg: vi.fn(),
  getProject: vi.fn(),
  getProvince: vi.fn(),
  getDistrict: vi.fn(),
  getSubdistrict: vi.fn(),
  getDeviceStatus: vi.fn(),
  getTitle: vi.fn(),
  getLprRegion: vi.fn(),
  getPoliceStation: vi.fn(),
}));

import { configureStore } from "@reduxjs/toolkit";

import reducer, {
  fetchArea,
  fetchAgency,
  fetchBh,
  fetchProvince,
} from "./DropdownSlice";
import * as api from "./DropdownApi";

const makeStore = () =>
  configureStore({ reducer: { dropdown: reducer } });

const initial = () => reducer(undefined, { type: "@@INIT" });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("dropdown reducer - shape", () => {
  it("starts with every list empty and no error", () => {
    const state = initial();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    for (const key of [
      "area",
      "agency",
      "bh",
      "bk",
      "org",
      "project",
      "province",
      "district",
      "subdistrict",
      "deviceStatus",
      "title",
      "lprRegion",
      "policeStation",
    ] as const) {
      expect(state[key]).toEqual([]);
    }
  });
});

describe("dropdown reducer - lifecycle", () => {
  it("sets loading and clears a previous error on pending", () => {
    const state = reducer(
      { ...initial(), error: "previous failure" },
      { type: fetchArea.pending.type }
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("stores the payload on fulfilled and stops loading", () => {
    const payload = [{ id: 1, name: "ภาค 1" }];
    const state = reducer(initial(), {
      type: fetchArea.fulfilled.type,
      payload,
    });
    expect(state.area).toEqual(payload);
    expect(state.loading).toBe(false);
  });

  it("stores the message on rejected without clobbering existing data", () => {
    const withData = reducer(initial(), {
      type: fetchArea.fulfilled.type,
      payload: [{ id: 1 }],
    });
    const state = reducer(withData, {
      type: fetchArea.rejected.type,
      payload: "Something went wrong",
    });
    expect(state.error).toBe("Something went wrong");
    expect(state.loading).toBe(false);
    expect(state.area).toEqual([{ id: 1 }]);
  });

  it("routes each thunk to its own slice key", () => {
    let state = reducer(initial(), {
      type: fetchAgency.fulfilled.type,
      payload: [{ ou_code: "OU1" }],
    });
    state = reducer(state, {
      type: fetchBh.fulfilled.type,
      payload: [{ bh_code: "BH1" }],
    });
    expect(state.agency).toEqual([{ ou_code: "OU1" }]);
    expect(state.bh).toEqual([{ bh_code: "BH1" }]);
    expect(state.area).toEqual([]);
  });
});

describe("dropdown thunks", () => {
  it("passes params through and commits the unwrapped data", async () => {
    vi.mocked(api.getArea).mockResolvedValue({
      data: [{ id: 1, name: "ภาค 1" }],
    } as never);

    const store = makeStore();
    await store.dispatch(fetchArea({ limit: "100" }) as never);

    expect(api.getArea).toHaveBeenCalledWith({ limit: "100" });
    expect(store.getState().dropdown.area).toEqual([{ id: 1, name: "ภาค 1" }]);
    expect(store.getState().dropdown.loading).toBe(false);
  });

  it("dispatches with undefined params when called bare", async () => {
    vi.mocked(api.getProvince).mockResolvedValue({ data: [] } as never);

    const store = makeStore();
    await store.dispatch(fetchProvince(undefined) as never);

    expect(api.getProvince).toHaveBeenCalledWith(undefined);
  });

  it("surfaces the API error message", async () => {
    vi.mocked(api.getArea).mockRejectedValue(new Error("Gateway timeout"));

    const store = makeStore();
    await store.dispatch(fetchArea(undefined) as never);

    expect(store.getState().dropdown.error).toBe("Gateway timeout");
  });

  it("prefers a nested response message when present", async () => {
    vi.mocked(api.getArea).mockRejectedValue({
      response: { data: { message: "Forbidden" } },
      message: "Request failed",
    });

    const store = makeStore();
    await store.dispatch(fetchArea(undefined) as never);

    expect(store.getState().dropdown.error).toBe("Forbidden");
  });

  it("falls back to a generic message for a shapeless rejection", async () => {
    vi.mocked(api.getArea).mockRejectedValue({});

    const store = makeStore();
    await store.dispatch(fetchArea(undefined) as never);

    expect(store.getState().dropdown.error).toBe("Something went wrong");
  });
});
