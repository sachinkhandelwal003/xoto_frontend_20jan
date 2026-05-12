import React from "react";
import { Card, Row, Col, Typography, Table, Tag, Statistic, Avatar, Timeline } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  RiseOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area
} from "recharts";

const { Title, Text } = Typography;

/* ---------- Styles & Theme ---------- */

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "24px"
  },
  header: {
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap"
  },
  card: {
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)",
    transition: "transform 0.2s",
    overflow: "hidden"
  },
  iconContainer: (color) => ({
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: `${color}20`, // 20% opacity
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px"
  }),
  trendUp: { color: "#52c41a", fontSize: "12px", fontWeight: 600 },
  trendDown: { color: "#ff4d4f", fontSize: "12px", fontWeight: 600 }
};

/* ---------- Stats Data ---------- */

const stats = [
  {
    title: "Total Agents",
    value: 12,
    icon: <TeamOutlined />,
    color: "#6f42c1",
    trend: "+12%",
    trendStatus: "up"
  },
  {
    title: "Active Leads",
    value: 86,
    icon: <UserOutlined />,
    color: "#17a2b8",
    trend: "+5%",
    trendStatus: "up"
  },
  {
    title: "Deals Closed",
    value: 24,
    icon: <RiseOutlined />,
    color: "#28a745",
    trend: "-2%",
    trendStatus: "down"
  },
  {
    title: "Revenue Generated",
    value: "\$148K",
    icon: <DollarOutlined />,
    color: "#ffc107",
    trend: "+18%",
    trendStatus: "up"
  }
];

/* ---------- Charts Data ---------- */

const revenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 18000 },
  { month: "Mar", revenue: 22000 },
  { month: "Apr", revenue: 26000 },
  { month: "May", revenue: 31000 },
  { month: "Jun", revenue: 29000 }
];

const pipelineData = [
  { stage: "Lead", count: 30 },
  { stage: "Visit", count: 20 },
  { stage: "Negotiation", count: 15 },
  { stage: "Booking", count: 10 },
  { stage: "Closed", count: 8 }
];

/* ---------- Table Data ---------- */

const columns = [
  {
    title: "Agent",
    dataIndex: "name",
    key: "name",
    render: (name) => (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Avatar style={{ backgroundColor: "#87d068" }} icon={<UserOutlined />} />
        <Text strong>{name}</Text>
      </div>
    )
  },
  { title: "Deals", dataIndex: "deals", key: "deals", sorter: (a, b) => a.deals - b.deals },
  { 
    title: "Revenue", 
    dataIndex: "revenue", 
    key: "revenue",
    render: (text) => <Text strong>{text}</Text>
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) =>
      status === "Active"
        ? <Tag color="green" style={{ borderRadius: "4px" }}>Active</Tag>
        : <Tag color="red" style={{ borderRadius: "4px" }}>Inactive</Tag>
  }
];

const agents = [
  { key: 1, name: "John Smith", deals: 8, revenue: "\$45K", status: "Active" },
  { key: 2, name: "Sarah Johnson", deals: 6, revenue: "\$32K", status: "Active" },
  { key: 3, name: "Ali Khan", deals: 5, revenue: "\$27K", status: "Active" },
  { key: 4, name: "Emily Davis", deals: 3, revenue: "\$15K", status: "Inactive" }
];

/* ---------- Activity Data ---------- */

const activities = [
  { text: "John Smith added a new lead", time: "2 hours ago", color: "#17a2b8" },
  { text: "Sarah scheduled a site visit", time: "5 hours ago", color: "#6f42c1" },
  { text: "Ali closed a deal", time: "1 day ago", color: "#28a745" },
  { text: "New project added to pipeline", time: "2 days ago", color: "#ffc107" }
];

/* ---------- Custom Tooltip ---------- */

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #eee", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <p style={{ margin: 0, fontWeight: "bold" }}>{label}</p>
        <p style={{ margin: 0, color: payload[0].color }}>
          {payload[0].name}: {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function AgencyDashboard() {
  return (
    <div style={styles.container}>
      
      {/* ---------- Header ---------- */}
      <div style={styles.header}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
          <Text type="secondary">Welcome back, Admin</Text>
        </div>
        <div>
          <Tag color="blue" style={{ padding: "5px 10px", fontSize: "14px" }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Tag>
        </div>
      </div>

      {/* ---------- Stats Cards ---------- */}
      <Row gutter={[16, 16]}>
        {stats.map((item, index) => (
          <Col key={index} xs={24} sm={12} lg={6}>
            <Card style={styles.card} hoverable>
              <Row justify="space-between" align="middle">
                <Col>
                  <Text type="secondary" style={{ fontSize: "14px" }}>{item.title}</Text>
                  <div style={{ marginTop: "8px" }}>
                    <Statistic
                      value={item.value}
                      valueStyle={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}
                      prefix={
                        item.trendStatus === "up" 
                          ? <ArrowUpOutlined style={styles.trendUp} /> 
                          : <ArrowDownOutlined style={styles.trendDown} />
                      }
                      suffix={<span style={item.trendStatus === "up" ? styles.trendUp : styles.trendDown}>{item.trend}</span>}
                    />
                  </div>
                </Col>
                <Col>
                  <div style={styles.iconContainer(item.color)}>
                    {item.icon}
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ---------- Charts ---------- */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} lg={14}>
          <Card title="Revenue Growth" style={styles.card} extra={<a href="#">View Report</a>}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6f42c1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6f42c1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `\$${value/1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6f42c1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Lead Pipeline" style={styles.card}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="stage" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f5f5f5'}} />
                <Bar dataKey="count" fill="#17a2b8" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ---------- Agents + Activity ---------- */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} lg={14}>
          <Card title="Top Performing Agents" style={styles.card}>
            <Table
              columns={columns}
              dataSource={agents}
              pagination={false}
              scroll={{ x: true }}
              size="middle"
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Recent Activity" style={styles.card}>
            <Timeline
              items={activities.map((item, i) => ({
                color: item.color,
                children: (
                  <div key={i}>
                    <Text strong>{item.text}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>{item.time}</Text>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
}