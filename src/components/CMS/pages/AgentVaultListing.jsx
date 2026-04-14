// src/components/Vault/AgentList.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, User, Mail, Phone, MapPin, Loader2, AlertCircle, Globe, CheckCircle, XCircle, Trash2 } from "lucide-react";
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

  const [actionLoading, setActionLoading] = useState(null);
  const [suspendModal, setSuspendModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const navigate = useNavigate();

  const fetchAgents = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await apiService.get(`/vault/agent/partner/agents?page=${page}&limit=${limit}`);
      const data = response?.data || response;

      let list = [];
      let total = 0;

      // API returns: { success, data: [...], total, pagination }
      if (data?.data && Array.isArray(data.data)) {
        list = data.data;
        total = data.total || data.pagination?.totalItems || data.data.length;
      } else if (Array.isArray(data)) {
        list = data;
        total = data.length;
      } else if (data?.agents) {
        list = data.agents;
        total = data.total || data.agents.length;
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

  useEffect(() => {
    fetchAgents(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // ✅ Fixed: name is nested object { first_name, last_name }
  const getAgentId   = (row) => row._id || row.id;
  const getAgentName = (row) =>
    `${row.name?.first_name || ""} ${row.name?.last_name || ""}`.trim() || "Agent";

  const handleActivate = async (row) => {
    const id = getAgentId(row);
    setActionLoading(id + "_activate");
    try {
      await apiService.post(`/vault/agent/activate/${id}`);
      setAgents((prev) =>
        prev.map((a) => getAgentId(a) === id ? { ...a, isActive: true, status: "active" } : a)
      );
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
      setAgents((prev) =>
        prev.map((a) => getAgentId(a) === id ? { ...a, isActive: false, status: "suspended" } : a)
      );
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
            {/* ✅ Fixed: row.name.first_name & row.name.last_name */}
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>
              {row.name?.first_name || ""} {row.name?.last_name || ""}
            </p>
            <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>{row.gender || ""}{row.gender && row.nationality ? " · " : ""}{row.nationality || ""}</p>
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
          {/* ✅ email is flat */}
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
          {/* ✅ Fixed: phone is nested object { country_code, number } */}
          <span>
            {row.phone?.country_code || ""} {row.phone?.number || "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "location",
      title: "Location",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
          <MapPin size={13} color="#9CA3AF" />
          {/* ✅ address can be null — optional chaining */}
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
        const isActive = row.isActive === true || row.status === "active";
        return (
          <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: isActive ? "#ECFDF5" : "#FEF2F2", color: isActive ? "#059669" : "#DC2626" }}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, row) => {
        const id = getAgentId(row);
        const isActive = row.isActive === true || row.status === "active";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => navigate(`/dashboard/vault-admin/agent-details/${id}`)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: 7, fontSize: 12, fontWeight: 600, color: PURPLE, cursor: "pointer" }}
            >
              <Eye size={13} /> View
            </button>

            {!isActive && (
              <button
                onClick={() => handleActivate(row)}
                disabled={actionLoading === id + "_activate"}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#059669", cursor: "pointer", opacity: actionLoading === id + "_activate" ? 0.6 : 1 }}
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
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#D97706", cursor: "pointer", opacity: actionLoading ? 0.6 : 1 }}
              >
                <XCircle size={13} /> Suspend
              </button>
            )}

            <button
              onClick={() => setDeleteModal(row)}
              disabled={!!actionLoading}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#DC2626", cursor: "pointer", opacity: actionLoading ? 0.6 : 1 }}
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
        <button onClick={() => fetchAgents(currentPage, itemsPerPage)}
          style={{ padding: "9px 20px", background: PURPLE, color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>All Agents</h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
            {totalAgents} agent{totalAgents !== 1 ? "s" : ""} registered
          </p>
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

      {/* Suspend Modal */}
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
              <button onClick={() => setSuspendModal(null)} style={{ flex: 1, padding: "10px 0", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSuspendConfirm} disabled={!!actionLoading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", background: "#D97706", cursor: "pointer", opacity: actionLoading ? 0.7 : 1 }}>
                {actionLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <XCircle size={14} />}
                Confirm Suspend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
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
              <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: "10px 0", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={!!actionLoading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", background: "#DC2626", cursor: "pointer", opacity: actionLoading ? 0.7 : 1 }}>
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