import axios from "axios";
import { clearToken, getToken } from "./auth";

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) clearToken();
    return Promise.reject(err);
  }
);

export function apiErrorMessage(err: unknown) {
  const anyErr = err as any;
  return anyErr?.response?.data?.message || anyErr?.message || "Something went wrong";
}

