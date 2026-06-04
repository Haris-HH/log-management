// API
import { fetchClient } from "../../../api/fetchClient";

// Types
import type { UserResponse } from "../../../types/response";

export const getUserApi = async (param?: Record<string, string>) => {
  return fetchClient<UserResponse>("/user-management/users/get", {
    method: "GET",
    queryParams: param,
  });
};