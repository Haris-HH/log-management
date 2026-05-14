import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";

// Slice
import DropdownReducer from "../features/dropdown/api/DropdownSlice";

// Reducer
export const store = configureStore({
  reducer: {
    dropdown: DropdownReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persist = persistStore(store);
export default store;