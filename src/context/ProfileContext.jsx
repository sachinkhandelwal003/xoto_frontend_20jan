import React, { createContext, useState, useEffect } from 'react';
import {apiService} from '../../src/manageApi/utils/custom.apiservice'; // Apna sahi path check kar lena

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      // Aapki API call jo aapne batayi thi
      const response = await apiService.get("profile/get-profile-data");
      console.log("Backend User Data:", response.data);
      if (response && response.data) {
        // Maan lo API response mein data 'response.data.user' mein hai
        // Agar response hi user object hai toh direct response.data rakho
        setUserProfile(response.data.user || response.data); 
      }
    } catch (error) {
      console.error("AuthContext Error:", error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token"); // Check karo aap 'token' hi use karte ho na?
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