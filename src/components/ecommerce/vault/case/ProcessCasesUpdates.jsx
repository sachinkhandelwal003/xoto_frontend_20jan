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
  LoadingOutlined, PlusOutlined, ArrowRightOutlined
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

// Case statuses for tabs - EXCLUDING DRAFT
const CASE_STATUSES = [
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

// Status color mapping
const getStatusColor = (status) => {
  const colorMap = {
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

// Status icons
const getStatusIcon = (status) => {
  const iconMap = {
    'Submitted to Xoto': <SendOutlined />,
    'Bank Application': <BankOutlined />,
    'Collecting Documentation': <FileTextOutlined />,
    'Pre-Approved': <CheckCircleOutlined />,
    'Valuation': <EyeOutlined />,
    'FOL Processed': <FileDoneOutlined />,
    'FOL Issued': <FileTextOutlined />,
    'FOL Signed': <CheckCircleOutlined />,
    'Disbursed': <DollarCircleOutlined />,
    'Rejected': <CloseCircleOutlined />,
    'Lost': <CloseCircleOutlined />
  };
  return iconMap[status] || <ClockCircleOutlined />;
};

// Available statuses for update (based on current status)
const getAvailableNextStatuses = (currentStatus) => {
  const transitions = {
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
  const [activeTab, setActiveTab] = useState('Submitted to Xoto');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal state
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusHistory, setStatusHistory] = useState([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // Fetch cases
  const fetchCases = useCallback(async (page, status) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/vault/cases?page=${page}&limit=12&status=${status}`);
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
    fetchCases(currentPage, activeTab);
  }, [currentPage, activeTab, fetchCases]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

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
        fetchCases(currentPage, activeTab);
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

  // View status history
  const viewStatusHistory = (caseItem, e) => {
    e.stopPropagation();
    // Mock history - replace with actual API call
    const mockHistory = [
      { status: caseItem.currentStatus, notes: "Current status", timestamp: caseItem.updatedAt, updatedBy: "System" },
      { status: "Submitted to Xoto", notes: "Case submitted to Xoto team", timestamp: caseItem.createdAt, updatedBy: caseItem.createdBy?.adminName || caseItem.createdBy?.partnerName }
    ];
    setStatusHistory(mockHistory);
    setHistoryModalVisible(true);
  };

  // Get document progress
  const getDocumentProgress = (documentStatus) => {
    const total = documentStatus?.requiredDocuments?.length || 10;
    const uploaded = documentStatus?.documentsUploadedCount || 0;
    const verified = documentStatus?.documentsVerifiedCount || 0;
    const percentage = total > 0 ? (uploaded / total) * 100 : 0;
    return { total, uploaded, verified, percentage };
  };

  // Render case card
  const renderCaseCard = (caseItem) => {
    const clientName = caseItem.clientInfo?.fullName || 'Unknown Client';
    const propertyValue = caseItem.propertyInfo?.propertyValue || 0;
    const loanAmount = caseItem.propertyInfo?.loanAmount || caseItem.loanInfo?.requestedAmount || 0;
    const bankName = caseItem.loanInfo?.selectedBank || 'Not Selected';
    const docProgress = getDocumentProgress(caseItem.documentStatus);
    const createdBy = caseItem.createdBy?.role === 'admin' ? 'Admin' : caseItem.createdBy?.partnerName || 'Partner';
    const availableStatuses = getAvailableNextStatuses(caseItem.currentStatus);
    const canUpdate = availableStatuses.length > 0;

    return (
      <Card 
        hoverable
        style={{ 
          borderRadius: 16, 
          border: `1px solid ${getStatusColor(caseItem.currentStatus) === 'success' ? SUCCESS_COLOR : getStatusColor(caseItem.currentStatus) === 'error' ? ERROR_COLOR : '#e8e8e8'}`,
          borderTop: `4px solid ${getStatusColor(caseItem.currentStatus) === 'success' ? SUCCESS_COLOR : getStatusColor(caseItem.currentStatus) === 'error' ? ERROR_COLOR : THEME_COLOR}`,
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
          cursor: 'pointer'
        }}
        bodyStyle={{ padding: 0 }}
        onClick={() => navigateToCaseDetail(caseItem)}
      >
        <div style={{ padding: 20 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: THEME_COLOR }} size="large" />
              <div>
                <Text strong style={{ fontSize: 16, display: 'block' }}>{clientName}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>Case: {caseItem.caseReference}</Text>
              </div>
            </div>
            <Tag color={getStatusColor(caseItem.currentStatus)} icon={getStatusIcon(caseItem.currentStatus)}>
              {caseItem.currentStatus}
            </Tag>
          </div>

          {/* Key Metrics */}
          <Row gutter={12} style={{ background: '#f9f9f9', padding: '12px', borderRadius: 8, marginBottom: 16 }}>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11 }}>Property Value</Text>
              <div style={{ fontWeight: 'bold', color: '#1e1b4b' }}>
                AED {propertyValue.toLocaleString()}
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11 }}>Loan Amount</Text>
              <div style={{ fontWeight: 'bold', color: THEME_COLOR }}>
                AED {loanAmount.toLocaleString()}
              </div>
            </Col>
          </Row>

          {/* Bank Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <BankOutlined style={{ color: THEME_COLOR }} />
            <Text strong style={{ fontSize: 13 }}>{bankName}</Text>
            {caseItem.loanInfo?.interestRatePercentage && (
              <Tag color="purple" style={{ marginLeft: 'auto' }}>
                {caseItem.loanInfo.interestRatePercentage}%
              </Tag>
            )}
          </div>

          {/* Document Progress */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Documents</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>{docProgress.uploaded}/{docProgress.total}</Text>
            </div>
            <Progress 
              percent={docProgress.percentage} 
              size="small" 
              strokeColor={docProgress.percentage === 100 ? SUCCESS_COLOR : THEME_COLOR}
              showInfo={false}
            />
          </div>

          {/* Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#888', marginBottom: 16 }}>
            <span><CalendarOutlined /> {dayjs(caseItem.createdAt).format('MMM DD, YYYY')}</span>
            <span><UserOutlined /> {createdBy}</span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {canUpdate && (
              <Tooltip title={`Update to next status (${availableStatuses.join(', ')})`}>
                <Button 
                  type="primary"
                  block
                  icon={<EditOutlined />}
                  onClick={(e) => openStatusModal(caseItem, e)}
                  style={{ 
                    background: THEME_COLOR, 
                    borderColor: THEME_COLOR, 
                    borderRadius: 8,
                    flex: 1
                  }}
                >
                  Update Status
                </Button>
              </Tooltip>
            )}
            <Tooltip title="View Status History">
              <Button 
                icon={<HistoryOutlined />}
                onClick={(e) => viewStatusHistory(caseItem, e)}
                style={{ borderRadius: 8 }}
              >
                History
              </Button>
            </Tooltip>
          </div>

          {/* Status badge for next action */}
          {canUpdate && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                <ArrowRightOutlined /> Next: {availableStatuses.join(' → ')}
              </Text>
            </div>
          )}
        </div>
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
        <Button key="cancel" onClick={() => { setStatusModalVisible(false); setSelectedCase(null); }} style={{ borderRadius: 8 }}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={updateCaseStatus}
          loading={updating}
          style={{ background: SUCCESS_COLOR, borderColor: SUCCESS_COLOR, borderRadius: 8 }}
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
            message={`Current Status: ${selectedCase.currentStatus}`}
            description={`Case: ${selectedCase.caseReference} - ${selectedCase.clientInfo?.fullName}`}
            type="info"
            showIcon
            style={{ borderRadius: 12, marginBottom: 20 }}
          />
          
          <div style={{ marginBottom: 20 }}>
            <Text strong>New Status <span style={{ color: 'red' }}>*</span></Text>
            <Select
              placeholder="Select new status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%', marginTop: 8 }}
              size="large"
            >
              {getAvailableNextStatuses(selectedCase.currentStatus).map(status => (
                <Option key={status} value={status}>
                  <Space>
                    {getStatusIcon(status)}
                    {status}
                    <Tag color={getStatusColor(status)} style={{ marginLeft: 8 }}>{status}</Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <Text strong>Notes / Remarks</Text>
            <TextArea
              rows={4}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Add notes about this status update (e.g., approval amount, valuation date, etc.)"
              style={{ marginTop: 8, borderRadius: 8 }}
            />
          </div>

          {selectedStatus === 'Pre-Approved' && (
            <Alert
              message="Pre-Approval Notes"
              description="Include the conditional approval amount and any conditions from the bank."
              type="warning"
              showIcon
              style={{ borderRadius: 12, marginBottom: 16 }}
            />
          )}

          {selectedStatus === 'Valuation' && (
            <Alert
              message="Valuation Details"
              description="Add valuation date, property access instructions, and valuation company details."
              type="warning"
              showIcon
              style={{ borderRadius: 12, marginBottom: 16 }}
            />
          )}

          {selectedStatus === 'Disbursed' && (
            <Alert
              message="Disbursement Confirmation"
              description="Confirm loan amount disbursed, date of transfer, and any post-disbursement requirements."
              type="success"
              showIcon
              style={{ borderRadius: 12, marginBottom: 16 }}
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
          <span style={{ fontSize: 18, fontWeight: 600 }}>Case Status History</span>
        </div>
      }
      open={historyModalVisible}
      onCancel={() => setHistoryModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setHistoryModalVisible(false)} style={{ borderRadius: 8 }}>
          Close
        </Button>
      ]}
      width={650}
      centered
    >
      {selectedCase && (
        <div>
          <div style={{ marginBottom: 20, padding: 16, background: '#f8f5ff', borderRadius: 12 }}>
            <Text strong>Case: {selectedCase.caseReference}</Text>
            <br />
            <Text type="secondary">{selectedCase.clientInfo?.fullName}</Text>
          </div>
          
          <Timeline
            items={statusHistory.map((item, index) => ({
              dot: getStatusIcon(item.status),
              color: getStatusColor(item.status) === 'success' ? SUCCESS_COLOR : 
                     getStatusColor(item.status) === 'error' ? ERROR_COLOR : THEME_COLOR,
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <Tag color={getStatusColor(item.status)} icon={getStatusIcon(item.status)}>
                      {item.status}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(item.timestamp).format('DD MMM YYYY, hh:mm A')}
                    </Text>
                  </div>
                  {item.notes && (
                    <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 8 }}>
                      <Text style={{ fontSize: 13 }}>{item.notes}</Text>
                    </div>
                  )}
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>By: {item.updatedBy}</Text>
                  </div>
                </div>
              )
            }))}
          />
        </div>
      )}
    </Modal>
  );

  // Summary Cards for stats
  const renderSummaryCards = () => {
    const stats = {
      total: cases.length,
      preApproved: cases.filter(c => c.currentStatus === 'Pre-Approved').length,
      valuation: cases.filter(c => c.currentStatus === 'Valuation').length,
      disbursed: cases.filter(c => c.currentStatus === 'Disbursed').length,
    };

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, background: `linear-gradient(135deg, ${THEME_COLOR}10 0%, #fff 100%)` }}>
            <Statistic title="Active Cases" value={stats.total} prefix={<FileTextOutlined />} valueStyle={{ color: THEME_COLOR }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fef3c7 0%, #fff 100%)' }}>
            <Statistic title="Pre-Approved" value={stats.preApproved} prefix={<CheckCircleOutlined />} valueStyle={{ color: WARNING_COLOR }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #dbeafe 0%, #fff 100%)' }}>
            <Statistic title="Valuation Stage" value={stats.valuation} prefix={<EyeOutlined />} valueStyle={{ color: '#3b82f6' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #d1fae5 0%, #fff 100%)' }}>
            <Statistic title="Disbursed" value={stats.disbursed} prefix={<DollarCircleOutlined />} valueStyle={{ color: SUCCESS_COLOR }} />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ padding: '24px', background: '#fdfbff', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ color: '#1e1b4b', margin: 0, fontWeight: 800 }}>Process & Update Cases</Title>
        <Text type="secondary">Manage and update case statuses for active mortgage applications (excluding Draft cases).</Text>
      </div>

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Tabs - Excluding Draft */}
      <Card style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 24 }} bodyStyle={{ padding: '16px 24px' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange} 
          tabBarGutter={16}
          items={CASE_STATUSES.map(status => ({
            label: (
              <span style={{ fontSize: 14, fontWeight: activeTab === status ? 600 : 400 }}>
                {getStatusIcon(status)} {status}
                {cases.filter(c => c.currentStatus === status).length > 0 && (
                  <Badge count={cases.filter(c => c.currentStatus === status).length} style={{ marginLeft: 8, backgroundColor: THEME_COLOR }} />
                )}
              </span>
            ),
            key: status
          }))}
        />
      </Card>

      {/* Cases Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : cases.length === 0 ? (
        <Empty
          description={
            <span>
              No cases found for status: <strong>{activeTab}</strong>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>Cases in Draft status are managed in the "Create Case" section.</Text>
            </span>
          }
          style={{ padding: '60px 0' }}
        />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {cases.map(caseItem => (
              <Col xs={24} md={24} lg={24} xl={24} key={caseItem._id}>
                {renderCaseCard(caseItem)}
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalItems > 0 && (
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end' }}>
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