  import React, { useState, useEffect, useCallback } from 'react';
  import { apiService } from '../../../../manageApi/utils/custom.apiservice';
  import {
    Card, Tabs, Button, Typography, Row, Col, Avatar, 
    Tag, Descriptions, Divider, Spin, message, Modal, Badge, Pagination, Space, Input, Tooltip
  } from 'antd';
  import {
    UserOutlined, BankOutlined, FileTextOutlined, 
    CalendarOutlined, EyeOutlined, HomeOutlined, DollarCircleOutlined,
    MailOutlined, LinkOutlined, CheckCircleOutlined
  } from '@ant-design/icons';
  import { CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

  import dayjs from 'dayjs';

  const { Title, Text } = Typography;
  const { TextArea } = Input;

  // BRAND COLOR
  const THEME_COLOR = "#5C039B";

  const STATUS_TABS = ['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired'];

  const ViewProposal = () => {
    // --- STATE ---
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Pagination & Filtering
    const [activeTab, setActiveTab] = useState('Draft');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    
    // Modal State
    const [viewingProposal, setViewingProposal] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Send Email Modal State
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [sendingProposal, setSendingProposal] = useState(null);
    const [clientEmail, setClientEmail] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);

    // --- API CALLS ---
    const fetchProposals = useCallback(async (page, status) => {
      setLoading(true);
      try {
        const res = await apiService.get(`/vault/lead/proposals/my-proposals?page=${page}&limit=10&status=${status}`);
        if (res?.success) {
          setProposals(res.data || []);
          setTotalItems(res.pagination?.total || 0);
        }
      } catch (err) {
        message.error("Failed to load proposals");
      } finally {
        setLoading(false);
      }
    }, []);

    // --- LIFECYCLE ---
    useEffect(() => {
      fetchProposals(currentPage, activeTab);
    }, [currentPage, activeTab, fetchProposals]);

    // --- HANDLERS ---
    const handleTabChange = (key) => {
      setActiveTab(key);
      setCurrentPage(1);
    };

    const handlePageChange = (page) => {
      setCurrentPage(page);
    };

    const openProposalDetails = (proposal) => {
      setViewingProposal(proposal);
      setIsModalOpen(true);
    };

    const openSendModal = (proposal) => {
      setSendingProposal(proposal);
      setClientEmail(proposal.leadId?.customerInfo?.email || '');
      setIsSendModalOpen(true);
    };

    const handleSendProposal = async () => {
      if (!clientEmail) {
        message.error('Please enter client email address');
        return;
      }

      if (!clientEmail.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/)) {
        message.error('Please enter a valid email address');
        return;
      }

      setSendingEmail(true);
      try {
        const response = await apiService.post(`/vault/lead/proposals/${sendingProposal._id}/send`, {
          clientEmail: clientEmail
        });

        if (response?.success) {
          message.success('Proposal sent successfully to client!');
          setIsSendModalOpen(false);
          // Refresh the proposals list to update status
          fetchProposals(currentPage, activeTab);
        } else {
          message.error(response?.message || 'Failed to send proposal');
        }
      } catch (error) {
        console.error('Error sending proposal:', error);
        message.error(error?.response?.data?.message || 'Failed to send proposal');
      } finally {
        setSendingEmail(false);
      }
    };

    const copyToClipboard = (text, type) => {
      navigator.clipboard.writeText(text);
      message.success(`${type} copied to clipboard!`);
    };

    // --- STATUS COLOR MAP ---
    const getStatusColor = (status) => {
      switch (status) {
        case 'Draft': return 'default';
        case 'Sent': return 'processing';
        case 'Viewed': return 'warning';
        case 'Accepted': return 'success';
        case 'Rejected': return 'error';
        case 'Expired': return 'default';
        default: return 'default';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'Draft': return <FileTextOutlined />;
        case 'Sent': return <MailOutlined />;
        case 'Viewed': return <EyeOutlined />;
        case 'Accepted': return <CheckCircleOutlined />;
        case 'Rejected': return <CloseCircleOutlined />;
        case 'Expired': return <ClockCircleOutlined />;
        default: return <FileTextOutlined />;
      }
    };

    return (
      <div style={{ padding: '24px', background: '#fdfbff', minHeight: '100vh' }}>
        
        {/* Header Area */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1e1b4b', margin: 0, fontWeight: 800 }}>Manage Proposals</Title>
          <Text type="secondary">View, track, and manage all client mortgage proposals.</Text>
        </div>

        {/* Tabs Layout */}
        <Card style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 24 }} bodyStyle={{ padding: '16px 24px' }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={handleTabChange} 
            tabBarGutter={32}
            items={STATUS_TABS.map(status => ({
              label: <span style={{ fontSize: 16, fontWeight: activeTab === status ? 600 : 400 }}>{status}</span>,
              key: status
            }))}
          />
        </Card>

        {/* Proposal Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {proposals.map(proposal => {
                const lead = proposal.leadId;
                const customerName = lead?.customerInfo?.fullName || 'Unknown Customer';
                const bankCount = proposal.selectedBankProducts?.length || 0;
                const propValue = proposal.clientRequirements?.targetPropertyValue;
                const isExpired = proposal.isExpired || (proposal.expiresAt && new Date(proposal.expiresAt) < new Date());
                
                return (
                  <Col xs={24} md={12} lg={8} key={proposal._id}>
                    <Card 
                      hoverable
                      style={{ 
                        borderRadius: 16, 
                        border: '1px solid #e8e8e8',
                        borderTop: `4px solid ${THEME_COLOR}`,
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                      bodyStyle={{ padding: 0 }}
                    >
                      <div style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Avatar icon={<UserOutlined />} style={{ backgroundColor: THEME_COLOR }} size="large" />
                            <div>
                              <Text strong style={{ fontSize: 16, display: 'block' }}>{customerName}</Text>
                              <Badge status={getStatusColor(proposal.status)} text={<span style={{fontSize: 12, color: '#666'}}>{proposal.status}</span>} />
                            </div>
                          </div>
                          {proposal.status === 'Sent' && proposal.fullSecureLink && (
                            <Tooltip title="Copy secure link">
                              <Button 
                                size="small" 
                                icon={<LinkOutlined />} 
                                onClick={() => copyToClipboard(proposal.fullSecureLink, 'Secure link')}
                                style={{ borderColor: THEME_COLOR, color: THEME_COLOR }}
                              />
                            </Tooltip>
                          )}
                        </div>

                        <Row gutter={16} style={{ background: '#f9f9f9', padding: '12px', borderRadius: 8, marginBottom: 16 }}>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 11 }}>Target Property</Text>
                            <div style={{ fontWeight: 'bold', color: '#1e1b4b' }}>
                              AED {propValue ? propValue.toLocaleString() : 'N/A'}
                            </div>
                          </Col>
                          <Col span={12}>
                            <Text type="secondary" style={{ fontSize: 11 }}>Proposed Banks</Text>
                            <div style={{ fontWeight: 'bold', color: THEME_COLOR }}>
                              {bankCount} Product(s)
                            </div>
                          </Col>
                        </Row>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                          {/* Render up to 3 bank logos */}
                          <Avatar.Group maxCount={3} size="small" maxStyle={{ color: THEME_COLOR, backgroundColor: '#f0e6ff' }}>
                            {proposal.selectedBankProducts?.map((product, idx) => (
                              <Avatar key={idx} src={product.bankProductId?.bankInfo?.logo} style={{ border: '1px solid #eee' }} />
                            ))}
                          </Avatar.Group>
                          <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
                            <CalendarOutlined /> Created {dayjs(proposal.createdAt).format('MMM DD, YYYY')}
                          </Text>
                        </div>

                        {/* Show sent info if status is Sent or beyond */}
                        {(proposal.status === 'Sent' || proposal.status === 'Viewed' || proposal.status === 'Accepted') && proposal.sentAt && (
                          <div style={{ 
                            background: '#f0f0f0', 
                            padding: '8px', 
                            borderRadius: 6, 
                            marginBottom: 12,
                            fontSize: 11,
                            color: '#666'
                          }}>
                            <MailOutlined style={{ marginRight: 4 }} /> Sent to: {proposal.sentTo}
                            <br />
                            <CalendarOutlined style={{ marginRight: 4 }} /> {dayjs(proposal.sentAt).format('MMM DD, YYYY hh:mm A')}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button 
                            type="primary" 
                            block 
                            icon={<EyeOutlined />}
                            style={{ background: THEME_COLOR, borderColor: THEME_COLOR, borderRadius: 8 }}
                            onClick={() => openProposalDetails(proposal)}
                          >
                            View Details
                          </Button>
                          
                          {proposal.status === 'Draft' && (
                            <Button 
                              block 
                              icon={<MailOutlined />}
                              style={{ borderRadius: 8 }}
                              onClick={() => openSendModal(proposal)}
                            >
                              Send
                            </Button>
                          )}
                        </div>

                        {proposal.status === 'Sent' && proposal.fullSecureLink && (
                          <div style={{ marginTop: 12 }}>
                            <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>
                              Secure Link:
                            </Text>
                            <div style={{ 
                              background: '#f5f5f5', 
                              padding: '6px 8px', 
                              borderRadius: 6,
                              fontSize: 11,
                              wordBreak: 'break-all',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Text style={{ fontSize: 10, color: '#666' }}>{proposal.fullSecureLink.substring(0, 50)}...</Text>
                              <Button 
                                size="small" 
                                type="link" 
                                icon={<LinkOutlined />}
                                onClick={() => copyToClipboard(proposal.fullSecureLink, 'Secure link')}
                                style={{ padding: 0 }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {proposals.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
                <FileTextOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                <br/>
                <Text type="secondary">No proposals found for status: <b>{activeTab}</b></Text>
              </div>
            )}

            {/* Pagination */}
            {totalItems > 0 && (
              <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination 
                  current={currentPage} 
                  total={totalItems} 
                  pageSize={10} 
                  onChange={handlePageChange} 
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}

        {/* --- SEND PROPOSAL MODAL --- */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MailOutlined style={{ color: THEME_COLOR, fontSize: 24 }} />
              <div>
                <div style={{ fontSize: 20, color: '#1e1b4b', fontWeight: 800 }}>Send Proposal to Client</div>
                <div style={{ fontSize: 13, color: '#666', fontWeight: 400 }}>
                  Proposal: {sendingProposal?._id}
                </div>
              </div>
            </div>
          }
          open={isSendModalOpen}
          onCancel={() => setIsSendModalOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsSendModalOpen(false)} style={{ borderRadius: 8 }}>
              Cancel
            </Button>,
            <Button 
              key="send" 
              type="primary" 
              loading={sendingEmail}
              onClick={handleSendProposal}
              style={{ background: THEME_COLOR, borderColor: THEME_COLOR, borderRadius: 8 }}
            >
              Send Proposal
            </Button>
          ]}
          width={600}
          centered
        >
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: 24 }}>
              <Text strong>Client Information:</Text>
              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginTop: 8 }}>
                <div><Text type="secondary">Name:</Text> <Text strong>{sendingProposal?.leadId?.customerInfo?.fullName}</Text></div>
                <div><Text type="secondary">Phone:</Text> {sendingProposal?.leadId?.customerInfo?.mobileNumber}</div>
              </div>
            </div>

            <div>
              <Text strong>Client Email Address:</Text>
              <Input
                placeholder="client@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                style={{ marginTop: 8, borderRadius: 8 }}
                prefix={<MailOutlined style={{ color: '#999' }} />}
              />
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                The client will receive a secure link to view and accept this proposal.
              </Text>
            </div>
          </div>
        </Modal>

        {/* --- FULL PROPOSAL DETAIL MODAL --- */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 8 }}>
              <FileTextOutlined style={{ color: THEME_COLOR, fontSize: 24 }} />
              <div>
                <div style={{ fontSize: 20, color: '#1e1b4b', fontWeight: 800 }}>Proposal Details</div>
                <div style={{ fontSize: 13, color: '#666', fontWeight: 400 }}>Ref: {viewingProposal?._id}</div>
              </div>
              <Tag color={getStatusColor(viewingProposal?.status)} style={{ marginLeft: 'auto', fontSize: 14, padding: '4px 12px', borderRadius: 20 }}>
                {viewingProposal?.status}
              </Tag>
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalOpen(false)} style={{ borderRadius: 8 }}>Close</Button>,
            viewingProposal?.status === 'Draft' && (
              <Button 
                key="send" 
                type="primary" 
                icon={<MailOutlined />}
                onClick={() => {
                  setIsModalOpen(false);
                  openSendModal(viewingProposal);
                }}
                style={{ background: THEME_COLOR, borderColor: THEME_COLOR, borderRadius: 8 }}
              >
                Send to Client
              </Button>
            ),
            viewingProposal?.fullSecureLink && viewingProposal?.status === 'Sent' && (
              <Button 
                key="copy" 
                icon={<LinkOutlined />}
                onClick={() => copyToClipboard(viewingProposal.fullSecureLink, 'Secure link')}
                style={{ borderRadius: 8 }}
              >
                Copy Secure Link
              </Button>
            )
          ]}
          width={1000}
          centered
          bodyStyle={{ maxHeight: '75vh', overflowY: 'auto', padding: '24px', backgroundColor: '#f9f9f9' }}
        >
          <style>{`.ant-modal-body::-webkit-scrollbar { display: none; }`}</style>
          
          {viewingProposal && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              
              {/* Lead & Property Context */}
              <Row gutter={[20, 20]}>
                <Col xs={24} lg={12}>
                  <Card title={<span><UserOutlined style={{color: THEME_COLOR}}/> Client Intelligence</span>} size="small" style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                      <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Name"><Text strong>{viewingProposal.leadId?.customerInfo?.fullName}</Text></Descriptions.Item>
                        <Descriptions.Item label="Email">{viewingProposal.leadId?.customerInfo?.email}</Descriptions.Item>
                        <Descriptions.Item label="Phone">{viewingProposal.leadId?.customerInfo?.mobileNumber}</Descriptions.Item>
                        <Descriptions.Item label="Salary"><Text strong color="green">AED {viewingProposal.leadId?.customerInfo?.monthlySalary?.toLocaleString()}</Text></Descriptions.Item>
                      </Descriptions>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title={<span><HomeOutlined style={{color: THEME_COLOR}}/> Requirements</span>} size="small" style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                      <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Target Property">AED {viewingProposal.clientRequirements?.targetPropertyValue?.toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Preferred Tenure">{viewingProposal.clientRequirements?.preferredLoanTenureYears} Years</Descriptions.Item>
                        <Descriptions.Item label="Property Type">{viewingProposal.clientRequirements?.propertyType}</Descriptions.Item>
                        <Descriptions.Item label="Fee Financing">{viewingProposal.clientRequirements?.feeFinancingPreference ? 'Requested' : 'Not Required'}</Descriptions.Item>
                      </Descriptions>
                  </Card>
                </Col>
              </Row>

              {/* Cover Note Section */}
              <Card title="Cover Note" size="small" style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ whiteSpace: 'pre-wrap', color: '#444', background: '#f5f5f5', padding: '16px', borderRadius: 8, fontFamily: 'monospace' }}>
                  {viewingProposal.coverNote || 'No cover note provided.'}
                </div>
              </Card>

              {/* Selected Bank Products */}
              <div>
                <Title level={5} style={{ color: THEME_COLOR, marginBottom: 16 }}>Included Bank Products</Title>
                <Row gutter={[16, 16]}>
                  {viewingProposal.selectedBankProducts?.map((item, idx) => {
                    const product = item.bankProductId;
                    if (!product) return null;
                    
                    return (
                      <Col xs={24} lg={12} key={idx}>
                        <Card size="small" style={{ borderRadius: 12, border: `1px solid ${THEME_COLOR}30` }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                            <Avatar src={product.bankInfo?.logo} size={54} shape="square" style={{ border: '1px solid #eee' }} />
                            <div>
                              <Text strong style={{ fontSize: 16 }}>{product.offerSummary?.title}</Text>
                              <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{product.bankInfo?.bankName} • {product.offerSummary?.productType}</Text>
                            </div>
                          </div>

                          <Row gutter={8} style={{ background: '#F8F5FF', padding: '8px', borderRadius: 8 }}>
                            <Col span={8} style={{ textAlign: 'center' }}>
                              <Text type="secondary" style={{ fontSize: 10 }}>Snapshot Rate</Text>
                              <div style={{ fontWeight: 'bold', color: THEME_COLOR, fontSize: 14 }}>{item.snapshotRate}%</div>
                            </Col>
                            <Col span={8} style={{ textAlign: 'center', borderLeft: '1px solid #eee', borderRight: '1px solid #eee' }}>
                              <Text type="secondary" style={{ fontSize: 10 }}>Max LTV</Text>
                              <div style={{ fontWeight: 'bold', fontSize: 14 }}>{item.snapshotMaxLtv}%</div>
                            </Col>
                            <Col span={8} style={{ textAlign: 'center' }}>
                              <Text type="secondary" style={{ fontSize: 10 }}>Processing</Text>
                              <div style={{ fontWeight: 'bold', fontSize: 14 }}>{product.costBreakdown?.bankProcessingFee || 'Free'}</div>
                            </Col>
                          </Row>

                          <div style={{ marginTop: 12 }}>
                            <Text type="secondary" style={{ fontSize: 11, marginBottom: 4, display: 'block' }}>Key Features Included:</Text>
                            <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: '#555' }}>
                              {item.snapshotFeatures?.slice(0, 3).map((feat, i) => (
                                <li key={i}>{feat}</li>
                              ))}
                              {item.snapshotFeatures?.length > 3 && <li>+ {item.snapshotFeatures.length - 3} more...</li>}
                            </ul>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>

              {/* Tracking Information for Sent Proposals */}
              {(viewingProposal.status === 'Sent' || viewingProposal.status === 'Viewed' || viewingProposal.status === 'Accepted') && (
                <Card title="Tracking Information" size="small" style={{ borderRadius: 12 }}>
                  <Descriptions bordered size="small" column={2}>
                    <Descriptions.Item label="Sent To">{viewingProposal.sentTo}</Descriptions.Item>
                    <Descriptions.Item label="Sent At">{dayjs(viewingProposal.sentAt).format('MMM DD, YYYY hh:mm A')}</Descriptions.Item>
                    {viewingProposal.viewedAt && (
                      <Descriptions.Item label="Viewed At">{dayjs(viewingProposal.viewedAt).format('MMM DD, YYYY hh:mm A')}</Descriptions.Item>
                    )}
                    {viewingProposal.acceptedAt && (
                      <Descriptions.Item label="Accepted At">{dayjs(viewingProposal.acceptedAt).format('MMM DD, YYYY hh:mm A')}</Descriptions.Item>
                    )}
                    <Descriptions.Item label="Expires At">{dayjs(viewingProposal.expiresAt).format('MMM DD, YYYY hh:mm A')}</Descriptions.Item>
                    {viewingProposal.fullSecureLink && (
                      <Descriptions.Item label="Secure Link" span={2}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontSize: 12, wordBreak: 'break-all' }}>{viewingProposal.fullSecureLink}</Text>
                          <Button size="small" icon={<LinkOutlined />} onClick={() => copyToClipboard(viewingProposal.fullSecureLink, 'Secure link')} />
                        </div>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              )}
            </Space>
          )}
        </Modal>
      </div>
    );
  };

  // Missing icons import

  export default ViewProposal;