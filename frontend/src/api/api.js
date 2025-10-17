import axios from "axios";
import toast from "react-hot-toast";

// ✅ Dynamic backend URL (local → production switch ready)
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8081/api";

// ✅ Create axios instance with proper configuration
const api = axios.create({
  baseURL: BASE_URL,
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

    // Log API requests in development mode
    if (import.meta.env.MODE === "development") {
      console.log(
        `%c[API REQUEST] → ${config.method?.toUpperCase()} ${config.url}`,
        "color: cyan;",
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

// ✅ Response Interceptor: handle backend + network errors
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.MODE === "development") {
      console.log(
        `%c[API RESPONSE] ← ${response.status} ${response.config.url}`,
        "color: green;",
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
          toast.error("⚠️ Bad request. Please check your input fields.");
          break;

        case 401:
          toast.error("🔒 Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("username");
          window.location.href = "/login";
          break;

        case 404:
          toast.error("🚫 Requested resource not found.");
          break;

        case 500:
          toast.error(
            "💥 Server error. Please try again later or check backend logs."
          );
          break;

        default:
          toast.error(
            `⚠️ Unexpected error (status ${status}). Check console for details.`
          );
      }
    } else if (error.request) {
      toast.error("❌ No response from backend. Check if Spring Boot is running.");
    } else {
      toast.error("⚙️ Request setup error: " + error.message);
    }

    return Promise.reject(error);
  }
);

// ✅ Quick backend connectivity test
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

//
// 🗑️ BIN MANAGEMENT ENDPOINTS
//

// ✅ Create (Register) a new Bin
export const registerBin = async (binData) => {
  try {
    const res = await api.post("/bins/register", binData);
    toast.success("🗑️ Bin registered successfully!");
    return res.data;
  } catch (error) {
    console.error("Error registering bin:", error);
    throw error;
  }
};

// ✅ Read (Fetch all bins)
export const fetchAllBins = async () => {
  try {
    const res = await api.get("/bins");
    return res.data;
  } catch (error) {
    console.error("Error fetching bins:", error);
    throw error;
  }
};

// ✅ Read (Fetch single bin by ID)
export const fetchBinById = async (id) => {
  try {
    const res = await api.get(`/bins/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching bin by ID:", error);
    throw error;
  }
};

// ✅ Update existing Bin
export const updateBin = async (id, updatedData) => {
  try {
    const res = await api.put(`/bins/${id}`, updatedData);
    toast.success("✅ Bin updated successfully!");
    return res.data;
  } catch (error) {
    console.error("Error updating bin:", error);
    throw error;
  }
};

// ✅ Delete a Bin
export const deleteBin = async (id) => {
  try {
    await api.delete(`/bins/${id}`);
    toast.success("🗑️ Bin deleted successfully!");
  } catch (error) {
    console.error("Error deleting bin:", error);
    throw error;
  }
};

export default api;
