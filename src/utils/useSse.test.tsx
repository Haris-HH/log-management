import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const fetchEventSource = vi.fn();
vi.mock("@microsoft/fetch-event-source", () => ({
  fetchEventSource: (...args: unknown[]) => fetchEventSource(...args),
}));

import { useSse } from "./useSse";

type Handlers = {
  onopen: (r: Response) => Promise<void>;
  onmessage: (e: { event: string; data: string }) => void;
  onerror: (e: unknown) => number | void;
};

const lastOptions = () => fetchEventSource.mock.calls.at(-1)![1] as Handlers &
  Record<string, unknown>;

beforeEach(() => {
  vi.clearAllMocks();
  // The hook's own retry loop replaces fetch-event-source's, so the mock must
  // resolve rather than return undefined — the code chains .catch() onto it.
  fetchEventSource.mockResolvedValue(undefined);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("useSse - connection", () => {
  it("does not connect when disabled", () => {
    renderHook(() => useSse("force-logout", vi.fn(), false));
    expect(fetchEventSource).not.toHaveBeenCalled();
  });

  it("does not connect without an event name", () => {
    renderHook(() => useSse("", vi.fn(), true));
    expect(fetchEventSource).not.toHaveBeenCalled();
  });

  it("connects to the events endpoint with the bearer token", () => {
    localStorage.setItem("accessToken", "tok-123");
    renderHook(() => useSse("force-logout", vi.fn(), true));

    expect(fetchEventSource).toHaveBeenCalledTimes(1);
    const [url, options] = fetchEventSource.mock.calls[0];
    expect(url).toBe("https://api.test/api/v0/events");
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe("Bearer tok-123");
    expect(options.headers["x-service-channel"]).toBe("log-management");
    expect(options.openWhenHidden).toBe(true);
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it("aborts the stream on unmount", () => {
    const { unmount } = renderHook(() =>
      useSse("force-logout", vi.fn(), true)
    );
    const { signal } = lastOptions() as unknown as { signal: AbortSignal };

    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it("reconnects when the enabled flag flips on", () => {
    const { rerender } = renderHook(
      ({ enabled }) => useSse("force-logout", vi.fn(), enabled),
      { initialProps: { enabled: false } }
    );
    expect(fetchEventSource).not.toHaveBeenCalled();

    rerender({ enabled: true });
    expect(fetchEventSource).toHaveBeenCalledTimes(1);
  });

  it("throws from onopen when the server rejects the stream", async () => {
    renderHook(() => useSse("force-logout", vi.fn(), true));
    const { onopen } = lastOptions();

    await expect(
      onopen(new Response(null, { status: 401 }))
    ).rejects.toThrow("SSE failed with status 401");
  });

  it("accepts an OK handshake", async () => {
    renderHook(() => useSse("force-logout", vi.fn(), true));
    const { onopen } = lastOptions();

    await expect(onopen(new Response(null, { status: 200 }))).resolves
      .toBeUndefined();
  });

  it("re-reads the access token before each reconnect", () => {
    localStorage.setItem("accessToken", "stale");
    renderHook(() => useSse("force-logout", vi.fn(), true));

    const options = lastOptions() as unknown as {
      headers: Record<string, string>;
      onerror: (e: unknown) => number | void;
    };
    expect(options.headers.Authorization).toBe("Bearer stale");

    // fetchClient refreshes the token between the drop and the retry.
    localStorage.setItem("accessToken", "fresh");
    options.onerror(new Error("dropped"));

    expect(options.headers.Authorization).toBe("Bearer fresh");
  });
});

describe("useSse - message routing", () => {
  const emit = (
    handlers: Handlers,
    event: string,
    payload: Record<string, unknown> | string
  ) =>
    handlers.onmessage({
      event,
      data: typeof payload === "string" ? payload : JSON.stringify(payload),
    });

  it("invokes the callback for a matching event and service channel", () => {
    const onMessage = vi.fn();
    renderHook(() => useSse("force-logout", onMessage, true));

    act(() =>
      emit(lastOptions(), "force-logout", {
        serviceChannel: "log-management",
        reason: "admin",
      })
    );

    expect(onMessage).toHaveBeenCalledWith({
      serviceChannel: "log-management",
      reason: "admin",
    });
  });

  it("ignores events of a different name", () => {
    const onMessage = vi.fn();
    renderHook(() => useSse("force-logout", onMessage, true));

    act(() =>
      emit(lastOptions(), "heartbeat", { serviceChannel: "log-management" })
    );

    expect(onMessage).not.toHaveBeenCalled();
  });

  it("ignores events addressed to another service channel", () => {
    const onMessage = vi.fn();
    renderHook(() => useSse("force-logout", onMessage, true));

    act(() =>
      emit(lastOptions(), "force-logout", { serviceChannel: "other-app" })
    );

    expect(onMessage).not.toHaveBeenCalled();
  });

  it("acts on a payload that names no channel rather than running on a discarded session", () => {
    const onMessage = vi.fn();
    renderHook(() => useSse("force-logout", onMessage, true));

    act(() => emit(lastOptions(), "force-logout", { reason: "displaced" }));

    expect(onMessage).toHaveBeenCalledWith({ reason: "displaced" });
  });

  it("swallows malformed JSON instead of tearing down the stream", () => {
    const onMessage = vi.fn();
    renderHook(() => useSse("force-logout", onMessage, true));

    expect(() =>
      act(() => emit(lastOptions(), "force-logout", "{not json"))
    ).not.toThrow();
    expect(onMessage).not.toHaveBeenCalled();
  });

  it("closes the stream after the first match when asked to", () => {
    const onMessage = vi.fn();
    renderHook(() =>
      useSse("force-logout", onMessage, true, { closeOnEvent: true })
    );
    const { signal } = lastOptions() as unknown as { signal: AbortSignal };

    act(() =>
      emit(lastOptions(), "force-logout", { serviceChannel: "log-management" })
    );

    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(signal.aborted).toBe(true);
  });

  it("keeps the stream open after a match by default", () => {
    const onMessage = vi.fn();
    renderHook(() => useSse("force-logout", onMessage, true));
    const { signal } = lastOptions() as unknown as { signal: AbortSignal };

    act(() =>
      emit(lastOptions(), "force-logout", { serviceChannel: "log-management" })
    );

    expect(signal.aborted).toBe(false);
  });

  it("uses the latest callback without reconnecting", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ cb }) => useSse("force-logout", cb, true),
      { initialProps: { cb: first } }
    );

    rerender({ cb: second });
    act(() =>
      emit(lastOptions(), "force-logout", { serviceChannel: "log-management" })
    );

    expect(fetchEventSource).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe("useSse - errors", () => {
  it("forwards errors to the optional handler and reconnects", () => {
    const onError = vi.fn();
    renderHook(() => useSse("force-logout", vi.fn(), true, { onError }));

    const err = new Error("stream died");
    // A number tells fetch-event-source to retry after that many ms; throwing
    // would end force-logout coverage for the rest of the session.
    expect(lastOptions().onerror(err)).toBe(2_000);
    expect(onError).toHaveBeenCalledWith(err);
  });

  it("backs off on repeated failures up to the cap", () => {
    renderHook(() => useSse("force-logout", vi.fn(), true));
    const { onerror } = lastOptions();

    const delays = Array.from({ length: 6 }, () => onerror(new Error("down")));

    expect(delays).toEqual([2_000, 4_000, 8_000, 16_000, 30_000, 30_000]);
  });

  it("resets the backoff once a connection opens", async () => {
    renderHook(() => useSse("force-logout", vi.fn(), true));
    const { onopen, onerror } = lastOptions();

    onerror(new Error("down"));
    onerror(new Error("down"));
    await onopen(new Response(null, { status: 200 }));

    expect(onerror(new Error("down"))).toBe(2_000);
  });

  it("stops for good when the route is missing on this host", async () => {
    renderHook(() => useSse("force-logout", vi.fn(), true));
    const { onopen, onerror } = lastOptions();

    const fatal = await onopen(new Response(null, { status: 404 })).catch(
      (err: unknown) => err
    );

    // Rethrowing is what stops fetch-event-source from retrying a 404 forever.
    expect(() => onerror(fatal)).toThrow(
      "SSE route is not available on this host"
    );
  });
});
