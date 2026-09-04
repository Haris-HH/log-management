import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

type FetchClientModule = typeof import("./fetchClient");
type TokenStoreModule = typeof import("../utils/tokenStore");

const BASE = "https://api.test/api/v0";

/*
  Fresh module instances — fetchClient keeps module-level refresh/location
  state, and the access token lives in tokenStore's own module-level variable.
  Both must be reset together, and tokenStore must be the same instance
  fetchClient resolves internally, so it is imported in the same
  resetModules() cycle rather than once at file scope.
*/
const loadModule = async (): Promise<FetchClientModule & TokenStoreModule> => {
  vi.resetModules();
  const tokenStore = await import("../utils/tokenStore");
  const fetchClientModule = await import("./fetchClient");
  return { ...tokenStore, ...fetchClientModule };
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const setGeolocation = (
  impl:
    | ((
        success: PositionCallback,
        error: PositionErrorCallback | null
      ) => void)
    | null
) => {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: impl ? { getCurrentPosition: vi.fn(impl) } : undefined,
  });
};

const grantGeolocation = (lat = 13.7563, lng = 100.5018) => {
  const spy = vi.fn((success: PositionCallback) => {
    success({
      coords: { latitude: lat, longitude: lng },
    } as GeolocationPosition);
  });
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition: spy },
  });
  return spy;
};

const lastRequestHeaders = (fetchMock: ReturnType<typeof vi.fn>, call = 0) =>
  (fetchMock.mock.calls[call][1] as RequestInit).headers as Record<
    string,
    string
  >;

let fetchMock: ReturnType<typeof vi.fn>;
let locationAssign: string[];

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  setGeolocation(null);

  // window.location.href = "/login" would attempt a real navigation.
  locationAssign = [];
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      pathname: "/statistic-access-log",
      get href() {
        return "http://localhost/statistic-access-log";
      },
      set href(value: string) {
        locationAssign.push(value);
      },
    },
  });

  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("combineURL", () => {
  it("concatenates base and endpoint", async () => {
    const { combineURL } = await loadModule();
    expect(combineURL("https://a.test", "/b")).toBe("https://a.test/b");
  });
});

