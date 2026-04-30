import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import {
  Eye, User, Mail, Phone, AlertCircle, CheckCircle,
  Clock, Building2, Banknote, FileText,
  Calendar, TrendingUp, RefreshCw, DollarSign,
  ArrowLeftRight, Wallet, Receipt, TrendingDown, Home,
  Percent, Calculator, Calendar as CalendarIcon, CreditCard,
  Info, Award, Gift
} from "lucide-react";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../../CMS/pages/custom/CustomTable";
import dayjs from "dayjs";
import { Card, Tag, Badge, Progress, Modal, Alert, Button, Input, Tooltip, Descriptions, Row, Col, Statistic, Divider, Tabs, Table as AntTable, Spin, Typography } from "antd";
import { 
  CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, 
  DollarOutlined, RiseOutlined, FallOutlined, BankOutlined, 
  HomeOutlined, UserOutlined, CalendarOutlined, PercentageOutlined, 
  WalletOutlined, FileTextOutlined, CalculatorOutlined, 
  TrophyOutlined, GiftOutlined, InfoCircleOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;
const PURPLE = "#5C039B";
const PURPLE_LIGHT = "#FAF5FF";
const PURPLE_BORDER = "#E9D5FF";
const SUCCESS_COLOR = "#10b981";
const WARNING_COLOR = "#f59e0b";
const ERROR_COLOR = "#ef4444";
const INFO_COLOR = "#3b82f6";

const roleSlugMap = {
  '0': 'superadmin',
  '1': 'admin',
  '2': "customer",
  '5': 'vendor-b2c',
  '6': 'vendor-b2b',
  '7': 'freelancer',
  '11': 'accountant',
  '12': 'supervisor',
  '15': "agency",
  '16': "agent",
  '17': "developer",
  '18': "vault-admin",
  '22': "vaultagent",
  '21': "vaultpartner",
  '24': "GridAdvisor",
  '26': "vault-advisor",
  '23': "vault-ops",
  '25': "gridReferralPartner",
};

const DisbursedCases = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "superadmin";

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCases, setTotalCases] = useState(0);
  const [search, setSearch] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [amountDetails, setAmountDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    totalDisbursedAmount: 0,
    totalCases: 0,
    avgLoanAmount: 0,
    totalCommission: 0
  });
  const [activeTab, setActiveTab] = useState('summary');

  const formatCurrency = (value) => {
    if (!value) return "AED 0";
    return `AED ${value.toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return dayjs(date).format("DD MMM YYYY, hh:mm A");
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch only disbursed cases
  const fetchDisbursedCases = useCallback(async (page = 1, limit = 10, searchTerm = search) => {
    setLoading(true);
    try {
      let url = `/vault/cases/ops/my-cases?page=${page}&limit=${limit}&caseStatus=Disbursed`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const response = await apiService.get(url);
      
      if (response?.success) {
        setCases(response.data || []);
        setTotalCases(response.pagination?.totalItems || response.data?.length || 0);
        
        const disbursedCases = response.data || [];
        const totalAmount = disbursedCases.reduce((sum, c) => sum + (c.loanInfo?.disbursedAmount || c.loanInfo?.approvedAmount || 0), 0);
        const avgAmount = disbursedCases.length > 0 ? totalAmount / disbursedCases.length : 0;
        
        const xotoCommissionRate = 0.01;
        const totalCommission = disbursedCases.reduce((sum, c) => {
          const loanAmount = c.loanInfo?.disbursedAmount || c.loanInfo?.approvedAmount || 0;
          const xotoCommission = loanAmount * xotoCommissionRate;
          let partnerPercentage = 80;
          if (c.createdBy?.role === 'partner') {
            partnerPercentage = loanAmount <= 5000000 ? 80 : 85;
          } else if (c.createdBy?.role === 'advisor') {
            partnerPercentage = 0;
          }
          return sum + (xotoCommission * partnerPercentage / 100);
        }, 0);
        
        setSummaryStats({
          totalDisbursedAmount: totalAmount,
          totalCases: disbursedCases.length,
          avgLoanAmount: avgAmount,
          totalCommission: totalCommission
        });
      } else {
        showToast(response?.message || "Failed to load disbursed cases", "error");
      }
    } catch (err) {
      console.error("Error fetching disbursed cases:", err);
      showToast(err?.response?.data?.message || "Failed to load disbursed cases", "error");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDisbursedCases(currentPage, itemsPerPage, search);
  }, [currentPage, itemsPerPage, search, fetchDisbursedCases]);

  // Fetch amount details for a case
  const fetchAmountDetails = async (caseId) => {
    setLoadingDetails(true);
    try {
      const response = await apiService.get(`/vault/cases/ops/bank-decision/${caseId}/amount-details`);
      if (response?.success) {
        setAmountDetails(response.data);
      } else {
        showToast("Failed to load amount details", "error");
      }
    } catch (err) {
      console.error("Error fetching amount details:", err);
      showToast("Failed to load amount details", "error");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewCase = async (row) => {
    setViewModal(row);
    setActiveTab('summary');
    await fetchAmountDetails(row._id);
  };

  // Navigation to Full Case View
  const handleViewFullCase = (id) => {
    navigate(`/dashboard/${roleSlug}/case/assigned/view/${id}`);
  };

  // Navigation to Amount Details View
  const handleViewAmountDetails = (id) => {
    navigate(`/dashboard/${roleSlug}/case/amount/view/${id}`);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchDisbursedCases(currentPage, itemsPerPage, search);
  };

  const getAmountComparison = (row) => {
    const requested = row.loanInfo?.requestedAmount || 0;
    const approved = row.loanInfo?.approvedAmount || 0;
    const disbursed = row.loanInfo?.disbursedAmount || row.loanInfo?.approvedAmount || 0;
    
    if (disbursed < requested) {
      return { text: `AED ${(requested - disbursed).toLocaleString()} less than requested`, color: ERROR_COLOR, icon: <TrendingDown size={14} /> };
    } else if (disbursed > requested) {
      return { text: `AED ${(disbursed - requested).toLocaleString()} more than requested`, color: WARNING_COLOR, icon: <RiseOutlined /> };
    }
    return { text: "Exact match", color: SUCCESS_COLOR, icon: <CheckCircleOutlined /> };
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Disbursed': { color: SUCCESS_COLOR, bg: "#ECFDF5", text: "Disbursed", icon: <DollarOutlined /> }
    };
    return statusMap[status] || { color: "#6B7280", bg: "#F3F4F6", text: status, icon: <ClockCircleOutlined /> };
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
            Disbursed: {formatDate(row.updatedAt)}
          </p>
        </div>
      ),
    },
    {
      key: "clientInfo",
      title: "Client Info",
      width: 200,
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
      key: "amountDetails",
      title: "Amount Details",
      width: 250,
      render: (_, row) => {
        const requested = row.loanInfo?.requestedAmount || 0;
        const approved = row.loanInfo?.approvedAmount || 0;
        const disbursed = row.loanInfo?.disbursedAmount || approved || 0;
        const comparison = getAmountComparison(row);
        
        return (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#6B7280" }}>Requested:</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{formatCurrency(requested)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#6B7280" }}>Approved:</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: WARNING_COLOR }}>{formatCurrency(approved)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#6B7280" }}>Disbursed:</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: SUCCESS_COLOR }}>{formatCurrency(disbursed)}</span>
            </div>
            <Tag color={comparison.color === SUCCESS_COLOR ? "success" : comparison.color === WARNING_COLOR ? "warning" : "error"} style={{ marginTop: 4, fontSize: 10 }}>
              {comparison.icon} {comparison.text}
            </Tag>
          </div>
        );
      }
    },
    {
      key: "loanDetails",
      title: "Loan Details",
      width: 180,
      render: (_, row) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151", marginBottom: 4 }}>
            <Building2 size={13} color="#9CA3AF" />
            <span>{row.loanInfo?.selectedBank || "N/A"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
            <TrendingUp size={12} color="#9CA3AF" />
            <span>{row.loanInfo?.interestRatePercentage || 0}%</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280" }}>
            <Calendar size={12} color="#9CA3AF" />
            <span>{row.loanInfo?.tenureYears || 0} years</span>
          </div>
        </div>
      ),
    },
    {
      key: "commission",
      title: "Est. Commission",
      width: 150,
      render: (_, row) => {
        const loanAmount = row.loanInfo?.disbursedAmount || row.loanInfo?.approvedAmount || 0;
        const xotoCommission = loanAmount * 0.01;
        let partnerPercentage = 80;
        if (row.createdBy?.role === 'partner') {
          partnerPercentage = loanAmount <= 5000000 ? 80 : 85;
        } else if (row.createdBy?.role === 'advisor') {
          partnerPercentage = 0;
        }
        const commissionAmount = (xotoCommission * partnerPercentage) / 100;
        
        return (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: SUCCESS_COLOR }}>
              {formatCurrency(commissionAmount)}
            </div>
            <div style={{ fontSize: 10, color: "#6B7280", marginTop: 4 }}>
              {partnerPercentage}% of Xoto's commission
            </div>
            <div style={{ fontSize: 10, color: "#9CA3AF" }}>
              Xoto: {formatCurrency(xotoCommission)}
            </div>
          </div>
        );
      }
    },
    {
      key: "actions",
      title: "Actions",
      width: 280,
      render: (_, row) => {
        const id = row._id;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Quick View Button */}
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
              <Eye size={13} /> Quick View
            </button>

            {/* Full Case Details Button */}
            <button
              onClick={() => handleViewFullCase(id)}
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
              <FileText size={13} /> Full Case
            </button>

            {/* Amount Details Button */}
            <button
              onClick={() => handleViewAmountDetails(id)}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                background: "#fff", border: `1px solid ${SUCCESS_COLOR}`,
                borderRadius: 7, fontSize: 12, fontWeight: 600, color: SUCCESS_COLOR,
                cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = SUCCESS_COLOR;
                e.target.style.borderColor = SUCCESS_COLOR;
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#fff";
                e.target.style.borderColor = SUCCESS_COLOR;
                e.target.style.color = SUCCESS_COLOR;
              }}
            >
              <DollarOutlined /> Amount Details
            </button>
          </div>
        );
      }
    }
  ];

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
          <Calendar size={12} style={{ marginRight: 4 }} />
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

  // Stats Cards
  const StatsCards = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={6}>
        <Card style={{ borderRadius: 16, background: `linear-gradient(135deg, ${PURPLE}08 0%, #fff 100%)` }}>
          <Statistic
            title="Total Disbursed Cases"
            value={summaryStats.totalCases}
            prefix={<CheckCircleOutlined style={{ color: SUCCESS_COLOR }} />}
            valueStyle={{ color: PURPLE, fontSize: 28 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card style={{ borderRadius: 16, background: `linear-gradient(135deg, ${SUCCESS_COLOR}08 0%, #fff 100%)` }}>
          <Statistic
            title="Total Disbursed Amount"
            value={summaryStats.totalDisbursedAmount}
            prefix={<DollarSign size={20} color={SUCCESS_COLOR} />}
            valueStyle={{ color: SUCCESS_COLOR, fontSize: 24 }}
            formatter={(value) => formatCurrency(value)}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card style={{ borderRadius: 16, background: `linear-gradient(135deg, #3b82f608 0%, #fff 100%)` }}>
          <Statistic
            title="Average Loan Amount"
            value={summaryStats.avgLoanAmount}
            prefix={<Wallet size={20} color="#3b82f6" />}
            valueStyle={{ color: "#3b82f6", fontSize: 24 }}
            formatter={(value) => formatCurrency(value)}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card style={{ borderRadius: 16, background: `linear-gradient(135deg, #f59e0b08 0%, #fff 100%)` }}>
          <Statistic
            title="Est. Total Commission"
            value={summaryStats.totalCommission}
            prefix={<Receipt size={20} color="#f59e0b" />}
            valueStyle={{ color: "#f59e0b", fontSize: 24 }}
            formatter={(value) => formatCurrency(value)}
          />
        </Card>
      </Col>
    </Row>
  );

  // ==================== QUICK VIEW MODAL WITH API DATA ====================
  const renderViewModal = () => {
    if (!viewModal) return null;

    if (loadingDetails) {
      return (
        <Modal
          title="Loading Case Details..."
          open={!!viewModal}
          onCancel={() => { setViewModal(null); setAmountDetails(null); }}
          footer={null}
          width={600}
          centered
        >
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Fetching amount details...</div>
          </div>
        </Modal>
      );
    }

    const data = amountDetails?.data || {};
    const comparison = data.amountComparison || {};
    const bankOffer = data.bankOffer || {};
    const commission = data.commissionCalculation || {};
    const summary = data.summary || {};
    const timeline = data.amountTimeline || [];

    // Amount Comparison Table Data
    const amountComparisonData = [
      { key: '1', label: 'Requested Amount', value: formatCurrency(comparison.requestedAmount), icon: <BankOutlined />, color: '#6B7280' },
      { key: '2', label: 'Approved Amount', value: formatCurrency(comparison.approvedAmount), icon: <CheckCircleOutlined />, color: WARNING_COLOR },
      { key: '3', label: 'Disbursed Amount', value: formatCurrency(comparison.disbursedAmount), icon: <DollarOutlined />, color: SUCCESS_COLOR },
      { key: '4', label: 'Difference', value: formatCurrency(Math.abs(comparison.amountDifference || 0)), icon: <RiseOutlined />, color: comparison.amountStatus === 'reduced' ? ERROR_COLOR : WARNING_COLOR },
    ];

    // Loan Details Table Data
    const loanDetailsData = [
      { key: '1', label: 'Bank Name', value: bankOffer.bankName, icon: <BankOutlined /> },
      { key: '2', label: 'Interest Rate', value: `${bankOffer.interestRate}% (${bankOffer.interestRateType})`, icon: <PercentageOutlined /> },
      { key: '3', label: 'Loan Tenure', value: `${bankOffer.tenureYears} years`, icon: <CalendarOutlined /> },
      { key: '4', label: 'Monthly EMI', value: formatCurrency(bankOffer.monthlyEMI), icon: <CalculatorOutlined /> },
      { key: '5', label: 'Processing Fee', value: formatCurrency(bankOffer.processingFee), icon: <FileTextOutlined /> },
      { key: '6', label: 'Valuation Fee', value: formatCurrency(bankOffer.valuationFee), icon: <FileTextOutlined /> },
      { key: '7', label: 'Early Settlement Fee', value: `${bankOffer.earlySettlementFee}%`, icon: <PercentageOutlined /> },
    ];

    // Financial Summary Table Data
    const financialSummaryData = [
      { key: '1', label: 'Property Value', value: formatCurrency(summary.propertyValue), icon: <HomeOutlined /> },
      { key: '2', label: 'Down Payment', value: formatCurrency(summary.downPayment), icon: <DollarOutlined /> },
      { key: '3', label: 'LTV Ratio', value: `${summary.ltvPercentage}%`, icon: <PercentageOutlined /> },
      { key: '4', label: 'DBR', value: `${summary.dbrPercentage}% (${summary.dbrStatus})`, icon: <PercentageOutlined /> },
      { key: '5', label: 'Total Upfront Cost', value: formatCurrency(summary.totalUpfrontCost), icon: <WalletOutlined /> },
      { key: '6', label: 'Total Interest Payable', value: formatCurrency(summary.totalInterestPayable), icon: <RiseOutlined /> },
      { key: '7', label: 'Total Amount Payable', value: formatCurrency(summary.totalAmountPayable), icon: <DollarOutlined /> },
    ];

    // Commission Table Data
    const commissionData = [
      { key: '1', label: 'Disbursed Amount', value: formatCurrency(commission.loanAmount), icon: <DollarOutlined /> },
      { key: '2', label: 'Loan Tier', value: commission.loanTier, icon: <TrophyOutlined /> },
      { key: '3', label: 'Xoto Commission Rate', value: commission.xotoCommissionRate, icon: <PercentageOutlined /> },
      { key: '4', label: 'Xoto Commission Amount', value: formatCurrency(commission.xotoCommissionFromBank), icon: <BankOutlined /> },
      { key: '5', label: 'Recipient', value: `${commission.recipientType} (${commission.recipientName || 'N/A'})`, icon: <UserOutlined /> },
      { key: '6', label: 'Recipient Percentage', value: `${commission.recipientPercentage}%`, icon: <PercentageOutlined /> },
      { key: '7', label: 'Commission Amount', value: formatCurrency(commission.commissionAmount), icon: <GiftOutlined />, highlight: true },
      { key: '8', label: 'Formula', value: commission.formula, icon: <CalculatorOutlined /> },
      { key: '9', label: 'Status', value: commission.status, icon: <ClockCircleOutlined /> },
    ];

    const columnsConfig = [
      { title: 'Parameter', dataIndex: 'label', key: 'label', render: (text, record) => (<span><span style={{ marginRight: 8 }}>{record.icon}</span> {text}</span>) },
      { title: 'Value', dataIndex: 'value', key: 'value', render: (text, record) => (<Text strong style={{ color: record.highlight ? SUCCESS_COLOR : record.color || '#374151' }}>{text}</Text>) }
    ];

    return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DollarOutlined style={{ color: SUCCESS_COLOR, fontSize: 24 }} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>Disbursed Case Details</span>
            <Tag color="success" style={{ marginLeft: 'auto' }}>{data.currentStatus || 'Disbursed'}</Tag>
          </div>
        }
        open={!!viewModal}
        onCancel={() => { setViewModal(null); setAmountDetails(null); }}
        width={1000}
        footer={[
          <Button key="close" onClick={() => { setViewModal(null); setAmountDetails(null); }}>Close</Button>,
          <Button 
            key="fullCase" 
            type="primary" 
            onClick={() => {
              setViewModal(null);
              setAmountDetails(null);
              handleViewFullCase(viewModal._id);
            }}
            style={{ background: PURPLE }}
            icon={<FileTextOutlined />}
          >
            View Full Case
          </Button>,
          <Button 
            key="amountDetails" 
            type="primary" 
            onClick={() => {
              setViewModal(null);
              setAmountDetails(null);
              handleViewAmountDetails(viewModal._id);
            }}
            style={{ background: SUCCESS_COLOR }}
            icon={<DollarOutlined />}
          >
            Amount Details
          </Button>
        ]}
      >
        <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 8 }}>
          {/* Status Banner */}
          <Alert
            message={`Case ${viewModal.caseReference} - ${data.currentStatus || 'Disbursed'}`}
            description={`Disbursed on ${formatDate(viewModal.updatedAt)} | Message: ${comparison.message || 'Loan disbursed successfully'}`}
            type="success"
            showIcon
            style={{ marginBottom: 16, borderRadius: 12 }}
          />

          {/* Tabs */}
          <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
            <Tabs.TabPane tab={<span><DollarOutlined /> Amount Summary</span>} key="summary" />
            <Tabs.TabPane tab={<span><BankOutlined /> Loan Details</span>} key="loan" />
            <Tabs.TabPane tab={<span><CalculatorOutlined /> Financial Summary</span>} key="financial" />
            <Tabs.TabPane tab={<span><GiftOutlined /> Commission</span>} key="commission" />
            <Tabs.TabPane tab={<span><ClockCircleOutlined /> Timeline</span>} key="timeline" />
          </Tabs>

          {/* Tab 1: Amount Summary */}
          {activeTab === 'summary' && (
            <AntTable 
              columns={columnsConfig} 
              dataSource={amountComparisonData} 
              pagination={false} 
              size="middle"
              bordered
              rowKey="key"
              style={{ borderRadius: 12, overflow: 'hidden' }}
            />
          )}

          {/* Tab 2: Loan Details */}
          {activeTab === 'loan' && (
            <AntTable 
              columns={columnsConfig} 
              dataSource={loanDetailsData} 
              pagination={false} 
              size="middle"
              bordered
              rowKey="key"
              style={{ borderRadius: 12, overflow: 'hidden' }}
            />
          )}

          {/* Tab 3: Financial Summary */}
          {activeTab === 'financial' && (
            <AntTable 
              columns={columnsConfig} 
              dataSource={financialSummaryData} 
              pagination={false} 
              size="middle"
              bordered
              rowKey="key"
              style={{ borderRadius: 12, overflow: 'hidden' }}
            />
          )}

          {/* Tab 4: Commission Breakdown */}
          {activeTab === 'commission' && (
            <>
              <AntTable 
                columns={columnsConfig} 
                dataSource={commissionData} 
                pagination={false} 
                size="middle"
                bordered
                rowKey="key"
                style={{ borderRadius: 12, overflow: 'hidden' }}
              />
              <Card style={{ marginTop: 16, background: '#f0fdf4', border: `1px solid ${SUCCESS_COLOR}`, borderRadius: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <Text strong style={{ color: SUCCESS_COLOR }}>Commission Calculation Summary</Text>
                  <div style={{ marginTop: 8, fontSize: 14 }}>
                    {formatCurrency(commission.xotoCommissionFromBank)} × {commission.recipientPercentage}% = <Text strong style={{ color: SUCCESS_COLOR, fontSize: 16 }}>{formatCurrency(commission.commissionAmount)}</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Commission will be processed within 30 days after disbursement confirmation</Text>
                </div>
              </Card>
            </>
          )}

          {/* Tab 5: Timeline */}
          {activeTab === 'timeline' && (
            <div>
              {timeline.map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  marginBottom: 16, 
                  padding: 12, 
                  background: item.isFinal ? '#f0fdf4' : '#f8fafc', 
                  borderRadius: 12,
                  borderLeft: `3px solid ${item.isFinal ? SUCCESS_COLOR : PURPLE}`
                }}>
                  <div style={{ minWidth: 160 }}>
                    <Text strong style={{ fontSize: 12 }}>{formatDate(item.date)}</Text>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text>{item.event}</Text>
                    {item.reference && <div><Text type="secondary" style={{ fontSize: 11 }}>Reference: {item.reference}</Text></div>}
                    <Text type="secondary" style={{ fontSize: 11 }}>By: {item.addedBy}</Text>
                  </div>
                  {item.isFinal && <Tag color="success">Final</Tag>}
                </div>
              ))}
              {timeline.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Text type="secondary">No timeline events found</Text>
                </div>
              )}
            </div>
          )}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 24,
            background: `linear-gradient(135deg, ${SUCCESS_COLOR} 0%, ${PURPLE} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <DollarSign size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Disbursed Cases</h1>
            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
              View all successfully completed and disbursed mortgage cases
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Filter Bar */}
      <FilterBar />

      {/* Case Count Info */}
      <div style={{ marginBottom: 16, fontSize: 13, color: "#6B7280", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span>
          Showing <strong>{cases.length}</strong> disbursed case{cases.length !== 1 ? 's' : ''}
        </span>
        <span style={{ fontSize: 11, background: PURPLE_LIGHT, padding: "4px 10px", borderRadius: 20, color: PURPLE }}>
          Total Disbursed: {summaryStats.totalCases}
        </span>
      </div>

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

      {/* View Modal with API Data */}
      {renderViewModal()}
    </div>
  );
};

export default DisbursedCases;