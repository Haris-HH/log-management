// Types
import type { 
  OverallProblemReportResponse,
  OverallReportResponse,
  CameraResponse,
} from "../../../types/response";

// Api
import { fetchClient } from "../../../api/fetchClient";

// Mocks
import {
  mockCamera
} from "../../../mocks/mockCameras";
import { 
  mockOverallReport,
} from "../../../mocks/mockOverallReport";
import {
  mockOverallProblemReport
} from "../../../mocks/mockOverallProblemReport";

// Env
const isDev = import.meta.env.VITE_IS_DEV;

export const getOverallCheckpoint = async (): Promise<CameraResponse> => {
  if (isDev) {
    return mockCamera;
  }

  const res = await fetchClient<CameraResponse>(
    "/core-data/cameras/search",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  return res;
};

export const getOverallReport = async (body? : Record<string, string>): Promise<OverallReportResponse> => {
  if (isDev) {
    return mockOverallReport;
  }

  const res = await fetchClient<OverallReportResponse>(
    "/log-management/device-check-logs/statistics/chart-data",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  return res;
};


export const searchOverallProblemReport = async (body? : Record<string, string>): Promise<OverallProblemReportResponse> => {
  if (isDev) {
    return mockOverallProblemReport
  }

  const res = await fetchClient<OverallProblemReportResponse>(
    "/ops-management/devices/statistics/problem-report",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  return res;
};