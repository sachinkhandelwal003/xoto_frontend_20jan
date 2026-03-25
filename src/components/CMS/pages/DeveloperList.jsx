import React, { useState, useEffect } from "react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { useSelector } from "react-redux";
import {
  Card, Typography, Avatar, Row, Col, Space, message,
  Modal, Button, Tag, Spin, Divider, Switch, Input,
  Descriptions, Select
} from "antd";
import {
  EnvironmentOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ApartmentOutlined, MailOutlined, PhoneOutlined, FileTextOutlined, UserOutlined,
  CalendarOutlined, GlobalOutlined, SafetyCertificateOutlined, BarChartOutlined,
  FileDoneOutlined, CheckOutlined, CloseOutlined, UploadOutlined, PlusOutlined,
  DeleteOutlined, EditOutlined, ExclamationCircleOutlined, EyeOutlined
} from "@ant-design/icons";
import CustomTable from "../../../components/CMS/pages/custom/CustomTable"; // ✅ apna path adjust karo

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DeveloperList = () => {
  const { user } = useSelector((s) => s.auth);

  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const [viewModal, setViewModal] = useState(false);
  const [selectedDev, setSelectedDev] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // KYC states
  const [kycActionLoading, setKycActionLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Agreement Upload states
  const [agreementModalVisible, setAgreementModalVisible] = useState(false);
  const [agreementLoading, setAgreementLoading] = useState(false);
  const [agreementDocs, setAgreementDocs] = useState([{ type: 'main_agreement', name: '', url: '' }]);

  // Agreement Approve states
  const [approveAgreementModal, setApproveAgreementModal] = useState(false);
  const [approveRemark, setApproveRemark] = useState('');
  const [approveAgreementLoading, setApproveAgreementLoading] = useState(false);

  // Agreement Request Changes states
  const [requestChangesModal, setRequestChangesModal] = useState(false);
  const [requestChangesMessage, setRequestChangesMessage] = useState('');
  const [requestChangesRemark, setRequestChangesRemark] = useState('');
  const [requestChangesLoading, setRequestChangesLoading] = useState(false);

  // ✅ FETCH DEVELOPERS LIST
  const fetchDevelopers = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      const resData = await apiService.get("/developer/get-all-developers", {
        page, limit, search: search || undefined
      });
      const rawList = resData?.data || resData || [];
      setDevelopers(Array.isArray(rawList) ? rawList : []);
      const count =
  resData?.pagination?.totalItems ||
  resData?.total ||
  0;
      setTotal(count);
    } catch (err) {
      message.error("Failed to load developers list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDevelopers(currentPage, pageSize, searchText);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, pageSize, searchText]);

  // ✅ FETCH DEVELOPER BY ID
  const fetchDeveloperById = async (devId) => {
    setLoadingDetail(true);
    try {
      const resData = await apiService.get(`/property/get-developer-by-id`, { id: devId });
      const dev = resData?.data || resData;
      setSelectedDev(dev);
    } catch (err) {
      message.error("Failed to load developer details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  // ✅ TOGGLE STATUS
  const handleStatusToggle = async (record, checked) => {
    setActionLoading(record._id || record.id);
    try {
      const payload = { ...record, isVerifiedByAdmin: checked };
      delete payload._id;
      await apiService.post(`/property/edit-developer?id=${record._id || record.id}`, payload);
      message.success(`Developer ${checked ? "Verified" : "Unverified"} successfully!`);
      fetchDevelopers(currentPage, pageSize, searchText);
    } catch (err) {
      message.error("Status update failed");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ OPEN VIEW MODAL
  const openViewModal = (record) => {
    setSelectedDev(null);
    setViewModal(true);
    fetchDeveloperById(record._id || record.id);
  };

  // ✅ KYC APPROVE
  const handleKycApprove = async () => {
    if (!selectedDev) return;
    setKycActionLoading(true);
    try {
      await apiService.put(`/developer/admin/review-kyc/${selectedDev._id}`, { action: "approve" });
      message.success("KYC Approved successfully!");
      fetchDeveloperById(selectedDev._id);
      fetchDevelopers(currentPage, pageSize, searchText);
    } catch (err) {
      message.error("KYC approval failed.");
    } finally {
      setKycActionLoading(false);
    }
  };

  // ✅ KYC REJECT
  const handleKycReject = async () => {
    if (!rejectionReason.trim()) { message.warning("Please enter a rejection reason."); return; }
    setKycActionLoading(true);
    try {
      await apiService.post(`/admin/review-kyc/${selectedDev._id}`, {
        action: "reject", rejectionReason: rejectionReason.trim()
      });
      message.success("KYC Rejected.");
      setRejectModalVisible(false);
      setRejectionReason('');
      fetchDeveloperById(selectedDev._id);
      fetchDevelopers(currentPage, pageSize, searchText);
    } catch (err) {
      message.error("KYC rejection failed.");
    } finally {
      setKycActionLoading(false);
    }
  };

  // ✅ AGREEMENT APPROVE
  const handleAgreementApprove = async () => {
    setApproveAgreementLoading(true);
    try {
      await apiService.put(`/developer/admin/verify-agreement/${selectedDev._id}`, {
        remarks: approveRemark.trim()
      });
      message.success("Agreement Approved successfully!");
      setApproveAgreementModal(false);
      setApproveRemark('');
      fetchDeveloperById(selectedDev._id);
      fetchDevelopers(currentPage, pageSize, searchText);
    } catch (err) {
      message.error("Agreement approval failed.");
    } finally {
      setApproveAgreementLoading(false);
    }
  };

  // ✅ AGREEMENT REQUEST CHANGES
  const handleRequestChanges = async () => {
    if (!requestChangesMessage.trim() || !requestChangesRemark.trim()) {
      message.warning("Please fill in both message and remarks.");
      return;
    }
    setRequestChangesLoading(true);
    try {
      await apiService.post(`/developer/admin/request-changes/${selectedDev._id}`, {
        message: requestChangesMessage.trim(),
        remarks: requestChangesRemark.trim()
      });
      message.success("Change request sent to developer.");
      setRequestChangesModal(false);
      setRequestChangesMessage('');
      setRequestChangesRemark('');
      fetchDeveloperById(selectedDev._id);
    } catch (err) {
      message.error("Failed to send change request.");
    } finally {
      setRequestChangesLoading(false);
    }
  };

  // ✅ AGREEMENT UPLOAD
  const handleAgreementUpload = async () => {
    const validDocs = agreementDocs.filter(d => d.type && d.name && d.url);
    if (validDocs.length === 0) { message.warning("Please fill all document fields."); return; }
    setAgreementLoading(true);
    try {
      await apiService.post(`/agreement/upload`, {
        developerId: selectedDev._id,
        agreementDocuments: validDocs
      });
      message.success("Agreement documents uploaded successfully!");
      setAgreementModalVisible(false);
      setAgreementDocs([{ type: 'main_agreement', name: '', url: '' }]);
      fetchDeveloperById(selectedDev._id);
    } catch (err) {
      message.error("Agreement upload failed.");
    } finally {
      setAgreementLoading(false);
    }
  };

  const addAgreementDoc = () => setAgreementDocs([...agreementDocs, { type: 'addendum', name: '', url: '' }]);
  const removeAgreementDoc = (index) => setAgreementDocs(agreementDocs.filter((_, i) => i !== index));
  const updateAgreementDoc = (index, field, value) => {
    const updated = [...agreementDocs];
    updated[index][field] = value;
    setAgreementDocs(updated);
  };

  // ✅ SERVER-SIDE FILTER HANDLER for CustomTable
  const handleTableFilter = (filters) => {
    setSearchText(filters.search || '');
    setCurrentPage(1);
  };

  // ✅ SERVER-SIDE PAGE CHANGE HANDLER for CustomTable
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const verifiedDevs = developers.filter(d => d.isVerifiedByAdmin).length;
  const unverifiedDevs = developers.filter(d => !d.isVerifiedByAdmin).length;

  const stats = [
    { title: "Total Developers", value: total || 0, icon: <TeamOutlined />, color: "#2563eb", bg: "#dbeafe" },
    { title: "Verified Developers", value: verifiedDevs, icon: <CheckCircleOutlined />, color: "#059669", bg: "#d1fae5" },
    { title: "Unverified Developers", value: unverifiedDevs, icon: <ClockCircleOutlined />, color: "#d97706", bg: "#fef3c7" },
  ];

  const kycTypeLabel = { passport: "Passport", emirates_id: "Emirates ID", trade_license: "Trade License" };
  const agreementTypeLabel = { main_agreement: "Main Agreement", commission_schedule: "Commission Schedule", addendum: "Addendum" };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getKycStatusColor = (status) => {
    if (status === "approved") return "green";
    if (status === "rejected") return "red";
    return "orange";
  };

  const getAgreementStatusColor = (status) => {
    if (status === "approved") return "green";
    if (status === "changes_requested") return "orange";
    if (status === "rejected") return "red";
    if (status === "pending_review") return "blue";
    return "default";
  };

  // ✅ CustomTable columns definition
  const tableColumns = [
    {
      title: "Developer",
      key: "name",
      sortable: true,
      render: (value, record) => (
        <Space size="middle">
          <Avatar
            size={42}
            src={record.logo}
            style={{ backgroundColor: "#f3e8ff", color: "#5c039b", fontWeight: "bold", borderRadius: "8px" }}
            icon={!record.logo && !record.name && <ApartmentOutlined />}
          >
            {!record.logo && record.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ fontSize: "14px", color: "#1f2937" }}>{record.name || "Unnamed Developer"}</Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>RERA: {record.reraNumber || "N/A"}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact Info",
      key: "email",
      sortable: true,
      render: (value, record) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: "13px" }}>
            <MailOutlined style={{ color: "#6b7280", marginRight: "6px" }} />{record.email}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            <PhoneOutlined style={{ color: "#6b7280", marginRight: "6px" }} />
            {record.country_code} {record.phone_number}
          </Text>
        </Space>
      ),
    },
    {
      title: "Location",
      key: "city",
      sortable: true,
      render: (value, record) => (
        <Space>
          <EnvironmentOutlined style={{ color: "#9ca3af" }} />
          <Text>{record.city ? `${record.city}, ${record.country || ''}` : 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: "KYC Status",
      key: "kycStatus",
      sortable: true,
      render: (value, record) => (
        <Tag
          color={getKycStatusColor(record.kycStatus)}
          style={{ borderRadius: "20px", padding: "2px 10px" }}
        >
          {record.kycStatus?.toUpperCase() || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Account Status",
      key: "accountStatus",
      sortable: true,
      render: (value, record) => (
        <Tag
          color={record.accountStatus === "active" ? "green" : "red"}
          style={{ borderRadius: "20px", padding: "2px 10px" }}
        >
          {record.accountStatus === "active" ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Admin Verified",
      key: "isVerifiedByAdmin",
      align: "center",
      render: (value, record) => (
        <Space direction="vertical" size={2} style={{ alignItems: "center" }}>
          <Switch
            checked={record.isVerifiedByAdmin}
            loading={actionLoading === (record._id || record.id)}
            onChange={(val) => handleStatusToggle(record, val)}
            style={{ background: record.isVerifiedByAdmin ? "#059669" : "#ef4444" }}
          />
          <Text
            type="secondary"
            style={{ fontSize: "11px", color: record.isVerifiedByAdmin ? "#059669" : "#ef4444", fontWeight: "500" }}
          >
            {record.isVerifiedByAdmin ? "Verified" : "Unverified"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (value, record) => (
        <button
          onClick={() => openViewModal(record)}
          title="View Profile"
          style={{
            background: "#f3e8ff", border: "none", borderRadius: "8px",
            padding: "8px 10px", cursor: "pointer", color: "#5c039b",
            display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600"
          }}
        >
          <EyeOutlined style={{ fontSize: "15px" }} /> View
        </button>
      ),
    },
  ];

  // ✅ Document Card
  const DocCard = ({ doc, typeLabel, accentColor = "#5c039b", bgColor = "#faf5ff", borderColor = "#e9d5ff", iconBg = "#ede9fe" }) => (
    <a href={doc.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
      <Card size="small" hoverable
        style={{ borderRadius: "10px", border: `1px solid ${borderColor}`, background: bgColor, marginBottom: "10px" }}
        bodyStyle={{ padding: "12px 14px" }}
      >
        <Space>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FileTextOutlined style={{ color: accentColor, fontSize: "16px" }} />
          </div>
          <div>
            <Text strong style={{ fontSize: "13px", color: "#374151", display: "block" }}>{typeLabel[doc.type] || doc.type}</Text>
            <Text type="secondary" style={{ fontSize: "11px" }}>{doc.uploadedBy ? `By ${doc.uploadedBy} · ` : ''}{formatDate(doc.uploadedAt)}</Text>
          </div>
        </Space>
      </Card>
    </a>
  );

  // ✅ Agreement Action Banner
  const AgreementActionBanner = () => {
    const status = selectedDev?.agreementStatus;
    const feedback = selectedDev?.agreementFeedback;

    if (status === "pending_review" && selectedDev?.agreementDocuments?.length > 0) {
      return (
        <div style={{
          background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
          border: "1px solid #93c5fd", borderRadius: "12px",
          padding: "16px 20px", marginBottom: "16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px"
        }}>
          <div>
            <Text strong style={{ color: "#1e40af", fontSize: "14px" }}>📋 Agreement Pending Review</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>Developer has submitted agreement documents. Review and take action.</Text>
          </div>
          <Space>
            <Button type="primary" icon={<CheckOutlined />}
              onClick={() => setApproveAgreementModal(true)}
              style={{ background: "#059669", borderColor: "#059669", borderRadius: "8px", fontWeight: "600" }}>
              Approve
            </Button>
            <Button icon={<ExclamationCircleOutlined />}
              onClick={() => setRequestChangesModal(true)}
              style={{ borderRadius: "8px", fontWeight: "600", borderColor: "#f59e0b", color: "#d97706", background: "#fffbeb" }}>
              Request Changes
            </Button>
          </Space>
        </div>
      );
    }

    if (status === "approved") {
      return (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "14px 20px", marginBottom: "16px" }}>
          <Text strong style={{ color: "#166534" }}>✅ Agreement Approved</Text>
          {selectedDev?.agreementRemarks && (
            <Text type="secondary" style={{ fontSize: "12px", marginLeft: "8px" }}>Remark: {selectedDev.agreementRemarks}</Text>
          )}
          <Text type="secondary" style={{ fontSize: "12px", marginLeft: "8px" }}>on {formatDate(selectedDev?.agreementVerifiedAt)}</Text>
        </div>
      );
    }

    if (status === "changes_requested") {
      return (
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "12px", padding: "14px 20px", marginBottom: "16px" }}>
          <Text strong style={{ color: "#92400e" }}>🔄 Correction Requested</Text>
          {feedback?.message && (
            <div style={{ marginTop: "6px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>Message: </Text>
              <Text style={{ fontSize: "12px", color: "#78350f" }}>{feedback.message}</Text>
            </div>
          )}
          {feedback?.remarks && (
            <div style={{ marginTop: "4px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>Remarks: </Text>
              <Text style={{ fontSize: "12px", color: "#78350f" }}>{feedback.remarks}</Text>
            </div>
          )}
          {feedback?.requestedAt && (
            <div style={{ marginTop: "4px" }}>
              <Text type="secondary" style={{ fontSize: "11px" }}>Requested on {formatDate(feedback.requestedAt)}</Text>
            </div>
          )}
          <div style={{ marginTop: "12px" }}>
            <Space>
              <Button size="small" type="primary" icon={<CheckOutlined />}
                onClick={() => setApproveAgreementModal(true)}
                style={{ background: "#059669", borderColor: "#059669", borderRadius: "6px", fontWeight: "600" }}>
                Approve Now
              </Button>
              <Button size="small" icon={<EditOutlined />}
                onClick={() => setRequestChangesModal(true)}
                style={{ borderRadius: "6px", fontWeight: "600", borderColor: "#f59e0b", color: "#d97706" }}>
                Resend Changes
              </Button>
            </Space>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ padding: "10px", background: "#f3e8ff", borderRadius: "10px", color: "#5c039b" }}>
          <ApartmentOutlined style={{ fontSize: "24px" }} />
        </div>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>Developer Management</Title>
          <Text type="secondary" style={{ fontSize: "15px" }}>Verify, approve, and monitor all property developers on the platform.</Text>
        </div>
      </div>

      {/* QUICK STATS */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card bordered={false} style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                  {stat.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "13px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.title}</Text>
                  <Title level={2} style={{ margin: "4px 0 0 0", color: "#1f2937" }}>{stat.value}</Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ✅ CUSTOM TABLE — ANT Design Table replace ho gaya */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ padding: "20px 0 12px 0" }}>
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Registered Developers Directory</Title>
        </div>
        <CustomTable
          columns={tableColumns}
          data={developers}
          totalItems={total}
          currentPage={currentPage}
          itemsPerPage={pageSize}
          onPageChange={handlePageChange}
          onFilter={handleTableFilter}
          loading={loading}
          showSearch={true}
        />
      </div>

      {/* ✅ DEVELOPER DETAIL MODAL */}
      <Modal
        title={<Space><ApartmentOutlined style={{ color: "#5c039b" }} /><Text strong style={{ fontSize: "18px" }}>Developer Complete Profile</Text></Space>}
        open={viewModal}
        onCancel={() => { setViewModal(false); setSelectedDev(null); }}
        width={980} centered destroyOnClose
        footer={[<Button key="close" onClick={() => { setViewModal(false); setSelectedDev(null); }}>Close</Button>]}
      >
        {loadingDetail || !selectedDev ? (
          <div style={{ textAlign: "center", padding: "60px" }}><Spin size="large" /></div>
        ) : (
          <div style={{ maxHeight: "80vh", overflowY: "auto", paddingRight: "4px" }}>

            {/* PROFILE HEADER */}
            <div style={{ textAlign: "center", marginBottom: "28px", paddingTop: "8px" }}>
              <Avatar size={88} shape="square" src={selectedDev.logo}
                style={{ backgroundColor: "#f3e8ff", color: "#5c039b", fontSize: "34px", fontWeight: "bold", borderRadius: "14px" }}
              >
                {selectedDev.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Title level={4} style={{ marginTop: "14px", marginBottom: "6px" }}>{selectedDev.name}</Title>
              <Space wrap style={{ justifyContent: "center" }}>
                <Tag color={selectedDev.isVerifiedByAdmin ? "green" : "red"} style={{ borderRadius: "20px", padding: "2px 12px" }}>
                  {selectedDev.isVerifiedByAdmin ? "✓ Verified" : "✗ Unverified"}
                </Tag>
                <Tag color={selectedDev.accountStatus === "active" ? "cyan" : "orange"} style={{ borderRadius: "20px", padding: "2px 12px" }}>
                  Status: {selectedDev.accountStatus?.toUpperCase()}
                </Tag>
                <Tag style={{ borderRadius: "20px", padding: "2px 12px" }}>
                  Onboarding: {selectedDev.onboardingStatus?.replace(/_/g, " ").toUpperCase()}
                </Tag>
                <Tag color={getKycStatusColor(selectedDev.kycStatus)} style={{ borderRadius: "20px", padding: "2px 12px" }}>
                  KYC: {selectedDev.kycStatus?.toUpperCase()}
                </Tag>
                {selectedDev.agreementStatus && (
                  <Tag color={getAgreementStatusColor(selectedDev.agreementStatus)} style={{ borderRadius: "20px", padding: "2px 12px" }}>
                    AGR: {selectedDev.agreementStatus?.replace(/_/g, " ").toUpperCase()}
                  </Tag>
                )}
                {selectedDev.reraNumber && <Tag color="blue" style={{ borderRadius: "20px", padding: "2px 12px" }}>RERA: {selectedDev.reraNumber}</Tag>}
              </Space>
            </div>

            {/* BASIC INFO */}
            <Divider orientation="left" style={{ color: "#5c039b", borderColor: "#e9d5ff" }}>
              <Space><UserOutlined /> Basic Information</Space>
            </Divider>
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle"
              labelStyle={{ fontWeight: "600", color: "#4b5563", background: "#faf5ff", width: "160px" }}
              style={{ marginBottom: "24px" }}
            >
              <Descriptions.Item label="Email"><MailOutlined style={{ marginRight: 6, color: "#5c039b" }} />{selectedDev.email}</Descriptions.Item>
              <Descriptions.Item label="Official Email"><MailOutlined style={{ marginRight: 6, color: "#5c039b" }} />{selectedDev.officialEmailId || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Phone"><PhoneOutlined style={{ marginRight: 6, color: "#5c039b" }} />{selectedDev.country_code} {selectedDev.phone_number}</Descriptions.Item>
              <Descriptions.Item label="Authorized Person"><UserOutlined style={{ marginRight: 6, color: "#5c039b" }} />{selectedDev.authorizedPersonName || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="City / Country"><EnvironmentOutlined style={{ marginRight: 6, color: "#5c039b" }} />{selectedDev.city || "N/A"}, {selectedDev.country || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Address">{selectedDev.address || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Website" span={2}>
                {selectedDev.websiteUrl ? <a href={selectedDev.websiteUrl} target="_blank" rel="noreferrer" style={{ color: "#5c039b" }}><GlobalOutlined style={{ marginRight: 6 }} />{selectedDev.websiteUrl}</a> : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Operating Years">{selectedDev.operatingYears || 0} Years</Descriptions.Item>
              <Descriptions.Item label="TAT Days">{selectedDev.tatDays} Day(s)</Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>{selectedDev.description || "No description provided."}</Descriptions.Item>
            </Descriptions>

            {/* ONBOARDING & AGREEMENT */}
            <Divider orientation="left" style={{ color: "#5c039b", borderColor: "#e9d5ff" }}>
              <Space><SafetyCertificateOutlined /> Onboarding & Agreement</Space>
            </Divider>
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle"
              labelStyle={{ fontWeight: "600", color: "#4b5563", background: "#faf5ff", width: "160px" }}
              style={{ marginBottom: "24px" }}
            >
              <Descriptions.Item label="Onboarding Status">
                <Tag color="purple" style={{ borderRadius: "20px" }}>{selectedDev.onboardingStatus?.replace(/_/g, " ").toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Agreement Signed">
                {selectedDev.agreementSigned ? <Tag color="green">✓ Signed</Tag> : <Tag color="red">✗ Not Signed</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Agreement Status">
                <Tag color={getAgreementStatusColor(selectedDev.agreementStatus)} style={{ borderRadius: "20px" }}>
                  {selectedDev.agreementStatus?.replace(/_/g, " ").toUpperCase() || "N/A"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Agreement Verified">
                {selectedDev.agreementVerified ? <Tag color="green">✓ Yes</Tag> : <Tag color="orange">Pending</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Agreement Signed At"><CalendarOutlined style={{ marginRight: 6, color: "#5c039b" }} />{formatDate(selectedDev.agreementSignedAt)}</Descriptions.Item>
              <Descriptions.Item label="KYC Reviewed At"><CalendarOutlined style={{ marginRight: 6, color: "#5c039b" }} />{formatDate(selectedDev.kycReviewedAt)}</Descriptions.Item>
              <Descriptions.Item label="Onboarding Started"><CalendarOutlined style={{ marginRight: 6, color: "#5c039b" }} />{formatDate(selectedDev.onboardingStartedAt)}</Descriptions.Item>
              <Descriptions.Item label="Onboarding Completed"><CalendarOutlined style={{ marginRight: 6, color: "#5c039b" }} />{formatDate(selectedDev.onboardingCompletedAt)}</Descriptions.Item>
            </Descriptions>

            {/* ENGAGEMENT PLAN */}
            {selectedDev.engagementPlan && (
              <>
                <Divider orientation="left" style={{ color: "#5c039b", borderColor: "#e9d5ff" }}>
                  <Space><FileDoneOutlined /> Engagement Plan</Space>
                </Divider>
                <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }} size="middle"
                  labelStyle={{ fontWeight: "600", color: "#4b5563", background: "#faf5ff", width: "140px" }}
                  style={{ marginBottom: "24px" }}
                >
                  <Descriptions.Item label="Plan Type">
                    <Tag color={selectedDev.engagementPlan.type ? "purple" : "default"} style={{ borderRadius: "20px", textTransform: "capitalize" }}>
                      {selectedDev.engagementPlan.type || "Not Assigned"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Price">
                    {selectedDev.engagementPlan.price === 0 ? <Tag color="green">Free</Tag> : `AED ${selectedDev.engagementPlan.price}`}
                  </Descriptions.Item>
                  <Descriptions.Item label="Payment Status">
                    <Tag color={selectedDev.engagementPlan.paymentStatus === "paid" ? "green" : "orange"} style={{ borderRadius: "20px" }}>
                      {selectedDev.engagementPlan.paymentStatus?.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Plan Start">{formatDate(selectedDev.engagementPlan.startDate)}</Descriptions.Item>
                  <Descriptions.Item label="Plan End">{formatDate(selectedDev.engagementPlan.endDate)}</Descriptions.Item>
                  <Descriptions.Item label="Payment Date">{formatDate(selectedDev.engagementPlan.paymentDate)}</Descriptions.Item>
                </Descriptions>
              </>
            )}

            {/* PERFORMANCE STATS */}
            {/* <Divider orientation="left" style={{ color: "#5c039b", borderColor: "#e9d5ff" }}>
              <Space><BarChartOutlined /> Performance Stats</Space>
            </Divider> */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
              {[
                { label: "Presentations Generated", value: selectedDev.presentationsGenerated_stats ?? 0, color: "#2563eb", bg: "#dbeafe" },
                { label: "Leads Generated", value: selectedDev.leadsGenerated_stats ?? 0, color: "#059669", bg: "#d1fae5" },
                { label: "Units Sold", value: selectedDev.unitsSold_stats ?? 0, color: "#7c3aed", bg: "#ede9fe" },
                { label: "Conversion Rate", value: `${selectedDev.conversionRate_stats ?? 0}%`, color: "#d97706", bg: "#fef3c7" },
              ].map((stat, i) => (
                <Col xs={12} sm={6} key={i}>
                  <Card size="small" bordered={false} style={{ borderRadius: "10px", background: stat.bg, textAlign: "center" }} bodyStyle={{ padding: "16px 10px" }}>
                    <Title level={3} style={{ margin: 0, color: stat.color }}>{stat.value}</Title>
                    <Text style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500" }}>{stat.label}</Text>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* DOCUMENTS SECTION */}
            <Divider orientation="left" style={{ color: "#5c039b", borderColor: "#e9d5ff" }}>
              <Space>
                <FileTextOutlined /> Documents
                <Button size="small" type="primary" icon={<UploadOutlined />}
                  onClick={() => setAgreementModalVisible(true)}
                  style={{ background: "#2563eb", borderColor: "#2563eb", borderRadius: "6px", fontSize: "12px" }}>
                  Upload Agreement
                </Button>
              </Space>
            </Divider>

            <Row gutter={[24, 16]} style={{ marginBottom: "24px" }}>

              {/* KYC DOCUMENTS COLUMN */}
              <Col xs={24} md={12}>
                {selectedDev.kycStatus === "pending" && (
                  <div style={{
                    background: "linear-gradient(135deg, #fefce8, #fffbeb)",
                    border: "1px solid #fde68a", borderRadius: "12px",
                    padding: "14px 16px", marginBottom: "12px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px"
                  }}>
                    <div>
                      <Text strong style={{ color: "#92400e", fontSize: "13px" }}>⏳ KYC Pending Review</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "11px" }}>Review documents and take action.</Text>
                    </div>
                    <Space size={6}>
                      <Button size="small" type="primary" icon={<CheckOutlined />} loading={kycActionLoading}
                        onClick={handleKycApprove}
                        style={{ background: "#059669", borderColor: "#059669", borderRadius: "6px", fontWeight: "600" }}>
                        Approve
                      </Button>
                      <Button size="small" danger icon={<CloseOutlined />}
                        onClick={() => setRejectModalVisible(true)}
                        style={{ borderRadius: "6px", fontWeight: "600" }}>
                        Reject
                      </Button>
                    </Space>
                  </div>
                )}
                {selectedDev.kycStatus === "approved" && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "12px 16px", marginBottom: "12px" }}>
                    <Text strong style={{ color: "#166534" }}>✅ KYC Approved</Text>
                    <Text type="secondary" style={{ fontSize: "11px", marginLeft: "8px" }}>on {formatDate(selectedDev.kycReviewedAt)}</Text>
                  </div>
                )}
                {selectedDev.kycStatus === "rejected" && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "12px", padding: "12px 16px", marginBottom: "12px" }}>
                    <Text strong style={{ color: "#991b1b" }}>❌ KYC Rejected</Text>
                    {selectedDev.kycRejectionReason && (
                      <div style={{ marginTop: "4px" }}>
                        <Text type="secondary" style={{ fontSize: "11px" }}>Reason: </Text>
                        <Text style={{ fontSize: "11px", color: "#7f1d1d" }}>{selectedDev.kycRejectionReason}</Text>
                      </div>
                    )}
                  </div>
                )}
                <Card bordered style={{ borderRadius: "12px", border: "1px solid #e9d5ff" }} bodyStyle={{ padding: "16px" }}
                  title={
                    <Space>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#5c039b" }} />
                      <Text strong style={{ color: "#5c039b", fontSize: "13px" }}>KYC Documents</Text>
                      <Tag color="purple" style={{ borderRadius: "20px", fontSize: "11px" }}>{selectedDev.kycDocuments?.length || 0}</Tag>
                    </Space>
                  }
                >
                  {selectedDev.kycDocuments?.length > 0
                    ? selectedDev.kycDocuments.map((doc) => (
                      <DocCard key={doc._id} doc={doc} typeLabel={kycTypeLabel}
                        accentColor="#5c039b" bgColor="#faf5ff" borderColor="#e9d5ff" iconBg="#ede9fe" />
                    ))
                    : <Text type="secondary" style={{ fontSize: "13px" }}>No KYC documents uploaded.</Text>
                  }
                </Card>
              </Col>

              {/* AGREEMENT DOCUMENTS COLUMN */}
              <Col xs={24} md={12}>
                <AgreementActionBanner />
                <Card bordered style={{ borderRadius: "12px", border: "1px solid #bfdbfe" }} bodyStyle={{ padding: "16px" }}
                  title={
                    <Space>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb" }} />
                      <Text strong style={{ color: "#2563eb", fontSize: "13px" }}>Agreement Documents</Text>
                      <Tag color="blue" style={{ borderRadius: "20px", fontSize: "11px" }}>{selectedDev.agreementDocuments?.length || 0}</Tag>
                    </Space>
                  }
                >
                  {selectedDev.agreementDocuments?.length > 0
                    ? selectedDev.agreementDocuments.map((doc) => (
                      <DocCard key={doc._id} doc={doc} typeLabel={agreementTypeLabel}
                        accentColor="#2563eb" bgColor="#eff6ff" borderColor="#bfdbfe" iconBg="#dbeafe" />
                    ))
                    : <Text type="secondary" style={{ fontSize: "13px" }}>No agreement documents uploaded.</Text>
                  }
                </Card>
              </Col>
            </Row>

          </div>
        )}
      </Modal>

      {/* KYC REJECT MODAL */}
      <Modal
        title={<Space><CloseOutlined style={{ color: "#ef4444" }} /><Text strong>Reject KYC — Provide Reason</Text></Space>}
        open={rejectModalVisible}
        onCancel={() => { setRejectModalVisible(false); setRejectionReason(''); }}
        centered
        footer={[
          <Button key="cancel" onClick={() => { setRejectModalVisible(false); setRejectionReason(''); }}>Cancel</Button>,
          <Button key="reject" danger loading={kycActionLoading} onClick={handleKycReject} icon={<CloseOutlined />} style={{ fontWeight: "600" }}>
            Confirm Reject
          </Button>
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          <Text type="secondary" style={{ fontSize: "13px", display: "block", marginBottom: "12px" }}>
            Please provide a clear reason. The developer will be notified.
          </Text>
          <TextArea rows={4} placeholder="e.g. Trade license is expired. Please upload valid trade license."
            value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
            style={{ borderRadius: "8px", borderColor: "#fca5a5" }} maxLength={500} showCount />
        </div>
      </Modal>

      {/* AGREEMENT APPROVE MODAL */}
      <Modal
        title={<Space><CheckOutlined style={{ color: "#059669" }} /><Text strong>Approve Agreement</Text></Space>}
        open={approveAgreementModal}
        onCancel={() => { setApproveAgreementModal(false); setApproveRemark(''); }}
        centered
        footer={[
          <Button key="cancel" onClick={() => { setApproveAgreementModal(false); setApproveRemark(''); }}>Cancel</Button>,
          <Button key="approve" type="primary" loading={approveAgreementLoading} onClick={handleAgreementApprove}
            icon={<CheckOutlined />} style={{ background: "#059669", borderColor: "#059669", fontWeight: "600" }}>
            Confirm Approve
          </Button>
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
            <Text style={{ color: "#166534", fontSize: "13px" }}>
              ✅ You are about to <strong>approve</strong> the agreement for <strong>{selectedDev?.name}</strong>.
            </Text>
          </div>
          <Text strong style={{ fontSize: "13px", display: "block", marginBottom: "8px" }}>
            Remark <Text type="secondary" style={{ fontWeight: "400" }}>(optional)</Text>
          </Text>
          <TextArea rows={3} placeholder="e.g. All documents verified and in order."
            value={approveRemark} onChange={(e) => setApproveRemark(e.target.value)}
            style={{ borderRadius: "8px", borderColor: "#86efac" }} maxLength={500} showCount />
        </div>
      </Modal>

      {/* REQUEST CHANGES MODAL */}
      <Modal
        title={<Space><ExclamationCircleOutlined style={{ color: "#d97706" }} /><Text strong>Request Changes from Developer</Text></Space>}
        open={requestChangesModal}
        onCancel={() => { setRequestChangesModal(false); setRequestChangesMessage(''); setRequestChangesRemark(''); }}
        centered width={560}
        footer={[
          <Button key="cancel" onClick={() => { setRequestChangesModal(false); setRequestChangesMessage(''); setRequestChangesRemark(''); }}>Cancel</Button>,
          <Button key="send" type="primary" loading={requestChangesLoading} onClick={handleRequestChanges}
            icon={<EditOutlined />} style={{ background: "#d97706", borderColor: "#d97706", fontWeight: "600" }}>
            Send Request
          </Button>
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
            <Text style={{ color: "#92400e", fontSize: "13px" }}>
              ⚠️ This will notify <strong>{selectedDev?.name}</strong> to revise and resubmit their agreement documents.
            </Text>
          </div>
          <Text strong style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>
            Message <Text type="danger">*</Text>
          </Text>
          <TextArea rows={3}
            placeholder="e.g. Commission schedule is incorrect. The percentage should be 5% not 3%."
            value={requestChangesMessage}
            onChange={(e) => setRequestChangesMessage(e.target.value)}
            style={{ borderRadius: "8px", borderColor: "#fcd34d", marginBottom: "16px" }}
            maxLength={500} showCount
          />
          <Text strong style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>
            Remarks <Text type="danger">*</Text>
          </Text>
          <TextArea rows={2}
            placeholder="e.g. Developer needs to correct commission rate in the schedule."
            value={requestChangesRemark}
            onChange={(e) => setRequestChangesRemark(e.target.value)}
            style={{ borderRadius: "8px", borderColor: "#fcd34d" }}
            maxLength={300} showCount
          />
        </div>
      </Modal>

      {/* AGREEMENT UPLOAD MODAL */}
      <Modal
        title={<Space><UploadOutlined style={{ color: "#2563eb" }} /><Text strong>Upload Agreement Documents</Text></Space>}
        open={agreementModalVisible}
        onCancel={() => { setAgreementModalVisible(false); setAgreementDocs([{ type: 'main_agreement', name: '', url: '' }]); }}
        centered width={620}
        footer={[
          <Button key="cancel" onClick={() => { setAgreementModalVisible(false); setAgreementDocs([{ type: 'main_agreement', name: '', url: '' }]); }}>Cancel</Button>,
          <Button key="upload" type="primary" loading={agreementLoading} onClick={handleAgreementUpload}
            icon={<UploadOutlined />} style={{ background: "#2563eb", borderColor: "#2563eb", fontWeight: "600" }}>
            Upload Documents
          </Button>
        ]}
      >
        <div style={{ padding: "12px 0" }}>
          <Text type="secondary" style={{ fontSize: "13px", display: "block", marginBottom: "16px" }}>
            Add one or more agreement documents. Each entry requires a type, file name, and URL.
          </Text>
          {agreementDocs.map((doc, index) => (
            <Card key={index} size="small" bordered
              style={{ borderRadius: "10px", border: "1px solid #bfdbfe", background: "#f8faff", marginBottom: "12px" }}
              bodyStyle={{ padding: "14px" }}
            >
              <Row gutter={[10, 10]} align="middle">
                <Col xs={24} sm={10}>
                  <Select value={doc.type} onChange={(val) => updateAgreementDoc(index, 'type', val)}
                    style={{ width: "100%" }} placeholder="Select Type">
                    <Option value="main_agreement">Main Agreement</Option>
                    <Option value="commission_schedule">Commission Schedule</Option>
                    <Option value="addendum">Addendum</Option>
                  </Select>
                </Col>
                <Col xs={22} sm={12}>
                  <Input placeholder="File name (e.g. agreement.pdf)" value={doc.name}
                    onChange={(e) => updateAgreementDoc(index, 'name', e.target.value)} style={{ borderRadius: "8px" }} />
                </Col>
                <Col xs={2} style={{ textAlign: "center" }}>
                  {agreementDocs.length > 1 && (
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeAgreementDoc(index)} />
                  )}
                </Col>
                <Col xs={24}>
                  <Input placeholder="Document URL (https://...)" value={doc.url}
                    onChange={(e) => updateAgreementDoc(index, 'url', e.target.value)}
                    style={{ borderRadius: "8px" }} prefix={<GlobalOutlined style={{ color: "#9ca3af" }} />} />
                </Col>
              </Row>
            </Card>
          ))}
          <Button type="dashed" block icon={<PlusOutlined />} onClick={addAgreementDoc}
            style={{ borderRadius: "8px", borderColor: "#2563eb", color: "#2563eb", marginTop: "4px" }}>
            Add Another Document
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default DeveloperList;