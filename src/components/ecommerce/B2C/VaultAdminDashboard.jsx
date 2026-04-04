import React from "react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Users, UserCheck, FolderOpen, Banknote,
  TrendingUp, Clock, Handshake, Building2,
  ArrowUpRight
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────
const timelineData = [
  { name: "Mar 25", cases: 4 },
  { name: "Mar 26", cases: 8 },
  { name: "Mar 27", cases: 12 },
  { name: "Mar 28", cases: 18 },
  { name: "Mar 29", cases: 15 },
  { name: "Mar 30", cases: 24 },
  { name: "Mar 31", cases: 20 },
];

const categoryData = [
  { name: "Mortgage",     value: 40, color: "#00C49F" },
  { name: "Partner",      value: 20, color: "#FFBB28" },
  { name: "Sell",         value: 15, color: "#FF8042" },
  { name: "Consultation", value: 25, color: "#5C039B" },
];

const distributionData = [
  { name: "Mortgage",       value: 120 },
  { name: "Consultation",   value: 45  },
  { name: "Buy",            value: 55  },
  { name: "Schedule Visit", value: 65  },
  { name: "AI Enquiry",     value: 180 },
];

// ── Stat Card ─────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, iconColor, iconBg, growth }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-3xl font-bold text-gray-900">{value}</span>
      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
        <ArrowUpRight size={12} />
        {growth}
      </div>
    </div>
    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${iconBg.replace("bg-", "bg-").replace("50", "400")}`} style={{ width: "60%" }} />
    </div>
  </div>
);

// ── Custom Tooltip ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="font-semibold text-gray-700">{label}</p>
        <p className="text-purple-700 font-bold">{payload[0].value} cases</p>
      </div>
    );
  }
  return null;
};

// ── Main ──────────────────────────────────────────────────────────────
const VaultAdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time overview of agents, clients, and cases.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard title="Total Agents"   value="45"  icon={Users}      iconColor="text-purple-700" iconBg="bg-purple-50"  growth="12%" />
        <StatCard title="Total Clients"  value="120" icon={UserCheck}   iconColor="text-sky-600"    iconBg="bg-sky-50"     growth="8%"  />
        <StatCard title="Total Cases"    value="85"  icon={FolderOpen}  iconColor="text-emerald-600" iconBg="bg-emerald-50" growth="15%" />
        <StatCard title="Disbursed"      value="32"  icon={Banknote}    iconColor="text-amber-600"  iconBg="bg-amber-50"   growth="5%"  />
      </div>

      {/* Row 2: Area Chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

        {/* Area Chart — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-800">Case Generation Timeline</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
            </div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">Weekly</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={timelineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#5C039B" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#5C039B" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cases"
                stroke="#5C039B" strokeWidth={2.5}
                fill="url(#grad)" dot={false}
                activeDot={{ r: 5, fill: "#5C039B", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut — 1/3 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-800">Cases by Category</h3>
            <p className="text-xs text-gray-400 mt-0.5">Distribution breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={categoryData} innerRadius={55} outerRadius={80}
                paddingAngle={4} dataKey="value" strokeWidth={0}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.08)", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="mt-4 flex flex-col gap-2">
            {categoryData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-gray-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 3: Agent Overview + Bar Chart + Bank Connects */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        {/* Agent Overview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-800">Agent Overview</h3>
            <p className="text-xs text-gray-400 mt-0.5">Current agent status</p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: "Active Agents",     value: "45", icon: Users,     iconBg: "bg-sky-50",    iconColor: "text-sky-500",    valueCls: "text-gray-800" },
              { label: "Pending Approvals", value: "12", icon: Clock,     iconBg: "bg-amber-50",  iconColor: "text-amber-500",  valueCls: "text-amber-500" },
              { label: "External Partners", value: "8",  icon: Handshake, iconBg: "bg-purple-50", iconColor: "text-purple-700", valueCls: "text-gray-800" },
            ].map(({ label, value, icon: Icon, iconBg, iconColor, valueCls }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                    <Icon size={15} className={iconColor} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <span className={`text-base font-bold ${valueCls}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-800">Case Type Distribution</h3>
            <p className="text-xs text-gray-400 mt-0.5">Volume by lead type</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={distributionData} layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 11 }} width={95} />
              <Tooltip
                cursor={{ fill: "#F9FAFB" }}
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.08)", fontSize: 12 }}
              />
              <Bar dataKey="value" fill="#5C039B" radius={[0, 5, 5, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bank Connects */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-800">Bank Connects</h3>
            <p className="text-xs text-gray-400 mt-0.5">Connected bank status</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Available", value: "112", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
              { label: "Featured",  value: "56",  color: "text-sky-600",     bg: "bg-sky-50",     border: "border-sky-100"     },
              { label: "Pending",   value: "26",  color: "text-red-500",     bg: "bg-red-50",     border: "border-red-100"     },
              { label: "Verified",  value: "23",  color: "text-amber-500",   bg: "bg-amber-50",   border: "border-amber-100"   },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} className={`rounded-xl p-4 text-center border ${bg} ${border}`}>
                <div className="flex items-center justify-center mb-2">
                  <Building2 size={15} className={color} />
                </div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 font-medium mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VaultAdminDashboard;