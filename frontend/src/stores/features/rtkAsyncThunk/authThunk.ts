import { createAsyncThunk } from "@reduxjs/toolkit";
// import axiosInstance from "@/services/rtkAsyncThunk/axiosInstance";
import axios from "axios";
import { UserProfile } from "./authSlice";

const gasURL =
  "https://script.google.com/macros/s/AKfycbzjeh8Nj8NKH-uH3VLFYtanEIMjmX7DovMDQ6mmR6JMddIcu4LFORlQilGD2iJNyx34/exec";

//* 因為GAS不支援jwt，這邊直接打API不經過axiosInstance
export const loginAsync = createAsyncThunk(
  "auth/login",
  async (
    payload: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post(
        `${gasURL}?action=login`,
        JSON.stringify(payload),
        {
          headers: {
            // ❌ Apps Script Web App 不允許 application/json
            // 因此不能加 "Content-Type"
          },
        }
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Login failed");
    }
  }
);

export const registerAsync = createAsyncThunk(
  "auth/register",
  async (payload: UserProfile, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${gasURL}?action=register`,
        JSON.stringify(payload)
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Register failed");
    }
  }
);

// export const logoutAsync = createAsyncThunk(
//   "auth/logout",
//   async (_, { rejectWithValue }) => {
//     try {
//       await axiosInstance.post("/logout");
//       return true;
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data || "Logout failed");
//     }
//   }
// );
