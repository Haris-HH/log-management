import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Types
import type { Permissions } from "../../../types/common";

export interface AuthUser {
  user_id: string;
  hash_id: string;
  title_name_th: string;
  title_name_en: string;
  first_name: string;
  last_name: string;
  image_url: string;
  agency?: {
    ou_code: string;
    ou_abbr_th?: string;
    ou_abbr_en?: string;
  };
  /*
    What the user may see and do, as of the last time the server was asked.
    Persisted with the rest of the user so a reload has something to gate on
    immediately; `undefined` means "not known yet" and is distinct from `null`
    ("asked, and they have none") — permission checks hold rather than deny
    while it is undefined. See `usePermission`.
  */
  permission?: Permissions | null;
}

interface AuthUserState {
  user: AuthUser | null;
}

const initialState: AuthUserState = {
  user: null,
};

const authUserSlice = createSlice({
  name: "authUser",
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
    /*
      Permissions are refreshed on every app load, separately from the identity
      fields, so a grant revoked server-side takes effect on the next reload
      instead of only after the user logs out and back in.
    */
    setAuthPermission: (state, action: PayloadAction<Permissions | null>) => {
      if (!state.user) return;

      state.user.permission = action.payload;
    },
    /*
      Settles an unknown permission tree into "none" without overwriting one we
      already have. Used when the refresh fails: a transient network error must
      not blank the menu for a user whose grants are already persisted, but a
      session that never had any has to stop waiting or the app holds forever.
    */
    resolveAuthPermission: (state) => {
      if (!state.user || state.user.permission !== undefined) return;

      state.user.permission = null;
    },
    clearAuthUser: (state) => {
      state.user = null;
    },
  },
});

export const {
  setAuthUser,
  setAuthPermission,
  resolveAuthPermission,
  clearAuthUser,
} = authUserSlice.actions;
export default authUserSlice.reducer;