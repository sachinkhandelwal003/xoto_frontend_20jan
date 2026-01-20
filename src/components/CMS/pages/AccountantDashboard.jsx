import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  DollarSign,
  Building,
  TrendingUp,
  Calendar,
  CheckCircle,
  PieChart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AccountantDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  // Dummy data
  const accountant = {
    name: { first_name: "Rahul", last_name: "Sharma" },
    email: "rahul.sharma@accountant.com",
    firm_name: "Sharma & Co.",
    gst_number: "22AAAAA0000A1Z5",
  };

  const stats = [
    {
      title: "Active Clients",
      value: "18",
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      change: "+12%",
      trend: "up"
    },
    {
      title: "Invoices This Month",
      value: "42",
      icon: <FileText className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      change: "+8%",
      trend: "up"
    },
    {
      title: "Total Revenue",
      value: "₹48,750",
      icon: <DollarSign className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      change: "+15%",
      trend: "up"
    },
    {
      title: "Pending GST Filings",
      value: "12",
      icon: <Building className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      change: "-3%",
      trend: "down"
    }
  ];

  const quickActions = [
    {
      title: "Create Invoice",
      description: "Generate new invoice for client",
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      color: "bg-blue-50 hover:bg-blue-100",
      onClick: () => navigate("/dashboard/accountant/invoices/create")
    },
    {
      title: "GST Filing",
      description: "File GST returns",
      icon: <Building className="w-8 h-8 text-green-600" />,
      color: "bg-green-50 hover:bg-green-100",
      onClick: () => navigate("/dashboard/accountant/gst-filing")
    },
    {
      title: "Client Management",
      description: "Manage client accounts",
      icon: <Users className="w-8 h-8 text-purple-600" />,
      color: "bg-purple-50 hover:bg-purple-100",
      onClick: () => navigate("/dashboard/accountant/clients")
    },
    {
      title: "Financial Reports",
      description: "View financial analytics",
      icon: <PieChart className="w-8 h-8 text-orange-600" />,
      color: "bg-orange-50 hover:bg-orange-100",
      onClick: () => navigate("/dashboard/accountant/reports")
    }
  ];

  const recentActivities = [
    { id: 1, action: "Invoice generated", client: "ABC Corp", time: "2 hours ago", status: "completed" },
    { id: 2, action: "GST filed", client: "XYZ Ltd", time: "1 day ago", status: "completed" },
    { id: 3, action: "Payment received", client: "Global Tech", time: "2 days ago", status: "completed" },
    { id: 4, action: "New client onboarded", client: "Startup Inc", time: "3 days ago", status: "completed" }
  ];

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {accountant.name.first_name} 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your accounting practice today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`${item.color} rounded-2xl p-6 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{item.title}</p>
                <h3 className="text-2xl font-bold mt-2">{item.value}</h3>
                <div className={`flex items-center mt-2 text-sm ${item.trend === 'up' ? 'text-green-200' : 'text-red-200'}`}>
                  <TrendingUp className={`w-4 h-4 mr-1 ${item.trend === 'down' ? 'rotate-180' : ''}`} />
                  {item.change} from last month
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                {item.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.onClick}
                  className={`${action.color} p-4 rounded-xl text-left transition-all duration-200 border border-transparent hover:border-gray-200`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.client}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Deadlines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Deadlines</h2>
          <Calendar className="w-5 h-5 text-gray-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { task: "GST Filing - Q4", date: "Mar 31, 2024", daysLeft: 15, priority: "high" },
            { task: "TDS Return", date: "Apr 7, 2024", daysLeft: 22, priority: "medium" },
            { task: "Annual Audit", date: "Apr 15, 2024", daysLeft: 30, priority: "low" }
          ].map((deadline, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  deadline.priority === 'high' ? 'bg-red-100 text-red-800' :
                  deadline.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {deadline.priority} priority
                </span>
                <span className="text-sm text-gray-500">{deadline.daysLeft} days left</span>
              </div>
              <h3 className="font-semibold text-gray-900">{deadline.task}</h3>
              <p className="text-sm text-gray-600 mt-1">Due: {deadline.date}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AccountantDashboard;