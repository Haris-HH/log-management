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

export const getUsageInternalPoliceChart = async (selectedMonthYear: string, monthRange: 1 | 3): Promise<UsageChartResponse> => {
  if (isDev) {
    return {
      columns: mockChartInternalPoliceColumn,
      data: mockChartInternalPoliceDataGroup.slice(0, monthRange),
    };
  }

  const res = await fetchClient<UsageChartResponse>(
    "/statistic/usage-chart",
    {
      method: "POST",
      body: JSON.stringify({
        selectedMonthYear,
        monthRange,
      }),
    },
  );

  return {
    columns: mockChartInternalPoliceColumn,
    data: res.data,
  };
};

export const getUsageExternalPoliceChart = async (selectedMonthYear: string, monthRange: 1 | 3): Promise<UsageChartResponse> => {
  if (isDev) {
    return {
      columns: mockChartExternalPoliceColumn,
      data: mockChartExternalPoliceDataGroup.slice(0, monthRange),
    };
  }

  const res = await fetchClient<UsageChartResponse>(
    "/statistic/usage-chart",
    {
      method: "POST",
      body: JSON.stringify({
        selectedMonthYear,
        monthRange,
      }),
    },
  );

  return {
    columns: mockChartExternalPoliceColumn,
    data: res.data,
  };
};

export const getUsageInternalNsbChart = async (selectedMonthYear: string, monthRange: 1 | 3): Promise<UsageChartResponse> => {
  if (isDev) {
    return {
      columns: mockChartInternalNsbColumn,
      data: mockChartInternalNsbDataGroup.slice(0, monthRange),
    };
  }

  const res = await fetchClient<UsageChartResponse>(
    "/statistic/usage-chart",
    {
      method: "POST",
      body: JSON.stringify({
        selectedMonthYear,
        monthRange,
      }),
    },
  );

  return {
    columns: mockChartInternalNsbColumn,
    data: res.data,
  };
};

export const getTopUsersChart = async (selectedMonthYear: string, policeState: "internal" | "external"): Promise<TopUsersResponse> => {
  if (isDev) {
    return policeState === "internal" ? mockTopInternalUsers : mockTopExternalUsers;
  }

  const res = await fetchClient<TopUsersResponse>(
    "/statistic/usage-chart",
    {
      method: "POST",
      body: JSON.stringify({
        selectedMonthYear,
        policeState,
      }),
    },
  );

  return policeState === "internal" ? res : res;
};