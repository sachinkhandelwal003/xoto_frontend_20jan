import React, { createContext, useState, useEffect } from 'react';
import {apiService} from '../../src/manageApi/utils/custom.apiservice'; // Apna sahi path check kar lena

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

const fetchProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await axios.get("/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.log(err.response?.data?.message);
  }
};


  useEffect(() => {
    const token = localStorage.getItem("token"); 
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ userProfile, setUserProfile, loading, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};