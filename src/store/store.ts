import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "./storage";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// reducers
import DropdownReducer from "../features/dropdown/api/DropdownSlice";
import AuthUserReducer from "../features/auth-user/api/AuthUserSlice";

const rootReducer = combineReducers({
  dropdown: DropdownReducer,
  authUser: AuthUserReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["authUser"],
};

const persistedReducer = persistReducer(
  persistConfig,
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;