// API
import { fetchClient } from "../../../api/fetchClient";

// Types
import type { NsbOuResponse } from "../../../types/response";

export const getNsbOuApi = async (param?: Record<string, string>) => {
  return fetchClient<NsbOuResponse>("/masterdata/nsb-ou/get", {
    method: "GET",
    queryParams: param,
  });
};