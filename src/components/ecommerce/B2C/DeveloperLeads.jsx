import React, { useState, useEffect } from "react";
import { Card, Typography, Table, Tag, Button, Input, message } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function DeveloperLeads() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLeads();
  }, []);

  // ================= FETCH LEADS API =================
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://xoto.ae/api/property/developer-leads", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch leads");
      }

      const list = data?.data || [];

      // 🛠 Safe Data Formatting (Taki koi null value app crash na kare)
      const formattedLeads = list.map((lead) => ({
        id: lead?._id,
        clientName: `${lead?.name?.first_name || ""} ${lead?.name?.last_name || ""}`.trim() || "Unknown Client",
        project: lead?.project?.title || "N/A",
        budget: lead?.budget || "N/A",
        agentName: `${lead?.agent?.first_name || ""} ${lead?.agent?.last_name || ""}`.trim() || "Unassigned",
        status: lead?.status || "New",
      }));

      setLeads(formattedLeads);
      setFilteredLeads(formattedLeads);
    } catch (err) {
      console.error("Fetch Leads Error:", err);
      message.error("Failed to load leads from server.");
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH =================
  const handleSearch = (value) => {
    setSearch(value);
    const lowerValue = value.toLowerCase();

    const filtered = leads.filter((lead) => {
      return (
        lead.clientName.toLowerCase().includes(lowerValue) ||
        lead.project.toLowerCase().includes(lowerValue) ||
        lead.agentName.toLowerCase().includes(lowerValue)
      );
    });

    setFilteredLeads(filtered);
  };

  // ================= STATUS COLOR =================
  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("new")) return "blue";
    if (s.includes("visit")) return "orange";
    if (s.includes("nego")) return "purple";
    if (s.includes("book") || s.includes("clos") || s.includes("done")) return "green";
    return "default";
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      title: "Client Name",
      dataIndex: "clientName",
      key: "clientName",
      render: (text) => <Text strong style={{ color: "#1f2937" }}>{text}</Text>,
    },
    {
      title: "Interested Project",
      dataIndex: "project",
      key: "project",
    },
    {
      title: "Budget",
      dataIndex: "budget",
      key: "budget",
      render: (text) => <Text style={{ color: "#059669", fontWeight: "500" }}>{text}</Text>,
    },
    {
      title: "Assigned Agent",
      dataIndex: "agentName",
      key: "agentName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ borderRadius: "12px", padding: "2px 10px", fontSize: "12px" }}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          style={{ background: "#5c039b", borderColor: "#5c039b", borderRadius: "6px" }}
          onClick={() => navigate(`/dashboard/developer/leads/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={3} style={{ margin: 0, color: "#1f2937" }}>Leads Tracking</Title>
        <Text type="secondary">Monitor all incoming leads & assigned agents.</Text>
      </div>

      {/* SEARCH */}
      <Card bordered={false} style={{ marginBottom: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <Input
          size="large"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by client, project, or agent..."
          prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
          style={{ maxWidth: "400px", borderRadius: "8px" }}
        />
      </Card>

      {/* TABLE */}
      <Card bordered={false} style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: 0 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <Text strong style={{ fontSize: "16px", color: "#374151" }}>All Registered Leads</Text>
        </div>
        <Table
          columns={columns}
          dataSource={filteredLeads}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          style={{ padding: "12px 24px" }}
        />
      </Card>
      
    </div>
  );
}