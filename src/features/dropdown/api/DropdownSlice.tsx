import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Types
import type { 
  ProvinceResponse,
  DistrictResponse,
  SubdistrictResponse,
  NsbOuResponse,
  NsbBhResponse,
  NsbBkResponse,
  NsbOrgResponse,
  TitleResponse,
  LprRegionResponse,
  AreaResponse,
  DeviceStatusResponse,
  ProjectResponse,
  PoliceStationResponse,
} from "../../../types/response";

// API
import {
  getArea,
  getAgency,
  getBh,
  getBk,
  getOrg,
  getProject,
  getProvince,
  getDistrict,
  getSubdistrict,
  getDeviceStatus,
  getTitle,
  getLprRegion,
  getPoliceStation,
} from "./DropdownApi";

interface DropdownState {
  area: AreaResponse["data"];
  agency: NsbOuResponse["data"];
  bh: NsbBhResponse["data"];
  bk: NsbBkResponse["data"];
  org: NsbOrgResponse["data"];
  project: ProjectResponse["data"];
  province: ProvinceResponse["data"];
  district: DistrictResponse["data"];
  subdistrict: SubdistrictResponse["data"];
  deviceStatus: DeviceStatusResponse["data"];
  title: TitleResponse["data"];
  lprRegion: LprRegionResponse["data"];
  policeStation: PoliceStationResponse["data"];
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: DropdownState = {
  area: [],
  agency: [],
  bh: [],
  bk: [],
  org: [],
  project: [],
  province: [],
  district: [],
  subdistrict: [],
  deviceStatus: [],
  title: [],
  lprRegion: [],
  policeStation: [],
  loading: false,
  error: null,
};

type DropdownParams = Record<string, string> | undefined;

const getErrorMessage = (err: any) =>
  err?.response?.data?.message ?? err?.message ?? "Something went wrong";

// Thunks
export const fetchArea = createAsyncThunk<
  AreaResponse["data"],
  DropdownParams,
  { rejectValue: string }
>("dropdown/fetchArea", async (param = undefined, { rejectWithValue }) => {
  try {
    const { data } = await getArea(param);
    return data;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchAgency = createAsyncThunk<
  NsbOuResponse["data"],
  DropdownParams,
  { rejectValue: string }
>("dropdown/fetchAgency", async (param = undefined, { rejectWithValue }) => {
  try {
    const { data } = await getAgency(param);
    return data;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchBh = createAsyncThunk<
  NsbBhResponse["data"],
  DropdownParams,
  { rejectValue: string }
>("dropdown/fetchBh", async (param = undefined, { rejectWithValue }) => {
  try {
    const { data } = await getBh(param);
    return data;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchBk = createAsyncThunk<
  NsbBkResponse["data"],
  DropdownParams,
  { rejectValue: string }
>("dropdown/fetchBk", async (param = undefined, { rejectWithValue }) => {
  try {
    const { data } = await getBk(param);
    return data;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchOrg = createAsyncThunk<
  NsbOrgResponse["data"],
  DropdownParams,
  { rejectValue: string }
>("dropdown/fetchOrg", async (param = undefined, { rejectWithValue }) => {
  try {
    const { data } = await getOrg(param);
    return data;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchProject = createAsyncThunk<
  ProjectResponse["data"],
  DropdownParams,
  { rejectValue: string }
>("dropdown/fetchProject", async (param = undefined, { rejectWithValue }) => {
  try {
    const { data } = await getProject(param);
    return data;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchProvince = createAsyncThunk<
  ProvinceResponse["data"],
  DropdownParams,
  { rejectValue: string }
>("dropdown/fetchProvince", async (param = undefined, { rejectWithValue }) => {
  try {
    const { data } = await getProvince(param);
    return data;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchDistrict = createAsyncThunk<
  DistrictResponse["data"],
  DropdownParams,
  { rejectValue: string }
>("dropdown/fetchDistrict", async (param = undefined, { rejectWithValue }) => {
  try {
    const { data } = await getDistrict(param);
    return data;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchSubdistrict = createAsyncThunk<
  SubdistrictResponse["data"],
  DropdownParams,
  { rejectValue: string }
>("dropdown/fetchSubdistrict", async (param = undefined, { rejectWithValue }) => {
  try {
    const { data } = await getSubdistrict(param);
    return data;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchDeviceStatus = createAsyncThunk<
  DeviceStatusResponse["data"],
  DropdownParams,
  { rejectValue: string }
>("dropdown/fetchDeviceStatus", async (param = undefined, { rejectWithValue }) => {
  try {
    const { data } = await getDeviceStatus(param);
    return data;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchTitle = createAsyncThunk<
  TitleResponse["data"],
  DropdownParams,
  { rejectValue: string }
>("dropdown/fetchTitle", async (param = undefined, { rejectWithValue }) => {
  try {
    const { data } = await getTitle(param);
    return data;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchLprRegion = createAsyncThunk<
  LprRegionResponse["data"],
  DropdownParams,
  { rejectValue: string }
>("dropdown/fetchLprRegion", async (param = undefined, { rejectWithValue }) => {
  try {
    const { data } = await getLprRegion(param);
    return data;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchPoliceStation = createAsyncThunk<
  PoliceStationResponse["data"],
  DropdownParams,
  { rejectValue: string }
>("dropdown/fetchPoliceStation", async (param = undefined, { rejectWithValue }) => {
  try {
    const { data } = await getPoliceStation(param);
    return data;
  } catch (err: any) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// Slice
const dropdownSlice = createSlice({
  name: "dropdown",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // AREA
      .addCase(fetchArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArea.fulfilled, (state, action) => {
        state.loading = false;
        state.area = action.payload;
      })
      .addCase(fetchArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // AGENCY
      .addCase(fetchAgency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgency.fulfilled, (state, action) => {
        state.loading = false;
        state.agency = action.payload;
      })
      .addCase(fetchAgency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // BH
      .addCase(fetchBh.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBh.fulfilled, (state, action) => {
        state.loading = false;
        state.bh = action.payload;
      })
      .addCase(fetchBh.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // BK
      .addCase(fetchBk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBk.fulfilled, (state, action) => {
        state.loading = false;
        state.bk = action.payload;
      })
      .addCase(fetchBk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ORG
      .addCase(fetchOrg.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrg.fulfilled, (state, action) => {
        state.loading = false;
        state.org = action.payload;
      })
      .addCase(fetchOrg.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // PROJECT
      .addCase(fetchProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // PROVINCE
      .addCase(fetchProvince.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProvince.fulfilled, (state, action) => {
        state.loading = false;
        state.province = action.payload;
      })
      .addCase(fetchProvince.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // LPR Region
      .addCase(fetchLprRegion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLprRegion.fulfilled, (state, action) => {
        state.loading = false;
        state.lprRegion = action.payload;
      })
      .addCase(fetchLprRegion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // CHECKPOINT TYPE
      .addCase(fetchDeviceStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeviceStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.deviceStatus = action.payload;
      })
      .addCase(fetchDeviceStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // TITLE
      .addCase(fetchTitle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTitle.fulfilled, (state, action) => {
        state.loading = false;
        state.title = action.payload;
      })
      .addCase(fetchTitle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // POLICE STATION
      .addCase(fetchPoliceStation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPoliceStation.fulfilled, (state, action) => {
        state.loading = false;
        state.policeStation = action.payload;
      })
      .addCase(fetchPoliceStation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dropdownSlice.reducer;