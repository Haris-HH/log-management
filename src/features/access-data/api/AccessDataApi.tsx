// Types
import type { 
  AccessLogResponse,
} from "../../../types/response";

// Api
import { fetchClient } from "../../../api/fetchClient";

// Mocks
import { mockAccessLog } from "../../../mocks/mockAccessLog";

// Env
const isDev = import.meta.env.VITE_IS_DEV;

export const searchAccessLogs = async (param?: Record<string, string>, body?: Record<string, string>): Promise<AccessLogResponse> => {
  if (isDev) {
    return mockAccessLog;
  }

  const res = await fetchClient<AccessLogResponse>(
    "/log-management/access-logs/search",
    {
      method: "POST",
      body: JSON.stringify(body),
      queryParams: param,
    },
  );

  return res;
};