import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  RiseOutlined,
  FileTextOutlined,
  TeamOutlined,
  HomeOutlined,
  PercentageOutlined,
  BellOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Typography,
  Tag,
  Avatar,
  List,
  Spin,
} from "antd";

import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const DeveloperDashboard = () => {

  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth || {});
  const developerId = user?._id || user?.id || user?.sub;

  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState([]);
  const [leadsTrend, setLeadsTrend] = useState([]);
  const [unitsSoldMonthly, setUnitsSoldMonthly] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const [dealFunnel, setDealFunnel] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [topProjects, setTopProjects] = useState([]);
  const COLORS = ["#3b82f6", "#f59e0b", "#10b981"];

 useEffect(() => {
  if (!developerId) return;

  fetchDashboard();
}, [developerId, timeRange]);

 const fetchDashboard = async () => {
  try {
    const res = await apiService.get(
      `/property/developer-dashboard/${developerId}`
    );

    if (res?.success) {
      setStats(res.stats || []);
      setInventoryStatus(res.inventoryStatus || []);
      setDealFunnel(res.dealFunnel || []);
      setTopProjects(res.topProjects || []);
    }

  } catch (err) {
    console.log("Dashboard error:", err);
  }

  setLoading(false);
};

  const quickActions = [
    {
      label: "Projects",
      icon: <RiseOutlined />,
      color: "#3b82f6",
      onClick: () => navigate("/dashboard/developer/developer-projects"),
    },
    {
      label: "Inventory",
      icon: <HomeOutlined />,
      color: "#10b981",
      onClick: () => navigate("/dashboard/developer/inventory"),
    },
    {
      label: "Bookings",
      icon: <FileTextOutlined />,
      color: "#6366f1",
      onClick: () => navigate("/dashboard/developer/bookings"),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2}>Developer Dashboard</Title>
          <Text type="secondary">
            Monitor projects, inventory, visits and deals.
          </Text>
        </div>

        <div className="flex gap-3">
          <Select
            defaultValue="7d"
            style={{ width: 160 }}
            onChange={setTimeRange}
          >
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
            <Option value="90d">Last 90 Days</Option>
          </Select>

          <Button type="primary" icon={<BellOutlined />}>
            Alerts
          </Button>
        </div>
      </div>

      {/* STATS */}

      <Row gutter={[16, 16]} className="mb-8">
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false}>
              <div className="flex justify-between">
                <div>
                  <Text type="secondary">{stat.label}</Text>
                  <Title level={3}>{stat.value}</Title>
                </div>

                <div
                  style={{
                    background: stat.bg,
                    color: stat.color,
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {stat.icon}
                </div>
              </div>

              <Tag
                color={stat.change > 0 ? "green" : "red"}
                icon={
                  stat.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />
                }
              >
                {Math.abs(stat.change)}%
              </Tag>
            </Card>
          </Col>
        ))}
      </Row>

      {/* INVENTORY PIE CHART */}

      <Row gutter={[16, 16]}>

        <Col xs={24} lg={12}>
          <Card title="Inventory Status">

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>

                <Pie
                  data={inventoryStatus}
                  dataKey="value"
                  outerRadius={120}
                  label
                >
                  {inventoryStatus.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />

              </PieChart>
            </ResponsiveContainer>

          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Sales Pipeline">

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dealFunnel}>
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

    </div>
  );
};

export default DeveloperDashboard;