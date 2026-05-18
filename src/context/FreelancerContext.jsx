import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService } from "../manageApi/utils/custom.apiservice";
import { useSelector } from "react-redux";

const FreelancerContext = createContext();

export const FreelancerProvider = ({ children }) => {
  const [freelancer, setFreelancer] = useState(null);
  const [progress, setProgress] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const { token, user } = useSelector((state) => state.auth);

  const fetchFreelancerData = async () => {
    if (!token) return; // 🔒 hard guard

    try {
      setLoading(true);

      const profileRes = await apiService.get("/freelancer/profile");

      setFreelancer(profileRes.freelancer);
      setProgress(profileRes.profileProgress);
      setStats({
        totalJobs: 0,
        pendingJobs: 0,
        completedJobs: 0,
        totalEarnings: 0,
        currentMonthEarnings: 0,
        performanceScore: 85,
        activeProposals: 0,
      });
    } catch (error) {
      console.error("Failed to fetch freelancer data", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 THIS is the key line
  useEffect(() => {
    if (token && user?.role?.code === "7") {
      fetchFreelancerData();
    }
  }, [token, user?.role?.code]);

  return (
    <FreelancerContext.Provider
      value={{
        freelancer,
        progress,
        stats,
        loading,
        refreshFreelancer: fetchFreelancerData,
        setFreelancer,
      }}
    >
      {children}
    </FreelancerContext.Provider>
  );
};

export const useFreelancer = () => {
  const context = useContext(FreelancerContext);
  if (!context) {
    throw new Error("useFreelancer must be used inside FreelancerProvider");
  }
  return context;
};
