import { configureStore } from "@reduxjs/toolkit";
import salesReducer from "../features/salesSlice";

export const store = configureStore({
  reducer: {
    sales: salesReducer,
  },
});

// Типізація RootState та Dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
