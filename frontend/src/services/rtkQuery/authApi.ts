//* RTK Query endpoint 註冊處
//* 是前端與後端 API 的對應層。

import { api } from "./api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      { accessToken: string; user: { username: string } },
      { username: string; password: string }
    >({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        data: credentials,
      }),
    }),
    register: builder.mutation<
      { message: string },
      { username: string; password: string }
    >({
      query: (data) => ({
        url: "/register",
        method: "POST",
        data,
      }),
    }),
    getProtected: builder.query<{ message: string }, void>({
      query: () => ({
        url: "/protected",
        method: "GET",
      }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProtectedQuery,
  useLogoutMutation,
} = authApi;
