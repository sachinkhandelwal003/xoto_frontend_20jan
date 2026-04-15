// src/components/Vault/AgentList.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, User, Mail, Phone, Loader2, AlertCircle, CheckCircle, XCircle, Trash2, Briefcase } from "lucide-react";
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
  
  // Tab State: 'all', 'active', 'suspended'
  const [activeTab, setActiveTab] = useState("all");

  // Action states
  const [actionLoading, setActionLoading] = useState(null);
  const [suspendModal, setSuspendModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const navigate = useNavigate();

  const fetchAgents = async (page = 1, limit = 10, tab = activeTab) => {
    setLoading(true);
    try {
      let url = `/vault/agent/admin/all-agents?page=${page}&limit=${limit}`;
      
      // Append tab filter to URL
      if (tab === "active") url += `&isActive=true`;
      if (tab === "suspended") url += `&isActive=false`;

      const response = await apiService.get(url);
      const data = response?.data || response;

      let list = [];
      let total = 0;

      if (Array.isArray(data)) {
        list = data;
        total = data.length;
      } else if (data?.agents) {
        list = data.agents;
        total = data.total || data.agents.length;
      } else if (data?.data) {
        list = data.data;
        total = data.total || data.data.length;
      } else if (data?.docs) {
        list = data.docs;
        total = data.totalDocs || data.docs.length;
      }

      setAgents(list);
      setTotalAgents(total);
    } catch (err) {
      setError(err?.message || "Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when page, items per page, or tab changes
  useEffect(() => {
    fetchAgents(currentPage, itemsPerPage, activeTab);
  }, [currentPage, itemsPerPage, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to page 1 when switching tabs
  };

  const getAgentId = (row) => row._id || row.id;
  
  const getAgentName = (row) => {
    if (row.name?.first_name || row.name?.last_name) {
      return `${row.name.first_name || ""} ${row.name.last_name || ""}`.trim();
    }
    return `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Agent";
  };

  const handleActivate = async (row) => {
    const id = getAgentId(row);
    setActionLoading(id + "_activate");
    try {
      await apiService.post(`/vault/agent/activate/${id}`);
      // Remove from list if we are currently looking at the "suspended" tab
      if (activeTab === "suspended") {
        setAgents(prev => prev.filter(a => getAgentId(a) !== id));
        setTotalAgents(prev => prev - 1);
      } else {
        setAgents((prev) =>
          prev.map((a) => getAgentId(a) === id ? { ...a, isActive: true, status: "active" } : a)
        );
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Activation failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendConfirm = async () => {
    const id = getAgentId(suspendModal);
    setActionLoading(id + "_suspend");
    try {
      await apiService.post(`/vault/agent/suspend/${id}`, { suspensionReason: "" });
      // Remove from list if we are currently looking at the "active" tab
      if (activeTab === "active") {
        setAgents(prev => prev.filter(a => getAgentId(a) !== id));
        setTotalAgents(prev => prev - 1);
      } else {
        setAgents((prev) =>
          prev.map((a) => getAgentId(a) === id ? { ...a, isActive: false, status: "suspended" } : a)
        );
      }
      setSuspendModal(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Suspension failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    const id = getAgentId(deleteModal);
    setActionLoading(id + "_delete");
    try {
      await apiService.delete(`/vault/agent/delete/${id}`);
      setAgents((prev) => prev.filter((a) => getAgentId(a) !== id));
      setTotalAgents((prev) => prev - 1);
      setDeleteModal(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: "name",
      title: "Agent",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#FAF5FF", border: "1.5px solid #E9D5FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <User size={15} color={PURPLE} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              {getAgentName(row)}
            </p>
            <p style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
              {row.agentType ? row.agentType.replace(/([A-Z])/g, ' $1').trim() : "Agent"} · {row.nationality || "Unknown Nat."}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact Info",
      render: (_, row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
            <Mail size={13} color="#9CA3AF" />
            <span>{row.email || "N/A"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
            <Phone size={13} color="#9CA3AF" />
            <span>
              {row.phone?.country_code || ""} {row.phone?.number || "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "performance",
      title: "Performance",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
          <Briefcase size={13} color="#9CA3AF" />
          <span style={{ fontWeight: 500 }}>
            {row.earnings?.totalLeadsSubmitted || 0} Leads
          </span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, row) => {
        const isActive = row.isActive === true;
        const isVerified = row.isVerified === true;
        
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
            <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: isActive ? "#ECFDF5" : "#FEF2F2", color: isActive ? "#059669" : "#DC2626" }}>
              {isActive ? "Active" : "Suspended"}
            </span>
            
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: isVerified ? "#059669" : "#D97706" }}>
               {isVerified ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
               {isVerified ? "Verified" : "Unverified"}
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, row) => {
        const id = getAgentId(row);
        const isActive = row.isActive === true;
        
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => navigate(`/dashboard/vault-admin/agent-details/${id}`)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: 7, fontSize: 12, fontWeight: 600, color: PURPLE, cursor: "pointer", transition: "all 0.2s" }}
            >
              <Eye size={13} /> View
            </button>

            {!isActive && (
              <button
                onClick={() => handleActivate(row)}
                disabled={actionLoading === id + "_activate"}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#059669", cursor: "pointer", opacity: actionLoading === id + "_activate" ? 0.6 : 1 }}
              >
                {actionLoading === id + "_activate"
                  ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                  : <CheckCircle size={13} />}
                Activate
              </button>
            )}

            {isActive && (
              <button
                onClick={() => setSuspendModal(row)}
                disabled={!!actionLoading}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#D97706", cursor: "pointer", opacity: actionLoading ? 0.6 : 1 }}
              >
                <XCircle size={13} /> Suspend
              </button>
            )}

            <button
              onClick={() => setDeleteModal(row)}
              disabled={!!actionLoading}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#DC2626", cursor: "pointer", opacity: actionLoading ? 0.6 : 1 }}
            >
              {actionLoading === id + "_delete"
                ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                : <Trash2 size={13} />}
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <AlertCircle size={44} color="#EF4444" style={{ marginBottom: 12 }} />
        <p style={{ color: "#B91C1C", marginBottom: 16, fontSize: 14 }}>{error}</p>
        <button onClick={() => fetchAgents(currentPage, itemsPerPage, activeTab)}
          style={{ padding: "9px 20px", background: PURPLE, color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "28px 24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
        
        {/* Header Block */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Vault Agents</h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
            {totalAgents} {activeTab === "all" ? "total" : activeTab} agent{totalAgents !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Custom Tabs */}
        <div style={{ display: "flex", gap: 24, borderBottom: "1px solid #E5E7EB", paddingBottom: 0 }}>
          {[
            { id: "all", label: "All Agents" },
            { id: "active", label: "Active" },
            { id: "suspended", label: "Suspended" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                padding: "0 4px 12px",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? `2px solid ${PURPLE}` : "2px solid transparent",
                color: activeTab === tab.id ? PURPLE : "#6B7280",
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

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

      {/* Suspend Confirmation Modal */}
      {suspendModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 380, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <XCircle size={22} color="#D97706" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Suspend Agent?</h2>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 22 }}>
              Are you sure you want to suspend <strong>{getAgentName(suspendModal)}</strong>? They will not be able to access the platform.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setSuspendModal(null)}
                style={{ flex: 1, padding: "10px 0", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendConfirm}
                disabled={!!actionLoading}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", background: "#D97706", cursor: "pointer", opacity: actionLoading ? 0.7 : 1 }}
              >
                {actionLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <XCircle size={14} />}
                Confirm Suspend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 380, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Trash2 size={22} color="#DC2626" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Delete Agent?</h2>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 22 }}>
              Are you sure you want to permanently delete <strong>{getAgentName(deleteModal)}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteModal(null)}
                style={{ flex: 1, padding: "10px 0", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!!actionLoading}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", background: "#DC2626", cursor: "pointer", opacity: actionLoading ? 0.7 : 1 }}
              >
                {actionLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}