import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle, // Added for the warning
  Edit3,
  MapPin,
  Languages,
  Hammer
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFreelancer } from "../../../../src/context/FreelancerContext"; // Adjust path if needed

const FreelancerDashboard = () => {
  const navigate = useNavigate();
  const { freelancer, progress, stats, loading } = useFreelancer();
console.log(freelancer)
  // 1. Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // 2. Error/Empty State
  if (!freelancer || !progress) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load your freelancer profile.
          </p>
          <button
            onClick={() => navigate("/dashboard/freelancer/complete-profile")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Complete Your Profile
          </button>
        </div>
      </div>
    );
  }

  // 3. Check Approval Status (Check both fields as requested)
  const isApproved =
    freelancer?.onboarding_status === "approved" &&
    freelancer?.status_info?.status === 1;

  // 4. Render Data
  const dashboardStats = [
    {
      title: "Total Jobs",
      value: stats?.totalJobs || 0,
      icon: <Briefcase className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50 border border-blue-200",
      trend: "+12%",
      description: "All time jobs",
    },
    {
      title: "Pending Jobs",
      value: stats?.pendingJobs || 0,
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      color: "bg-orange-50 border border-orange-200",
      trend: "+5%",
      description: "Under review",
    },
    {
      title: "Completed Jobs",
      value: stats?.completedJobs || 0,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      color: "bg-green-50 border border-green-200",
      trend: "+8%",
      description: "Successfully delivered",
    },
    {
      title: "Total Earnings",
      value: `AED${(stats?.totalEarnings || 0).toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6 text-purple-600" />,
      color: "bg-purple-50 border border-purple-200",
      trend: "+15%",
      description: "Lifetime earnings",
    },
    {
      title: "This Month",
      value: `AED${(stats?.currentMonthEarnings || 0).toLocaleString()}`,
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      color: "bg-green-50 border border-green-200",
      trend: "+20%",
      description: "Current month payout",
    },
    {
      title: "Performance",
      value: `${stats?.performanceScore || 85}%`,
      icon: <Award className="w-6 h-6 text-yellow-600" />,
      color: "bg-yellow-50 border border-yellow-200",
      trend: "+2%",
      description: "Client satisfaction",
    },
  ];

  const quickActions = [
    {
      title: "Update Profile",
      description: "Complete your profile details",
      icon: <Edit3 className="w-5 h-5" />,
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => navigate(`/dashboard/freelancer/update`),
      completed: progress.completionPercentage === 100,
    },
    {
      title: "View Jobs",
      description: "Check available landscaping jobs",
      icon: <Briefcase className="w-5 h-5" />,
      color: isApproved ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed",
      onClick: () => isApproved && navigate("/dashboard/freelancer/jobs"),
      completed: false,
    },
    {
      title: "My Portfolio",
      description: "Manage your work portfolio",
      icon: <Award className="w-5 h-5" />,
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: () => navigate("/dashboard/freelancer/portfolio"),
      completed: freelancer.portfolio?.length > 0,
    },
    {
      title: "Earnings",
      description: "View your earnings and payments",
      icon: <DollarSign className="w-5 h-5" />,
      color: isApproved ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-400 cursor-not-allowed",
      onClick: () => isApproved && navigate("/dashboard/freelancer/earnings"),
      completed: false,
    },
  ];

  const profileSummary = [
    {
      label: "Location",
      value: `${freelancer.location?.city || "Not set"}, ${
        freelancer.location?.country || "Not set"
      }`,
      icon: <MapPin className="w-4 h-4" />,
      completed: !!freelancer.location?.city,
    },
    {
      label: "Languages",
      value: freelancer.languages?.join(", ") || "Not set",
      icon: <Languages className="w-4 h-4" />,
      completed: freelancer.languages?.length > 0,
    },
    {
      label: "Services",
      value: `${freelancer.services_offered?.length || 0} services offered`,
      icon: <Hammer className="w-4 h-4" />,
      completed: freelancer.services_offered?.length > 0,
    },
    {
      label: "Experience",
      value: `${freelancer.professional?.experience_years || 0} years`,
      icon: <Briefcase className="w-4 h-4" />,
      completed: !!freelancer.professional?.experience_years,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {freelancer?.name?.first_name || "Freelancer"}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Here's what's happening with your landscaping business today.
            </p>
          </div>
          {/* <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  isApproved
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
               
              </div>
            </div>
          </div> */}
        </div>
      </motion.div>

      {/* ===== RED ALERT BOX (NEW) ===== */}
      {/* {!isApproved && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm flex items-start gap-4"
        >
          <div className="p-3 bg-red-100 rounded-full shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-800 mb-1">
              Profile Under Review
            </h3>
            <p className="text-red-700 leading-relaxed">
              Your profile is currently under review. While you can update your
              profile details, access to Jobs and Earnings will be restricted
              until your <strong>Onboarding Status is Approved</strong> and your
              account status is active.
            </p>
          </div>
        </motion.div>
      )} */}

      {/* ===== STATS GRID ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10"
      >
        {dashboardStats.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`p-5 rounded-2xl shadow-sm ${item.color} backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white rounded-lg shadow-xs">
                {item.icon}
              </div>
              <span className="text-xs font-medium bg-white px-2 py-1 rounded-full text-green-600">
                {item.trend}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {item.value}
              </h2>
              <p className="text-sm font-medium text-gray-700">{item.title}</p>
              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ===== LEFT COLUMN ===== */}
        <div className="lg:col-span-2 space-y-8">
          {/* ===== PROFILE COMPLETION ===== */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Profile Completion
              </h2>
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  progress.completionPercentage === 100
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {progress.completionPercentage}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden mb-6">
              <motion.div
                className={`h-4 rounded-full ${
                  progress.completionPercentage >= 100
                    ? "bg-gradient-to-r from-green-500 to-green-600"
                    : "bg-gradient-to-r from-blue-500 to-purple-600"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress.completionPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            <p className="text-gray-600 mb-6">{progress.summary}</p>

            <button
              className={`w-full px-6 py-3 rounded-xl font-semibold transition-all ${
                progress.completionPercentage >= 100
                  ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
              }`}
              onClick={() => navigate(`/dashboard/freelancer/update`)}
              disabled={progress.completionPercentage >= 100}
            >
              {progress.completionPercentage < 100
                ? "Complete Your Profile →"
                : "🎉 Profile Fully Completed!"}
            </button>
          </motion.div>

          {/* ===== SECTION PROGRESS ===== */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Profile Sections
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(progress.sections).map(([section, value]) => (
                <div
                  key={section}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium capitalize text-gray-700">
                      {section.replace(/([A-Z])/g, " AED1")}
                    </p>
                    <span
                      className={`text-sm font-semibold ${
                        value === 100 ? "text-green-600" : "text-blue-600"
                      }`}
                    >
                      {value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-2 rounded-full ${
                        value === 100
                          ? "bg-green-500"
                          : "bg-gradient-to-r from-blue-500 to-purple-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="space-y-8">
          {/* ===== QUICK ACTIONS ===== */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.onClick}
                  // Disable visually if action is disabled logic (like not approved)
                  className={`w-full text-white ${action.color} p-4 rounded-xl flex items-center gap-4 transition shadow-sm hover:shadow-md`}
                >
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    {action.icon}
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{action.title}</p>
                      {action.completed && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <p className="text-sm text-white text-opacity-90">
                      {action.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* ===== PROFILE SUMMARY ===== */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Profile Summary
            </h2>
            <div className="space-y-4">
              {profileSummary.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      item.completed
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {item.label}
                    </p>
                    <p
                      className={`text-sm ${
                        item.completed ? "text-gray-600" : "text-gray-500"
                      }`}
                    >
                      {item.value}
                    </p>
                  </div>
                  {item.completed && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ===== PERFORMANCE METRICS ===== */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
          >
            <h2 className="text-xl font-semibold mb-4">Performance Score</h2>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-2">
                {stats?.performanceScore || 85}%
              </div>
              <p className="text-blue-100">Client Satisfaction Rate</p>
            </div>
            <div className="flex justify-between text-sm text-blue-200">
              <span>Response Time</span>
              <span>Excellent</span>
            </div>
            <div className="flex justify-between text-sm text-blue-200 mt-2">
              <span>Job Completion</span>
              <span>Perfect</span>
            </div>
            <div className="flex justify-between text-sm text-blue-200 mt-2">
              <span>Client Reviews</span>
              <span>4.9/5</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;