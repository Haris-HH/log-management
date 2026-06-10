// Types
import type { UsageChartResponse, TopUsersResponse } from "../../../types/response";

// Api
import { fetchClient } from "../../../api/fetchClient";

// Mocks
import {
  mockChartInternalPoliceColumn,
  mockChartInternalPoliceDataGroup,
} from "../../../mocks/mockChartInternalPolice";
import {
  mockChartExternalPoliceColumn,
  mockChartExternalPoliceDataGroup,
} from "../../../mocks/mockChartExternalPolice";
import {
  mockChartInternalNsbColumn,
  mockChartInternalNsbDataGroup,
} from "../../../mocks/mockChartInternalNsb";
import {
  mockTopExternalUsers,
  mockTopInternalUsers,
} from "../../../mocks/mockTopUsers";

// Env
const isDev = import.meta.env.VITE_IS_DEV;

export const getUsagePoliceChart = async (
  body: Record<string, string>
): Promise<UsageChartResponse> => {
  if (isDev) {
    const monthRange = Number(body.count_month ?? 1);

    let columns = mockChartInternalPoliceColumn;
    let data = mockChartInternalPoliceDataGroup.slice(0, monthRange);

    if (body.ou_code === "05") {
      columns = mockChartExternalPoliceColumn;
      data = mockChartExternalPoliceDataGroup.slice(0, monthRange);
    }
    if (body.ou_code !== "05" && body.ou_code !== "00") {
      columns = mockChartInternalNsbColumn;
      data = mockChartInternalNsbDataGroup.slice(0, monthRange);
    }
    
    return {
      columns: columns,
      data: data,
    };
  }

  const res = await fetchClient<UsageChartResponse>(
    "/log-management/access-logs/statistics/ou-access",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  return {
    columns: mockChartInternalPoliceColumn,
    data: res.data,
  };
};

export const getTopUsersChart = async (
  body: Record<string, string>
): Promise<TopUsersResponse> => {
  if (isDev) {
    return body.police_state === "internal"
      ? mockTopInternalUsers
      : mockTopExternalUsers;
  }

  return await fetchClient<TopUsersResponse>(
    "/log-management/access-logs/statistics/user-max-access",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
};