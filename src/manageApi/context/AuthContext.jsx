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



const login = async (endpoint, credentials) => {
  const fullEndpoint = `${API_BASE}${endpoint}`;

if (
  endpoint.includes("agent") ||
  endpoint.includes("agency") ||
  endpoint.includes("developer")
) {
  try {

    const res = await fetch(fullEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (data.success === true || data?.data?.success === true || data.token || data?.data?.token) {

      const token =
        data.token ||
        data.data?.token ||
        data.data?.data?.token;

      const user =
        data.user ||
        data.agency ||
        data.agent ||
        data.developer ||
        data.data?.user ||
        data.data?.agency ||
        data.data?.agent ||
        data.data?.developer;

      if (token) {
        localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));

        console.log("✅ Login Success! Redirecting...");

        // 🔥 redirect based on role
        let redirectPath = "/dashboard";

        if (endpoint.includes("agent")) redirectPath = "/dashboard/agent";
        if (endpoint.includes("agency")) redirectPath = "/dashboard/agency";
        if (endpoint.includes("developer")) redirectPath = "/dashboard/developer";

        setTimeout(() => {
          window.location.href = redirectPath;
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

  
  const response = await dispatch(
    loginUser({
      payload: credentials,
      endpoint: fullEndpoint,
    })
  ).unwrap();

 
  const token = response?.token || response?.data?.token;
  if (token) localStorage.setItem("token", token);

  return response;
};

  
  const logout = async (logoutEndpoint = '/auth/logout') => {
    hasFetchedPermissions.current = false;
    const fullEndpoint = `${API_BASE}${logoutEndpoint}`;
    
    try {
      await dispatch(logoutUser(fullEndpoint));
    } catch (err) {
     
      dispatch(logoutUser());
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,    
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;