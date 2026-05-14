// Types
import type { 
  OverallCheckpointResponse,
  OverallDayReportResponse,
  OverallLineChartReportResponse,
  OverallReportDetailResponse,
} from "../../../types/response";

// Api
import { fetchClient } from "../../../api/fetchClient";

// Mocks
import {
  mockOverallCheckpoint
} from "../../../mocks/mockOverallCheckpoint";
import { 
  mockOverallDayReport, 
  mockOverallWeekReport,
  mockOverallMonthReport,
} from "../../../mocks/mockOverallReport";
import {
  mockOverallReportDetail
} from "../../../mocks/mockOverallReportDetail";

// Env
const isDev = import.meta.env.VITE_IS_DEV;

export const getOverallCheckpoint = async (): Promise<OverallCheckpointResponse> => {
  if (isDev) {
    return {
      data: mockOverallCheckpoint,
    };
  }

  const res = await fetchClient<OverallCheckpointResponse>(
    "/overview/checkpoint",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  return {
    data: res.data,
  };
};

export const getOverallDayReport = async (): Promise<OverallDayReportResponse> => {
  if (isDev) {
    return {
      data: mockOverallDayReport,
    };
  }

  const res = await fetchClient<OverallDayReportResponse>(
    "/overview/daily-report",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  return {
    data: res.data,
  };
};

export const getOverallReport = async (reportRange: "week" | "month"): Promise<OverallLineChartReportResponse> => {
  if (isDev) {
    return {
      data: reportRange === "week" ? mockOverallWeekReport : mockOverallMonthReport,
    };
  }

  const res = await fetchClient<OverallLineChartReportResponse>(
    reportRange === "week" ? "/overview/weekly-report" : "/overview/monthly-report",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  return {
    data: res.data,
  };
};


export const getOverallReportDetail = async (): Promise<OverallReportDetailResponse> => {
  if (isDev) {
    return {
      data: mockOverallReportDetail,
    };
  }

  const res = await fetchClient<OverallReportDetailResponse>(
    "/overview/report-detail",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  return {
    data: res.data,
  };
};