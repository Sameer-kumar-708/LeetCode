import { configureStore } from "@reduxjs/toolkit";
import authRouter from "../authSlice";

const store = configureStore({
  reducer: {
    auth: authRouter,
  },
});

export default store;
