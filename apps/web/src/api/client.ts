import axios from "axios";
import type { AxiosRequestConfig } from "axios";

let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach JWT access token from memory
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// Response interceptor — handle 401 and refresh via HttpOnly cookie
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      originalRequest._retry = true;

      try {
        // refreshToken is sent automatically via HttpOnly cookie
        const res = await axios.post("/api/auth/refresh");
        const { accessToken } = res.data;
        setAccessToken(accessToken);
        originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        setAccessToken(null);
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
