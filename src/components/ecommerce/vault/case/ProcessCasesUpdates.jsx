import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import {
  Card, Tabs, Button, Typography, Row, Col, Avatar,
  Tag, Descriptions, Divider, Spin, message, Badge,
  Pagination, Space, Progress, Statistic, Modal, Tooltip,
  Select, Input, Timeline, Steps, Alert, Empty
} from 'antd';
import {
  UserOutlined, BankOutlined, FileTextOutlined,
  CalendarOutlined, EyeOutlined, HomeOutlined,
  DollarCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, RocketOutlined,
  SendOutlined, TrophyOutlined, TeamOutlined, InfoCircleOutlined,
  EditOutlined, HistoryOutlined, FileDoneOutlined,
  LoadingOutlined, PlusOutlined, ArrowRightOutlined, SyncOutlined,
  WarningOutlined, SmileOutlined, SolutionOutlined, GiftOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const THEME_COLOR = "#5C039B";
const SUCCESS_COLOR = "#10b981";
const WARNING_COLOR = "#f59e0b";
const ERROR_COLOR = "#ef4444";
const INFO_COLOR = "#3b82f6";

// ================= STATUS CONFIGURATION =================
// All possible statuses based on the workflow
const CASE_STATUSES = [
  'Under Review',
  'Submitted to Xoto',
  'Bank Application',
  'Collecting Documentation',
  'Pre-Approved',
  'Valuation',
  'FOL Processed',
  'FOL Issued',
  'FOL Signed',
  'Disbursed',
  'Rejected',
  'Lost'
];

// Status to icon mapping with animated effects
const getStatusIcon = (status) => {
  const iconMap = {
    'Under Review': <SyncOutlined spin style={{ color: INFO_COLOR }} />,
    'Submitted to Xoto': <SendOutlined style={{ color: THEME_COLOR }} />,
    'Bank Application': <BankOutlined style={{ color: THEME_COLOR }} />,
    'Collecting Documentation': <FileTextOutlined style={{ color: WARNING_COLOR }} />,
    'Pre-Approved': <CheckCircleOutlined style={{ color: SUCCESS_COLOR }} />,
    'Valuation': <EyeOutlined style={{ color: INFO_COLOR }} />,
    'FOL Processed': <FileDoneOutlined style={{ color: SUCCESS_COLOR }} />,
    'FOL Issued': <FileTextOutlined style={{ color: SUCCESS_COLOR }} />,
    'FOL Signed': <CheckCircleOutlined style={{ color: SUCCESS_COLOR }} />,
    'Disbursed': <DollarCircleOutlined style={{ color: SUCCESS_COLOR }} />,
    'Rejected': <CloseCircleOutlined style={{ color: ERROR_COLOR }} />,
    'Lost': <WarningOutlined style={{ color: ERROR_COLOR }} />
  };
  return iconMap[status] || <ClockCircleOutlined />;
};

// Status color mapping for tags and borders
const getStatusColor = (status) => {
  const colorMap = {
    'Under Review': 'processing',
    'Submitted to Xoto': 'processing',
    'Bank Application': 'processing',
    'Collecting Documentation': 'warning',
    'Pre-Approved': 'success',
    'Valuation': 'processing',
    'FOL Processed': 'success',
    'FOL Issued': 'success',
    'FOL Signed': 'success',
    'Disbursed': 'success',
    'Rejected': 'error',
    'Lost': 'default'
  };
  return colorMap[status] || 'default';
};

// Get gradient background for cards based on status
const getCardGradient = (status) => {
  const gradients = {
    'Under Review': `linear-gradient(135deg, ${INFO_COLOR}08 0%, #fff 100%)`,
    'Pre-Approved': `linear-gradient(135deg, ${SUCCESS_COLOR}08 0%, #fff 100%)`,
    'Rejected': `linear-gradient(135deg, ${ERROR_COLOR}04 0%, #fff 100%)`,
    'Disbursed': `linear-gradient(135deg, ${SUCCESS_COLOR}10 0%, #fff 100%)`,
  };
  return gradients[status] || `linear-gradient(135deg, ${THEME_COLOR}04 0%, #fff 100%)`;
};

// Get available next statuses based on current status
const getAvailableNextStatuses = (currentStatus) => {
  const transitions = {
    'Under Review': ['Submitted to Xoto', 'Collecting Documentation', 'Lost'],
    'Submitted to Xoto': ['Bank Application', 'Collecting Documentation', 'Lost'],
    'Bank Application': ['Pre-Approved', 'Collecting Documentation', 'Rejected'],
    'Collecting Documentation': ['Bank Application', 'Lost'],
    'Pre-Approved': ['Valuation', 'Rejected'],
    'Valuation': ['FOL Processed', 'Rejected'],
    'FOL Processed': ['FOL Issued', 'Rejected'],
    'FOL Issued': ['FOL Signed', 'Rejected'],
    'FOL Signed': ['Disbursed', 'Rejected'],
    'Disbursed': [],
    'Rejected': [],
    'Lost': []
  };
  return transitions[currentStatus] || [];
};

// Role slug mapping
const roleSlugMap = {
  0: "superadmin", 1: "admin", 2: "customer",
  15: "agency", 16: "agent", 17: "developer", 18: "vault-admin"
};

const ProcessCasesUpdates = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "superadmin";

  // State
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  // Modal state
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusHistory, setStatusHistory] = useState([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // Fetch cases
  const fetchCases = useCallback(async (page) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/vault/cases?page=${page}&limit=12`);
      if (res?.success) {
        setCases(res.data || []);
        setTotalItems(res.pagination?.total || 0);
      }
    } catch (err) {
      message.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases(currentPage);
  }, [currentPage, fetchCases]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const navigateToCaseDetail = (caseItem) => {
    navigate(`/dashboard/${roleSlug}/case/view/${caseItem._id}`);
  };

  // Open status update modal
  const openStatusModal = (caseItem, e) => {
    e.stopPropagation();
    setSelectedCase(caseItem);
    setSelectedStatus('');
    setStatusNotes('');
    setStatusModalVisible(true);
  };

  // Update case status
  const updateCaseStatus = async () => {
    if (!selectedStatus) {
      message.warning("Please select a status");
      return;
    }

    setUpdating(true);
    try {
      const response = await apiService.put(`/vault/cases/admin/${selectedCase._id}/status`, {
        status: selectedStatus,
        notes: statusNotes
      });

      if (response?.success) {
        message.success({
          content: `Case status updated to "${selectedStatus}" successfully!`,
          duration: 3,
          icon: <CheckCircleOutlined />
        });
        setStatusModalVisible(false);
        fetchCases(currentPage);
      } else {
        message.error(response?.message || "Failed to update case status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      message.error(err.response?.data?.message || "Error updating case status");
    } finally {
      setUpdating(false);
    }
  };

  // View status history - fetch from API ideally
  const viewStatusHistory = async (caseItem, e) => {
    e.stopPropagation();
    try {
      // Replace with actual API call: GET /vault/cases/:id/status-history
      const mockHistory = [
        { status: caseItem.currentStatus, notes: "Current status", timestamp: caseItem.updatedAt, updatedBy: "System" },
        { status: "Under Review", notes: "Case received and under review", timestamp: caseItem.createdAt, updatedBy: caseItem.createdBy?.advisorName || "System" }
      ];
      setStatusHistory(mockHistory);
      setHistoryModalVisible(true);
    } catch (err) {
      message.error("Failed to load history");
    }
  };

  // Get document progress
  const getDocumentProgress = (documentStatus) => {
    const total = documentStatus?.requiredDocuments?.length || 10;
    const uploaded = documentStatus?.documentsUploadedCount || 0;
    const verified = documentStatus?.documentsVerifiedCount || 0;
    const percentage = total > 0 ? (uploaded / total) * 100 : 0;
    return { total, uploaded, verified, percentage };
  };

  // Filter cases by status tab
  const getFilteredCases = () => {
    if (activeTab === 'all') return cases;
    return cases.filter(c => c.currentStatus === activeTab);
  };

  // Get count for each status
  const getStatusCount = (status) => {
    if (status === 'all') return cases.length;
    return cases.filter(c => c.currentStatus === status).length;
  };

  // Render individual case card with enhanced UI
  const renderCaseCard = (caseItem) => {
    const clientName = caseItem.clientInfo?.fullName || 'Unknown Client';
    const propertyValue = caseItem.propertyInfo?.propertyValue || 0;
    const loanAmount = caseItem.propertyInfo?.loanAmount || caseItem.loanInfo?.requestedAmount || 0;
    const bankName = caseItem.loanInfo?.selectedBank || 'Not Selected';
    const docProgress = getDocumentProgress(caseItem.documentStatus);
    const createdBy = caseItem.createdBy?.advisorName || caseItem.createdBy?.partnerName || 'Admin';
    const availableStatuses = getAvailableNextStatuses(caseItem.currentStatus);
    const canUpdate = availableStatuses.length > 0;
    const isUnderReview = caseItem.currentStatus === 'Under Review';
    const statusIcon = getStatusIcon(caseItem.currentStatus);
    const statusColor = getStatusColor(caseItem.currentStatus);
    const cardGradient = getCardGradient(caseItem.currentStatus);

    return (
      <Card
        hoverable
        style={{
          borderRadius: 20,
          border: `1px solid ${statusColor === 'success' ? SUCCESS_COLOR : statusColor === 'error' ? ERROR_COLOR : '#e8e8e8'}`,
          borderTop: `5px solid ${statusColor === 'success' ? SUCCESS_COLOR : statusColor === 'error' ? ERROR_COLOR : THEME_COLOR}`,
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
          cursor: 'pointer',
          background: cardGradient,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
        bodyStyle={{ padding: 0 }}
        onClick={() => navigateToCaseDetail(caseItem)}
      >
        {/* Animated loader for Under Review status */}
        {isUnderReview && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${INFO_COLOR}, ${THEME_COLOR}, ${INFO_COLOR})`,
            animation: 'loadingProgress 2s ease-in-out infinite',
            zIndex: 10
          }} />
        )}

        <div style={{ padding: 24 }}>
          {/* Header Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar
                icon={isUnderReview ? <SyncOutlined spin /> : <UserOutlined />}
                style={{
                  backgroundColor: isUnderReview ? INFO_COLOR : THEME_COLOR,
                  boxShadow: `0 4px 12px ${isUnderReview ? INFO_COLOR : THEME_COLOR}30`
                }}
                size={52}
              />
              <div>
                <Text strong style={{ fontSize: 18, display: 'block', color: '#1e1b4b' }}>{clientName}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>Case: {caseItem.caseReference}</Text>
              </div>
            </div>
            <Tag
              icon={statusIcon}
              color={statusColor}
              style={{ padding: '6px 14px', borderRadius: 30, fontSize: 13, fontWeight: 600 }}
            >
              {caseItem.currentStatus}
              {isUnderReview && <LoadingOutlined style={{ marginLeft: 8 }} spin />}
            </Tag>
          </div>

          {/* Key Metrics Row */}
          <Row gutter={16} style={{ background: '#faf9fe', padding: '16px', borderRadius: 16, marginBottom: 20 }}>
            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HomeOutlined style={{ color: THEME_COLOR, fontSize: 18 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Property Value</Text>
                  <div style={{ fontWeight: 700, color: '#1e1b4b', fontSize: 16 }}>
                    AED {propertyValue.toLocaleString()}
                  </div>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarCircleOutlined style={{ color: SUCCESS_COLOR, fontSize: 18 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Loan Amount</Text>
                  <div style={{ fontWeight: 700, color: THEME_COLOR, fontSize: 16 }}>
                    AED {loanAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Bank & Rate Info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BankOutlined style={{ color: THEME_COLOR, fontSize: 18 }} />
              <Text strong style={{ fontSize: 14 }}>{bankName}</Text>
            </div>
            {caseItem.loanInfo?.interestRatePercentage && (
              <Tag color="purple" style={{ borderRadius: 30, padding: '4px 12px', fontWeight: 600 }}>
                {caseItem.loanInfo.interestRatePercentage}% Fixed
              </Tag>
            )}
            {caseItem.calculations?.dbr && (
              <Tag color="blue" style={{ borderRadius: 30 }}>
                DBR: {caseItem.calculations.dbr}%
              </Tag>
            )}
          </div>

          {/* Document Progress */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <FileTextOutlined /> Document Status
              </Text>
              <Text strong style={{ fontSize: 12 }}>{docProgress.uploaded}/{docProgress.total} uploaded</Text>
            </div>
            <Progress
              percent={docProgress.percentage}
              size="small"
              strokeColor={docProgress.percentage === 100 ? SUCCESS_COLOR : THEME_COLOR}
              showInfo={false}
              strokeWidth={8}
              style={{ borderRadius: 10 }}
            />
            {docProgress.verified === docProgress.total && docProgress.total > 0 && (
              <div style={{ marginTop: 6 }}>
                <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 11 }}>
                  All documents verified
                </Tag>
              </div>
            )}
          </div>

          {/* Metadata Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
            <span><CalendarOutlined /> Created {dayjs(caseItem.createdAt).format('MMM DD, YYYY')}</span>
            <span><UserOutlined /> {createdBy}</span>
            {caseItem.assignedTo?.opsName && (
              <span><TeamOutlined /> {caseItem.assignedTo.opsName}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            {canUpdate ? (
              <Tooltip title={`Move to: ${availableStatuses.join(' → ')}`}>
                <Button
                  type="primary"
                  block
                  icon={<RocketOutlined />}
                  onClick={(e) => openStatusModal(caseItem, e)}
                  style={{
                    background: THEME_COLOR,
                    borderColor: THEME_COLOR,
                    borderRadius: 12,
                    flex: 1,
                    height: 42,
                    fontWeight: 600
                  }}
                >
                  Update Status
                </Button>
              </Tooltip>
            ) : (
              <Button
                block
                disabled
                style={{ borderRadius: 12, flex: 1, height: 42 }}
                icon={<CloseCircleOutlined />}
              >
                Final Stage
              </Button>
            )}
            <Tooltip title="View Status Timeline">
              <Button
                icon={<HistoryOutlined />}
                onClick={(e) => viewStatusHistory(caseItem, e)}
                style={{ borderRadius: 12, width: 42, height: 42 }}
              />
            </Tooltip>
          </div>

          {/* Next Step Hint */}
          {canUpdate && availableStatuses.length > 0 && (
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                <ArrowRightOutlined /> Next: {availableStatuses[0]}
              </Text>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes loadingProgress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </Card>
    );
  };

  // Status Update Modal
  const renderStatusModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <EditOutlined style={{ color: THEME_COLOR, fontSize: 24 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Update Case Status</span>
        </div>
      }
      open={statusModalVisible}
      onCancel={() => { setStatusModalVisible(false); setSelectedCase(null); }}
      footer={[
        <Button key="cancel" onClick={() => { setStatusModalVisible(false); setSelectedCase(null); }} style={{ borderRadius: 10 }}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={updateCaseStatus}
          loading={updating}
          style={{ background: SUCCESS_COLOR, borderColor: SUCCESS_COLOR, borderRadius: 10 }}
          icon={<RocketOutlined />}
        >
          Update Status
        </Button>
      ]}
      width={600}
      centered
    >
      {selectedCase && (
        <div style={{ padding: '8px 0' }}>
          <Alert
            message={`Current: ${selectedCase.currentStatus}`}
            description={`Case ${selectedCase.caseReference} · ${selectedCase.clientInfo?.fullName}`}
            type="info"
            showIcon
            icon={getStatusIcon(selectedCase.currentStatus)}
            style={{ borderRadius: 16, marginBottom: 24 }}
          />

          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ fontSize: 15 }}>New Status <span style={{ color: 'red' }}>*</span></Text>
            <Select
              placeholder="Select next status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%', marginTop: 10 }}
              size="large"
              suffixIcon={<ArrowRightOutlined />}
            >
              {getAvailableNextStatuses(selectedCase.currentStatus).map(status => (
                <Option key={status} value={status}>
                  <Space>
                    {getStatusIcon(status)}
                    <span style={{ fontWeight: 500 }}>{status}</span>
                    <Tag color={getStatusColor(status)} style={{ borderRadius: 20 }}>{status}</Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ fontSize: 15 }}>Notes / Remarks</Text>
            <TextArea
              rows={4}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Add details about this update (e.g., approval amount, valuation date, etc.)"
              style={{ marginTop: 10, borderRadius: 12 }}
            />
          </div>

          {/* Conditional Tips */}
          {selectedStatus === 'Pre-Approved' && (
            <Alert
              message="💡 Pre-Approval Tip"
              description="Include the conditional approval amount and any bank conditions."
              type="warning"
              showIcon
              style={{ borderRadius: 12 }}
            />
          )}
          {selectedStatus === 'Disbursed' && (
            <Alert
              message="🎉 Disbursement Confirmation"
              description="Confirm loan amount, transfer date, and post-disbursement actions."
              type="success"
              showIcon
              style={{ borderRadius: 12 }}
            />
          )}
        </div>
      )}
    </Modal>
  );

  // Status History Modal
  const renderHistoryModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <HistoryOutlined style={{ color: THEME_COLOR, fontSize: 24 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Status Timeline</span>
        </div>
      }
      open={historyModalVisible}
      onCancel={() => setHistoryModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setHistoryModalVisible(false)} style={{ borderRadius: 10 }}>
          Close
        </Button>
      ]}
      width={700}
      centered
    >
      {selectedCase && (
        <div>
          <div style={{ marginBottom: 24, padding: 16, background: '#f5f0ff', borderRadius: 16 }}>
            <Text strong style={{ fontSize: 16 }}>{selectedCase.caseReference}</Text>
            <br />
            <Text type="secondary">{selectedCase.clientInfo?.fullName} · {selectedCase.loanInfo?.selectedBank || 'No bank'}</Text>
          </div>

          <Timeline
            items={statusHistory.map((item, idx) => ({
              dot: getStatusIcon(item.status),
              color: getStatusColor(item.status) === 'success' ? SUCCESS_COLOR :
                getStatusColor(item.status) === 'error' ? ERROR_COLOR : THEME_COLOR,
              children: (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <Tag color={getStatusColor(item.status)} icon={getStatusIcon(item.status)} style={{ borderRadius: 30, padding: '4px 14px' }}>
                      {item.status}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(item.timestamp).format('DD MMM YYYY, hh:mm A')}
                    </Text>
                  </div>
                  {item.notes && (
                    <div style={{ marginTop: 10, padding: 12, background: '#f9f9f9', borderRadius: 12 }}>
                      <Text style={{ fontSize: 13 }}>{item.notes}</Text>
                    </div>
                  )}
                  <div style={{ marginTop: 6 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Updated by: {item.updatedBy}</Text>
                  </div>
                </div>
              )
            }))}
          />
        </div>
      )}
    </Modal>
  );

  // Status Tabs with Counts - No stats cards, just tabs showing counts
  const renderStatusTabs = () => {
    const allStatuses = ['all', ...CASE_STATUSES];
    return (
      <div style={{ marginBottom: 32, overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 8 }}>
        <Space size={12} wrap>
          {allStatuses.map(status => {
            const count = getStatusCount(status);
            const isActive = activeTab === status;
            const displayName = status === 'all' ? 'All Cases' : status;
            const statusColorType = getStatusColor(status);
            
            return (
              <Button
                key={status}
                onClick={() => setActiveTab(status)}
                style={{
                  borderRadius: 40,
                  padding: '6px 24px',
                  height: 'auto',
                  background: isActive ? THEME_COLOR : 'white',
                  borderColor: isActive ? THEME_COLOR : '#e0e0e0',
                  color: isActive ? 'white' : '#4a5568',
                  fontWeight: 600,
                  boxShadow: isActive ? `0 4px 12px ${THEME_COLOR}40` : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {status !== 'all' && getStatusIcon(status)}
                <span style={{ marginLeft: status !== 'all' ? 8 : 0 }}>
                  {displayName}
                  {count > 0 && ` (${count})`}
                </span>
              </Button>
            );
          })}
        </Space>
      </div>
    );
  };

  const filteredCases = getFilteredCases();

  return (
    <div style={{ padding: '28px 32px', background: '#fdfbff', minHeight: '100vh' }}>

      {/* Header Section */}
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ color: '#1e1b4b', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Process & Update Cases
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          Manage mortgage case workflows, update statuses, and track progress
        </Text>
      </div>

      {/* Status Tabs with inline counts */}
      {renderStatusTabs()}

      {/* Cases Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" tip="Loading cases..." />
        </div>
      ) : filteredCases.length === 0 ? (
        <Empty
          description={
            <span>
              No cases found for <strong>{activeTab === 'all' ? 'any' : activeTab}</strong> status
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>Cases in draft are not shown here</Text>
            </span>
          }
          style={{ padding: '80px 0' }}
        />
      ) : (
        <>
          <Row gutter={[28, 28]}>
            {filteredCases.map(caseItem => (
              <Col xs={24} md={24} lg={24} xl={24} key={caseItem._id}>
                {renderCaseCard(caseItem)}
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalItems > 0 && (
            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination
                current={currentPage}
                total={totalItems}
                pageSize={12}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total) => `Total ${total} cases`}
              />
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {renderStatusModal()}
      {renderHistoryModal()}
    </div>
  );
};

export default ProcessCasesUpdates;