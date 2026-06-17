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

// Thunks
export const fetchArea = createAsyncThunk(
  "dropdown/fetchArea",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getArea();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAgency = createAsyncThunk(
  "dropdown/fetchAgency",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAgency();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchBh = createAsyncThunk(
  "dropdown/fetchBh",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getBh();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchBk = createAsyncThunk(
  "dropdown/fetchBk",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getBk();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchOrg = createAsyncThunk(
  "dropdown/fetchOrg",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getOrg();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchProject = createAsyncThunk(
  "dropdown/fetchProject",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProject();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchProvince = createAsyncThunk(
  "dropdown/fetchProvince",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProvince();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchDistrict = createAsyncThunk(
  "dropdown/fetchDistrict",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getDistrict();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchSubdistrict = createAsyncThunk(
  "dropdown/fetchSubdistrict",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getSubdistrict();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchDeviceStatus = createAsyncThunk(
  "dropdown/fetchDeviceStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getDeviceStatus();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTitle = createAsyncThunk(
  "dropdown/fetchTitle",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getTitle();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchLprRegion = createAsyncThunk(
  "dropdown/fetchLprRegion",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getLprRegion();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPoliceStation = createAsyncThunk(
  "dropdown/fetchPoliceStation",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getPoliceStation();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

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