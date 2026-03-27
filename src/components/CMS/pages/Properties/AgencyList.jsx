import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Typography,
  Avatar,
  Space,
  message,
  Tooltip,
  Modal,
  Button,
  Popconfirm,
  Tag,
  Input,
  Drawer,
  Divider,
  Dropdown,
  Segmented
} from "antd";
import {
  ApartmentOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  MoreOutlined,
  TeamOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { FiEye, FiSearch, FiRefreshCw } from "react-icons/fi";

// Assuming CustomTable is in this path based on your snippet
import CustomTable from '../../pages/custom/CustomTable';
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

const THEME = {
  primary: "#5c039b",
  success: "#10b981",
  error: "#ef4444",
  warning: "#d97706"
};

const AgencyList = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("registered"); // 'registered' = pending
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [agencyDetails, setAgencyDetails] = useState(null);
  const [viewDetailsLoading, setViewDetailsLoading] = useState(false);

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedAgencyForReject, setSelectedAgencyForReject] = useState(null);

  const searchTimeout = useRef(null);

  // FETCH AGENCIES
  const fetchAgencies = useCallback(async (page = 1, limit = 10, searchVal = "", status = activeTab) => {
    setLoading(true);
    try {
      let url = `/agency/get-all-agencies?page=${page}&limit=${limit}&onboarding_status=${status}`;
      if (searchVal?.trim()) {
        url += `&search=${searchVal.trim()}`;
      }
      
      const res = await apiService.get(url);
      const responseData = res?.data || res;
      
      if (responseData) {
        // Map data to include standard table keys
        const mappedData = (responseData.data || responseData).map((a, i) => ({
          ...a,
          key: a._id,
          sno: (page - 1) * limit + i + 1,
        }));
        
        setAgencies(mappedData);
        setPagination({
          currentPage: responseData.pagination?.currentPage || page,
          totalPages: responseData.pagination?.totalPages || 1,
          totalResults: responseData.pagination?.totalItems || mappedData.length,
          itemsPerPage: responseData.pagination?.limit || limit,
        });
      } else {
        setAgencies([]);
      }
    } catch (err) {
      message.error("Failed to fetch agencies.");
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAgencies(1, pagination.itemsPerPage, search, activeTab);
  }, [activeTab, fetchAgencies]);

  // SEARCH HANDLER
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchAgencies(1, pagination.itemsPerPage, val, activeTab);
    }, 500);
  };

  const handleClearSearch = () => {
    setSearch("");
    fetchAgencies(1, pagination.itemsPerPage, "", activeTab);
  };

  // ACTIONS LOGIC
  const updateStatus = async (record, status) => {
    const id = record?._id;
    if (!id) return;

    try {
      if (status === "approved") {
        await apiService.put(`/agency/approve-agency/${id}`);
        message.success(`Agency approved successfully.`);
      } else if (status === "rejected") {
        setSelectedAgencyForReject(record);
        setRejectModalVisible(true);
        return;
      }
      fetchAgencies(pagination.currentPage, pagination.itemsPerPage, search, activeTab);
    } catch (err) {
      message.error("Status update failed.");
    }
  };

  const handleRejectAgency = async () => {
    if (!rejectReason.trim()) {
      message.error("Please provide a rejection reason.");
      return;
    }
    
    try {
      await apiService.put(`/agency/reject-agency/${selectedAgencyForReject._id}`, {
        rejection_reason: rejectReason
      });
      message.success("Agency rejected successfully.");
      setRejectModalVisible(false);
      setRejectReason("");
      setSelectedAgencyForReject(null);
      fetchAgencies(pagination.currentPage, pagination.itemsPerPage, search, activeTab);
    } catch (err) {
      message.error("Failed to reject agency.");
    }
  };

  const toggleActiveStatus = async (record, checked) => {
    const id = record?._id;
    if (!id) return;

    try {
      await apiService.put(`/agency/update/${id}`, {
        is_active: checked
      });
      message.success(`Agency ${checked ? "Activated" : "Suspended"} successfully.`);
      
      // Update local state to reflect UI instantly
      setAgencies((prev) => prev.map((a) => a._id === id ? { ...a, is_active: checked } : a));
      if (agencyDetails?._id === id) {
        setAgencyDetails((prev) => ({ ...prev, is_active: checked }));
      }
    } catch (err) {
      message.error("Failed to update active status.");
    }
  };

  // OPEN DRAWER & FETCH DETAILS
  const openViewDrawer = async (record) => {
    setDrawerOpen(true);
    setViewDetailsLoading(true);
    setSelectedAgency(record);
    setAgencyDetails(record); // Set basic details first
    
    try {
      const res = await apiService.get(`/agency/get-agency-details/${record._id}`);
      const responseData = res?.data || res;
      
      if (responseData?.success || responseData) {
        setAgencyDetails(responseData.data || responseData);
      }
    } catch (err) {
      message.error("Failed to fetch full agency details.");
    } finally {
      setViewDetailsLoading(false);
    }
  };

  const getDropdownItems = (record) => {
    const items = [
      {
        key: 'view',
        icon: <FiEye style={{ color: THEME.primary, fontSize: 16 }} />,
        label: 'View Details',
        onClick: () => openViewDrawer(record),
      },
      {
        type: 'divider',
      }
    ];

    if (record.onboarding_status !== 'approved') {
      items.push({
        key: 'approve',
        icon: <CheckCircleOutlined style={{ color: THEME.success }} />,
        label: 'Approve Agency',
        onClick: () => updateStatus(record, 'approved'),
      });
    }

    if (record.onboarding_status !== 'rejected') {
      items.push({
        key: 'reject',
        icon: <CloseCircleOutlined style={{ color: THEME.error }} />,
        label: 'Reject Agency',
        danger: true,
        onClick: () => updateStatus(record, 'rejected'),
      });
    }

    items.push({
        type: 'divider',
    });

    // items.push({
    //   key: 'toggle',
    //   icon: record.is_active ? <StopOutlined style={{ color: THEME.error }} /> : <CheckCircleOutlined style={{ color: THEME.success }} />,
    //   label: record.is_active ? 'Suspend Access' : 'Activate Access',
    //   danger: record.is_active,
    //   onClick: () => toggleActiveStatus(record, !record.is_active),
    // });

    return items;
  };

  // TABLE COLUMNS
  const columns = [
  
    {
      title: "Agency Name",
      width: 280,
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={45}
            icon={<ApartmentOutlined />}
            src={r.profile_photo || r.logo}
            style={{ background: `${THEME.primary}20`, color: THEME.primary, fontWeight: 'bold' }}
          >
            {r.agency_name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <div className="font-bold text-gray-800" style={{ fontSize: "14px" }}>
              {r.agency_name || "Unnamed Agency"}
            </div>
            <div className="text-xs text-gray-400">
              <MailOutlined /> {r.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      width: 180,
      render: (_, r) => (
        <div className="text-sm">
          <PhoneOutlined /> {r.country_code} {r.mobile_number}
        </div>
      ),
    },
    
    {
      title: "Status",
      width: 130,
      render: (_, r) => {
        if (r.onboarding_status === 'approved') return <Tag color="success">Approved</Tag>;
        if (r.onboarding_status === 'rejected') return <Tag color="error">Rejected</Tag>;
        return <Tag color="warning">Pending</Tag>;
      },
    },
   
    {
      title: "Actions",
      fixed: "right",
      width: 80,
      align: 'center',
      render: (_, r) => (
        <Dropdown menu={{ items: getDropdownItems(r) }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: '20px' }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Agency Management</Title>
          <Text type="secondary">Review and manage white-label agencies.</Text>
        </div>
      </div>

      {/* TABLE CARD */}
      <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        
        {/* SEGMENTED TABS & SEARCH */}
        <div className="flex flex-wrap items-center justify-between px-4 py-4 border-b border-gray-100 gap-4">
          
          <Segmented
            options={[
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
            ]}
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val);
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
            className="custom-segmented-theme"
            size="large"
          />

          <div className="flex gap-3">
            <Input
              placeholder="Search agencies..."
              prefix={<FiSearch className="text-gray-400" />}
              value={search}
              onChange={handleSearch}
              allowClear
              onClear={handleClearSearch}
              style={{ width: 300, borderRadius: 8 }}
            />
            <Button
              icon={<FiRefreshCw />}
              onClick={() => fetchAgencies(pagination.currentPage, pagination.itemsPerPage, search, activeTab)}
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="bg-white">
          <CustomTable
            columns={columns}
            data={agencies}
            loading={loading}
            totalItems={pagination.totalResults}
            currentPage={pagination.currentPage}
            onPageChange={(page, limit) => fetchAgencies(page, limit, search, activeTab)}
            scroll={{ x: 1000 }}
            showSearch={false}
          />
        </div>
      </Card>

      {/* RICH DRAWER VIEW */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
        title={null}
        bodyStyle={{ padding: 0 }}
      >
        {agencyDetails && (
          <div>
            {/* Purple banner */}
            <div style={{
              background: `linear-gradient(135deg, ${THEME.primary}, #9b59b6)`,
              padding: "32px 24px 60px",
            }}>
              <div className="flex flex-col items-center">
                <Avatar
                  size={80}
                  icon={<ApartmentOutlined />}
                  src={agencyDetails.profile_photo || agencyDetails.logo}
                  style={{ border: "3px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", color: THEME.primary, background: "#fff", fontSize: "30px", fontWeight: "bold" }}
                >
                  {agencyDetails.agency_name?.charAt(0)?.toUpperCase()}
                </Avatar>
              </div>
            </div>

            {/* Floating name card */}
            <div style={{ padding: "0 24px", marginTop: -30 }}>
              <Card
                bordered={false}
                bodyStyle={{ padding: "16px 20px", textAlign: "center" }}
                style={{ borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              >
                <Title level={4} style={{ margin: 0 }}>{agencyDetails.agency_name || "Unnamed Agency"}</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>{agencyDetails.email}</Text>
                
                <div className="mt-2 flex justify-center gap-2">
                  <Tag color={
                    agencyDetails.onboarding_status === 'approved' ? 'green' : 
                    agencyDetails.onboarding_status === 'rejected' ? 'red' : 'orange'
                  }>
                    {agencyDetails.onboarding_status?.toUpperCase()}
                  </Tag>
                  {agencyDetails.is_active
                    ? <Tag color="blue" icon={<CheckCircleOutlined />}>System Active</Tag>
                    : <Tag color="default" icon={<StopOutlined />}>System Suspended</Tag>
                  }
                </div>
              </Card>
            </div>

            {/* Detail rows */}
            <div style={{ padding: "20px 24px" }}>
              <Text className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                Agency Details
              </Text>
              
              <div className="mt-3 space-y-4">
                {[
                  { icon: <MailOutlined />, label: "Email", value: agencyDetails.email || "—" },
                  { icon: <PhoneOutlined />, label: "Phone", value: `${agencyDetails.country_code || ''} ${agencyDetails.mobile_number || ''}` },
                  { icon: <EnvironmentOutlined />, label: "Location", value: agencyDetails.city ? `${agencyDetails.city}, ${agencyDetails.address || ''}` : "—" },
                  { icon: <DollarOutlined />, label: "Subscription", value: agencyDetails.subscription_status === "Pro" ? "Pro Plan" : "Free Plan" },
                  { icon: <TeamOutlined />, label: "Total Agents", value: agencyDetails.totalAgents || 0 },
                  { icon: <CheckCircleOutlined />, label: "Total Deals", value: agencyDetails.totalDeals || 0 },
                  { icon: <FileTextOutlined />, label: "Commission Earned", value: `$${agencyDetails.totalCommission_earned || 0}` },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: `${THEME.primary}12`, color: THEME.primary,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, fontSize: 15,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="text-sm font-medium text-gray-800">{item.value}</div>
                    </div>
                  </div>
                ))}

                {/* Documents Section */}
                {(agencyDetails.trade_license || agencyDetails.letter_of_authority || agencyDetails.rera_license) && (
                  <>
                    <Divider style={{ margin: '16px 0' }} />
                    <Text className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                      Legal Documents
                    </Text>
                    
                    {agencyDetails.trade_license && (
                       <div className="mt-2 text-sm"><a href={agencyDetails.trade_license} target="_blank" rel="noreferrer" style={{color: THEME.primary}}>View Trade License</a></div>
                    )}
                    {agencyDetails.letter_of_authority && (
                       <div className="mt-2 text-sm"><a href={agencyDetails.letter_of_authority} target="_blank" rel="noreferrer" style={{color: THEME.primary}}>View Letter of Authority</a></div>
                    )}
                    {agencyDetails.rera_license && (
                       <div className="mt-2 text-sm"><a href={agencyDetails.rera_license} target="_blank" rel="noreferrer" style={{color: THEME.primary}}>View RERA License</a></div>
                    )}
                  </>
                )}
                
                {/* Rejection Note */}
                {agencyDetails.rejection_reason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <Text strong type="danger">Rejection Reason:</Text>
                    <div className="text-sm text-red-600 mt-1">{agencyDetails.rejection_reason}</div>
                  </div>
                )}
              </div>

              <Divider />

              {/* Action Buttons */}
              <Space direction="vertical" style={{ width: '100%' }}>
                {agencyDetails.onboarding_status !== 'approved' && (
                  <Popconfirm title="Approve this agency?" onConfirm={() => { updateStatus(agencyDetails, 'approved'); setDrawerOpen(false); }}>
                    <Button block type="primary" size="large" style={{ background: THEME.success, borderColor: THEME.success, borderRadius: 10, fontWeight: 600 }}>
                      Approve Application
                    </Button>
                  </Popconfirm>
                )}
                
                <Popconfirm
                  title={`${agencyDetails.is_active ? "Suspend" : "Activate"} system access for this agency?`}
                  onConfirm={() => toggleActiveStatus(agencyDetails, !agencyDetails.is_active)}
                >
                  <Button
                    block
                    danger={agencyDetails.is_active}
                    type={agencyDetails.is_active ? "default" : "primary"}
                    size="large"
                    style={!agencyDetails.is_active ? { background: THEME.primary, borderRadius: 10, fontWeight: 600 } : { borderRadius: 10, fontWeight: 600 }}
                    icon={agencyDetails.is_active ? <StopOutlined /> : <CheckCircleOutlined />}
                  >
                    {agencyDetails.is_active ? "Suspend Access" : "Activate Access"}
                  </Button>
                </Popconfirm>
              </Space>

            </div>
          </div>
        )}
      </Drawer>

      {/* REJECT MODAL */}
      <Modal
        title="Reject Agency Application"
        open={rejectModalVisible}
        onOk={handleRejectAgency}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason("");
          setSelectedAgencyForReject(null);
        }}
        okText="Reject"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <div style={{ marginBottom: "16px" }}>
          <Text strong>Agency: </Text>
          <Text>{selectedAgencyForReject?.agency_name}</Text>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <Text>Please provide a reason for rejection:</Text>
          <Input.TextArea
            rows={4}
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            style={{ marginTop: "8px" }}
          />
        </div>
      </Modal>

      {/* CUSTOM CSS FOR SEGMENTED THEME & UTILITIES */}
    
    </div>
  );
};

export default AgencyList;