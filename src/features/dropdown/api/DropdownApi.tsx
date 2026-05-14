// Types
import type { DropdownResponse } from "../../../types/response";

// Api
import { fetchClient } from "../../../api/fetchClient";

// Mocks
import { mockArea } from "../../../mocks/mockArea";
import { mockAgency } from "../../../mocks/mockAgency";
import { mockBh } from "../../../mocks/mockBh";
import { mockBk } from "../../../mocks/mockBk";
import { mockOrg } from "../../../mocks/mockOrg";
import { mockProject } from "../../../mocks/mockProject";
import { mockProvince } from "../../../mocks/mockProvince";
import { mockCheckpointType } from "../../../mocks/mockCheckpointType";

// Env
const isDev = import.meta.env.VITE_IS_DEV;

export const getArea = async (): Promise<DropdownResponse> => {
  if (isDev) {
    return {
      data: mockArea,
    };
  }

  const res = await fetchClient<DropdownResponse>(
    "/nsb-option/police-division",
    {
      method: "GET",
    },
  );

  return {
    data: res.data,
  };
};

export const getAgency = async (): Promise<DropdownResponse> => {
  if (isDev) {
    return {
      data: mockAgency,
    };
  }

  const res = await fetchClient<DropdownResponse>(
    "/option/ou",
    {
      method: "GET",
    },
  );

  return {
    data: res.data,
  };
};

export const getBh = async (): Promise<DropdownResponse> => {
  if (isDev) {
    return {
      data: mockBh,
    };
  }

  const res = await fetchClient<DropdownResponse>(
    "/option/bh",
    {
      method: "GET",
    },
  );

  return {
    data: res.data,
  };
};

export const getBk = async (): Promise<DropdownResponse> => {
  if (isDev) {
    return {
      data: mockBk,
    };
  }

  const res = await fetchClient<DropdownResponse>(
    "/option/bk",
    {
      method: "GET",
    },
  );

  return {
    data: res.data,
  };
}; 

export const getOrg = async (): Promise<DropdownResponse> => {
  if (isDev) {
    return {
      data: mockOrg,
    };
  }

  const res = await fetchClient<DropdownResponse>(
    "/option/org",
    {
      method: "GET",
    },
  );

  return {
    data: res.data,
  };
};

export const getProject = async (): Promise<DropdownResponse> => {
  if (isDev) {
    return {
      data: mockProject,
    };
  }

  const res = await fetchClient<DropdownResponse>(
    "/option/project",
    {
      method: "GET",
    },
  );

  return {
    data: res.data,
  };
};

export const getProvince = async (): Promise<DropdownResponse> => {
  if (isDev) {
    return {
      data: mockProvince,
    };
  }

  const res = await fetchClient<DropdownResponse>(
    "/option/province",
    {
      method: "GET",
    },
  );

  return {
    data: res.data,
  };
};

export const getCheckpointType = async (): Promise<DropdownResponse> => {
  if (isDev) {
    return {
      data: mockCheckpointType,
    };
  }

  const res = await fetchClient<DropdownResponse>(
    "/option/checkpointType",
    {
      method: "GET",
    },
  );

  return {
    data: res.data,
  };
};