// Types
import type { 
  AreaResponse,
  ProvinceResponse,
  DistrictResponse,
  SubdistrictResponse,
  NsbOuResponse,
  NsbBhResponse,
  NsbBkResponse,
  NsbOrgResponse,
  TitleResponse,
  LprRegionResponse,
  DeviceStatusResponse,
  ProjectResponse,
  PoliceStationResponse,
} from "../../../types/response";

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
import { mockDistrict } from "../../../mocks/mockDistricts";
import { mockSubdistrict } from "../../../mocks/mockSubDistricts";
import { mockDeviceStatus } from "../../../mocks/mockDeviceStatus";
import { mockTitle } from "../../../mocks/mockTitle";
import { mockLprRegion } from "../../../mocks/mockLprRegions";
import { mockPoliceStations } from "../../../mocks/mockPoliceStations";

// Env
const isDev = import.meta.env.VITE_IS_DEV;

export const getArea = async (param?: Record<string, string>): Promise<AreaResponse> => {
  if (isDev) {
    return mockArea;
  }

  const res = await fetchClient<AreaResponse>(
    "/masterdata/police-regions/get",
    {
      method: "GET",
      queryParams: param,
    },
  );

  return res;
};

export const getAgency = async (param?: Record<string, string>): Promise<NsbOuResponse> => {
  if (isDev) {
    return mockAgency;
  }

  const res = await fetchClient<NsbOuResponse>(
    "/masterdata/nsb-ou/get",
    {
      method: "GET",
      queryParams: param,
    },
  );

  return res;
};

export const getBh = async (param?: Record<string, string>): Promise<NsbBhResponse> => {
  if (isDev) {
    return mockBh;
  }

  const res = await fetchClient<NsbBhResponse>(
    "/masterdata/nsb-bh/get",
    {
      method: "GET",
      queryParams: param,
    },
  );

  return res;
};

export const getBk = async (param?: Record<string, string>): Promise<NsbBkResponse> => {
  if (isDev) {
    return mockBk;
  }

  const res = await fetchClient<NsbBkResponse>(
    "/masterdata/nsb-bk/get",
    {
      method: "GET",
      queryParams: param,
    },
  );

  return res;
}; 

export const getOrg = async (param?: Record<string, string>): Promise<NsbOrgResponse> => {
  if (isDev) {
    return mockOrg;
  }

  const res = await fetchClient<NsbOrgResponse>(
    "/masterdata/nsb-org/get",
    {
      method: "GET",
      queryParams: param,
    },
  );

  return res;
};

export const getProject = async (param?: Record<string, string>): Promise<ProjectResponse> => {
  if (isDev) {
    return mockProject;
  }

  const res = await fetchClient<ProjectResponse>(
    "/core-data/projects/get",
    {
      method: "GET",
      queryParams: param,
    },
  );

  return res;
};

export const getProvince = async (param?: Record<string, string>): Promise<ProvinceResponse> => {
  if (isDev) {
    return mockProvince;
  }

  const res = await fetchClient<ProvinceResponse>(
    "/masterdata/provinces/get",
    {
      method: "GET",
      queryParams: param,
    },
  );

  return res;
};

export const getDistrict = async (param?: Record<string, string>): Promise<DistrictResponse> => {
  if (isDev) {
    return mockDistrict;
  }

  const res = await fetchClient<DistrictResponse>(
    "/masterdata/districts/get",
    {
      method: "GET",
      queryParams: param,
    },
  );

  return res;
};

export const getSubdistrict = async (param?: Record<string, string>): Promise<SubdistrictResponse> => {
  if (isDev) {
    return mockSubdistrict;
  }

  const res = await fetchClient<SubdistrictResponse>(
    "/masterdata/subdistricts/get",
    {
      method: "GET",
      queryParams: param,
    },
  );

  return res;
};

export const getDeviceStatus = async (param?: Record<string, string>): Promise<DeviceStatusResponse> => {
  if (isDev) {
    return mockDeviceStatus;
  }

  const res = await fetchClient<DeviceStatusResponse>(
    "/masterdata/device-statuses/get",
    {
      method: "GET",
      queryParams: param,
    },
  );

  return res;
};

export const getTitle = async (param?: Record<string, string>): Promise<TitleResponse> => {
  if (isDev) {
    return mockTitle;
  }

  const res = await fetchClient<TitleResponse>(
    "/masterdata/person-titles/get",
    {
      method: "GET",
      queryParams: param,
    },
  );
  
  return res;
};

export const getLprRegion = async (param?: Record<string, string>): Promise<LprRegionResponse> => {
  if (isDev) {
    return mockLprRegion;
  }

  const res = await fetchClient<LprRegionResponse>(
    "/masterdata/lpr-regions/get",
    {
      method: "GET",
      queryParams: param,
    },
  );
  
  return res;
};

export const getPoliceStation = async (param?: Record<string, string>): Promise<PoliceStationResponse> => {
  if (isDev) {
    return mockPoliceStations;
  }

  const res = await fetchClient<PoliceStationResponse>(
    "/masterdata/police-stations/get",
    {
      method: "GET",
      queryParams: param,
    },
  );

  return res;
};