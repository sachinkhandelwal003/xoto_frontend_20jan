import React, { useState } from "react";
import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Input,
  Space,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export default function AgencyProjects() {
  const [searchText, setSearchText] = useState("");

  const projectsData = [
    {
      key: "1",
      name: "Palm Heights",
      developer: "Emaar",
      location: "Dubai Marina",
      price: "$450,000",
      status: "Active",
    },
    {
      key: "2",
      name: "Skyline Towers",
      developer: "Damac",
      location: "Downtown Dubai",
      price: "$520,000",
      status: "Active",
    },
  ];

  const columns = [
    {
      title: "Project Name",
      dataIndex: "name",
    },
    {
      title: "Developer",
      dataIndex: "developer",
    },
    {
      title: "Location",
      dataIndex: "location",
    },
    {
      title: "Starting Price",
      dataIndex: "price",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      render: () => (
        <Space>
          <Tooltip title="View Project">
            <Button icon={<EyeOutlined />} />
          </Tooltip>

          <Tooltip title="Assign Agent">
            <Button type="primary" icon={<UserAddOutlined />}>
              Assign
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredProjects = projectsData.filter((project) =>
    project.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Card style={{ margin: 20 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>
          Agency Projects
        </Title>

        <Input
          placeholder="Search project..."
          prefix={<SearchOutlined />}
          style={{ width: 250 }}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Row>

      <Table
        columns={columns}
        dataSource={filteredProjects}
        pagination={{ pageSize: 6 }}
      />
    </Card>
  );
}

