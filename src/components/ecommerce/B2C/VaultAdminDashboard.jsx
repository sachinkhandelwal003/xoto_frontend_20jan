import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend
} from "recharts";
import {
  Users, UserCheck, FolderOpen, Banknote,
  TrendingUp, Clock, Handshake, Building2,
  ArrowUpRight, AlertCircle, Bell, RefreshCw, Calendar, ChevronRight,
  Target, Award, Zap, Shield, Activity, DollarSign, FileText, UserPlus
} from "lucide-react";
import { Spin, message, Tabs, Badge, Button, Tag, Alert, DatePicker, Segmented, Select, Statistic, Card, Row, Col, Progress, Space, Avatar, Dropdown, Menu } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

// --- Brand & Chart Colors ---
const BRAND_PURPLE = "#5C039B";
const BRAND_GRADIENT = "linear-gradient(135deg, #5C039B 0%, #8B5CF6 100%)";
const CHART_COLORS = {
  purple: BRAND_PURPLE,
  purpleLight: "#8B5CF6",
  green: "#10B981",
  orange: "#F59E0B",
  blue: "#3B82F6",
  red: "#EF4444",
  yellow: "#FBBF24",
  pink: "#EC4899",
  indigo: "#6366F1"
};

const CATEGORY_COLORS = [BRAND_PURPLE, "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];

// --- Utility Functions ---
const formatCurrency = (value) => {
  if (!value) return "AED 0";
  if (value >= 1000000) return `AED ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `AED ${(value / 1000).toFixed(0)}K`;
  return `AED ${value.toLocaleString()}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 48) return "yesterday";
  return `${Math.floor(diffHours / 24)}d ago`;
};

// --- Reusable Stat Card ---
const StatCard = ({ title, value, icon: Icon, colorTheme, growth, loading, suffix = "", trend }) => {
  const themeStyles = {
    purple: "text-[#5C039B] bg-[#5C039B]/10 border-[#5C039B]/20",
    green: "text-emerald-600 bg-emerald-50 border-emerald-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    red: "text-red-600 bg-red-50 border-red-100",
    gray: "text-gray-600 bg-gray-50 border-gray-200"
  };

  const currentTheme = themeStyles[colorTheme] || themeStyles.purple;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-lg transition-all duration-300 group hover:border-[#5C039B]/20">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110 ${currentTheme}`}>
          {loading ? <Spin size="small" /> : <Icon size={22} />}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900 group-hover:text-[#5C039B] transition-colors">
            {loading ? "..." : typeof value === 'number' ? value.toLocaleString() : value || 0}
          </span>
          {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
        </div>
        {growth && (
          <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md inline-flex">
            <ArrowUpRight size={12} />
            {growth}
          </div>
        )}
        {trend && <p className="text-xs text-gray-400 mt-2">{trend}</p>}
      </div>
    </div>
  );
};

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label, suffix = "", prefix = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-xl px-4 py-3 text-sm">
        <p className="font-semibold text-gray-500 mb-1">{label}</p>
        <p className="text-[#5C039B] font-bold text-lg">
          {prefix}{payload[0].value?.toLocaleString()}{suffix}
        </p>
      </div>
    );
  }
  return null;
};

