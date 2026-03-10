import React from "react";
import { Card, Row, Col, Typography, Table, Tag } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  RiseOutlined,
  DollarOutlined
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
  Bar
} from "recharts";

const { Title } = Typography;

/* ---------- Stats ---------- */

const stats = [
  {
    title: "Total Agents",
    value: 12,
    icon: <TeamOutlined />,
    color: "#6f42c1"
  },
  {
    title: "Active Leads",
    value: 86,
    icon: <UserOutlined />,
    color: "#17a2b8"
  },
  {
    title: "Deals Closed",
    value: 24,
    icon: <RiseOutlined />,
    color: "#28a745"
  },
  {
    title: "Revenue Generated",
    value: "$148K",
    icon: <DollarOutlined />,
    color: "#ffc107"
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

/* ---------- Top Agents Table ---------- */

const columns = [
  { title: "Agent", dataIndex: "name" },
  { title: "Deals", dataIndex: "deals" },
  { title: "Revenue", dataIndex: "revenue" },
  {
    title: "Status",
    dataIndex: "status",
    render: (status) =>
      status === "Active"
        ? <Tag color="green">Active</Tag>
        : <Tag color="red">Inactive</Tag>
  }
];

const agents = [
  { key: 1, name: "John Smith", deals: 8, revenue: "$45K", status: "Active" },
  { key: 2, name: "Sarah Johnson", deals: 6, revenue: "$32K", status: "Active" },
  { key: 3, name: "Ali Khan", deals: 5, revenue: "$27K", status: "Active" }
];

const activities = [
  "John Smith added a new lead",
  "Sarah scheduled a site visit",
  "Ali closed a deal",
  "New project added"
];

export default function AgencyDashboard() {

  return (
    <div style={{ padding: 20 }}>

      <Title level={3}>Agency Dashboard</Title>

      {/* ---------- Stats Cards ---------- */}

      <Row gutter={[16,16]}>
        {stats.map((item, index) => (
          <Col
            key={index}
            xs={24}
            sm={12}
            md={12}
            lg={6}
            xl={6}
          >
            <Card>
              <Row justify="space-between" align="middle">
                <div>
                  <p style={{ marginBottom: 0 }}>{item.title}</p>
                  <Title level={3}>{item.value}</Title>
                </div>

                <div style={{ fontSize: 28, color: item.color }}>
                  {item.icon}
                </div>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ---------- Charts ---------- */}

      <Row gutter={[16,16]} style={{ marginTop: 20 }}>

        <Col xs={24} lg={12}>
          <Card title="Revenue Growth">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month"/>
                <YAxis/>
                <Tooltip/>
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6f42c1"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Lead Pipeline">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage"/>
                <YAxis/>
                <Tooltip/>
                <Bar dataKey="count" fill="#17a2b8"/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

      </Row>

      {/* ---------- Agents + Activity ---------- */}

      <Row gutter={[16,16]} style={{ marginTop: 20 }}>

        <Col xs={24} lg={14}>
          <Card title="Top Agents">
            <Table
              columns={columns}
              dataSource={agents}
              pagination={false}
              scroll={{ x: true }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Recent Activity">
            {activities.map((a, i) => (
              <p key={i}>• {a}</p>
            ))}
          </Card>
        </Col>

      </Row>

    </div>
  );
}

