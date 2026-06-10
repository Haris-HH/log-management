// Types
import type { 
  DeviceResponse,
} from "../../../types/response";

// Api
import { fetchClient } from "../../../api/fetchClient";

// Mocks
import { mockDevice } from "../../../mocks/mockDevice";

// Env
const isDev = import.meta.env.VITE_IS_DEV;

export const searchDevice = async (body: Record<string, string>): Promise<DeviceResponse> => {
  if (isDev) {
    return mockDevice;
  }

  const res = await fetchClient<DeviceResponse>(
    "/ops-management/devices/search",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  return res;
};