// --- Main Component ---
const VaultAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState("month");
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [customerFilter, setCustomerFilter] = useState(null);
  const [customers, setCustomers] = useState([]);

  // Fetch dashboard stats with filters
  const fetchDashboardStats = async () => {
    setRefreshing(true);
    try {
      let url = `/vault/statistics/admin/stats?range=${timeFilter}`;
      
      if (dateRange && dateRange[0] && dateRange[1] && timeFilter === 'custom') {
        url += `&fromDate=${dateRange[0].format('YYYY-MM-DD')}&toDate=${dateRange[1].format('YYYY-MM-DD')}`;
      }
      
      if (customerFilter) {
        url += `&customerId=${customerFilter}`;
      }

      // Replace with your actual API call
      // const response = await apiService.get(url);
      
      // Using your provided data
      const mockData = {
        platformHealth: {
          totalUsers: { referralPartners: 26, partners: 3, advisors: 3, opsMembers: 4, total: 36 },
          leads: { total: 12, today: 0, thisWeek: 7, thisMonth: 12, top5Recent: [
            { _id: "69f5ca16d12d1086326e7db0", customerName: "Test001", mobileNumber: "919966558899", propertyValue: 1500000, createdAt: "2026-05-02T09:55:34.436Z", source: "freelance_agent" },
            { _id: "69f49a89d12d1086326e4def", customerName: "Ayush Rajpalani", mobileNumber: "08385973582", propertyValue: 444445424522, createdAt: "2026-05-01T12:20:25.386Z", source: "freelance_agent" }
          ] },
          leadStatus: { new: 4, assigned: 0, contacted: 0, qualified: 5, collectingDocuments: 0, applicationCreated: 0, notProceeding: 0, disbursed: 3 },
          applicationsByStatus: { draft: 0, submittedToXoto: 0, inOpsQueue: 0, underReview: 0, bankApplication: 1, preApproved: 0, valuation: 0, folIssued: 0, folSigned: 0, disbursed: 4, rejected: 0, lost: 0 },
          slaBreach: { count: 2, details: [
            { id: "69e878e24d637b43c066cecf", customerName: "Ahmed Al Mansouri", breachedAt: "2026-04-24T12:22:30.286Z" },
            { id: "69e8961ab961e908fb09a471", customerName: "John Smith", breachedAt: "2026-04-24T08:42:57.873Z" }
          ] }
        },
        opsQueue: { count: 0, urgentCount: 0, applications: [] },
        unassignedLeads: { count: 8, oldestLead: "2026-04-22T09:01:00.621Z", leads: [
          { _id: "69e88e4cec41e6a22b7e6805", customerName: "Divy Sharma", mobileNumber: "971965823654", propertyValue: 895623, createdAt: "2026-04-22T09:01:00.621Z", source: "freelance_agent" },
          { _id: "69e890c9201d9873661e713a", customerName: "wertfg", mobileNumber: "971741852654", propertyValue: 15000000, createdAt: "2026-04-22T09:11:37.217Z", source: "freelance_agent" }
        ] },
        recentActivities: [
          { type: "new_case", message: "New case XOTO-CASE-2026-4489 created for Test001", timestamp: "2026-05-02T10:05:42.325Z" },
          { type: "new_lead", message: "New lead from Ayush ayush", timestamp: "2026-05-02T09:55:34.436Z" },
          { type: "new_agent", message: "Freelance Agent Mongo DB registered", timestamp: "2026-05-01T13:17:20.586Z" }
        ],
        commissionStats: { pending: 0, confirmed: 0, paid: 0, total: 0 },
        graphData: {
          leadsOverTime: [
            { date: "2026-04-22", count: 4 }, { date: "2026-04-28", count: 2 }, { date: "2026-04-29", count: 1 },
            { date: "2026-04-30", count: 1 }, { date: "2026-05-01", count: 1 }, { date: "2026-05-02", count: 1 }
          ],
          casesOverTime: [
            { date: "2026-04-27", count: 1 }, { date: "2026-04-28", count: 1 }, { date: "2026-04-29", count: 1 },
            { date: "2026-04-30", count: 1 }, { date: "2026-05-01", count: 1 }, { date: "2026-05-02", count: 1 }
          ],
          disbursementsOverTime: [
            { date: "2026-04-30", count: 2, totalAmount: 1400000 },
            { date: "2026-05-01", count: 1, totalAmount: 19800000 },
            { date: "2026-05-02", count: 1, totalAmount: 1400000 }
          ],
          monthlySummary: [
            { month: "2026-04", totalCases: 4, disbursed: 2 },
            { month: "2026-05", totalCases: 2, disbursed: 2 }
          ],
          leadsBySource: [{ name: "Freelance Agent", value: 10, color: "#5C039B" }]
        },
        timestamp: new Date().toISOString()
      };
      
      setTimeout(() => {
        setStats(mockData);
        setLoading(false);
        setRefreshing(false);
      }, 600);
      
    } catch (error) {
      message.error("Failed to load dashboard data");
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [timeFilter, dateRange, customerFilter]);

  // --- Chart Data Preparation ---
  const formatChartDate = (dateString) => {
    const date = new Date(dateString);
    if (timeFilter === 'week') return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const timelineData = stats?.graphData?.casesOverTime?.map(item => ({
    name: formatChartDate(item.date), 
    cases: item.count,
    leads: stats.graphData.leadsOverTime.find(l => l.date === item.date)?.count || 0
  })) || [];

  const leadsOverTimeData = stats?.graphData?.leadsOverTime?.map(item => ({
    name: formatChartDate(item.date), 
    leads: item.count
  })) || [];

  const disbursementData = stats?.graphData?.disbursementsOverTime?.map(item => ({
    name: formatChartDate(item.date), 
    amount: item.totalAmount / 1000000, 
    count: item.count
  })) || [];

  const monthlyData = stats?.graphData?.monthlySummary?.map(item => ({
    name: item.month,
    cases: item.totalCases,
    disbursed: item.disbursed
  })) || [];

  // Calculate conversion rate
  const conversionRate = stats?.platformHealth?.leads?.total > 0 
    ? ((stats?.platformHealth?.leadStatus?.disbursed || 0) / stats?.platformHealth?.leads?.total * 100).toFixed(1)
    : 0;

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center flex-col gap-4">
        <Spin size="large" />
        <p className="text-[#5C039B] font-medium tracking-wide">Loading VAULT Intelligence...</p>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch(type) {
      case 'new_case': return <FileText size={14} className="text-blue-500" />;
      case 'new_lead': return <UserPlus size={14} className="text-green-500" />;
      case 'new_agent': return <Users size={14} className="text-purple-500" />;
      case 'sla_breach': return <AlertCircle size={14} className="text-red-500" />;
      default: return <Bell size={14} className="text-gray-500" />;
    }
  };

  // --- Tab Items Configuration ---
  const tabItems = [
    {
      key: 'overview',
      label: <span className="flex items-center gap-2 px-3 py-2"><TrendingUp size={16} /> Overview</span>,
      children: (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard title="Total Network" value={stats?.platformHealth?.totalUsers?.total} icon={Users} colorTheme="purple" growth="+12%" />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard title="Total Leads" value={stats?.platformHealth?.leads?.total} icon={Target} colorTheme="blue" growth="+8%" />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard title="Total Cases" value={stats?.platformHealth?.applicationsByStatus?.disbursed + stats?.platformHealth?.applicationsByStatus?.bankApplication} icon={FolderOpen} colorTheme="orange" />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard title="Conversion Rate" value={conversionRate} icon={Zap} colorTheme="green" suffix="%" />
            </Col>
          </Row>

          {/* SLA Alert */}
          {stats?.platformHealth?.slaBreach?.count > 0 && (
            <Alert
              message={
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-500" />
                  <span className="font-bold">SLA Breach Alert</span>
                </div>
              }
              description={`${stats.platformHealth.slaBreach.count} leads have exceeded the standard processing timeframe. Immediate attention required.`}
              type="error"
              showIcon
              action={
                <Button size="small" danger>
                  Review Queue
                </Button>
              }
              className="rounded-xl border-red-200 bg-red-50"
            />
          )}

          <Row gutter={[16, 16]}>
            {/* Main Chart - Combined */}
            <Col xs={24} lg={16}>
              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all" bordered={false}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Activity Timeline</h3>
                    <p className="text-sm text-gray-400">Leads & Cases trend over selected period</p>
                  </div>
                  <Tag color="purple" className="rounded-lg">Last {timeFilter}</Tag>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="leads" stroke={CHART_COLORS.orange} strokeWidth={3} dot={{ fill: CHART_COLORS.orange, r: 4 }} name="Leads" />
                    <Line type="monotone" dataKey="cases" stroke={BRAND_PURPLE} strokeWidth={3} dot={{ fill: BRAND_PURPLE, r: 4 }} name="Cases" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Recent Activity */}
            <Col xs={24} lg={8}>
              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all h-full" bordered={false}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                  <Badge count={stats?.recentActivities?.length} style={{ backgroundColor: BRAND_PURPLE }} />
                </div>
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                  {stats?.recentActivities?.slice(0, 6).map((activity, idx) => (
                    <div key={idx} className="flex gap-3 items-start p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group">
                      <div className="mt-1 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">{activity.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button type="link" className="w-full mt-4 text-[#5C039B] hover:text-[#4a027d]">
                  View All Activity <ChevronRight size={14} />
                </Button>
              </Card>
            </Col>
          </Row>

          {/* Status Progress Bars */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card className="rounded-2xl shadow-sm" bordered={false}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Lead Funnel Progress</h3>
                <Space direction="vertical" className="w-full" size="large">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">New Leads</span>
                      <span className="text-sm font-bold text-gray-900">{stats?.platformHealth?.leadStatus?.new || 0}</span>
                    </div>
                    <Progress percent={(stats?.platformHealth?.leadStatus?.new / stats?.platformHealth?.leads?.total * 100) || 0} strokeColor={BRAND_PURPLE} showInfo={false} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Qualified</span>
                      <span className="text-sm font-bold text-gray-900">{stats?.platformHealth?.leadStatus?.qualified || 0}</span>
                    </div>
                    <Progress percent={(stats?.platformHealth?.leadStatus?.qualified / stats?.platformHealth?.leads?.total * 100) || 0} strokeColor="#8B5CF6" showInfo={false} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Disbursed</span>
                      <span className="text-sm font-bold text-gray-900">{stats?.platformHealth?.leadStatus?.disbursed || 0}</span>
                    </div>
                    <Progress percent={(stats?.platformHealth?.leadStatus?.disbursed / stats?.platformHealth?.leads?.total * 100) || 0} strokeColor="#10B981" showInfo={false} />
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card className="rounded-2xl shadow-sm" bordered={false}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Lead Source Distribution</h3>
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={stats?.graphData?.leadsBySource || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {stats?.graphData?.leadsBySource?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'leads',
      label: <span className="flex items-center gap-2 px-3 py-2"><UserCheck size={16} /> Leads Management</span>,
      children: (
        <div className="space-y-6">
          {/* Lead Stats Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="rounded-2xl bg-gradient-to-br from-blue-50 to-white" bordered={false}>
                <Statistic title="Today's Leads" value={stats?.platformHealth?.leads?.today} prefix={<TrendingUp size={20} className="text-blue-500" />} valueStyle={{ color: "#3B82F6", fontSize: 28 }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="rounded-2xl bg-gradient-to-br from-purple-50 to-white" bordered={false}>
                <Statistic title="This Week" value={stats?.platformHealth?.leads?.thisWeek} prefix={<Calendar size={20} className="text-purple-500" />} valueStyle={{ color: BRAND_PURPLE, fontSize: 28 }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="rounded-2xl bg-gradient-to-br from-green-50 to-white" bordered={false}>
                <Statistic title="This Month" value={stats?.platformHealth?.leads?.thisMonth} prefix={<Award size={20} className="text-green-500" />} valueStyle={{ color: "#10B981", fontSize: 28 }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="rounded-2xl bg-gradient-to-br from-orange-50 to-white" bordered={false}>
                <Statistic title="Unassigned" value={stats?.unassignedLeads?.count} prefix={<AlertCircle size={20} className="text-orange-500" />} valueStyle={{ color: "#F59E0B", fontSize: 28 }} />
              </Card>
            </Col>
          </Row>

          {/* Lead Status Grid */}
          <Card className="rounded-2xl shadow-sm" bordered={false}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Lead Status Breakdown</h3>
            <Row gutter={[12, 12]}>
              {Object.entries(stats?.platformHealth?.leadStatus || {}).map(([status, count], idx) => (
                <Col xs={12} sm={8} md={6} lg={4} key={status}>
                  <div className={`p-4 rounded-xl text-center transition-all cursor-pointer hover:scale-105 ${count > 0 ? 'bg-gradient-to-br from-purple-50 to-white border border-purple-100' : 'bg-gray-50 opacity-60'}`}>
                    <div className={`text-2xl font-black ${count > 0 ? 'text-[#5C039B]' : 'text-gray-400'}`}>{count}</div>
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-2">
                      {status.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Recent Leads Table */}
          <Card className="rounded-2xl shadow-sm" bordered={false} title={<span className="font-bold text-gray-900">📋 Recent Leads</span>}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr className="text-left">
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Customer</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Contact</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Property Value</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Source</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.platformHealth?.leads?.top5Recent?.map((lead, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 text-sm font-medium text-gray-900">{lead.customerName}</td>
                      <td className="py-3 text-sm text-gray-600">{lead.mobileNumber}</td>
                      <td className="py-3 text-sm font-semibold text-[#5C039B]">{formatCurrency(lead.propertyValue)}</td>
                      <td className="py-3"><Tag color="purple" className="rounded-full text-xs">{lead.source === 'freelance_agent' ? 'Freelance Agent' : lead.source}</Tag></td>
                      <td className="py-3 text-sm text-gray-500">{formatDate(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Unassigned Leads */}
          {stats?.unassignedLeads?.leads?.length > 0 && (
            <Card className="rounded-2xl shadow-sm border-yellow-200 bg-gradient-to-br from-yellow-50 to-white" bordered={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">⚠️ Unassigned Leads Need Attention</h3>
                <Badge count={stats.unassignedLeads.count} style={{ backgroundColor: "#F59E0B" }} />
              </div>
              <div className="space-y-3">
                {stats.unassignedLeads.leads.slice(0, 5).map((lead, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{lead.customerName}</p>
                      <p className="text-xs text-gray-500 mt-1">{lead.mobileNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#5C039B]">{formatCurrency(lead.propertyValue)}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(lead.createdAt)}</p>
                    </div>
                    <Button type="primary" size="small" className="ml-4 rounded-lg" style={{ background: BRAND_GRADIENT, border: 'none' }}>
                      Assign Now
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'applications',
      label: <span className="flex items-center gap-2 px-3 py-2"><FolderOpen size={16} /> Applications</span>,
      children: (
        <div className="space-y-6">
          {/* Application Status Grid */}
          <Card className="rounded-2xl shadow-sm" bordered={false}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Application Pipeline</h3>
            <Row gutter={[12, 12]}>
              {Object.entries(stats?.platformHealth?.applicationsByStatus || {}).map(([status, count], idx) => (
                <Col xs={12} sm={8} md={6} lg={4} xl={3} key={status}>
                  <div className={`p-3 rounded-xl text-center transition-all ${count > 0 ? 'bg-gradient-to-br from-green-50 to-white border border-green-100 shadow-sm' : 'bg-gray-50'}`}>
                    <div className={`text-xl font-bold ${count > 0 ? 'text-green-600' : 'text-gray-400'}`}>{count}</div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase mt-1 line-clamp-2">
                      {status.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Disbursement Chart */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card className="rounded-2xl shadow-sm" bordered={false}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Disbursement Volume (AED Millions)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={disbursementData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip suffix="M AED" />} />
                    <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card className="rounded-2xl shadow-sm h-full flex items-center justify-center" bordered={false}>
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <DollarSign className="text-white" size={40} />
                  </div>
                  <Statistic title="Total Disbursed" value={stats?.platformHealth?.applicationsByStatus?.disbursed || 0} suffix="Cases" valueStyle={{ color: "#10B981", fontSize: 32 }} />
                  <p className="text-gray-400 text-sm mt-2">Successfully completed</p>
                  <Button type="primary" className="mt-6 rounded-xl px-6" style={{ background: BRAND_GRADIENT, border: 'none' }}>
                    View Report
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'network',
      label: <span className="flex items-center gap-2 px-3 py-2"><Users size={16} /> Network</span>,
      children: (
        <div className="space-y-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="rounded-2xl text-center" bordered={false}>
                <Avatar size={64} icon={<Handshake />} style={{ backgroundColor: BRAND_PURPLE }} className="mx-auto mb-3" />
                <Statistic title="Referral Partners" value={stats?.platformHealth?.totalUsers?.referralPartners || 0} valueStyle={{ color: BRAND_PURPLE }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="rounded-2xl text-center" bordered={false}>
                <Avatar size={64} icon={<Building2 />} style={{ backgroundColor: "#3B82F6" }} className="mx-auto mb-3" />
                <Statistic title="Partners" value={stats?.platformHealth?.totalUsers?.partners || 0} valueStyle={{ color: "#3B82F6" }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="rounded-2xl text-center" bordered={false}>
                <Avatar size={64} icon={<Users />} style={{ backgroundColor: "#10B981" }} className="mx-auto mb-3" />
                <Statistic title="Advisors" value={stats?.platformHealth?.totalUsers?.advisors || 0} valueStyle={{ color: "#10B981" }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="rounded-2xl text-center" bordered={false}>
                <Avatar size={64} icon={<Shield />} style={{ backgroundColor: "#F59E0B" }} className="mx-auto mb-3" />
                <Statistic title="Ops Members" value={stats?.platformHealth?.totalUsers?.opsMembers || 0} valueStyle={{ color: "#F59E0B" }} />
              </Card>
            </Col>
          </Row>

          {/* Network Growth Chart */}
          <Card className="rounded-2xl shadow-sm" bordered={false}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Network Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cases" fill={BRAND_PURPLE} radius={[6, 6, 0, 0]} name="Total Cases" />
                <Bar dataKey="disbursed" fill="#10B981" radius={[6, 6, 0, 0]} name="Disbursed" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 md:p-8 font-sans">
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5C039B] to-purple-600 flex items-center justify-center shadow-lg">
                  <Activity className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">VAULT Intelligence Dashboard</h1>
              </div>
              <p className="text-sm text-gray-500 font-medium">Real-time metrics and operational overview</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Segmented 
                options={[
                  { label: 'Today', value: 'today' },
                  { label: 'Week', value: 'week' },
                  { label: 'Month', value: 'month' },
                  { label: 'Custom', value: 'custom' }
                ]} 
                value={timeFilter}
                onChange={setTimeFilter}
                className="bg-gray-100 rounded-lg p-1 font-medium"
              />
              
              {timeFilter === 'custom' && (
                <RangePicker 
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                  className="rounded-lg border-gray-200 hover:border-[#5C039B]"
                  placeholder={['Start Date', 'End Date']}
                />
              )}
              
              <Select
                placeholder="Filter by Customer"
                allowClear
                onChange={setCustomerFilter}
                className="min-w-[180px] rounded-lg"
                showSearch
              >
                <Option value="customer1">Customer A</Option>
                <Option value="customer2">Customer B</Option>
              </Select>
              
              <Button 
                icon={<RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />} 
                onClick={fetchDashboardStats}
                loading={refreshing}
                className="rounded-lg px-6 border-gray-200 hover:text-[#5C039B] hover:border-[#5C039B] transition-all"
              >
                Sync Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="overview"
        items={tabItems}
        className="custom-tabs"
        tabBarStyle={{ marginBottom: '24px', backgroundColor: 'transparent' }}
      />
      
      {/* Global Styles */}
      <style>{`
        .custom-tabs .ant-tabs-ink-bar { 
          background: ${BRAND_PURPLE}; 
          height: 3px; 
          border-radius: 3px 3px 0 0;
        }
        .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { 
          color: ${BRAND_PURPLE} !important; 
          font-weight: 700;
        }
        .custom-tabs .ant-tabs-tab:hover { 
          color: ${BRAND_PURPLE}; 
        }
        .custom-tabs .ant-tabs-tab { 
          font-size: 14px; 
          font-weight: 600; 
          color: #64748B; 
          padding: 12px 0; 
          margin-right: 32px;
        }
        .custom-scrollbar::-webkit-scrollbar { 
          width: 4px; 
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #E2E8F0; 
          border-radius: 4px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: ${BRAND_PURPLE}; 
        }
        .ant-card {
          border-radius: 16px;
        }
        .ant-progress-bg {
          height: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default VaultAdminDashboard;