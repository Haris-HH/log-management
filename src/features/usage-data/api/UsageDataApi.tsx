// Types
import type { 
  AgencyUsageResponse,
  LogUsageResponse,
  PersonUsageResponse,
} from "../../../types/response";

// Api
import { fetchClient } from "../../../api/fetchClient";

// Mocks
import { mockAgencyUsage } from "../../../mocks/mockAgencyUsage";
import { mockLogUsage } from "../../../mocks/mockLogUsage"
import { mockPersonUsage } from "../../../mocks/mockPersonUsage";

// Env
const isDev = import.meta.env.VITE_IS_DEV;

export const getAgencyUsage = async (): Promise<AgencyUsageResponse> => {
  if (isDev) {
    return {
      data: mockAgencyUsage,
    };
  }

  const res = await fetchClient<AgencyUsageResponse>(
    "/usage-stat/organization",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  return res;
};

export const getLogUsage = async (): Promise<LogUsageResponse> => {
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

export const getPersonUsage = async (): Promise<PersonUsageResponse> => {
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