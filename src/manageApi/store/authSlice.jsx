// store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// ================= BASE API =================
const API_BASE = "https://xoto.ae/api";

// ================= USER NORMALIZER =================
// 🔥 IS FILE KA SABSE IMPORTANT PART
const normalizeUser = (decoded) => {
  if (!decoded) return null;

  return {
    ...decoded,
    name: decoded.name || decoded.fullName || "User",
    email: decoded.email || "",
    role:
      typeof decoded.role === "string"
        ? { name: decoded.role }
        : decoded.role
        ? decoded.role
        : { name: "developer" },
  };
};

// ================= LOAD INITIAL STATE =================
const loadInitialState = () => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 > Date.now()) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;

        return {
          user: normalizeUser(decoded),
          token,
          permissions: {},
          loading: false,
          error: null,
          isAuthenticated: true,
        };
      } else {
        localStorage.removeItem("token");
      }
    } catch {
      localStorage.removeItem("token");
    }
  }

  return {
    user: null,
    token: null,
    permissions: {},
    loading: false,
    error: null,
    isAuthenticated: false,
  };
};

// ================= LOGIN =================
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ payload, endpoint }, { rejectWithValue }) => {
    try {
      const response = await axios.post(endpoint, payload);
      const data = response.data;

      if (!data.token) {
        return rejectWithValue(data.message || "Login failed");
      }

      const token = data.token;
      const decoded = jwtDecode(token);

      localStorage.setItem("token", token);
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      return {
        user: normalizeUser(decoded),
        token,
        message: data.message || "Login successful",
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Login failed"
      );
    }
  }
);

// ================= LOGOUT =================
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (logoutUrl, { getState }) => {
    try {
      const { token } = getState().auth;

      if (token && logoutUrl) {
        await axios.post(
          logoutUrl,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common.Authorization;
    }
  }
);

// ================= REFRESH TOKEN =================
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) return rejectWithValue("No token");

      const res = await axios.post("/auth/refresh");
      const newToken = res.data.token;
      const decoded = jwtDecode(newToken);

      localStorage.setItem("token", newToken);
      axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      return {
        user: normalizeUser(decoded),
        token: newToken,
      };
    } catch {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common.Authorization;
      return rejectWithValue("Refresh failed");
    }
  }
);

// ================= FETCH PERMISSIONS =================
export const fetchMyPermissions = createAsyncThunk(
  "auth/fetchMyPermissions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token, user } = getState().auth;

      // 🔥 Developer / Agent → permissions skip
      if (!user?.role || user.role.name === "developer") {
        return [];
      }

      const res = await axios.get(`${API_BASE}/permission/my/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        return res.data.permissions;
      }

      return rejectWithValue(res.data.message);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch permissions"
      );
    }
  }
);

// ================= SLICE =================
const authSlice = createSlice({
  name: "auth",
  initialState: loadInitialState(),
  reducers: {
    setAuthFromToken: (state, action) => {
      const token = action.payload;
      const decoded = jwtDecode(token);

      state.token = token;
      state.user = normalizeUser(decoded);
      state.isAuthenticated = true;
      state.error = null;

      localStorage.setItem("token", token);
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    },

    rehydrateAuthState: (state) => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 > Date.now()) {
          state.user = normalizeUser(decoded);
          state.token = token;
          state.isAuthenticated = true;
          axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
          localStorage.removeItem("token");
        }
      } catch {
        localStorage.removeItem("token");
      }
    },

    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.permissions = {};
        state.isAuthenticated = false;
      })

      // REFRESH
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.permissions = {};
        state.isAuthenticated = false;
      })

      // PERMISSIONS
      .addCase(fetchMyPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = Array.isArray(action.payload)
          ? action.payload.reduce((map, p) => {
              const key = p.subModule
                ? `${p.module.name}→${p.subModule.name}`
                : p.module.name;

              map[key] = {
                canView: p.permissions.canView,
                canAdd: p.permissions.canAdd,
                canEdit: p.permissions.canEdit,
                canDelete: p.permissions.canDelete,
                canViewAll: p.permissions.canViewAll,
                route: p.subModule?.route || p.module.route,
                icon: p.subModule?.icon || p.module.icon,
                name: p.subModule?.name || p.module.name,
                moduleName: p.module.name,
              };
              return map;
            }, {})
          : {};
      })
      .addCase(fetchMyPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.permissions = {};
      });
  },
});

export const {
  rehydrateAuthState,
  clearError,
  setAuthFromToken,
} = authSlice.actions;

export default authSlice.reducer;
