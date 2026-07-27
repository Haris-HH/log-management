import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import L from "leaflet";
import type { ReactNode } from "react";

import { useMarkerManager } from "./useMarkerManager";
import dropdownReducer from "../features/dropdown/api/DropdownSlice";
import type { CameraInCheckpoint } from "../types/common";

const PAYLOAD = '<img src=x onerror="alert(1)">';

const makeWrapper = () => {
  const baseDropdown = dropdownReducer(undefined, { type: "@@INIT" });

  const store = configureStore({
    reducer: { dropdown: dropdownReducer },
    preloadedState: {
      dropdown: {
        ...baseDropdown,
        deviceStatus: [
          { status_code: "online", status_th: "ปกติ", status_en: "Online" },
          { status_code: "offline", status_th: "ปิด", status_en: "Offline" },
        ] as unknown as typeof baseDropdown.deviceStatus,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

const checkpoint = (overrides: Partial<CameraInCheckpoint> = {}) =>
  ({
    checkpoint_name: "ด่านบางนา",
    police_station_name: "สน.บางนา",
    province_name: "กรุงเทพมหานคร",
    district_name: "บางนา",
    subdistrict_name: "บางนาเหนือ",
    total: 2,
    latLng: [13.7, 100.6],
    cameras: [
      {
        device_name: "CAM-01",
        device_status_id: 5,
        device_status_code: "online",
        device_status_name: "ปกติ",
        route: "ถนนบางนา-ตราด",
        lane: "1",
      },
      {
        device_name: "CAM-02",
        device_status_id: 1,
        device_status_code: "offline",
        device_status_name: "ปิด",
        route: "ถนนสุขุมวิท",
        lane: "2",
      },
    ],
    ...overrides,
  }) as unknown as CameraInCheckpoint;

let container: HTMLDivElement;
let map: L.Map;

beforeEach(() => {
  container = document.createElement("div");
  Object.defineProperty(container, "clientWidth", { value: 800 });
  Object.defineProperty(container, "clientHeight", { value: 600 });
  document.body.appendChild(container);
  map = L.map(container, { center: [13.7, 100.5], zoom: 6 });
});

afterEach(() => {
  map.remove();
  container.remove();
});

const popupHtmlFor = async (detail: CameraInCheckpoint) => {
  const { result } = renderHook(() => useMarkerManager(map), {
    wrapper: makeWrapper(),
  });

  act(() => {
    result.current.createOverallMarkerWithList([detail]);
  });

  const marker = result.current.markers[0];
  expect(marker).toBeDefined();
  return marker.getPopup()!.getContent() as string;
};

describe("useMarkerManager - popup escaping", () => {
  it("renders benign checkpoint data verbatim", async () => {
    const html = await popupHtmlFor(checkpoint());

    expect(html).toContain("ด่านบางนา");
    expect(html).toContain("CAM-01");
    expect(html).toContain("ถนนบางนา-ตราด");
    expect(html).toContain("สน.บางนา");
  });

  it("escapes a hostile checkpoint name instead of emitting live markup", async () => {
    const html = await popupHtmlFor(
      checkpoint({ checkpoint_name: PAYLOAD } as never)
    );

    expect(html).not.toContain(PAYLOAD);
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });

  it("escapes hostile values in the area-structure breadcrumb", async () => {
    const html = await popupHtmlFor(
      checkpoint({ province_name: PAYLOAD } as never)
    );
    expect(html).not.toContain(PAYLOAD);
    expect(html).toContain("&lt;img src=x");
  });

  it("escapes hostile device names, statuses and routes in the table", async () => {
    const html = await popupHtmlFor(
      checkpoint({
        cameras: [
          {
            device_name: PAYLOAD,
            device_status_id: 5,
            device_status_code: "online",
            device_status_name: '"><svg onload=alert(1)>',
            route: "</td><script>alert(1)</script>",
            lane: "1",
          },
        ],
      } as never)
    );

    expect(html).not.toContain(PAYLOAD);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<svg onload");
    expect(html).toContain("&lt;/td&gt;&lt;script&gt;");
  });

  it("does not let injected markup reach the DOM as elements", async () => {
    const html = await popupHtmlFor(
      checkpoint({ checkpoint_name: PAYLOAD } as never)
    );

    const probe = document.createElement("div");
    probe.innerHTML = html;

    expect(probe.querySelector("img[onerror]")).toBeNull();
    expect(probe.textContent).toContain(PAYLOAD);
  });

  it("does not mutate the caller's camera array while sorting", async () => {
    const detail = checkpoint();
    const originalOrder = detail.cameras.map((c) => c.device_name);

    await popupHtmlFor(detail);

    expect(detail.cameras.map((c) => c.device_name)).toEqual(originalOrder);
  });
});

describe("useMarkerManager - marker lifecycle", () => {
  it("adds one marker per checkpoint", () => {
    const { result } = renderHook(() => useMarkerManager(map), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.createOverallMarkerWithList([
        checkpoint(),
        checkpoint({ checkpoint_name: "ด่านสอง" } as never),
      ]);
    });

    expect(result.current.markers).toHaveLength(2);
  });

  it("skips checkpoints with no cameras", () => {
    const { result } = renderHook(() => useMarkerManager(map), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.createOverallMarkerWithList([
        checkpoint({ cameras: [] } as never),
      ]);
    });

    expect(result.current.markers).toHaveLength(0);
  });

  it("clearMarkers removes everything", () => {
    const { result } = renderHook(() => useMarkerManager(map), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.createOverallMarkerWithList([checkpoint()]);
    });
    act(() => {
      result.current.clearMarkers();
    });

    expect(result.current.markers).toHaveLength(0);
  });

  it("clearMarkerByLocation removes only the matching marker", async () => {
    const { result } = renderHook(() => useMarkerManager(map), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.createMarkerWithList([
        { latLng: [13.7, 100.6], name: "a" },
        { latLng: [14.1, 101.2], name: "b" },
      ]);
    });
    expect(result.current.markers).toHaveLength(2);

    await act(async () => {
      await result.current.clearMarkerByLocation({ lat: 13.7, lng: 100.6 });
    });

    expect(result.current.markers).toHaveLength(1);
    expect(result.current.markers[0].getLatLng().lat).toBeCloseTo(14.1);
  });
});
