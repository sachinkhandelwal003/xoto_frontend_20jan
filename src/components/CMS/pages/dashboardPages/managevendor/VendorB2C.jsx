// src/pages/admin/VendorB2C.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiRefreshCw,
  FiEye,
  FiCheck,
  FiX,
  FiShoppingBag,
} from "react-icons/fi";
import { 
  Button, 
  Card, 
  Modal, 
  Input, 
  Tabs, 
  Tag, 
  Space, 
  Typography, 
  Badge, 
  Avatar, 
  Tooltip, 
  Alert,
  Popconfirm,
  Row,
  Col,
  Statistic 
} from "antd";
import {
  UserOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ShopTwoTone
} from "@ant-design/icons";
import CustomTable from "../../custom/CustomTable";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../../../manageApi/utils/toast";

const { TextArea } = Input;
const { Title, Text } = Typography;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1", // Purple
  secondary: "#1890ff", // Blue
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const roleSlugMap = {
  0: "superadmin",
  1: "admin",
  5: "vendor-b2c",
  6: "vendor-b2b",
  7: "freelancer",
  11: "accountant",
};

const useVendorPermission = () => {
  const { permissions } = useSelector((s) => s.auth);
  const p = permissions?.["Request→All Sellers"] ?? {};

  return {
    canView: !!p.canView,
    canAdd: !!p.canAdd,
    canEdit: !!p.canEdit,
    canDelete: !!p.canDelete,
    canApprove: !!p.canEdit,
    canReject: !!p.canDelete,
  };
};

