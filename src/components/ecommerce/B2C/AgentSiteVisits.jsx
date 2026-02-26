import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Space
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AgentSiteVisits() {

  const navigate = useNavigate();

  const visits = [
    {
      key: 1,
      client: "Rahul Mehta",
      project: "Sky Tower",
      date: "22 Feb 2026",
      status: "Scheduled"
    },
    {
      key: 2,
      client: "Ali Hassan",
      project: "Downtown View",
      date: "20 Feb 2026",
      status: "Completed"
    },
    {
      key: 3,
      client: "Neha Gupta",
      project: "Marina Heights",
      date: "18 Feb 2026",
      status: "Cancelled"
    }
  ];

  const getStatusColor = (status) => {
    if (status === "Scheduled") return "blue";
    if (status === "Completed") return "green";
    if (status === "Cancelled") return "red";
    return "default";
  };

  // Summary
  const totalVisits = visits.length;
  const completed = visits.filter(v => v.status === "Completed").length;
  const scheduled = visits.filter(v => v.status === "Scheduled").length;
  const cancelled = visits.filter(v => v.status === "Cancelled").length;

  const columns = [
    { title: "Client", dataIndex: "client" },
    { title: "Project", dataIndex: "project" },
    { title: "Visit Date", dataIndex: "date" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          className="px-3 py-1 rounded-full"
        >
          {status}
        </Tag>
      )
    },
    {
      title: "Action",
      render: (record) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() =>
            navigate(`/dashboard/agent/site-visits/${record.key}`)
          }
          className="rounded-lg"
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="!mb-1">
          Site Visit Management
        </Title>
        <Text type="secondary">
          Track all scheduled and completed property visits
        </Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[24, 24]} className="mb-8">

        <Col xs={24} md={6}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Total Visits"
              value={totalVisits}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Scheduled"
              value={scheduled}
              valueStyle={{ color: "#2563eb" }}
            />
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Completed"
              value={completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#16a34a" }}
            />
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Cancelled"
              value={cancelled}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#dc2626" }}
            />
          </Card>
        </Col>

      </Row>

      {/* Filter Section */}
      <Card bordered={false} className="shadow-lg rounded-2xl mb-6">
        <Space>
          <Input.Search
            placeholder="Search client or project"
            style={{ width: 250 }}
          />
          <Select defaultValue="all" style={{ width: 180 }}>
            <Option value="all">All Status</Option>
            <Option value="scheduled">Scheduled</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </Space>
      </Card>

      {/* Table */}
      <Card bordered={false} className="shadow-lg rounded-2xl">
        <Table
          columns={columns}
          dataSource={visits}
          pagination={{ pageSize: 5 }}
          rowKey="key"
        />
      </Card>

    </div>
  );
}