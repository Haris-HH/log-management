import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

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
    clearAuthUser: (state) => {
      state.user = null;
    },
  },
});

export const { setAuthUser, clearAuthUser } = authUserSlice.actions;
export default authUserSlice.reducer;