import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

// Store the token separately to ensure it's always available
let lastKnownToken: string | null = null;

// Subscribe to auth store changes to keep token in sync
useAuthStore.subscribe((state) => {
  lastKnownToken = state.token;
  console.log("🔗 API: Token updated in store", {
    hasToken: !!state.token,
    tokenLength: state.token?.length ?? 0,
    tokenPreview: state.token
      ? state.token.substring(0, 20) + "..."
      : "NO_TOKEN",
  });
});

api.interceptors.request.use((config) => {
  // Try to get token from store first, fall back to lastKnownToken
  const storeToken = useAuthStore.getState().token;
  const token = storeToken || lastKnownToken;

  console.log("🔗 API Request: Attaching token", {
    source: storeToken ? "store" : lastKnownToken ? "cache" : "none",
    hasToken: !!token,
    tokenLength: token?.length ?? 0,
    tokenPreview: token ? token.substring(0, 20) + "..." : "NO_TOKEN",
    endpoint: config.url,
  });

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn(
      "🔗 API Request: No token available for request to",
      config.url,
    );
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.error("🔗 API Error:", {
      status: error.response?.status || 'NETWORK_ERROR',
      endpoint: error.config?.url,
      message: error.response?.data?.message || error.message || "Connection failed",
      hasRetry: !originalRequest._retry,
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔗 API: 401 Error - Attempting token refresh");
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        console.log("🔗 API: Token refreshed successfully");
        useAuthStore
          .getState()
          .setAuth(useAuthStore.getState().user!, data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("🔗 API: Token refresh failed, logging out");
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
