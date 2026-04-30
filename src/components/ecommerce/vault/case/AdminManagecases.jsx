import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import {
  Card, Button, Typography, Row, Col, Avatar,
  Tag, Divider, Spin, message, Badge,
  Space, Progress, Modal, Tooltip,
  Select, Input, Alert, Empty, Form, Dropdown, Menu
} from 'antd';
import {
  UserOutlined, BankOutlined, FileTextOutlined,
  CalendarOutlined, EyeOutlined, HomeOutlined,
  DollarCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, RocketOutlined,
  SendOutlined, TeamOutlined, EditOutlined,
  HistoryOutlined, FileDoneOutlined,
  LoadingOutlined, ArrowRightOutlined, SyncOutlined,
  WarningOutlined, UserAddOutlined, SwapOutlined,
  ApartmentOutlined, UserSwitchOutlined, TrophyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import CustomTable from '../../../../components/CMS/pages/custom/CustomTable';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const THEME_COLOR = "#5C039B";
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
  '15': "agency",        // Agency
  '16': "agent",         // Agent
  '17': "developer",
  '18': "vault-admin", //vault
  '22': "vaultagent",
  '21': "vaultpartner",
  '24': "GridAdvisor",
  // '23': "vault-advisor",
  // '26': "vault-ops",
  // '26': "vault-advisor",
  '23': "vault-ops",
  '25': "gridReferralPartner",
  '26': "vault-advisor",
  // '23': "vault-ops",
  
   
 


};
// ================= STATUS CONFIGURATION =================
const CASE_STATUSES = [
  'Draft',
  'Submitted to Xoto',
  'In Ops Queue - Pending Pick-up',
  'Assigned - Pending Review',
  'Under Review',
  'Returned - Pending Correction',
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

const getStatusIcon = (status) => {
  const iconMap = {
    'Draft': <EditOutlined style={{ color: '#9ca3af' }} />,
    'Submitted to Xoto': <SendOutlined style={{ color: THEME_COLOR }} />,
    'In Ops Queue - Pending Pick-up': <ClockCircleOutlined style={{ color: WARNING_COLOR }} />,
    'Assigned - Pending Review': <SyncOutlined spin style={{ color: INFO_COLOR }} />,
    'Under Review': <SyncOutlined spin style={{ color: INFO_COLOR }} />,
    'Returned - Pending Correction': <WarningOutlined style={{ color: ERROR_COLOR }} />,
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

const getStatusColor = (status) => {
  const colorMap = {
    'Draft': 'default',
    'Submitted to Xoto': 'processing',
    'In Ops Queue - Pending Pick-up': 'warning',
    'Assigned - Pending Review': 'processing',
    'Under Review': 'processing',
    'Returned - Pending Correction': 'error',
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

const getAvailableNextStatuses = (currentStatus) => {
  const transitions = {
    'Draft': ['Submitted to Xoto', 'Lost'],
    'Submitted to Xoto': ['In Ops Queue - Pending Pick-up', 'Lost'],
    'In Ops Queue - Pending Pick-up': ['Assigned - Pending Review', 'Lost'],
    'Assigned - Pending Review': ['Under Review', 'Returned - Pending Correction', 'Lost'],
    'Under Review': ['Bank Application', 'Collecting Documentation', 'Rejected'],
    'Returned - Pending Correction': ['Under Review', 'Lost'],
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


// Get creator info with proper labels
const getCreatorInfo = (caseItem) => {
  const createdBy = caseItem.createdBy;
  if (!createdBy) return { name: 'Unknown', type: 'Unknown', icon: <UserOutlined /> };
  
  if (createdBy.role === 'partner' && createdBy.partnerName) {
    return { 
      name: createdBy.partnerName, 
      type: 'Partner', 
      icon: <ApartmentOutlined />,
      subText: 'Partner Created',
      color: '#8b5cf6'
    };
  } else if (createdBy.role === 'advisor' && createdBy.advisorName) {
    return { 
      name: createdBy.advisorName, 
      type: 'Xoto Advisor', 
      icon: <UserSwitchOutlined />,
      subText: 'Advisor Created',
      color: THEME_COLOR
    };
  } else if (createdBy.role === 'admin' && createdBy.adminName) {
    return { 
      name: createdBy.adminName, 
      type: 'Admin', 
      icon: <TrophyOutlined />,
      subText: 'Admin Created',
      color: '#f59e0b'
    };
  }
  
  return { name: 'System', type: 'System', icon: <UserOutlined />, subText: 'Auto Created', color: '#9ca3af' };
};


const AdminManagecases = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "superadmin";

  // State
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeStatus, setActiveStatus] = useState('all');
  
  // Ops list state
  const [opsList, setOpsList] = useState([]);
  const [fetchingOps, setFetchingOps] = useState(false);

  // Modal state
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [assignOpsModalVisible, setAssignOpsModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [selectedOpsId, setSelectedOpsId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

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

  // Fetch Ops list
  const fetchOpsList = useCallback(async () => {
    setFetchingOps(true);
    try {
      const res = await apiService.get('/vault/ops/all?page=1&limit=1000&status=active');
      if (res?.success) {
        setOpsList(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch Ops list:", err);
    } finally {
      setFetchingOps(false);
    }
  }, []);

  useEffect(() => {
    fetchCases(currentPage);
    fetchOpsList();
  }, [currentPage, fetchCases, fetchOpsList]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const navigateToCaseDetail = (caseId) => {
    navigate(`/dashboard/${roleSlug}/case/view/${caseId}`);
  };

  // Open status update modal
  const openStatusModal = (caseItem, e) => {
    e?.stopPropagation();
    setSelectedCase(caseItem);
    setSelectedStatus('');
    setStatusNotes('');
    setStatusModalVisible(true);
  };

  // Open assign Ops modal
  const openAssignOpsModal = (caseItem, e) => {
    e?.stopPropagation();
    setSelectedCase(caseItem);
    setSelectedOpsId(caseItem.assignedTo?.opsId || '');
    setAssignOpsModalVisible(true);
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
        message.success(`Case status updated to "${selectedStatus}" successfully!`);
        setStatusModalVisible(false);
        fetchCases(currentPage);
      } else {
        message.error(response?.message || "Failed to update case status");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Error updating case status");
    } finally {
      setUpdating(false);
    }
  };

  // Assign case to Ops
  const assignToOps = async () => {
    if (!selectedOpsId) {
      message.warning("Please select an Ops member");
      return;
    }

    setAssignLoading(true);
    try {
      const response = await apiService.post('/vault/cases/ops/assign', {
        caseId: selectedCase._id,
        opsId: selectedOpsId
      });

      if (response?.success) {
        message.success(`Case assigned to Ops successfully!`);
        setAssignOpsModalVisible(false);
        fetchCases(currentPage);
      } else {
        message.error(response?.message || "Failed to assign case");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Error assigning case");
    } finally {
      setAssignLoading(false);
    }
  };

  // Get filtered cases by status
  const getFilteredCases = () => {
    if (activeStatus === 'all') return cases;
    return cases.filter(c => c.currentStatus === activeStatus);
  };

  // Get count for each status
  const getStatusCount = (status) => {
    if (status === 'all') return cases.length;
    return cases.filter(c => c.currentStatus === status).length;
  };

  // Get document progress
  const getDocumentProgress = (documentStatus) => {
    const total = documentStatus?.requiredDocuments?.length || 10;
    const uploaded = documentStatus?.documentsUploadedCount || 0;
    const percentage = total > 0 ? (uploaded / total) * 100 : 0;
    return { total, uploaded, percentage };
  };

  // Table Columns
  const columns = [
    {
      key: 'caseInfo',
      title: 'Case Info',
      width: 280,
      render: (_, record) => {
        const creator = getCreatorInfo(record);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              icon={creator.icon}
              style={{ backgroundColor: creator.color, flexShrink: 0 }}
              size={44}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1e1b4b' }}>
                {record.clientInfo?.fullName || 'Unknown'}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                {record.caseReference}
              </div>
              <div style={{ marginTop: 4 }}>
                <Tag icon={creator.icon} color="purple" style={{ fontSize: 10, margin: 0 }}>
                  {creator.type}: {creator.name}
                </Tag>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'property',
      title: 'Property & Loan',
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <HomeOutlined style={{ color: THEME_COLOR, fontSize: 12 }} />
            <Text strong style={{ fontSize: 13 }}>
              AED {record.propertyInfo?.propertyValue?.toLocaleString() || 0}
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <DollarCircleOutlined style={{ color: SUCCESS_COLOR, fontSize: 12 }} />
            <Text style={{ fontSize: 12, color: '#4b5563' }}>
              Loan: AED {record.calculations?.loanAmount?.toLocaleString() || 0}
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <BankOutlined style={{ color: INFO_COLOR, fontSize: 12 }} />
            <Text style={{ fontSize: 12, color: '#4b5563' }}>
              {record.loanInfo?.selectedBank || 'No Bank'}
            </Text>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      width: 200,
      render: (_, record) => (
        <div>
          <Tag
            icon={getStatusIcon(record.currentStatus)}
            color={getStatusColor(record.currentStatus)}
            style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}
          >
            {record.currentStatus}
          </Tag>
          {record.assignedTo?.opsName && (
            <div style={{ marginTop: 6 }}>
              <Tag icon={<TeamOutlined />} style={{ fontSize: 10 }}>
                Ops: {record.assignedTo.opsName}
              </Tag>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'documents',
      title: 'Documents',
      width: 180,
      render: (_, record) => {
        const progress = getDocumentProgress(record.documentStatus);
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Uploaded</Text>
              <Text strong style={{ fontSize: 11 }}>{progress.uploaded}/{progress.total}</Text>
            </div>
            <Progress
              percent={progress.percentage}
              size="small"
              strokeColor={progress.percentage === 100 ? SUCCESS_COLOR : THEME_COLOR}
              showInfo={false}
              strokeWidth={6}
            />
            {record.documentStatus?.allDocumentsVerified && (
              <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: 10, marginTop: 6 }}>
                All Verified
              </Tag>
            )}
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Created',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {dayjs(record.createdAt).format('DD MMM YYYY')}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
            {dayjs(record.createdAt).fromNow()}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 180,
      align: 'center',
      render: (_, record) => {
        const availableStatuses = getAvailableNextStatuses(record.currentStatus);
        const canUpdate = availableStatuses.length > 0;
        const isAssigned = !!record.assignedTo?.opsId;
        
        return (
          <Space size={8}>
            <Tooltip title="View Details">
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() => navigateToCaseDetail(record._id)}
                style={{ borderRadius: 8 }}
              />
            </Tooltip>
            
            <Tooltip title="Update Status">
              <Button
                type="primary"
                icon={<RocketOutlined />}
                onClick={(e) => openStatusModal(record, e)}
                disabled={!canUpdate}
                style={{ background: canUpdate ? THEME_COLOR : '#d1d5db', borderColor: canUpdate ? THEME_COLOR : '#d1d5db', borderRadius: 8 }}
              />
            </Tooltip>
            
            <Tooltip title={isAssigned ? "Reassign to Ops" : "Assign to Ops"}>
              <Button
                type="default"
                icon={<UserAddOutlined />}
                onClick={(e) => openAssignOpsModal(record, e)}
                style={{ borderColor: isAssigned ? SUCCESS_COLOR : THEME_COLOR, color: isAssigned ? SUCCESS_COLOR : THEME_COLOR, borderRadius: 8 }}
              />
            </Tooltip>
          </Space>
        );
      }
    }
  ];

  // Status Tabs
  const renderStatusTabs = () => {
    const allStatuses = ['all', ...CASE_STATUSES];
    return (
      <div style={{ marginBottom: 28, overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 8 }}>
        <Space size={10} wrap>
          {allStatuses.map(status => {
            const count = getStatusCount(status);
            const isActive = activeStatus === status;
            const displayName = status === 'all' ? 'All Cases' : status;
            
            return (
              <Button
                key={status}
                onClick={() => setActiveStatus(status)}
                style={{
                  borderRadius: 40,
                  padding: '6px 22px',
                  height: 'auto',
                  background: isActive ? THEME_COLOR : 'white',
                  borderColor: isActive ? THEME_COLOR : '#e5e7eb',
                  color: isActive ? 'white' : '#4b5563',
                  fontWeight: 600,
                  boxShadow: isActive ? `0 2px 8px ${THEME_COLOR}40` : 'none',
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

  // Stats Summary
  const renderStats = () => {
    const total = cases.length;
    const pendingQueue = cases.filter(c => c.currentStatus === 'In Ops Queue - Pending Pick-up').length;
    const inProgress = cases.filter(c => ['Assigned - Pending Review', 'Under Review', 'Bank Application'].includes(c.currentStatus)).length;
    const completed = cases.filter(c => c.currentStatus === 'Disbursed').length;
    
    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: `1px solid ${THEME_COLOR}20` }}>
            <Statistic title="Total Cases" value={total} prefix={<FileTextOutlined />} valueStyle={{ color: THEME_COLOR }} />
          </div>
        </Col>
        <Col span={6}>
          <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: `1px solid ${WARNING_COLOR}20` }}>
            <Statistic title="Pending Queue" value={pendingQueue} prefix={<ClockCircleOutlined />} valueStyle={{ color: WARNING_COLOR }} />
          </div>
        </Col>
        <Col span={6}>
          <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: `1px solid ${INFO_COLOR}20` }}>
            <Statistic title="In Progress" value={inProgress} prefix={<SyncOutlined spin />} valueStyle={{ color: INFO_COLOR }} />
          </div>
        </Col>
        <Col span={6}>
          <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: `1px solid ${SUCCESS_COLOR}20` }}>
            <Statistic title="Completed" value={completed} prefix={<CheckCircleOutlined />} valueStyle={{ color: SUCCESS_COLOR }} />
          </div>
        </Col>
      </Row>
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
        <Button key="cancel" onClick={() => { setStatusModalVisible(false); setSelectedCase(null); }}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={updateCaseStatus}
          loading={updating}
          style={{ background: SUCCESS_COLOR, borderColor: SUCCESS_COLOR }}
          icon={<RocketOutlined />}
        >
          Update Status
        </Button>
      ]}
      width={600}
      centered
    >
      {selectedCase && (
        <div>
          <Alert
            message={`Current: ${selectedCase.currentStatus}`}
            description={`Case ${selectedCase.caseReference} · ${selectedCase.clientInfo?.fullName}`}
            type="info"
            showIcon
            icon={getStatusIcon(selectedCase.currentStatus)}
            style={{ borderRadius: 12, marginBottom: 24 }}
          />

          <div style={{ marginBottom: 24 }}>
            <Text strong>New Status <span style={{ color: 'red' }}>*</span></Text>
            <Select
              placeholder="Select next status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%', marginTop: 8 }}
              size="large"
            >
              {getAvailableNextStatuses(selectedCase.currentStatus).map(status => (
                <Option key={status} value={status}>
                  <Space>
                    {getStatusIcon(status)}
                    <span>{status}</span>
                    <Tag color={getStatusColor(status)}>{status}</Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text strong>Notes / Remarks</Text>
            <TextArea
              rows={4}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Add details about this update..."
              style={{ marginTop: 8 }}
            />
          </div>
        </div>
      )}
    </Modal>
  );

  // Assign Ops Modal
  const renderAssignOpsModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <UserAddOutlined style={{ color: THEME_COLOR, fontSize: 24 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Assign to Mortgage Ops</span>
        </div>
      }
      open={assignOpsModalVisible}
      onCancel={() => { setAssignOpsModalVisible(false); setSelectedCase(null); setSelectedOpsId(''); }}
      footer={[
        <Button key="cancel" onClick={() => { setAssignOpsModalVisible(false); setSelectedCase(null); setSelectedOpsId(''); }}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={assignToOps}
          loading={assignLoading}
          style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}
          icon={<SwapOutlined />}
        >
          Assign Case
        </Button>
      ]}
      width={600}
      centered
    >
      {selectedCase && (
        <div>
          <Alert
            message={`Case: ${selectedCase.caseReference}`}
            description={`Client: ${selectedCase.clientInfo?.fullName} | Current Status: ${selectedCase.currentStatus}`}
            type="info"
            showIcon
            style={{ borderRadius: 12, marginBottom: 24 }}
          />
          
          {selectedCase.assignedTo?.opsName && (
            <div style={{ marginBottom: 16, padding: 12, background: '#fef3c7', borderRadius: 12 }}>
              <Text>Currently assigned to: <strong>{selectedCase.assignedTo.opsName}</strong></Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>Reassigning will update workload automatically</Text>
            </div>
          )}

          <div>
            <Text strong>Select Ops Member <span style={{ color: 'red' }}>*</span></Text>
            <Select
              placeholder="Choose Ops team member"
              value={selectedOpsId || undefined}
              onChange={setSelectedOpsId}
              style={{ width: '100%', marginTop: 8 }}
              size="large"
              loading={fetchingOps}
              showSearch
              optionFilterProp="children"
            >
              {opsList.map(ops => {
                const fullName = `${ops.name?.first_name || ''} ${ops.name?.last_name || ''}`.trim();
                const workload = ops.workload?.currentApplications || 0;
                const capacity = ops.workload?.maxCapacity || 30;
                const isFull = workload >= capacity;
                
                return (
                  <Option key={ops._id} value={ops._id} disabled={isFull}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <Avatar size={24} icon={<UserOutlined />} />
                        <span><strong>{fullName || ops.email}</strong></span>
                        <Tag color="blue" style={{ fontSize: 10 }}>{ops.designation || 'Ops Executive'}</Tag>
                      </Space>
                      <Space>
                        <Badge count={workload} overflowCount={99} style={{ backgroundColor: workload > capacity * 0.8 ? ERROR_COLOR : SUCCESS_COLOR }} />
                        <Text type="secondary" style={{ fontSize: 11 }}>/ {capacity}</Text>
                        {isFull && <Tag color="error" style={{ fontSize: 10 }}>Full</Tag>}
                      </Space>
                    </div>
                  </Option>
                );
              })}
            </Select>
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
              * Assigned Ops will be notified and workload will be updated automatically
            </Text>
          </div>
        </div>
      )}
    </Modal>
  );

  const filteredCases = getFilteredCases();

  return (
    <div style={{ padding: '28px 32px', background: '#fdfbff', minHeight: '100vh' }}>
      <style>{`
        .case-table .ant-table-thead > tr > th {
          background: #faf5ff !important;
          color: ${THEME_COLOR} !important;
          font-weight: 700 !important;
          border-bottom: 2px solid #e9d5ff !important;
        }
        .case-table .ant-table-tbody > tr:hover > td {
          background: #faf5ff !important;
        }
        .case-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3e8ff;
        }
        .case-table .ant-pagination-item-active {
          border-color: ${THEME_COLOR} !important;
          background: ${THEME_COLOR} !important;
        }
        .case-table .ant-pagination-item-active a {
          color: white !important;
        }
      `}</style>

      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#1e1b4b', margin: 0, fontWeight: 800 }}>
          Case Management
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Manage mortgage cases, track progress, update statuses, and assign to Ops team
        </Text>
      </div>

      {/* Stats Cards */}
      {renderStats()}

      {/* Status Tabs */}
      {renderStatusTabs()}

      {/* Cases Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" tip="Loading cases..." />
        </div>
      ) : filteredCases.length === 0 ? (
        <Empty
          description={
            <span>
              No cases found for <strong>{activeStatus === 'all' ? 'any' : activeStatus}</strong> status
            </span>
          }
          style={{ padding: '60px 0' }}
        />
      ) : (
        <div className="case-table">
          <CustomTable
            columns={columns}
            data={filteredCases}
            loading={loading}
            totalItems={totalItems}
            currentPage={currentPage}
            itemsPerPage={12}
            onPageChange={handlePageChange}
            showSearch={true}
            searchPlaceholder="Search by client name, case reference, or email..."
            onSearch={(value, record) => {
              const searchTerm = value.toLowerCase();
              return (
                record.clientInfo?.fullName?.toLowerCase().includes(searchTerm) ||
                record.caseReference?.toLowerCase().includes(searchTerm) ||
                record.clientInfo?.email?.toLowerCase().includes(searchTerm)
              );
            }}
          />
        </div>
      )}

      {/* Modals */}
      {renderStatusModal()}
      {renderAssignOpsModal()}
    </div>
  );
};

// Statistic Component
const Statistic = ({ title, value, prefix, valueStyle }) => (
  <div>
    <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
    <div style={{ fontSize: 28, fontWeight: 700, ...valueStyle, marginTop: 4 }}>
      {prefix && <span style={{ marginRight: 6 }}>{prefix}</span>}
      {value}
    </div>
  </div>
);

export default AdminManagecases;