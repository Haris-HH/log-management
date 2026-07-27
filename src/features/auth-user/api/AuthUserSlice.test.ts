import { describe, it, expect } from "vitest";

import reducer, {
  setAuthUser,
  clearAuthUser,
  type AuthUser,
} from "./AuthUserSlice";

const user: AuthUser = {
  user_id: "u-1",
  hash_id: "hash-1",
  title_name_th: "พ.ต.ท.",
  title_name_en: "Pol.Lt.Col.",
  first_name: "สมชาย",
  last_name: "ใจดี",
  image_url: "/avatar.png",
  agency: { ou_code: "OU1", ou_abbr_th: "ตร.", ou_abbr_en: "RTP" },
};

describe("authUser reducer", () => {
  it("starts with no user", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual({ user: null });
  });

  it("stores the signed-in user", () => {
    expect(reducer(undefined, setAuthUser(user))).toEqual({ user });
  });

  it("replaces an existing user on re-login", () => {
    const next = { ...user, user_id: "u-2" };
    expect(reducer({ user }, setAuthUser(next)).user).toEqual(next);
  });

  it("drops the user on logout", () => {
    expect(reducer({ user }, clearAuthUser())).toEqual({ user: null });
  });

  it("clearing when already signed out is a no-op", () => {
    expect(reducer({ user: null }, clearAuthUser())).toEqual({ user: null });
  });

  it("ignores unrelated actions", () => {
    expect(reducer({ user }, { type: "other/action" })).toEqual({ user });
  });
});
