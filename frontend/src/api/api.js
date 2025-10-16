// src/api/api.js
import axios from "axios";

// ✅ Create axios instance with proper configuration
const api = axios.create({
  baseURL: "http://127.0.0.1:8081/api", // Spring Boot backend base path
  withCredentials: false,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ Request Interceptor: attach token unless it's an auth endpoint
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const url = config.url || "";
    const isAuthEndpoint =
      url.includes("/auth") || url.includes("/login") || url.includes("/register");

    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging only during development
    if (import.meta.env.MODE === "development") {
      console.log(
        `[API REQUEST] → ${config.method?.toUpperCase()} ${config.url}`,
        config.data || ""
      );
    }

    return config;
  },
  (error) => {
    console.error("[API REQUEST ERROR]", error);
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor: handle backend + network errors cleanly
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.MODE === "development") {
      console.log(
        `[API RESPONSE] ← ${response.status} ${response.config.url}`,
        response.data
      );
    }
    return response;
  },
  (error) => {
    console.error("[API RESPONSE ERROR]", error);

    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 400:
          toast.error("⚠️ Bad request. Check input data.");
          break;
        case 401:
          console.warn("Token expired or unauthorized. Redirecting...");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("username");
          window.location.href = "/login";
          break;
        case 404:
          console.error("🚫 Endpoint not found:", error.response.config?.url);
          break;
        case 500:
          console.error("💥 Server error:", error.response.data?.message || "Internal error");
          break;
        default:
          console.error(`⚠️ Unexpected error (status ${status}):`, error.response.data);
      }
    } else if (error.request) {
      console.error("❌ No response from backend. Check if Spring Boot is running.");
    } else {
      console.error("⚙️ Request configuration error:", error.message);
    }

    return Promise.reject(error);
  }
);

// ✅ Optional: Quick backend connection test
export const testBackendConnection = async () => {
  try {
    const res = await api.get("/auth/test");
    console.log("✅ Backend connected successfully:", res.data);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("❌ Backend connection failed:", err.message);
    return { success: false, error: err.message };
  }
};

// ✅ Dedicated endpoints for Bin Registration (optional helpers)
export const registerBin = async (binData) => {
  try {
    const res = await api.post("/bins/register", binData);
    return res.data;
  } catch (error) {
    console.error("Error registering bin:", error);
    throw error;
  }
};

export const fetchAllBins = async () => {
  try {
    const res = await api.get("/bins");
    return res.data;
  } catch (error) {
    console.error("Error fetching bins:", error);
    throw error;
  }
};

export default api;
