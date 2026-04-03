import React from "react";
import { 
  AreaChart, Area, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from "recharts";

// Brand Colors
const PURPLE = "#5C039B";
const LIGHT_PURPLE = "#F4E8FF";
const GREEN = "#10B981";
const LIGHT_GREEN = "#D1FAE5";
const TEXT_MAIN = "#1F2937";
const TEXT_MUTED = "#6B7280";
const BORDER_COLOR = "#F3F4F6";

// Dummy Data
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
  { name: "Mortgage", value: 40, color: "#00C49F" },
  { name: "Partner", value: 20, color: "#FFBB28" },
  { name: "Sell", value: 15, color: "#FF8042" },
  { name: "Consultation", value: 25, color: PURPLE },
];

const distributionData = [
  { name: "Mortgage", value: 120 },
  { name: "Consultation", value: 45 },
  { name: "Buy", value: 55 },
  { name: "Schedule Visit", value: 65 },
  { name: "AI Enquiry", value: 180 },
];

// Helper Component for Top Cards
const StatCard = ({ title, value, icon, color, bgColor }) => (
  <div style={{
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    flex: 1,
    minWidth: "220px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
    border: `1px solid ${BORDER_COLOR}`,
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  }}>
    <div style={{ color: TEXT_MUTED, fontSize: "14px", fontWeight: 500 }}>{title}</div>
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <div style={{
        width: "48px", height: "48px", borderRadius: "10px", 
        background: bgColor, color: color,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px"
      }}>
        {icon}
      </div>
      <div style={{ fontSize: "28px", fontWeight: "bold", color: TEXT_MAIN }}>{value}</div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
      <span style={{ 
        background: LIGHT_GREEN, color: GREEN, padding: "2px 8px", 
        borderRadius: "4px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px"
      }}>
        ↑ 12%
      </span>
      <span style={{ color: TEXT_MUTED }}>Growth</span>
    </div>
  </div>
);

const VaultAdminDashboard = () => {
  return (
    <div style={{ padding: "32px", background: "#F8FAFC", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ margin: 0, color: TEXT_MAIN, fontSize: "28px", fontWeight: 700 }}>Dashboard View</h1>
          <p style={{ margin: "4px 0 0 0", color: TEXT_MUTED, fontSize: "14px" }}>
            Real-time overview of agents, clients, and cases.
          </p>
        </div>
        
      </div>

      {/* Top 4 Stat Cards */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "24px", flexWrap: "wrap" }}>
        <StatCard title="Total Agents" value="45"  color={PURPLE}  />
        <StatCard title="Total Clients" value="120"  color="#0ea5e9"  />
        <StatCard title="Total Cases" value="85"  color={GREEN} />
        <StatCard title="Disbursed" value="32"  color="#f59e0b"  />
      </div>

      {/* Middle Section: Timeline & Category (2 Columns) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
        
        {/* Timeline Chart */}
        <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${BORDER_COLOR}`, padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 24px 0", fontSize: "16px", color: TEXT_MAIN }}>Case Generation Timeline</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={timelineData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PURPLE} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={PURPLE} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: TEXT_MUTED, fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: TEXT_MUTED, fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                <Area type="monotone" dataKey="cases" stroke={PURPLE} strokeWidth={3} fillOpacity={1} fill="url(#colorCases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${BORDER_COLOR}`, padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 24px 0", fontSize: "16px", color: TEXT_MAIN }}>Cases by Category</h3>
          <div style={{ width: "100%", height: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Section: 3 Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
        
        {/* User Overview */}
        <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${BORDER_COLOR}`, padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 24px 0", fontSize: "16px", color: TEXT_MAIN }}>Agent Overview</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER_COLOR}`, paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e0f2fe", color: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>👥</div>
                <span style={{ color: TEXT_MAIN, fontWeight: 500 }}>Active Agents</span>
              </div>
              <span style={{ fontWeight: "bold" }}>45</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER_COLOR}`, paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fef3c7", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>🕒</div>
                <span style={{ color: TEXT_MAIN, fontWeight: 500 }}>Pending Approvals</span>
              </div>
              <span style={{ fontWeight: "bold", color: "#f59e0b" }}>12</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: LIGHT_PURPLE, color: PURPLE, display: "flex", alignItems: "center", justifyContent: "center" }}>🤝</div>
                <span style={{ color: TEXT_MAIN, fontWeight: 500 }}>External Partners</span>
              </div>
              <span style={{ fontWeight: "bold" }}>8</span>
            </div>
          </div>
        </div>

        {/* Lead Type Distribution (Horizontal Bar) */}
        <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${BORDER_COLOR}`, padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 24px 0", fontSize: "16px", color: TEXT_MAIN }}>Case Type Distribution</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={distributionData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: TEXT_MUTED, fontSize: 12}} width={100} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill={PURPLE} radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property Inventory (Grid of 4) */}
        <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${BORDER_COLOR}`, padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 24px 0", fontSize: "16px", color: TEXT_MAIN }}>Bank Connects</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            
            <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", padding: "16px", textAlign: "center" }}>
              <div style={{ color: TEXT_MUTED, fontSize: "13px", marginBottom: "8px" }}>Available</div>
              <div style={{ color: GREEN, fontSize: "20px", fontWeight: "bold" }}>112</div>
            </div>
            
            <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", padding: "16px", textAlign: "center" }}>
              <div style={{ color: TEXT_MUTED, fontSize: "13px", marginBottom: "8px" }}>Featured</div>
              <div style={{ color: "#0ea5e9", fontSize: "20px", fontWeight: "bold" }}>56</div>
            </div>
            
            <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", padding: "16px", textAlign: "center" }}>
              <div style={{ color: TEXT_MUTED, fontSize: "13px", marginBottom: "8px" }}>Pending</div>
              <div style={{ color: "#ef4444", fontSize: "20px", fontWeight: "bold" }}>26</div>
            </div>
            
            <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", padding: "16px", textAlign: "center" }}>
              <div style={{ color: TEXT_MUTED, fontSize: "13px", marginBottom: "8px" }}>Verified</div>
              <div style={{ color: "#f59e0b", fontSize: "20px", fontWeight: "bold" }}>23</div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default VaultAdminDashboard;