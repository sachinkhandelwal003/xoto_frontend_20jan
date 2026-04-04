// src/components/Vault/AgentList.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, User, Mail, Phone, MapPin, Loader2, AlertCircle, UserPlus, Globe } from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../CMS/pages/custom/CustomTable";

const PURPLE = "#5C039B";

export default function VaultAgentlist() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalAgents, setTotalAgents] = useState(0);
  const navigate = useNavigate();

  const fetchAgents = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await apiService.get(`/vault/agent/all?page=${page}&limit=${limit}`);
      const data = response?.data || response;

      let list = [];
      let total = 0;

      if (Array.isArray(data)) {
        list = data; total = data.length;
      } else if (data?.agents) {
        list = data.agents; total = data.total || data.agents.length;
      } else if (data?.data) {
        list = data.data; total = data.total || data.data.length;
      } else if (data?.docs) {
        list = data.docs; total = data.totalDocs || data.docs.length;
      }

      setAgents(list);
      setTotalAgents(total);
    } catch (err) {
      setError(err?.message || "Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // CustomTable columns — use key + title + render
  const columns = [
    {
      key: "name",
      title: "Agent",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#FAF5FF", border: `1.5px solid #E9D5FF`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <User size={15} color={PURPLE} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              {row.first_name || row.firstName || ""} {row.last_name || row.lastName || ""}
            </p>
            <p style={{ fontSize: 11, color: "#9CA3AF" }}>{row.gender || ""} · {row.nationality || ""}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      title: "Email",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
          <Mail size={13} color="#9CA3AF" />
          <span>{row.email || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "phone",
      title: "Phone",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
          <Phone size={13} color="#9CA3AF" />
          <span>{row.country_code || row.countryCode || ""} {row.phone_number || row.phoneNumber || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "location",
      title: "Location",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
          <MapPin size={13} color="#9CA3AF" />
          <span>{row.address?.city || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "nationality",
      title: "Nationality",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
          <Globe size={13} color="#9CA3AF" />
          <span>{row.nationality || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, row) => {
        const status = row.status || row.isActive ? "Active" : "Inactive";
        const isActive = row.status === "active" || row.isActive === true || row.status === "Active";
        return (
          <span style={{
            padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: isActive ? "#ECFDF5" : "#FEF2F2",
            color: isActive ? "#059669" : "#DC2626",
          }}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, row) => (
        <button
          onClick={() => navigate(`/dashboard/vault-admin/agent-details/${row._id || row.id}`)}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "#FAF5FF", border: `1px solid #E9D5FF`, borderRadius: 7, fontSize: 13, fontWeight: 600, color: PURPLE, cursor: "pointer" }}
        >
          <Eye size={13} /> View
        </button>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <AlertCircle size={44} color="#EF4444" style={{ marginBottom: 12 }} />
        <p style={{ color: "#B91C1C", marginBottom: 16, fontSize: 14 }}>{error}</p>
        <button onClick={() => fetchAgents(currentPage, itemsPerPage)}
          style={{ padding: "9px 20px", background: PURPLE, color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "28px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>All Agents</h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
            {totalAgents} agent{totalAgents !== 1 ? "s" : ""} registered
          </p>
        </div>
      
      </div>

      {/* Table */}
      <CustomTable
        columns={columns}
        data={agents}
        loading={loading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalAgents}
        onPageChange={(page, size) => {
          setCurrentPage(page);
          if (size !== itemsPerPage) setItemsPerPage(size);
        }}
      />
    </div>
  );
}