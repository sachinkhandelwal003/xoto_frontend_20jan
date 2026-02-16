import React, { createContext, useState, useEffect } from 'react';
import { apiService } from '../../src/manageApi/utils/custom.apiservice'; // Check path

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiService.get("profile/get-profile-data");
      // Assuming your API returns data as shown
      setUserProfile(res.data); 
    } catch (err) {
      console.log(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ userProfile, setUserProfile, loading, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
