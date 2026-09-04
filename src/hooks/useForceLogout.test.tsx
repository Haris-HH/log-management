import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const navigate = vi.fn();
const logoutApi = vi.fn();
const dispatch = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
}));

vi.mock("../features/login/api/LoginApi", () => ({
  logoutApi: (...args: unknown[]) => logoutApi(...args),
}));

vi.mock("../store/hooks", () => ({
  useAppDispatch: () => dispatch,
}));

import { useForceLogout } from "./useForceLogout";
import { clearAuthUser } from "../features/auth-user/api/AuthUserSlice";
import { setAccessToken, getAccessToken } from "../utils/tokenStore";

const seedSession = () => {
  setAccessToken("tok");
  localStorage.setItem("refreshToken", "rtok");
  localStorage.setItem("userUid", "uid");
  localStorage.setItem("persist:root", '{"authUser":"{\\"user\\":{}}"}');
};

const expectSessionCleared = () => {
  expect(getAccessToken()).toBeNull();
  expect(localStorage.getItem("refreshToken")).toBeNull();
  expect(localStorage.getItem("userUid")).toBeNull();
  expect(localStorage.getItem("persist:root")).toBeNull();
};

beforeEach(() => {
  vi.clearAllMocks();
  logoutApi.mockResolvedValue(undefined);
});

describe("useForceLogout", () => {
  it("clears local state and redirects without calling the API by default", async () => {
    seedSession();
    const { result } = renderHook(() => useForceLogout());

    await act(async () => {
      await result.current.forceLogout();
    });

    expect(logoutApi).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(clearAuthUser());
    expectSessionCleared();
    expect(navigate).toHaveBeenCalledWith("/login", { replace: true });
  });

  it("notifies the server when asked to", async () => {
    seedSession();
    const { result } = renderHook(() => useForceLogout());

    await act(async () => {
      await result.current.forceLogout(true);
    });

    expect(logoutApi).toHaveBeenCalledTimes(1);
    expectSessionCleared();
  });

  it("still clears the session when the logout call fails", async () => {
    seedSession();
    logoutApi.mockRejectedValue(new Error("server down"));
    const { result } = renderHook(() => useForceLogout());

    await act(async () => {
      await result.current.forceLogout(true);
    });

    // A failing server must never strand an authenticated session in the browser.
    expectSessionCleared();
    expect(dispatch).toHaveBeenCalledWith(clearAuthUser());
    expect(navigate).toHaveBeenCalledWith("/login", { replace: true });
  });

  it("keeps a stable callback identity across re-renders", () => {
    const { result, rerender } = renderHook(() => useForceLogout());
    const first = result.current.forceLogout;
    rerender();
    expect(result.current.forceLogout).toBe(first);
  });
});
