import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  HomeOutlined, BellOutlined, ArrowUpOutlined, ArrowDownOutlined,
  MessageOutlined, ReloadOutlined, BuildOutlined, LineChartOutlined,
  CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined
} from "@ant-design/icons";
import {
  Card, Row, Col, Select, Button, Typography, Tag,
  Badge, Table, Spin, message
} from "antd";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const dealColumns = [
  { title: 'Deal Date', dataIndex: 'date', key: 'date' },
  { title: 'Unit Reference', dataIndex: 'unit', key: 'unit' },
  { 
    title: 'Status', 
    dataIndex: 'status', 
    key: 'status',
    render: (status) => <Tag color="green">{status}</Tag> 
  },
];

const COLORS = ["#3b82f6", "#f59e0b", "#10b981"];

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});

  const [timeRange, setTimeRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.get("/properties/developer/dashboard");
      if (res?.status === "success" || res?.data) {
        const data = res?.data?.data || res?.data;
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      message.error(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  // Prepare flattened data for the bar chart
  const getBarChartData = () => {
    if (!dashboardData?.propertyWiseInventory) return [];
    return dashboardData.propertyWiseInventory.map(prop => ({
      propertyName: prop.propertyName,
      available: prop.stats.available,
      reserved: prop.stats.reserved,
      sold: prop.stats.sold
    }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData().finally(() => {
      setTimeout(() => setRefreshing(false), 800);
    });
  };

  const getDisplayName = () => {
    if (user?.first_name) return `${user.first_name} ${user.last_name || ""}`;
    if (user?.name) return user.name;
    if (user?.company_name) return user.company_name;
    return "Developer";
  };

  const statsIcons = [
    <BuildOutlined />,
    <LineChartOutlined />,
    <CheckCircleOutlined />,
    <ClockCircleOutlined />
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Spin spinning={loading} tip="Loading dashboard...">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Welcome, {getDisplayName()} 👋
            </Title>
            <Text type="secondary">
              Monitor projects, inventory, visits and deals via Xoto GRID.
            </Text>
          </div>

          <div className="flex gap-3 items-center">
            <Select value={timeRange} style={{ width: 160 }} onChange={setTimeRange}>
              <Option value="7d">Last 7 Days</Option>
              <Option value="30d">Last 30 Days</Option>
              <Option value="90d">Last 90 Days</Option>
            </Select>

            <Button icon={<HomeOutlined />} onClick={() => navigate("/")}>
              Home
            </Button>

            <Button
              icon={<ReloadOutlined spin={refreshing} />}
              loading={refreshing}
              onClick={handleRefresh}
            >
              Refresh
            </Button>

            <Badge count={0} color="#7c3aed">
              <Button
                type="primary"
                icon={<MessageOutlined />}
                style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
              >
                Chats
              </Button>
            </Badge>

            <Button type="primary" icon={<BellOutlined />}>
              Alerts
            </Button>
          </div>
        </div>

        {/* STATS */}
        <Row gutter={[16, 16]} className="mb-8">
          {dashboardData?.stats?.map((stat, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card bordered={false}>
                <div className="flex justify-between mb-2">
                  <div>
                    <Text type="secondary">{stat.label}</Text>
                    <Title level={3} style={{ margin: "4px 0" }}>{stat.value}</Title>
                  </div>
                  <div style={{
                    background: stat.bg,
                    color: stat.color,
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px"
                  }}>
                    {statsIcons[i]}
                  </div>
                </div>
                {stat.change !== 0 && (
                  <Tag
                    color={stat.change > 0 ? "green" : "red"}
                    icon={stat.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  >
                    {Math.abs(stat.change)}%
                  </Tag>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {/* PROPERTY-WISE INVENTORY STATUS */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} lg={8}>
          <Card title="Top Performing Listing" className="h-full">
            <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <TrophyOutlined style={{ fontSize: "48px", color: "#f59e0b", marginBottom: "16px" }} />
              <Title level={4}>No Data Yet</Title>
              <Text type="secondary" className="mb-2">Add inventory to see top listings</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Overall Inventory Status">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={dashboardData?.inventoryStatus || []} dataKey="value" outerRadius={80} label>
                  {(dashboardData?.inventoryStatus || []).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Sales Pipeline">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardData?.dealFunnel || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* PROPERTY-WISE INVENTORY IN ONE OVERALL CHART */}
      {dashboardData?.propertyWiseInventory && dashboardData.propertyWiseInventory.length > 0 && (
        <Row gutter={[16, 16]} className="mb-8">
          <Col span={24}>
            <Card title="Property-wise Inventory Status (Overall)">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={getBarChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="propertyName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="available" stackId="a" fill="#3b82f6" name="Available" />
                  <Bar dataKey="reserved" stackId="a" fill="#f59e0b" name="Reserved" />
                  <Bar dataKey="sold" stackId="a" fill="#10b981" name="Sold" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}

        {/* DEALS CLOSED TABLE */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Deals Closed via Platform (Xoto GRID)">
              <Table 
                columns={dealColumns} 
                dataSource={dashboardData?.dealsClosed || []} 
                pagination={false}
                bordered
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default DeveloperDashboard;