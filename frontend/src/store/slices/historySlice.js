import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getInteractions } from "../../services/api";

// Normalized shape ({ ids, entities }) so History, Dashboard, and the HCP
// directory can all read from the same store slice instead of each page
// fetching/holding its own local copy of the interaction list.
const initialState = {
  ids: [],
  entities: {},
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

export const fetchInteractions = createAsyncThunk(
  "history/fetchInteractions",
  async () => {
    const res = await getInteractions();
    return res.data;
  }
);

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.status = "succeeded";
        const interactions = action.payload || [];
        state.ids = interactions.map((item) => item.id);
        state.entities = Object.fromEntries(
          interactions.map((item) => [item.id, item])
        );
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "Failed to load interactions";
      });
  },
});

export default historySlice.reducer;

// --- Selectors ---------------------------------------------------------
export const selectAllInteractions = (state) =>
  state.history.ids.map((id) => state.history.entities[id]);

export const selectHistoryStatus = (state) => state.history.status;
export const selectHistoryError = (state) => state.history.error;
