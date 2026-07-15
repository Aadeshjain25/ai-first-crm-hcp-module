import { createSlice } from "@reduxjs/toolkit";

const initialFormData = {
  hcp_name: "",
  interaction_type: "",
  interaction_date: "",
  interaction_time: "",
  location: "",
  discussion: "",
  products_discussed: "",
  materials_shared: "",
  samples_distributed: "",
  sentiment: "",
  outcome: "",
  follow_up: "",
  ai_summary: "",
};

const initialState = {
  formData: initialFormData,
  summary: "",
  followUps: [],
  insights: [],
};

const interactionSlice = createSlice({
  name: "interaction",
  initialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = action.payload;
    },
    updateFormData: (state, action) => {
      state.formData = {
        ...state.formData,
        ...action.payload,
      };
    },
    resetFormData: (state) => {
      state.formData = { ...initialFormData };
      state.summary = "";
      state.followUps = [];
      state.insights = [];
    },
    setSummary: (state, action) => {
      state.summary = action.payload;
    },
    setFollowUps: (state, action) => {
      state.followUps = action.payload;
    },
    setInsights: (state, action) => {
      state.insights = action.payload;
    },
  },
});

export const {
  setFormData,
  updateFormData,
  resetFormData,
  setSummary,
  setFollowUps,
  setInsights,
} = interactionSlice.actions;

export default interactionSlice.reducer;
