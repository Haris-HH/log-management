// API
import { fetchClient } from "../../../api/fetchClient";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId?: string;
}

export const loginApi = async (payload: LoginRequest) => {
  return fetchClient<LoginResponse>("/user-management/users/login", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(payload),
  });
};

export const logoutApi = async () => {
  return fetchClient("/user-management/users/logout", {
    method: "POST",
  });
};