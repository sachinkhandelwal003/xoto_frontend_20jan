import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Table, Tag, Statistic, Avatar, Timeline, Spin, message } from "antd";
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
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

/* ---------- Styles & Theme ---------- */

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F2EBF7",
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
  trendUp: { color: "#64EF0A", fontSize: "12px", fontWeight: 600 },
  trendDown: { color: "#EF4444", fontSize: "12px", fontWeight: 600 }
};

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
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState([
    {
      title: "Total Agents",
      value: 0,
      icon: <TeamOutlined />,
      color: "#5C039B",
      trend: null,
      trendStatus: null
    },
    {
      title: "Active Leads",
      value: 0,
      icon: <UserOutlined />,
      color: "#03A4F4",
      trend: null,
      trendStatus: null
    },
    {
      title: "Total Listings",
      value: 0,
      icon: <RiseOutlined />,
      color: "#64EF0A",
      trend: null,
      trendStatus: null
    },
    {
      title: "Revenue Generated",
      value: "$0",
      icon: <DollarOutlined />,
      color: "#D67A56",
      trend: null,
      trendStatus: null
    }
  ]);

  const [revenueData, setRevenueData] = useState([]);
  const [pipelineData, setPipelineData] = useState([]);
  const [topAgents, setTopAgents] = useState([]);
  const [activities, setActivities] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiService.get("agency/dashboard");
      const data = res?.data;
      if (!data) return;

      setDashboardData(data);

      const newStats = [
        {
          title: "Total Agents",
          value: data.stats.active_agents || 0,
          icon: <TeamOutlined />,
          color: "#5C039B",
          trend: null,
          trendStatus: null
        },
        {
          title: "Active Leads",
          value: data.stats.active_leads || 0,
          icon: <UserOutlined />,
          color: "#03A4F4",
          trend: null,
          trendStatus: null
        },
        {
          title: "Total Listings",
          value: data.stats.total_listings || 0,
          icon: <RiseOutlined />,
          color: "#64EF0A",
          trend: null,
          trendStatus: null
        },
        {
          title: "Revenue Generated",
          value: `$${(data.stats.total_commission || 0).toLocaleString()}`,
          icon: <DollarOutlined />,
          color: "#D67A56",
          trend: null,
          trendStatus: null
        }
      ];

      setStats(newStats);

      setTopAgents(data.top_agent ? [
        {
          key: "1",
          name: `${data.top_agent.first_name} ${data.top_agent.last_name}`,
          deals: data.top_agent.totalLeads || 0,
          revenue: `$${(data.top_agent.commissionEarned || 0).toLocaleString()}`,
          status: "Active"
        }
      ] : []);

      const recentActivities = (data.recent_activity || []).map((item, idx) => {
        if (item.type === 'lead') {
          const leadName = item.contact_info?.name
            ? `${item.contact_info.name.first_name || ''} ${item.contact_info.name.last_name || ''}`.trim()
            : 'Unknown Lead';
          return {
            text: `New lead: ${leadName}`,
            time: new Date(item.createdAt).toLocaleString(),
            color: "#03A4F4"
          };
        } else if (item.type === 'listing') {
          const listingName = item.propertyName || item.projectName || 'New Listing';
          const agentName = item.created_by_agent
            ? `${item.created_by_agent.first_name || ''} ${item.created_by_agent.last_name || ''}`.trim()
            : 'Agent';
          return {
            text: `${agentName} created listing: ${listingName}`,
            time: new Date(item.createdAt).toLocaleString(),
            color: "#64EF0A"
          };
        } else if (item.first_name && item.last_name) {
          return {
            text: `${item.first_name} ${item.last_name} updated their profile`,
            time: new Date(item.updatedAt).toLocaleString(),
            color: "#5C039B"
          };
        } else {
          return {
            text: `New activity`,
            time: new Date(item.createdAt || item.updatedAt).toLocaleString(),
            color: "#03A4F4"
          };
        }
      });
      setActivities(recentActivities);

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const columns = [
    {
      title: "Agent",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar style={{ backgroundColor: "#5C039B" }} icon={<UserOutlined />} />
          <Text strong style={{ color: "#020202" }}>{name}</Text>
        </div>
      )
    },
    { title: "Deals", dataIndex: "deals", key: "deals", sorter: (a, b) => a.deals - b.deals },
    { 
      title: "Revenue", 
      dataIndex: "revenue", 
      key: "revenue",
      render: (text) => <Text strong style={{ color: "#020202" }}>{text}</Text>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "Active"
          ? <Tag style={{ backgroundColor: "#64EF0A", color: "#fff", borderRadius: "4px" }}>Active</Tag>
          : <Tag style={{ backgroundColor: "#EF4444", color: "#fff", borderRadius: "4px" }}>Inactive</Tag>
    }
  ];

  return (
    <div style={styles.container}>
      <Spin spinning={loading}>
        {/* ---------- Header ---------- */}
        <div style={styles.header}>
          <div>
            <Title level={2} style={{ margin: 0, color: "#5C039B" }}>Dashboard</Title>
            <Text type="secondary" style={{ color: "#547593" }}>
              Welcome back, {dashboardData?.agency?.companyName || "Agency"}
            </Text>
          </div>
          <div>
            <Tag style={{ backgroundColor: "#03A4F4", color: "#fff", padding: "5px 10px", fontSize: "14px" }}>
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
            <Card title="Presentation Balance" style={styles.card} extra={<a href="#" style={{ color: "#03A4F4" }}>View Report</a>} headStyle={{ color: "#020202" }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[
                  { name: 'Used', value: dashboardData?.agency?.presentationsUsed || 0 },
                  { name: 'Remaining', value: dashboardData?.agency?.presentationBalance || 0 }
                ]}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5C039B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#5C039B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EBF7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#5C039B" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="Lead Pipeline" style={styles.card} headStyle={{ color: "#020202" }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { stage: "Total Leads", count: dashboardData?.stats?.total_leads || 0 },
                  { stage: "Active", count: dashboardData?.stats?.active_leads || 0 },
                  { stage: "Closed", count: dashboardData?.stats?.total_deals || 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EBF7" />
                  <XAxis dataKey="stage" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#F2EBF7'}} />
                  <Bar dataKey="count" fill="#03A4F4" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* ---------- Agents + Activity ---------- */}
        <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
          <Col xs={24} lg={14}>
            <Card title="Top Performing Agent" style={styles.card} headStyle={{ color: "#020202" }}>
              <Table
                columns={columns}
                dataSource={topAgents}
                pagination={false}
                scroll={{ x: true }}
                size="middle"
              />
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="Recent Activity" style={styles.card} headStyle={{ color: "#020202" }}>
              <Timeline
                items={activities.map((item, i) => ({
                  color: item.color,
                  children: (
                    <div key={i}>
                      <Text strong style={{ color: "#020202" }}>{item.text}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px", color: "#547593" }}>{item.time}</Text>
                    </div>
                  ),
                }))}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}