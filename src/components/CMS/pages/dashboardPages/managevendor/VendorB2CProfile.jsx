// src/pages/admin/VendorB2CProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../../manageApi/utils/toast';
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiFileText,
  FiShield,
  FiCreditCard,
  FiClock,
  FiPackage,
  FiDownload,
  FiZoomIn
} from 'react-icons/fi';
import { 
  Button, Card, Spin, Avatar, Tag, Modal, Input, 
  Space, Image, Row, Col, Timeline, Descriptions, Typography, Alert 
} from 'antd';

const { TextArea } = Input;
const { Title, Text } = Typography;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const VendorB2CProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Verification Modal State
  const [verificationModal, setVerificationModal] = useState({
    open: false,
    docKey: null, 
    approving: false,
    reason: '',
    suggestion: '',
    loading: false
  });

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    fetchVendor();
  }, [id, token]);

  const fetchVendor = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/vendor/b2c?vendorId=${id}`); 
      setVendor(res.vendor); 
    } catch (err) {
      showToast('Failed to load vendor profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openVerification = (docKey, approving) => {
    setVerificationModal({
      open: true,
      docKey,
      approving,
      reason: '',
      suggestion: '',
      loading: false
    });
  };

  const submitVerification = async () => {
    if (!verificationModal.approving && !verificationModal.reason.trim()) {
      showToast('Reason is required for rejection', 'error');
      return;
    }

    setVerificationModal(prev => ({ ...prev, loading: true }));

    try {
      const payload = {
        vendorId: id,
        documentField: verificationModal.docKey,
        verified: verificationModal.approving
      };

      if (!verificationModal.approving) {
        payload.reason = verificationModal.reason;
        payload.suggestion = verificationModal.suggestion;
      }

      await apiService.put('/vendor/b2c/document/verification/check', payload);
      
      showToast(`Document ${verificationModal.approving ? 'approved' : 'rejected'} successfully`, 'success');
      setVerificationModal({ ...verificationModal, open: false, loading: false });
      fetchVendor(); 
    } catch (err) {
      showToast(err.response?.data?.message || 'Verification update failed', 'error');
      setVerificationModal(prev => ({ ...prev, loading: false }));
    }
  };

  const downloadDoc = (path) => {
    window.open(`https://kotiboxglobaltech.online/api/${path}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading Profile..." />
      </div>
    );
  }

  if (!vendor) return null;

  // Helpers
  const fullName = `${vendor.name?.first_name || ''} ${vendor.name?.last_name || ''}`.trim();
  const getStatusInfo = () => {
    const status = vendor.status_info?.status;
    if (status === 1) return { text: 'Approved', color: 'green' };
    if (status === 2) return { text: 'Rejected', color: 'red' };
    return { text: 'Pending', color: 'orange' };
  };
  const statusInfo = getStatusInfo();

  const docsConfig = [
    { key: 'identity_proof', label: 'Identity Proof', icon: <FiUser /> },
    { key: 'address_proof', label: 'Address Proof', icon: <FiMapPin /> },
    { key: 'gst_certificate', label: 'GST Certificate', icon: <FiFileText /> },
    { key: 'pan_card', label: 'PAN Card', icon: <FiCreditCard /> },
    { key: 'cancelled_cheque', label: 'Cancelled Cheque', icon: <FiFileText /> },
    { key: 'shop_act_license', label: 'Shop Act License', icon: <FiShield /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* 1. Header */}
      <div className="mb-6 flex justify-between items-center">
         <div className="flex items-center gap-4">
            <Button icon={<FiArrowLeft />} onClick={() => navigate(-1)}>Back</Button>
            <div>
                <Title level={3} style={{ margin: 0 }}>Vendor Details</Title>
                <div className="flex gap-2 items-center">
                    <Text type="secondary">ID: {vendor._id}</Text>
                    <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                </div>
            </div>
         </div>
      </div>

      <div className="space-y-6 max-w-7xl mx-auto">

        {/* 2. Basic Info & Store (Combined) */}
        <Card className="shadow-sm rounded-xl border-t-4" style={{ borderColor: THEME.primary }}>
            <Row gutter={24} align="middle">
                <Col xs={24} md={4} className="text-center">
                    <Avatar 
                        size={100} 
                        src={vendor.store_details?.logo ? `https://kotiboxglobaltech.online/api/${vendor.store_details.logo}` : null}
                        icon={<FiUser />}
                        style={{ backgroundColor: THEME.bgLight, color: THEME.primary }}
                    />
                </Col>
                <Col xs={24} md={20}>
                    <Descriptions title="Vendor Information" column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                        <Descriptions.Item label="Full Name"><span className="font-semibold">{fullName}</span></Descriptions.Item>
                        <Descriptions.Item label="Email"><a href={`mailto:${vendor.email}`}>{vendor.email}</a></Descriptions.Item>
                        <Descriptions.Item label="Mobile">{vendor.mobile?.country_code} {vendor.mobile?.number}</Descriptions.Item>
                        <Descriptions.Item label="Store Name"><span className="font-semibold text-purple-700">{vendor.store_details?.store_name}</span></Descriptions.Item>
                        <Descriptions.Item label="Store Type">{vendor.store_details?.store_type}</Descriptions.Item>
                        <Descriptions.Item label="Joined">{new Date(vendor.createdAt).toLocaleDateString()}</Descriptions.Item>
                    </Descriptions>
                </Col>
            </Row>
        </Card>

        {/* 3. Store Details (Full Width) */}
        <Card title={<span><FiPackage className="mr-2"/> Store & Location</span>} className="shadow-sm rounded-xl">
             <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                <Descriptions.Item label="Description">{vendor.store_details?.store_description || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Website">
                    {vendor.store_details?.website ? <a href={vendor.store_details.website} target="_blank" rel="noreferrer">{vendor.store_details.website}</a> : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Address">{vendor.store_details?.store_address}</Descriptions.Item>
                <Descriptions.Item label="City/State">{vendor.store_details?.city}, {vendor.store_details?.state}</Descriptions.Item>
                <Descriptions.Item label="Pincode">{vendor.store_details?.pincode}</Descriptions.Item>
                <Descriptions.Item label="Country">{vendor.store_details?.country}</Descriptions.Item>
                <Descriptions.Item label="Categories">
                    {vendor.store_details?.categories?.map(cat => <Tag key={cat._id}>{cat.name}</Tag>) || 'None'}
                </Descriptions.Item>
             </Descriptions>
        </Card>

        {/* 4. Registration & Bank (Split Row) */}
        <Row gutter={24}>
            <Col xs={24} md={12}>
                <Card title={<span><FiFileText className="mr-2"/> Registration</span>} className="shadow-sm rounded-xl h-full">
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="PAN">{vendor.registration?.pan_number}</Descriptions.Item>
                        <Descriptions.Item label="GSTIN">{vendor.registration?.gstin}</Descriptions.Item>
                        <Descriptions.Item label="License">{vendor.registration?.business_license_number || 'N/A'}</Descriptions.Item>
                    </Descriptions>
                </Card>
            </Col>
            <Col xs={24} md={12}>
                <Card title={<span><FiCreditCard className="mr-2"/> Bank Details</span>} className="shadow-sm rounded-xl h-full">
                     <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Account Holder">{vendor.bank_details?.account_holder_name}</Descriptions.Item>
                        <Descriptions.Item label="Bank & Branch">{vendor.bank_details?.bank_name} ({vendor.bank_details?.branch_name})</Descriptions.Item>
                        <Descriptions.Item label="Account No">{vendor.bank_details?.bank_account_number}</Descriptions.Item>
                        <Descriptions.Item label="IFSC">{vendor.bank_details?.ifsc_code}</Descriptions.Item>
                        <Descriptions.Item label="Currency">
                            {vendor.bank_details?.preferred_currency?.code} ({vendor.bank_details?.preferred_currency?.symbol})
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </Col>
        </Row>

        {/* 5. Documents Grid (UPDATED) */}
        <Card title={<span><FiShield className="mr-2"/> Verification Documents</span>} className="shadow-sm rounded-xl">
            {/* GRID LAYOUT: 1 column mobile, 2 tablet, 3 desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {docsConfig.map(docType => {
                    const docData = vendor.documents?.[docType.key];
                    const hasDoc = !!docData?.path;
                    const fileUrl = hasDoc ? `https://kotiboxglobaltech.online/api/${docData.path}` : null;
                    const isImage = hasDoc && /\.(jpg|jpeg|png|webp)$/i.test(docData.path);

                    return (
                        <div key={docType.key} className="border rounded-xl p-0 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
                            
                            {/* Header */}
                            <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-100">
                                <div className="flex items-center gap-2 font-semibold text-gray-700">
                                    {docType.icon} {docType.label}
                                </div>
                                <Tag color={!hasDoc ? 'red' : docData.verified ? 'success' : 'warning'}>
                                    {!hasDoc ? 'Missing' : docData.verified ? 'Verified' : 'Pending'}
                                </Tag>
                            </div>

                            {/* Preview Area (Fixed Height) */}
                            <div className="flex-1 h-48 bg-gray-100 relative group flex items-center justify-center">
                                {hasDoc ? (
                                    isImage ? (
                                        <>
                                            <Image 
                                                src={fileUrl} 
                                                className="w-full h-full object-cover" 
                                                preview={false} // Disable default preview to use custom modal or just view
                                            />
                                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex flex-col items-center justify-center gap-2 transition-all">
                                                 <Button 
                                                    type="primary" 
                                                    shape="circle" 
                                                    icon={<FiZoomIn />} 
                                                    onClick={() => setImagePreview(fileUrl)} 
                                                 />
                                                 <Button 
                                                    shape="circle" 
                                                    icon={<FiDownload />} 
                                                    onClick={() => downloadDoc(docData.path)} 
                                                 />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center cursor-pointer" onClick={() => downloadDoc(docData.path)}>
                                            <FiFileText size={40} className="text-gray-400 mb-2 mx-auto" />
                                            <span className="text-blue-600 text-sm underline">Download PDF</span>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-gray-400 flex flex-col items-center">
                                        <FiX size={30} className="mb-1" />
                                        <span className="text-xs">No Document</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Status Info (Reason/Suggestion) */}
                            {docData?.reason && (
                                <Alert 
                                    message={docData.reason} 
                                    type="error" 
                                    banner 
                                    className="text-xs border-b border-gray-200"
                                />
                            )}

                            {/* Action Buttons */}
                            {hasDoc && !docData.verified && (
                                <div className="p-3 grid grid-cols-2 gap-3 mt-auto bg-white">
                                    <Button 
                                        type="primary" 
                                        className="bg-green-600 hover:bg-green-700 border-none w-full" 
                                        icon={<FiCheck />}
                                        onClick={() => openVerification(docType.key, true)}
                                    >
                                        Approve
                                    </Button>
                                    <Button 
                                        danger 
                                        className="w-full"
                                        icon={<FiX />}
                                        onClick={() => openVerification(docType.key, false)}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            )}

                            {/* Verified Info */}
                            {hasDoc && docData.verified && (
                                <div className="p-3 text-center bg-green-50 text-green-700 text-xs font-medium mt-auto">
                                    Verified on {new Date(docData.verified_at || Date.now()).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>

        {/* 6. Activity Timeline */}
        {vendor.meta?.change_history && (
            <Card title={<span><FiClock className="mr-2"/> Activity History</span>} className="shadow-sm rounded-xl">
                <Timeline
                    items={vendor.meta.change_history.slice(-5).reverse().map((item, idx) => ({
                        color: idx === 0 ? 'green' : 'gray',
                        children: (
                            <>
                                <Text strong>{item.changes?.[0] || 'Profile Update'}</Text>
                                <br/>
                                <Text type="secondary" className="text-xs">
                                    {new Date(item.updated_at).toLocaleString()}
                                </Text>
                            </>
                        )
                    }))}
                />
            </Card>
        )}

      </div>

      {/* Image Preview Modal */}
      <Image.PreviewGroup
        preview={{
          visible: !!imagePreview,
          onVisibleChange: (vis) => !vis && setImagePreview(null),
        }}
      >
        <Image src={imagePreview} style={{ display: 'none' }} />
      </Image.PreviewGroup>

      {/* Verification Modal */}
      <Modal
        open={verificationModal.open}
        title={verificationModal.approving ? 'Approve Document' : 'Reject Document'}
        onCancel={() => setVerificationModal({ ...verificationModal, open: false })}
        footer={null}
        width={400}
        centered
      >
        <div className="space-y-4 pt-2">
            <Alert 
                 message={`You are about to ${verificationModal.approving ? 'approve' : 'reject'} the document.`}
                 type={verificationModal.approving ? "success" : "warning"}
                 showIcon
            />
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                     {verificationModal.approving ? "Comments (Optional)" : "Reason for Rejection *"}
                </label>
                <Input.TextArea 
                    rows={3} 
                    placeholder={verificationModal.approving ? "Any notes..." : "Reason is required..."}
                    value={verificationModal.reason}
                    onChange={(e) => setVerificationModal({...verificationModal, reason: e.target.value})}
                    status={!verificationModal.approving && !verificationModal.reason ? 'error' : ''}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suggestion (Optional)</label>
                <Input.TextArea 
                    rows={2} 
                    placeholder="Suggestion for vendor..."
                    value={verificationModal.suggestion}
                    onChange={(e) => setVerificationModal({...verificationModal, suggestion: e.target.value})}
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button onClick={() => setVerificationModal({ ...verificationModal, open: false })}>Cancel</Button>
                <Button 
                    type="primary" 
                    danger={!verificationModal.approving}
                    className={verificationModal.approving ? 'bg-green-600' : ''}
                    onClick={submitVerification}
                    loading={verificationModal.loading}
                    disabled={!verificationModal.approving && !verificationModal.reason.trim()}
                >
                    Confirm
                </Button>
            </div>
        </div>
      </Modal>

    </div>
  );
};

export default VendorB2CProfile;