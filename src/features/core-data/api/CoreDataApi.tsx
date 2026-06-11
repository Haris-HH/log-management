// Types
import type { 
  CheckpointResponse,
} from "../../../types/response";

// Api
import { fetchClient } from "../../../api/fetchClient";

// Mocks
import { mockCheckpoint } from "../../../mocks/mockCheckpoints";

// Env
const isDev = import.meta.env.VITE_IS_DEV;

export const getCheckpoints = async (param?: Record<string, string>): Promise<CheckpointResponse> => {
  if (isDev) {
    return mockCheckpoint;
  }

  const res = await fetchClient<CheckpointResponse>(
    "/core-data/checkpoints/get",
    {
      method: "GET",
      queryParams: param,
    },
  );

  return res;
};