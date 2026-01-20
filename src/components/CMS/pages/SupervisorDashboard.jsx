import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  MessageSquare,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  // Dummy data
  const supervisor = {
    name: { first_name: "Amit", last_name: "Verma" },
    email: "amit.verma@supervisor.com",
    department: "Operations",
    employee_id: "SUP-2024-001"
  };

  const stats = [
    {
      title: "Total Leads",
      value: "156",
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      change: "+18%",
      trend: "up"
    },
    {
      title: "Pending Estimates",
      value: "23",
      icon: <FileText className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      change: "-5%",
      trend: "down"
    },
    {
      title: "Completed Jobs",
      value: "89",
      icon: <CheckCircle className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      change: "+12%",
      trend: "up"
    },
    {
      title: "Team Members",
      value: "8",
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      change: "+2",
      trend: "up"
    }
  ];

  const quickActions = [
    {
      title: "Manage Leads",
      description: "View and assign leads to team",
      icon: <Users className="w-8 h-8 text-blue-600" />,
      color: "bg-blue-50 hover:bg-blue-100",
      onClick: () => navigate("/dashboard/supervisor/leads")
    },
    {
      title: "Create Estimate",
      description: "Prepare new cost estimate",
      icon: <FileText className="w-8 h-8 text-green-600" />,
      color: "bg-green-50 hover:bg-green-100",
      onClick: () => navigate("/dashboard/supervisor/estimates/create")
    },
    {
      title: "Team Performance",
      description: "View team analytics",
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      color: "bg-purple-50 hover:bg-purple-100",
      onClick: () => navigate("/dashboard/supervisor/performance")
    },
    {
      title: "Schedule Tasks",
      description: "Assign tasks to team members",
      icon: <Calendar className="w-8 h-8 text-orange-600" />,
      color: "bg-orange-50 hover:bg-orange-100",
      onClick: () => navigate("/dashboard/supervisor/schedule")
    }
  ];

  const pendingTasks = [
    { id: 1, task: "Review Site Visit Report", priority: "high", assignee: "Raj Kumar", due: "Today" },
    { id: 2, task: "Approve Material Purchase", priority: "medium", assignee: "Priya Singh", due: "Tomorrow" },
    { id: 3, task: "Client Meeting Preparation", priority: "low", assignee: "You", due: "Mar 25" },
    { id: 4, task: "Team Performance Review", priority: "medium", assignee: "You", due: "Mar 28" }
  ];

  const teamPerformance = [
    { name: "Raj Kumar", completed: 12, pending: 3, rating: 4.5 },
    { name: "Priya Singh", completed: 15, pending: 1, rating: 4.8 },
    { name: "Ankit Patel", completed: 8, pending: 4, rating: 4.2 },
    { name: "Sneha Reddy", completed: 11, pending: 2, rating: 4.6 }
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
          Welcome,  👋
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your team and oversee project operations efficiently.
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
                  {item.change} from last week
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

          {/* Team Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Performance</h2>
            <div className="space-y-4">
              {teamPerformance.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">
                        {member.completed} completed • {member.pending} pending
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900">{member.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Pending Tasks & Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Pending Tasks */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Tasks</h2>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-sm text-gray-500">{task.due}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{task.task}</h3>
                  <p className="text-sm text-gray-600">Assigned to: {task.assignee}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: "Lead assigned to Raj", time: "2 hours ago", type: "assignment" },
                { action: "Estimate approved", time: "4 hours ago", type: "approval" },
                { action: "New lead received", time: "1 day ago", type: "lead" },
                { action: "Site visit completed", time: "2 days ago", type: "completion" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'assignment' ? 'bg-blue-100' :
                    activity.type === 'approval' ? 'bg-green-100' :
                    activity.type === 'lead' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <MessageSquare className={`w-4 h-4 ${
                      activity.type === 'assignment' ? 'text-blue-600' :
                      activity.type === 'approval' ? 'text-green-600' :
                      activity.type === 'lead' ? 'text-purple-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;