import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Breadcrumb,
  Progress,
  Tag,
  Space
} from "antd";

import {
  FundOutlined,
  RiseOutlined,
  ProjectOutlined,
  TeamOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function DeveloperAnalytics() {

  const data = [
    { key:1, project:"Palm Residency", leads:32, bookings:8, unsold:20 },
    { key:2, project:"Skyline Towers", leads:18, bookings:5, unsold:12 }
  ];

  const columns = [
    {
      title:"Project",
      dataIndex:"project",
      render:(text)=> <strong>{text}</strong>
    },
    {
      title:"Leads",
      dataIndex:"leads",
      render:(v)=> <Tag color="blue">{v}</Tag>
    },
    {
      title:"Bookings",
      dataIndex:"bookings",
      render:(v)=> <Tag color="green">{v}</Tag>
    },
    {
      title:"Unsold Units",
      dataIndex:"unsold",
      render:(v)=> <Tag color="orange">{v}</Tag>
    }
  ];

  return (
    <div style={{ background:"#f6f8fb", minHeight:"100vh", padding:24 }}>

      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom:18 }}>
        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item>Analytics</Breadcrumb.Item>
      </Breadcrumb>

      {/* HEADER */}
      <Card
        style={{
          borderRadius:14,
          marginBottom:20,
          background:"linear-gradient(135deg,#5c039b 0%,#7b2cbf 100%)",
          border:"none"
        }}
        bodyStyle={{ padding:26 }}
      >
        <Title level={3} style={{ color:"white", marginBottom:4 }}>
          Developer Analytics
        </Title>

        <Text style={{ color:"rgba(255,255,255,0.85)" }}>
          Monitor project performance, leads conversion and sales insights.
        </Text>
      </Card>

      {/* STAT CARDS */}
      <Row gutter={[18,18]}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius:14 }}>
            <Statistic
              title="Total Leads"
              value={120}
              prefix={<TeamOutlined style={{ color:"#1677ff" }}/>}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius:14 }}>
            <Statistic
              title="Bookings"
              value={28}
              prefix={<ProjectOutlined style={{ color:"#52c41a" }}/>}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius:14 }}>
            <Statistic
              title="Conversion Rate"
              value={23}
              suffix="%"
              prefix={<RiseOutlined style={{ color:"#faad14" }}/>}
            />
            <Progress percent={23} size="small" strokeColor="#faad14"/>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius:14 }}>
            <Statistic
              title="Active Projects"
              value={5}
              prefix={<FundOutlined style={{ color:"#722ed1" }}/>}
            />
          </Card>
        </Col>
      </Row>

      {/* TABLE */}
      <Card
        style={{
          marginTop:22,
          borderRadius:14,
          boxShadow:"0 6px 22px rgba(0,0,0,0.05)"
        }}
      >
        <Space direction="vertical" style={{ width:"100%" }}>
          <Title level={5} style={{ marginBottom:0 }}>
            Project Performance
          </Title>

          <Text type="secondary">
            Overview of leads, bookings and remaining inventory.
          </Text>

          <Table
            columns={columns}
            dataSource={data}
            pagination={{ pageSize:5 }}
          />
        </Space>
      </Card>

    </div>
  );
}  