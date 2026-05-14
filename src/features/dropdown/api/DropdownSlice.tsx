import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Types
import type { DropdownResponse } from "../../../types/response";

// API
import {
  getArea,
  getAgency,
  getBh,
  getBk,
  getOrg,
  getProject,
  getProvince,
  getCheckpointType,
} from "./DropdownApi";

interface DropdownState {
  area: DropdownResponse["data"];
  agency: DropdownResponse["data"];
  bh: DropdownResponse["data"];
  bk: DropdownResponse["data"];
  org: DropdownResponse["data"];
  project: DropdownResponse["data"];
  province: DropdownResponse["data"];
  checkpointType: DropdownResponse["data"];
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
  checkpointType: [],
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

export const fetchCheckpointType = createAsyncThunk(
  "dropdown/fetchCheckpointType",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getCheckpointType();
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

      // CHECKPOINT TYPE
      .addCase(fetchCheckpointType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCheckpointType.fulfilled, (state, action) => {
        state.loading = false;
        state.checkpointType = action.payload;
      })
      .addCase(fetchCheckpointType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dropdownSlice.reducer;