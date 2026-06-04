// Types
import type { 
  AccessLogResponse,
  LogUsageResponse,
  PersonUsageResponse,
} from "../../../types/response";

// Api
import { fetchClient } from "../../../api/fetchClient";

// Mocks
import { mockAccessLog } from "../../../mocks/mockAccessLog";
import { mockLogUsage } from "../../../mocks/mockLogUsage"
import { mockPersonUsage } from "../../../mocks/mockPersonUsage";

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

export const getLogUsage = async (param?: Record<string, string>, body?: Record<string, string>): Promise<LogUsageResponse> => {
  if (isDev) {
    return {
      data: mockLogUsage,
    };
  }

  const res = await fetchClient<LogUsageResponse>(
    "/usage-stat/person-logs",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  return res;
};

export const getPersonUsage = async (param?: Record<string, string>, body?: Record<string, string>): Promise<PersonUsageResponse> => {
  if (isDev) {
    return {
      data: mockPersonUsage,
    };
  }

  const res = await fetchClient<PersonUsageResponse>(
    "/usage-stat/person",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  return res;
};