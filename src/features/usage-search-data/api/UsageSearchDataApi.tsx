// Types
import type { 
  LprSearchLogResponse,
} from "../../../types/response";

// Api
import { fetchClient } from "../../../api/fetchClient";

// Mocks
import { mockLprSearchLog } from "../../../mocks/mockLprSearchLog";

// Env
const isDev = import.meta.env.VITE_IS_DEV;

export const searchLprSearchLogs = async (param?: Record<string, string>, body?: Record<string, string>): Promise<LprSearchLogResponse> => {
  if (isDev) {
    return mockLprSearchLog;
  }

  const res = await fetchClient<LprSearchLogResponse>(
    "/log-management/lpr-search-logs/search",
    {
      method: "POST",
      body: JSON.stringify(body),
      queryParams: param,
    },
  );

  return res;
};