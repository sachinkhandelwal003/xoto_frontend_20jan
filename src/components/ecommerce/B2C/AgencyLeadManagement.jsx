import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Select,
  Typography,
  Row,
  Col,
  Button,
} from "antd";

const { Title } = Typography;
const { Option } = Select;

const AgencyLeadManagement = () => {
  const [leads, setLeads] = useState([
    {
      key: 1,
      client: "Amit Verma",
      project: "Palm Residency",
      budget: "80L",
      status: "New",
      assignedTo: null,
    },
    {
      key: 2,
      client: "Neha Singh",
      project: "Skyline Towers",
      budget: "1.2Cr",
      status: "Assigned",
      assignedTo: "Rahul Sharma",
    },
  ]);

  const agents = ["Rahul Sharma", "Priya Mehta", "Amit Jain"];

  const assignLead = (key, agent) => {
    setLeads(
      leads.map((lead) =>
        lead.key === key
          ? { ...lead, assignedTo: agent, status: "Assigned" }
          : lead
      )
    );
  };

  const closeLead = (key) => {
    setLeads(
      leads.map((lead) =>
        lead.key === key ? { ...lead, status: "Closed" } : lead
      )
    );
  };

  const columns = [
    {
      title: "Client",
      dataIndex: "client",
    },
    {
      title: "Project",
      dataIndex: "project",
    },
    {
      title: "Budget",
      dataIndex: "budget",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        if (status === "New") return <Tag color="blue">New</Tag>;
        if (status === "Assigned") return <Tag color="orange">Assigned</Tag>;
        return <Tag color="green">Closed</Tag>;
      },
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      render: (val, record) =>
        record.status === "Closed" ? (
          val || "-"
        ) : (
          <Select
            value={val}
            placeholder="Assign Agent"
            style={{ width: 160 }}
            onChange={(value) => assignLead(record.key, value)}
          >
            {agents.map((agent) => (
              <Option key={agent} value={agent}>
                {agent}
              </Option>
            ))}
          </Select>
        ),
    },
    {
      title: "Action",
      render: (_, record) =>
        record.status !== "Closed" ? (
          <Button
            type="primary"
            onClick={() => closeLead(record.key)}
          >
            Mark Closed
          </Button>
        ) : null,
    },
  ];

  const totalLeads = leads.length;
  const assigned = leads.filter((l) => l.status === "Assigned").length;
  const closed = leads.filter((l) => l.status === "Closed").length;

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Lead Management</Title>

      {/* Summary */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card bordered={false}>
            <Title level={5}>Total Leads</Title>
            <Title level={3}>{totalLeads}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Title level={5}>Assigned</Title>
            <Title level={3}>{assigned}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Title level={5}>Closed</Title>
            <Title level={3}>{closed}</Title>
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Table columns={columns} dataSource={leads} pagination={false} />
      </Card>
    </div>
  );
};

export default AgencyLeadManagement;