describe("fetchClient - request shaping", () => {
  it("sends the service channel and bearer token from the in-memory token store", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ ok: true }));

    const { fetchClient, setAccessToken } = await loadModule();
    setAccessToken("tok-123");
    await fetchClient("/things");

    const headers = lastRequestHeaders(fetchMock);
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/things`);
    expect(headers["x-service-channel"]).toBe("log-management");
    expect(headers.Authorization).toBe("Bearer tok-123");
    expect(headers["Content-Type"]).toBe("application/json");
    expect((fetchMock.mock.calls[0][1] as RequestInit).credentials).toBe(
      "include"
    );
  });

  it("omits Authorization when skipAuth is set", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({}));

    const { fetchClient, setAccessToken } = await loadModule();
    setAccessToken("tok-123");
    await fetchClient("/login", { skipAuth: true });

    expect(lastRequestHeaders(fetchMock).Authorization).toBeUndefined();
  });

  it("omits Content-Type for FormData bodies so the browser sets the boundary", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({}));

    const { fetchClient } = await loadModule();
    await fetchClient("/upload", { isFormData: true, method: "POST" });

    expect(lastRequestHeaders(fetchMock)["Content-Type"]).toBeUndefined();
  });

  it("encodes query params", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({}));

    const { fetchClient } = await loadModule();
    await fetchClient("/search", {
      queryParams: { filter: "user_id=a|b", limit: "10" },
    });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("filter=user_id%3Da%7Cb");
    expect(url).toContain("limit=10");
  });

  it("lets caller headers override defaults", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({}));

    const { fetchClient } = await loadModule();
    await fetchClient("/things", { headers: { "x-service-channel": "custom" } });

    expect(lastRequestHeaders(fetchMock)["x-service-channel"]).toBe("custom");
  });
});

describe("fetchClient - response handling", () => {
  it("parses JSON bodies", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ data: [1, 2] }));

    const { fetchClient } = await loadModule();
    await expect(fetchClient<{ data: number[] }>("/things")).resolves.toEqual({
      data: [1, 2],
    });
  });

  it("returns undefined for 204 No Content", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const { fetchClient } = await loadModule();
    await expect(fetchClient("/things")).resolves.toBeUndefined();
  });

  it("returns the raw Response when isStream is set", async () => {
    const res = jsonResponse({ a: 1 });
    fetchMock.mockResolvedValue(res);

    const { fetchClient } = await loadModule();
    await expect(fetchClient("/export", { isStream: true })).resolves.toBe(res);
  });

  it("throws an error carrying the HTTP status", async () => {
    fetchMock.mockResolvedValue(
      new Response("boom", { status: 500, statusText: "Server Error" })
    );

    const { fetchClient } = await loadModule();
    await expect(fetchClient("/things")).rejects.toMatchObject({
      message: "boom",
      status: 500,
    });
  });
});

describe("fetchClient - token refresh", () => {
  it("refreshes once on 401 and retries with the new token", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response("nope", { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ accessToken: "fresh" }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const { fetchClient, setAccessToken, getAccessToken } = await loadModule();
    setAccessToken("stale");
    await expect(fetchClient("/things")).resolves.toEqual({ ok: true });

    expect(fetchMock.mock.calls[1][0]).toBe(
      `${BASE}/user-management/users/refresh`
    );
    expect(getAccessToken()).toBe("fresh");
    expect(lastRequestHeaders(fetchMock, 2).Authorization).toBe("Bearer fresh");
  });

  it("treats 403 the same as 401", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response("nope", { status: 403 }))
      .mockResolvedValueOnce(jsonResponse({ accessToken: "fresh" }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const { fetchClient, setAccessToken } = await loadModule();
    setAccessToken("stale");
    await expect(fetchClient("/things")).resolves.toEqual({ ok: true });
  });

  it("does not attempt refresh when skipAuth is set", async () => {
    fetchMock.mockImplementation(async () => new Response("bad creds", { status: 401 }));

    const { fetchClient } = await loadModule();
    await expect(
      fetchClient("/login", { skipAuth: true })
    ).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shares a single refresh across concurrent 401s", async () => {
    let refreshCalls = 0;
    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      if (url.endsWith("/user-management/users/refresh")) {
        refreshCalls++;
        return jsonResponse({ accessToken: "fresh" });
      }
      const auth = (init.headers as Record<string, string>)?.Authorization;
      if (auth === "Bearer fresh") return jsonResponse({ ok: true });
      return new Response("nope", { status: 401 });
    });

    const { fetchClient, setAccessToken } = await loadModule();
    setAccessToken("stale");
    const results = await Promise.all([
      fetchClient("/a"),
      fetchClient("/b"),
      fetchClient("/c"),
    ]);

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(refreshCalls).toBe(1);
  });

  it("dispatches force-logout when the refresh itself fails", async () => {
    const onForceLogout = vi.fn();
    window.addEventListener("force-logout", onForceLogout);

    fetchMock
      .mockResolvedValueOnce(new Response("nope", { status: 401 }))
      .mockResolvedValueOnce(new Response("expired", { status: 401 }));

    const { fetchClient, setAccessToken } = await loadModule();
    setAccessToken("stale");
    await expect(fetchClient("/things")).rejects.toBeDefined();

    expect(onForceLogout).toHaveBeenCalledTimes(1);
    window.removeEventListener("force-logout", onForceLogout);
  });

  it("gives up after one retry instead of looping", async () => {
    const onForceLogout = vi.fn();
    window.addEventListener("force-logout", onForceLogout);

    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith("/user-management/users/refresh")) {
        return jsonResponse({ accessToken: "fresh" });
      }
      return new Response("nope", { status: 401 });
    });

    const { fetchClient, setAccessToken } = await loadModule();
    setAccessToken("stale");
    await expect(fetchClient("/things")).rejects.toThrow("Too many retries");

    expect(onForceLogout).toHaveBeenCalledTimes(1);
    window.removeEventListener("force-logout", onForceLogout);
  });
});

describe("fetchClient - restoreSession", () => {
  it("mints a token from the refresh cookie and stores it in memory", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ accessToken: "fresh" }));

    const { restoreSession, getAccessToken } = await loadModule();
    await expect(restoreSession()).resolves.toBe(true);

    expect(fetchMock.mock.calls[0][0]).toBe(
      `${BASE}/user-management/users/refresh`
    );
    expect(getAccessToken()).toBe("fresh");
  });

  it("resolves false and leaves the token store empty when there is no valid refresh cookie", async () => {
    fetchMock.mockResolvedValue(new Response("nope", { status: 401 }));

    const { restoreSession, getAccessToken } = await loadModule();
    await expect(restoreSession()).resolves.toBe(false);

    expect(getAccessToken()).toBeNull();
  });
});

describe("fetchClient - network failure", () => {
  it("clears every auth artefact and redirects to login", async () => {
    localStorage.setItem("refreshToken", "rtok");
    localStorage.setItem("userUid", "uid");
    localStorage.setItem("persist:root", '{"authUser":"{}"}');

    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const { fetchClient, setAccessToken, getAccessToken } = await loadModule();
    setAccessToken("tok");
    await expect(fetchClient("/things")).rejects.toThrow("Failed to fetch");

    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("userUid")).toBeNull();
    // Regression: the persisted Redux user used to survive a forced logout.
    expect(localStorage.getItem("persist:root")).toBeNull();
    expect(locationAssign).toEqual(["/login"]);
  });

  it("does not redirect when already on the login page", async () => {
    (window.location as unknown as { pathname: string }).pathname = "/login";
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const { fetchClient, setAccessToken } = await loadModule();
    setAccessToken("tok");
    await expect(fetchClient("/things")).rejects.toThrow();

    expect(locationAssign).toEqual([]);
  });

  it("does not redirect an unauthenticated caller", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const { fetchClient } = await loadModule();
    await expect(fetchClient("/things")).rejects.toThrow();

    expect(locationAssign).toEqual([]);
  });
});

describe("fetchClient - geolocation headers", () => {
  it("attaches the current position", async () => {
    grantGeolocation(13.7563, 100.5018);
    fetchMock.mockImplementation(async () => jsonResponse({}));

    const { fetchClient } = await loadModule();
    await fetchClient("/things");

    const headers = lastRequestHeaders(fetchMock);
    expect(headers["x-latitude"]).toBe("13.7563");
    expect(headers["x-longitude"]).toBe("100.5018");
  });

  it("reuses one fix across sequential requests instead of re-acquiring per call", async () => {
    const spy = grantGeolocation();
    fetchMock.mockImplementation(async () => jsonResponse({}));

    const { fetchClient } = await loadModule();
    await fetchClient("/a");
    await fetchClient("/b");
    await fetchClient("/c");

    expect(spy).toHaveBeenCalledTimes(1);
    expect(lastRequestHeaders(fetchMock, 2)["x-latitude"]).toBe("13.7563");
  });

  it("collapses concurrent requests onto a single acquisition", async () => {
    let resolvePosition: (() => void) | undefined;
    const spy = vi.fn((success: PositionCallback) => {
      resolvePosition = () =>
        success({
          coords: { latitude: 1, longitude: 2 },
        } as GeolocationPosition);
    });
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition: spy },
    });
    fetchMock.mockImplementation(async () => jsonResponse({}));

    const { fetchClient } = await loadModule();
    const pending = Promise.all([
      fetchClient("/a"),
      fetchClient("/b"),
      fetchClient("/c"),
    ]);

    await vi.waitFor(() => expect(resolvePosition).toBeDefined());
    resolvePosition!();
    await pending;

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("caches a denial so a blocked permission is not re-queried every request", async () => {
    const spy = vi.fn(
      (_s: PositionCallback, error: PositionErrorCallback | null) => {
        error?.({ code: 1, message: "denied" } as GeolocationPositionError);
      }
    );
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition: spy },
    });
    fetchMock.mockImplementation(async () => jsonResponse({}));

    const { fetchClient } = await loadModule();
    await fetchClient("/a");
    await fetchClient("/b");

    expect(spy).toHaveBeenCalledTimes(1);
    expect(lastRequestHeaders(fetchMock, 1)["x-latitude"]).toBeUndefined();
  });

  it("sends no location headers when the API is unavailable", async () => {
    setGeolocation(null);
    fetchMock.mockImplementation(async () => jsonResponse({}));

    const { fetchClient } = await loadModule();
    await fetchClient("/things");

    expect(lastRequestHeaders(fetchMock)["x-latitude"]).toBeUndefined();
  });

  it("clearLocationCache forces the next request to re-acquire", async () => {
    const spy = grantGeolocation();
    fetchMock.mockImplementation(async () => jsonResponse({}));

    const { fetchClient, clearLocationCache } = await loadModule();
    await fetchClient("/a");
    clearLocationCache();
    await fetchClient("/b");

    expect(spy).toHaveBeenCalledTimes(2);
  });
});
