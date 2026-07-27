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
  onerror: (e: unknown) => void;
};

const lastOptions = () => fetchEventSource.mock.calls.at(-1)![1] as Handlers &
  Record<string, unknown>;

beforeEach(() => {
  vi.clearAllMocks();
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

  it("swallows malformed JSON instead of tearing down the stream", () => {
    const onMessage = vi.fn();
    renderHook(() => useSse("force-logout", onMessage, true));

    expect(() =>
      act(() => emit(lastOptions(), "force-logout", "{not json"))
    ).not.toThrow();
    expect(onMessage).not.toHaveBeenCalled();
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
  it("forwards errors to the optional handler and rethrows", () => {
    const onError = vi.fn();
    renderHook(() =>
      useSse("force-logout", vi.fn(), true, true, onError)
    );

    const err = new Error("stream died");
    expect(() => lastOptions().onerror(err)).toThrow("stream died");
    expect(onError).toHaveBeenCalledWith(err);
  });

  it("rethrows even without an error handler", () => {
    renderHook(() => useSse("force-logout", vi.fn(), true));
    expect(() => lastOptions().onerror(new Error("boom"))).toThrow("boom");
  });
});
