import { configureStore } from "@reduxjs/toolkit";
import interactionReducer from "./slices/interactionSlice";
import historyReducer from "./slices/historySlice";

const store = configureStore({
  reducer: {
    interaction: interactionReducer,
    history: historyReducer,
  },
});

export default store;
