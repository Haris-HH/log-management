// Types
import type { 
  DeviceCheckLogResponse,
} from "../../../types/response";

// Api
import { fetchClient } from "../../../api/fetchClient";

// Mocks
import { mockDeviceCheckLog } from "../../../mocks/mockDeviceCheckLog";

// Env
const isDev = import.meta.env.VITE_IS_DEV;

export const searchDeviceCheckLog = async (body: Record<string, string>): Promise<DeviceCheckLogResponse> => {
  if (isDev) {
    return mockDeviceCheckLog;
  }

  const res = await fetchClient<DeviceCheckLogResponse>(
    "/log-management/device-check-logs/search",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  return res;
};