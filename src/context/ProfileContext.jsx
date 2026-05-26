import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { apiService } from '../../src/manageApi/utils/custom.apiservice';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token: reduxToken } = useSelector((state) => state.auth || {});

  const roleCode = user?.role && typeof user.role === 'object'
    ? user.role.code?.toString()
    : user?.role?.toString();

  const roleName = user?.role && typeof user.role === 'object'
    ? user.role.name?.toString().toLowerCase()
    : user?.role?.toString().toLowerCase();

  const getProfileEndpoint = () => {
    if (roleCode === '15' || roleName === 'agency') return '/agency/profile';
    if (roleCode === '25' || roleName === 'gridreferralpartner') return '/referral/profile';
    return '/profile/get-profile-data';
  };

  const fetchProfile = async () => {
    const token = reduxToken || localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiService.get(getProfileEndpoint());

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
  }, [reduxToken, roleCode, roleName]);

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
