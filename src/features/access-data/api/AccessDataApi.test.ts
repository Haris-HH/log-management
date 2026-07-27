import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const fetchClient = vi.fn();
vi.mock("../../../api/fetchClient", () => ({
  fetchClient: (...args: unknown[]) => fetchClient(...args),
}));

import { mockAccessLog } from "../../../mocks/mockAccessLog";

const loadApi = async () => {
  vi.resetModules();
  return import("./AccessDataApi");
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("VITE_IS_DEV", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("searchAccessLogs", () => {
  it("POSTs the filter body to the access-log search endpoint", async () => {
    fetchClient.mockResolvedValue({ data: [], pagination: {} });

    const { searchAccessLogs } = await loadApi();
    await searchAccessLogs({ page: "1" }, { limit: "50", page: "1" });

    expect(fetchClient).toHaveBeenCalledWith(
      "/log-management/access-logs/search",
      {
        method: "POST",
        body: JSON.stringify({ limit: "50", page: "1" }),
        queryParams: { page: "1" },
      }
    );
  });

  it("returns whatever the client resolves", async () => {
    const payload = { data: [{ log_id: 1 }] };
    fetchClient.mockResolvedValue(payload);

    const { searchAccessLogs } = await loadApi();
    await expect(searchAccessLogs()).resolves.toBe(payload);
  });

  it("serialises an absent body as undefined rather than crashing", async () => {
    fetchClient.mockResolvedValue({});

    const { searchAccessLogs } = await loadApi();
    await searchAccessLogs();

    expect(fetchClient.mock.calls[0][1].body).toBeUndefined();
  });

  it("propagates transport errors to the caller", async () => {
    fetchClient.mockRejectedValue(
      Object.assign(new Error("Unauthorized"), { status: 401 })
    );

    const { searchAccessLogs } = await loadApi();
    await expect(searchAccessLogs()).rejects.toMatchObject({ status: 401 });
  });

  it("short-circuits to the fixture when VITE_IS_DEV is set", async () => {
    vi.stubEnv("VITE_IS_DEV", "true");

    const { searchAccessLogs } = await loadApi();
    // resetModules gives the API module its own fixture instance, so compare
    // by value rather than identity.
    await expect(searchAccessLogs()).resolves.toEqual(mockAccessLog);
    expect(fetchClient).not.toHaveBeenCalled();
  });
});
