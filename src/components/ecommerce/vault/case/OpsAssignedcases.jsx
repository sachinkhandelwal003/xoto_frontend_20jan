import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import {
  Eye, User, Mail, Phone, AlertCircle, CheckCircle,
  Clock, Building2, Banknote, FileText, Inbox,
  Calendar, TrendingUp, RefreshCw
} from "lucide-react";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../../CMS/pages/custom/CustomTable";
import dayjs from "dayjs";
import { Card, Tag, Badge, Progress, Modal, Descriptions, Alert, Button, Input, Tabs } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, EyeOutlined } from "@ant-design/icons";

const PURPLE = "#5C039B";
const PURPLE_LIGHT = "#FAF5FF";
const PURPLE_BORDER = "#E9D5FF";

const { TabPane } = Tabs;
const roleSlugMap = {
  '0': 'superadmin',
  '1': 'admin',
  '2': "customer",
  '5': 'vendor-b2c',
  '6': 'vendor-b2b',
  '7': 'freelancer',
  '11': 'accountant',
  '12': 'supervisor',
  '15': "agency",        // Agency
  '16': "agent",         // Agent
  '17': "developer",
  '18': "vault-admin", //vault
  '22': "vaultagent",
  '21': "vaultpartner",
  '24': "GridAdvisor",
  '26': "vault-advisor",
  '23': "vault-ops",
  '25': "gridReferralPartner",
  
};

