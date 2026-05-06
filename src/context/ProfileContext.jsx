import React, { createContext, useState, useEffect, useMemo } from 'react';
import { apiService } from '../../src/manageApi/utils/custom.apiservice';

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

      // ⭐ SAFE PARSE (handles nested response)
      const profileData =
        res?.data?.data?.data ||
        res?.data?.data ||
        res?.data ||
        null;

      setUserProfile(profileData);

    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ⭐ FINAL ONBOARDING LOGIC
  const isOnboarded = useMemo(() => {

    const p = userProfile || {};

    const kycStatus = String(p?.kycStatus || "").toLowerCase();

    const kycOk =
      kycStatus === "verified" ||
      kycStatus === "approved";

    const agreementOk =
      p?.agreementSigned === true ||
      p?.agreementSigned === "true";

    return kycOk && agreementOk;

  }, [userProfile]);

  return (
    <AuthContext.Provider
      value={{
        userProfile,
        loading,
        isOnboarded,
        fetchProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};