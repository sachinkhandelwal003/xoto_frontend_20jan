// src/context/AuthProvider.jsx
import React, { createContext, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import {
  loginUser,
  logoutUser,
  refreshToken,
  rehydrateAuthState,
  fetchMyPermissions,
} from '../store/authSlice';

export const AuthContext = createContext();

// const API_BASE = 'https://kotiboxglobaltech.online/api';
// const API_BASE = 'http://localhost:5000/api';
const API_BASE = 'https://xoto.ae/api';


export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [intervalId, setIntervalId] = useState(null);
  const hasFetchedPermissions = useRef(false);

  // Rehydrate auth state on app mount
  useEffect(() => {
    dispatch(rehydrateAuthState());
  }, [dispatch]);

  // Fetch permissions once after successful authentication
  useEffect(() => {
    if (isAuthenticated && token && !hasFetchedPermissions.current) {
      hasFetchedPermissions.current = true;
      dispatch(fetchMyPermissions()).unwrap().catch(() => {});
    }

    if (!isAuthenticated) {
      hasFetchedPermissions.current = false;
    }
  }, [isAuthenticated, token, dispatch]);

  // Auto token refresh logic
  useEffect(() => {
  if (!token) return;

  const checkAndRefresh = () => {
    try {
      const decoded = jwtDecode(token);
      const timeUntilExpiry = decoded.exp * 1000 - Date.now();

      if (timeUntilExpiry < 5 * 60 * 1000) {
        dispatch(refreshToken());
      }
    } catch (err) {
      console.error('Invalid token, logging out');
      dispatch(logoutUser());
    }
  };

  checkAndRefresh();
  const id = setInterval(checkAndRefresh, 60 * 1000);

  return () => clearInterval(id);
}, [token, dispatch]);


  // Enhanced login function that accepts dynamic endpoint
// Enhanced login function that accepts dynamic endpoint AND full payload
const login = async (endpoint, credentials) => {
  const fullEndpoint = `${API_BASE}${endpoint}`;

  if (endpoint.includes("agent")) {
    try {
        // ... (fetch wala purana code) ...
        const res = await fetch(fullEndpoint, {
             method: "POST", // Make sure ye POST hai
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(credentials),
        });

        const data = await res.json();

        // Check Success
        if (data.success === true || data?.data?.success === true) {
            
            // Token Nikaalo
            const token = data.token || data.data?.token || data.data?.data?.token;
            const user = data.user || data.data?.user || data.data?.data?.user;

            if (token) {
    localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", JSON.stringify(user));

    console.log("✅ Login Success! Redirecting to Agent Dashboard...");

    // 👇 1. YAHAN CHANGE KARNA HAI (Seedha Agent Dashboard par bhejo)
    setTimeout(() => {
        window.location.href = "/dashboard/agent"; 
    }, 100);

    return data;
}
        }
        
        throw new Error(data.message || "Login Failed");

    } catch (err) {
        console.error(err);
        throw err;
    }
}
  // --- STANDARD FLOW (Baaki sab ke liye) ---
  const response = await dispatch(
    loginUser({
      payload: credentials,
      endpoint: fullEndpoint,
    })
  ).unwrap();

  // Standard flow token save
  const token = response?.token || response?.data?.token;
  if (token) localStorage.setItem("token", token);

  return response;
};

  // Logout with optional backend call
  const logout = async (logoutEndpoint = '/auth/logout') => {
    hasFetchedPermissions.current = false;
    const fullEndpoint = `${API_BASE}${logoutEndpoint}`;
    
    try {
      await dispatch(logoutUser(fullEndpoint));
    } catch (err) {
      // Even if backend fails, clear local state
      dispatch(logoutUser());
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,    // Now supports dynamic endpoints
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;