const VendorB2C = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((s) => s.auth);
  const perm = useVendorPermission();

  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";

  const [loading, setLoading] = useState(true);
  
  // ✅ CHANGED DEFAULT TO 'approved'
  const [activeTab, setActiveTab] = useState("approved");
  
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchVendors = useCallback(
    async (page = 1, limit = 10) => {
      if (!token || !perm.canView) return;
      setLoading(true);

      try {
        // Map tab strings to Backend numeric status (0=Pending, 1=Approved, 2=Rejected)
        const statusMap = { pending: 0, approved: 1, rejected: 2 };

        const res = await apiService.get("/vendor/b2c", {
          page,
          limit,
          status: statusMap[activeTab], 
        });

        // 1. Process List Data
        const data = (res.vendors || []).map((v, i) => {
          const fullName = `${v.name?.first_name || ""} ${v.name?.last_name || ""}`.trim() || "—";
          const mobile = v.mobile ? `${v.mobile.country_code} ${v.mobile.number}` : "—";
          const categories = v.store_details?.categories
            ? v.store_details.categories.map(c => c.name).join(", ")
            : "—";

          return {
            ...v,
            key: v._id,
            sno: (page - 1) * limit + i + 1,
            full_name: fullName,
            email: v.email || "—",
            mobile: mobile,
            store_name: v.store_details?.store_name || "—",
            store_type: v.store_details?.store_type || "—",
            categories: categories,
            status: v.status_info?.status || 0,
            rejection_reason: v.status_info?.rejection_reason || "",
            created_at: v.meta?.created_at || v.createdAt,
          };
        });

        setVendors(data);

        // 2. Update Pagination from Backend Response
        setPagination({
          currentPage: res.pagination?.page || 1,
          totalPages: res.pagination?.totalPages || 1,
          totalResults: res.pagination?.total || 0,
          itemsPerPage: res.pagination?.limit || 10,
        });

        // 3. Update Stats (Badges)
        if (res.stats) {
            setStats({
                total: res.stats?.total || 0,
                pending: res.stats?.pending || 0,
                approved: res.stats?.approved || 0,
                rejected: res.stats?.rejected || 0,
            });
        }
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to load vendors", "error");
        setVendors([]);
      } finally {
        setLoading(false);
      }
    },
    [activeTab, token, perm.canView]
  );

  useEffect(() => {
    fetchVendors(pagination.currentPage, pagination.itemsPerPage);
  }, [activeTab, fetchVendors]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination((p) => ({ ...p, currentPage: 1 }));
  };

  const handlePageChange = (page, limit) => {
    fetchVendors(page, limit);
  };

  const handleRefresh = () => {
    fetchVendors(pagination.currentPage, pagination.itemsPerPage);
  };

  const handleApprove = async (id) => {
    try {
      await apiService.put(`/vendor/b2c/${id}/status`, { status: 1 });
      showToast("Vendor approved successfully", "success");
      handleRefresh();
    } catch (err) {
      showToast("Approval failed", "error");
    }
  };

  const openRejectModal = (vendor) => {
    setSelectedVendor(vendor);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast("Rejection reason is required", "error");
      return;
    }
    try {
      await apiService.put(`/vendor/b2c/${selectedVendor._id}/status`, {
        status: 2,
        rejection_reason: rejectionReason,
      });
      showToast("Vendor rejected", "success");
      handleRefresh();
      setShowRejectModal(false);
    } catch (err) {
      showToast("Rejection failed", "error");
    }
  };

  // --- COLUMNS ---
  const columns = useMemo(
    () => [
      {
        title: "Vendor Profile",
        width: 300,
        render: (_, r) => (
          <div className="flex items-center gap-3">
            <Avatar 
                size={48} 
                icon={<ShopOutlined />} 
                style={{ backgroundColor: THEME.bgLight, color: THEME.primary, border: '1px solid #eee' }}
            />
            <div>
              <div className="font-semibold text-gray-900 text-base">{r.store_name}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                 <UserOutlined /> {r.full_name}
              </div>
              <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                 <MailOutlined /> {r.email}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Contact Info",
        width: 160,
        render: (_, r) => (
          <Space direction="vertical" size={0}>
            <div className="flex items-center gap-2 text-sm text-gray-700">
                <PhoneOutlined style={{ color: THEME.secondary }} /> {r.mobile}
            </div>
            {r.is_mobile_verified && <Tag color="success" style={{ marginTop: 4, fontSize: '10px' }}>Verified</Tag>}
          </Space>
        ),
      },
      {
        title: "Store Details",
        width: 200,
        render: (_, r) => (
          <Space direction="vertical" size={2}>
             <Tag color="geekblue">{r.store_type}</Tag>
             <div className="text-xs text-gray-500 line-clamp-1" title={r.categories}>
                {r.categories}
             </div>
          </Space>
        ),
      },
      {
        title: "Status",
        width: 140,
        render: (_, r) => {
          const status = r.status;
          const config = {
             0: { color: 'warning', icon: <ClockCircleOutlined />, label: 'Pending' },
             1: { color: 'success', icon: <CheckCircleOutlined />, label: 'Approved' },
             2: { color: 'error', icon: <CloseCircleOutlined />, label: 'Rejected' }
          }[status];

          return (
            <div>
              <Tag color={config.color} icon={config.icon} style={{ borderRadius: 12 }}>{config.label}</Tag>
              {status === 2 && r.rejection_reason && (
                <Tooltip title={r.rejection_reason}>
                    <div className="text-xs text-red-500 mt-1 cursor-help underline">Reason</div>
                </Tooltip>
              )}
            </div>
          );
        },
      },
      {
        title: "Registered",
        width: 120,
        render: (_, r) => (
            <span className="text-gray-500 text-xs">
                {r.created_at ? new Date(r.created_at).toLocaleDateString("en-GB") : "—"}
            </span>
        )
      },
      {
        title: "Actions",
        fixed: "right",
        width: 180,
        render: (_, r) => (
          <Space>
            <Tooltip title="View Profile">
                <Button
                type="text"
                shape="circle"
                icon={<FiEye style={{ color: THEME.primary }} />}
                onClick={() => navigate(`/dashboard/${roleSlug}/seller/${r._id}`)}
                />
            </Tooltip>

            <Tooltip title="View Products">
                <Button
                type="text"
                shape="circle"
                icon={<ShoppingOutlined style={{ color: THEME.secondary }} />}
                onClick={() => navigate(`/dashboard/${roleSlug}/seller/product/${r._id}`)}
                />
            </Tooltip>

            {activeTab === "pending" && perm.canApprove && (
              <Tooltip title="Approve">
                  <Popconfirm
                    title="Approve Vendor"
                    description="Are you sure you want to approve this vendor?"
                    onConfirm={() => handleApprove(r._id)}
                    okText="Approve"
                    cancelText="No"
                    okButtonProps={{ type: 'primary', style: { background: THEME.success } }}
                  >
                    <Button
                        type="text"
                        shape="circle"
                        icon={<FiCheck style={{ color: THEME.success }} />}
                    />
                  </Popconfirm>
              </Tooltip>
            )}

            {activeTab === "pending" && perm.canReject && (
              <Tooltip title="Reject">
                <Button
                  type="text"
                  shape="circle"
                  icon={<FiX style={{ color: THEME.error }} />}
                  onClick={() => openRejectModal(r)}
                />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ],
    [activeTab, perm.canApprove, perm.canReject, roleSlug, navigate]
  );

  if (!perm.canView) {
    return (
      <div className="p-10 text-center">
        <Alert
          message="Access Denied"
          description="You don't have permission to view B2C vendors."
          type="error"
          showIcon
        />
      </div>
    );
  }

  // --- TAB CONFIGURATION ---
  const tabItems = [
    {
      key: 'approved',
      label: (
        <span>
          <CheckCircleOutlined /> Approved
          <Badge count={stats.approved} style={{ marginLeft: 8, backgroundColor: THEME.success }} />
        </span>
      )
    },
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined /> Pending
          <Badge count={stats.pending} style={{ marginLeft: 8, backgroundColor: THEME.warning }} />
        </span>
      )
    },
    {
      key: 'rejected',
      label: (
        <span>
          <CloseCircleOutlined /> Rejected
          <Badge count={stats.rejected} style={{ marginLeft: 8, backgroundColor: THEME.error }} />
        </span>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
            <Title level={3} style={{ margin: 0 }}>Vendor Management (B2C)</Title>
            <Text type="secondary">Manage approvals and view vendor details.</Text>
        </div>
        
      </div>

      {/* Main Content Card */}
      <Card 
        bordered={false} 
        className="shadow-md rounded-lg" 
        bodyStyle={{ padding: 0 }}
      >
        <Tabs 
            activeKey={activeTab} 
            onChange={handleTabChange} 
            size="large"
            tabBarStyle={{ margin: 0, paddingLeft: 16, paddingTop: 16, background: '#fafafa' }}
            items={tabItems}
            type="card"
        />

        <div className="p-0">
            <CustomTable
                columns={columns}
                data={vendors}
                loading={loading}
                totalItems={pagination.totalResults}
                currentPage={pagination.currentPage}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
                scroll={{ x: 1200 }}
            />
        </div>
      </Card>

      {/* Reject Modal */}
      <Modal
        title={
            <div className="flex items-center gap-2 text-red-600 font-bold">
                <CloseCircleOutlined /> Reject Vendor Application
            </div>
        }
        open={showRejectModal}
        onCancel={() => setShowRejectModal(false)}
        footer={null}
        width={500}
        destroyOnClose
        centered
      >
        {selectedVendor && (
          <div className="pt-2">
            <Alert
                message="Action Required"
                description={`You are about to reject ${selectedVendor.store_name}. Please provide a reason.`}
                type="warning"
                showIcon
                className="mb-4"
            />
            
            <p className="mb-2 font-medium">Rejection Reason:</p>
            <TextArea
              rows={4}
              placeholder="e.g. Incomplete documentation, policy violation..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mb-6"
            />
            
            <div className="flex justify-end gap-3">
              <Button onClick={() => setShowRejectModal(false)}>Cancel</Button>
              <Button
                type="primary"
                danger
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorB2C;