const OpsAssignedcases = () => {
  const navigate = useNavigate();
    const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "superadmin";

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCases, setTotalCases] = useState(0);
  const [summary, setSummary] = useState({
    total: 0,
    pendingReview: 0,
    underReview: 0,
    returned: 0,
    bankApplication: 0
  });
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [toast, setToast] = useState(null);

  const getCaseId = (row) => row._id || row.id;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatCurrency = (value) => {
    if (!value) return "AED 0";
    return `AED ${value.toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return dayjs(date).format("DD MMM YYYY, hh:mm A");
  };

  // Fetch assigned cases
  const fetchAssignedCases = useCallback(async (page = 1, limit = 10, status = activeTab, searchTerm = search) => {
    setLoading(true);
    try {
      let url = `/vault/cases/ops/my-cases?page=${page}&limit=${limit}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (status !== "all") url += `&caseStatus=${status}`;

      const response = await apiService.get(url);
      
      if (response?.success) {
        setCases(response.data || []);
        setTotalCases(response.pagination?.totalItems || response.data?.length || 0);
        setSummary(response.summary || {
          total: 0,
          pendingReview: 0,
          underReview: 0,
          returned: 0,
          bankApplication: 0
        });
      } else {
        showToast(response?.message || "Failed to load assigned cases", "error");
      }
    } catch (err) {
      console.error("Error fetching assigned cases:", err);
      showToast(err?.response?.data?.message || "Failed to load assigned cases", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    fetchAssignedCases(currentPage, itemsPerPage, activeTab, search);
  }, [currentPage, itemsPerPage, activeTab, search, fetchAssignedCases]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setActiveTab("all");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchAssignedCases(currentPage, itemsPerPage, activeTab, search);
  };

  // View case details
  const handleViewCase = (row) => {
    setViewModal(row);
  };


   const handleReviewCase = (id) => {
    navigate(`/dashboard/${roleSlug}/case/assigned/view/${id}`);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      'Assigned - Pending Review': { color: "#D97706", bg: "#FFFBEB", text: "Pending Review", icon: <ClockCircleOutlined /> },
      'Under Review': { color: "#3B82F6", bg: "#EFF6FF", text: "Under Review", icon: <EyeOutlined /> },
      'Returned - Pending Correction': { color: "#DC2626", bg: "#FEF2F2", text: "Returned", icon: <ClockCircleOutlined /> },
      'Bank Application': { color: "#8B5CF6", bg: "#F3E8FF", text: "Bank Application", icon: <ClockCircleOutlined /> },
      'Pre-Approved': { color: "#10B981", bg: "#ECFDF5", text: "Pre-Approved", icon: <CheckCircleOutlined /> },
      'Valuation': { color: "#F59E0B", bg: "#FFFBEB", text: "Valuation", icon: <ClockCircleOutlined /> },
      'FOL Processed': { color: "#6366F1", bg: "#EEF2FF", text: "FOL Processed", icon: <ClockCircleOutlined /> },
      'FOL Issued': { color: "#06B6D4", bg: "#ECFEFF", text: "FOL Issued", icon: <CheckCircleOutlined /> },
      'FOL Signed': { color: "#14B8A6", bg: "#F0FDFA", text: "FOL Signed", icon: <CheckCircleOutlined /> },
      'Disbursed': { color: "#059669", bg: "#ECFDF5", text: "Disbursed", icon: <CheckCircleOutlined /> },
      'Rejected': { color: "#DC2626", bg: "#FEF2F2", text: "Rejected", icon: <AlertCircle /> },
      'Lost': { color: "#6B7280", bg: "#F3F4F6", text: "Lost", icon: <AlertCircle /> }
    };
    return statusMap[status] || { color: "#6B7280", bg: "#F3F4F6", text: status, icon: <ClockCircleOutlined /> };
  };

  // Calculate document progress
  const getDocumentProgress = (row) => {
    const uploaded = row.documentStatus?.documentsUploadedCount || 0;
    const total = row.documentStatus?.requiredDocuments?.length || 0;
    return total > 0 ? (uploaded / total) * 100 : 0;
  };

  // Columns for CustomTable
  const columns = [
    {
      key: "caseReference",
      title: "Case ID",
      width: 180,
      render: (_, row) => (
        <div style={{ padding: "4px 0" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: PURPLE }}>
            {row.caseReference}
          </p>
          <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
            Assigned: {formatDate(row.assignedTo?.assignedAt)}
          </p>
        </div>
      ),
    },
    {
      key: "clientInfo",
      title: "Client Info",
      width: 220,
      render: (_, row) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
            <User size={13} color="#9CA3AF" />
            <span style={{ fontWeight: 500 }}>{row.clientInfo?.fullName || "N/A"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", marginTop: 4 }}>
            <Mail size={12} color="#9CA3AF" />
            <span>{row.clientInfo?.email || "N/A"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            <Phone size={12} color="#9CA3AF" />
            <span>{row.clientInfo?.mobile || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "loanDetails",
      title: "Loan Details",
      width: 220,
      render: (_, row) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151" }}>
            <Banknote size={13} color="#9CA3AF" />
            <span style={{ fontWeight: 500 }}>{formatCurrency(row.loanInfo?.requestedAmount)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", marginTop: 4 }}>
            <Building2 size={12} color="#9CA3AF" />
            <span>{row.loanInfo?.selectedBank || "N/A"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            <TrendingUp size={12} color="#9CA3AF" />
            <span>{row.loanInfo?.interestRatePercentage}%</span>
          </div>
        </div>
      ),
    },
    {
      key: "documents",
      title: "Documents",
      width: 150,
      render: (_, row) => {
        const uploaded = row.documentStatus?.documentsUploadedCount || 0;
        const total = row.documentStatus?.requiredDocuments?.length || 0;
        const percentage = getDocumentProgress(row);
        return (
          <div style={{ minWidth: 120 }}>
            <Progress 
              percent={Math.round(percentage)} 
              size="small" 
              strokeColor={percentage === 100 ? "#10b981" : PURPLE}
              format={(percent) => `${percent}%`}
            />
            <p style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
              {uploaded} / {total} uploaded
            </p>
          </div>
        );
      }
    },
    {
      key: "status",
      title: "Status",
      width: 140,
      render: (_, row) => {
        const status = getStatusBadge(row.currentStatus);
        return (
          <Badge 
            color={status.color} 
            text={
              <span style={{ color: status.color, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                {status.icon}
                {status.text}
              </span>
            }
          />
        );
      }
    },
    {
      key: "actions",
      title: "Actions",
      width: 180,
      render: (_, row) => {
        const id = getCaseId(row);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* View Button */}
            <button
              onClick={() => handleViewCase(row)}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                background: PURPLE_LIGHT, border: `1px solid ${PURPLE_BORDER}`,
                borderRadius: 7, fontSize: 12, fontWeight: 600, color: PURPLE,
                cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = PURPLE;
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = PURPLE_LIGHT;
                e.target.style.color = PURPLE;
              }}
            >
              <Eye size={13} /> View
            </button>

            {/* Review Button */}
            <button
              onClick={() => handleReviewCase(id)}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                background: "#fff", border: `1px solid ${PURPLE_BORDER}`,
                borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#374151",
                cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = PURPLE;
                e.target.style.borderColor = PURPLE;
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#fff";
                e.target.style.borderColor = PURPLE_BORDER;
                e.target.style.color = "#374151";
              }}
            >
              <FileText size={13} /> Review
            </button>
          </div>
        );
      }
    }
  ];

  // Stats Cards
  const StatsCards = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: `1px solid ${PURPLE_BORDER}` }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{summary.total || 0}</p>
        <p style={{ fontSize: 12, color: "#6B7280" }}>Total Assigned</p>
      </div>
      <div style={{ background: "#FFFBEB", borderRadius: 12, padding: "16px 20px", border: "1px solid #FDE68A" }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: "#D97706" }}>{summary.pendingReview || 0}</p>
        <p style={{ fontSize: 12, color: "#6B7280" }}>Pending Review</p>
      </div>
      <div style={{ background: "#EFF6FF", borderRadius: 12, padding: "16px 20px", border: "1px solid #BFDBFE" }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: "#3B82F6" }}>{summary.underReview || 0}</p>
        <p style={{ fontSize: 12, color: "#6B7280" }}>Under Review</p>
      </div>
      <div style={{ background: "#FEF2F2", borderRadius: 12, padding: "16px 20px", border: "1px solid #FECACA" }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: "#DC2626" }}>{summary.returned || 0}</p>
        <p style={{ fontSize: 12, color: "#6B7280" }}>Returned</p>
      </div>
      <div style={{ background: "#F3E8FF", borderRadius: 12, padding: "16px 20px", border: "1px solid #E9D5FF" }}>
        <p style={{ fontSize: 28, fontWeight: 700, color: "#8B5CF6" }}>{summary.bankApplication || 0}</p>
        <p style={{ fontSize: 12, color: "#6B7280" }}>Bank Application</p>
      </div>
    </div>
  );

  // Filter Bar
  const FilterBar = () => (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "16px 20px", marginBottom: 24,
      border: `1px solid ${PURPLE_BORDER}`, display: "flex", flexWrap: "wrap",
      alignItems: "center", gap: 12, justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, flex: 1 }}>
        <Input
          placeholder="Search by case ID or client name..."
          value={search}
          onChange={handleSearch}
          style={{ width: 260 }}
          allowClear
          prefix={<User size={14} />}
        />
        <Button onClick={resetFilters}>Reset Filters</Button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 12, color: "#6B7280", background: PURPLE_LIGHT, padding: "6px 12px", borderRadius: 8 }}>
          Last updated: {formatDate(new Date())}
        </span>
        <Button 
          icon={<RefreshCw size={14} />} 
          onClick={handleRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </div>
    </div>
  );

  // View Modal
  const renderViewModal = () => {
    if (!viewModal) return null;

    const status = getStatusBadge(viewModal.currentStatus);
    const uploaded = viewModal.documentStatus?.documentsUploadedCount || 0;
    const total = viewModal.documentStatus?.requiredDocuments?.length || 0;
    const percentage = total > 0 ? (uploaded / total) * 100 : 0;

    return (
      <Modal
        title={`Case Details: ${viewModal.caseReference}`}
        open={!!viewModal}
        onCancel={() => setViewModal(null)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setViewModal(null)}>Close</Button>,
          <Button 
            key="review" 
            type="primary" 
            onClick={() => {
              setViewModal(null);
              handleReviewCase(viewModal._id);
            }}
            style={{ background: PURPLE }}
          >
            Review Case
          </Button>
        ]}
      >
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {/* Status Banner */}
          <Alert
            message={`Status: ${status.text}`}
            description={`Case assigned on ${formatDate(viewModal.assignedTo?.assignedAt)}`}
            type={viewModal.currentStatus === 'Returned - Pending Correction' ? 'error' : 'info'}
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* Client Information */}
          <Card title="Client Information" size="small" style={{ marginBottom: 16 }}>
            <table style={{ width: "100%", fontSize: 13 }}>
              <tbody>
                <tr><td style={{ padding: "4px 0", color: "#6B7280", width: 120 }}>Full Name:</td><td style={{ padding: "4px 0", fontWeight: 500 }}>{viewModal.clientInfo?.fullName}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Email:</td><td style={{ padding: "4px 0" }}>{viewModal.clientInfo?.email}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Mobile:</td><td style={{ padding: "4px 0" }}>{viewModal.clientInfo?.mobile}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Nationality:</td><td style={{ padding: "4px 0" }}>{viewModal.clientInfo?.nationality}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Marital Status:</td><td style={{ padding: "4px 0" }}>{viewModal.clientInfo?.maritalStatus}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Dependents:</td><td style={{ padding: "4px 0" }}>{viewModal.clientInfo?.numberOfDependents}</td></tr>
              </tbody>
            </table>
          </Card>

          {/* Loan Information */}
          <Card title="Loan Information" size="small" style={{ marginBottom: 16 }}>
            <table style={{ width: "100%", fontSize: 13 }}>
              <tbody>
                <tr><td style={{ padding: "4px 0", color: "#6B7280", width: 120 }}>Loan Amount:</td><td style={{ padding: "4px 0", fontWeight: 500 }}>{formatCurrency(viewModal.loanInfo?.requestedAmount)}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Interest Rate:</td><td style={{ padding: "4px 0" }}>{viewModal.loanInfo?.interestRatePercentage}%</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Tenure:</td><td style={{ padding: "4px 0" }}>{viewModal.loanInfo?.tenureYears} years</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Selected Bank:</td><td style={{ padding: "4px 0" }}>{viewModal.loanInfo?.selectedBank}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Monthly EMI:</td><td style={{ padding: "4px 0" }}>{formatCurrency(viewModal.loanInfo?.monthlyInstallment?.principalAndInterest)}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>LTV Ratio:</td><td style={{ padding: "4px 0" }}>{viewModal.propertyInfo?.ltvPercentage}%</td></tr>
              </tbody>
            </table>
          </Card>

          {/* Property Information */}
          <Card title="Property Information" size="small" style={{ marginBottom: 16 }}>
            <table style={{ width: "100%", fontSize: 13 }}>
              <tbody>
                <tr><td style={{ padding: "4px 0", color: "#6B7280", width: 120 }}>Property Value:</td><td style={{ padding: "4px 0", fontWeight: 500 }}>{formatCurrency(viewModal.propertyInfo?.propertyValue)}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Property Type:</td><td style={{ padding: "4px 0" }}>{viewModal.propertyInfo?.propertyType}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Area:</td><td style={{ padding: "4px 0" }}>{viewModal.propertyInfo?.propertyAddress?.area}</td></tr>
                <tr><td style={{ padding: "4px 0", color: "#6B7280" }}>Building:</td><td style={{ padding: "4px 0" }}>{viewModal.propertyInfo?.propertyAddress?.building || "N/A"}</td></tr>
              </tbody>
            </table>
          </Card>

          {/* Document Status */}
          <Card title="Document Status" size="small">
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Progress 
                type="circle" 
                percent={Math.round(percentage)} 
                width={100}
                strokeColor={percentage === 100 ? "#10b981" : PURPLE}
              />
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 13 }}>{uploaded} / {total} documents uploaded</span>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {viewModal.documentStatus?.requiredDocuments?.slice(0, 10).map((doc, idx) => (
                <Tag 
                  key={idx}
                  color={doc.isUploaded ? "green" : "orange"}
                  icon={doc.isUploaded ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                  style={{ fontSize: 11 }}
                >
                  {doc.documentType?.replace(/_/g, " ").toUpperCase()}
                </Tag>
              ))}
            </div>
          </Card>
        </div>
      </Modal>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "28px 24px" }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 8,
          background: toast.type === "success" ? "#059669" : "#DC2626",
          color: "#fff", padding: "12px 16px", borderRadius: 10,
          fontSize: 13, fontWeight: 600, boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          
        }}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>My Assigned Cases</h1>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
          View and review cases assigned to you
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={handleTabChange} style={{ marginBottom: 24 }}>
        <TabPane tab="All Cases" key="all" />
        <TabPane tab="Pending Review" key="Assigned - Pending Review" />
        <TabPane tab="Under Review" key="Under Review" />
        <TabPane tab="Returned" key="Returned - Pending Correction" />
        <TabPane tab="Bank Application" key="Bank Application" />
      </Tabs>

      {/* Filter Bar */}
      <FilterBar />

      {/* Table */}
      <CustomTable
        columns={columns}
        data={cases}
        loading={loading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalCases}
        onPageChange={(page, size) => {
          setCurrentPage(page);
          if (size !== itemsPerPage) setItemsPerPage(size);
        }}
      />

      {/* View Modal */}
      {renderViewModal()}

      <style>{`
        .ant-progress-text {
          font-size: 10px !important;
        }
        .ant-tabs-tab-active {
          color: ${PURPLE} !important;
        }
        .ant-tabs-ink-bar {
          background-color: ${PURPLE} !important;
        }
        .ant-tabs-tab:hover {
          color: ${PURPLE} !important;
        }
      `}</style>
    </div>
  );
};

export default OpsAssignedcases;