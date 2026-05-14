// Types
import type { 
  SearchAgencyUsageResponse,
  SearchPersonUsageResponse,
  SearchLogUsageResponse,
} from "../../../types/response";

// Api
import { fetchClient } from "../../../api/fetchClient";

// Mocks
import { mockAgencyUsage } from "../../../mocks/mockAgencyUsage";
import { mockSearchLog } from "../../../mocks/mockSearchLog";
import { mockPersonUsage } from "../../../mocks/mockPersonUsage";

// Env
const isDev = import.meta.env.VITE_IS_DEV;

export const getSearchAgencyUsage = async (): Promise<SearchAgencyUsageResponse> => {
  if (isDev) {
    return {
      data: mockAgencyUsage,
    };
  }

  const res = await fetchClient<SearchAgencyUsageResponse>(
    "/usage-stat/organization",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  return res;
};

export const getSearchLogUsage = async (): Promise<SearchLogUsageResponse> => {
  if (isDev) {
    return {
      data: mockSearchLog,
    };
  }

  const res = await fetchClient<SearchLogUsageResponse>(
    "/usage-stat/person-logs",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  return res;
};

export const getSearchPersonUsage = async (): Promise<SearchPersonUsageResponse> => {
  if (isDev) {
    return {
      data: mockPersonUsage,
    };
  }

  const res = await fetchClient<SearchPersonUsageResponse>(
    "/usage-stat/person",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  return res;
};