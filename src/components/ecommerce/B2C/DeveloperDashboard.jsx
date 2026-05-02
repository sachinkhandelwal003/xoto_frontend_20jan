import { useState, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  RiseOutlined, FileTextOutlined, HomeOutlined,
  BellOutlined, ArrowUpOutlined, ArrowDownOutlined,
  MessageOutlined, ReloadOutlined,
} from "@ant-design/icons";
import {
  Card, Row, Col, Select, Button, Typography, Tag,
  Spin, Badge
} from "antd";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { registerSocket } from "../../../utils/socket";
import ActionRequiredModal from "../../../component/Actionrequired";
import { AuthContext } from "../../../context/ProfileContext";

const { Title, Text } = Typography;
const { Option } = Select;

const DeveloperDashboard = () => {

  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const developerId = user?._id || user?.id || user?.sub;

  const { userProfile, loading: profileLoading, isOnboarded } = useContext(AuthContext);
  const prof = userProfile?.data || userProfile || {};

  // 🔥 Foolproof check: Context wala flag OR Backend ka actual data
  const checkIsOnboarded = isOnboarded || prof?.isVerified === true || prof?.onboarding_status === "approved";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const [dealFunnel, setDealFunnel] = useState([]);
  const [timeRange, setTimeRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);

  const COLORS = ["#3b82f6", "#f59e0b", "#10b981"];

  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiService.get(`/property/developer-dashboard/${developerId}`);
      if (res?.success) {
        setStats(res.stats || []);
        setInventoryStatus(res.inventoryStatus || []);
        setDealFunnel(res.dealFunnel || []);
      }
    } catch (err) {
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!developerId) return;
    fetchDashboard();
    registerSocket(developerId);
  }, [developerId, timeRange]);

  const getDisplayName = () => {
    if (prof?.first_name)
      return `${prof.first_name} ${prof.last_name || ""}`;
    if (prof?.name) return prof.name;
    if (prof?.company_name) return prof.company_name;
    return "Developer";
  };

  // Agar profile ya dashboard load ho raha hai
  if (loading || profileLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  // 🔥 Ab yahan naya variable use kiya hai
  if (!checkIsOnboarded) {
    return <ActionRequiredModal isOpen />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Welcome, {getDisplayName()} 👋
          </Title>
          <Text type="secondary">
            Monitor projects, inventory, visits and deals.
          </Text>
        </div>

        <div className="flex gap-3 items-center">
          <Select defaultValue="7d" style={{ width: 160 }} onChange={setTimeRange}>
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
            onClick={() => fetchDashboard(true)}
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
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false}>
              <div className="flex justify-between">
                <div>
                  <Text type="secondary">{stat.label}</Text>
                  <Title level={3}>{stat.value}</Title>
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
                }}>
                  {stat.icon}
                </div>
              </div>
              <Tag
                color={stat.change > 0 ? "green" : "red"}
                icon={stat.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              >
                {Math.abs(stat.change)}%
              </Tag>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CHARTS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Inventory Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={inventoryStatus} dataKey="value" outerRadius={120} label>
                  {inventoryStatus.map((_, index) => (
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