import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import {
  Card, Tag, Button, Spin, Alert, Descriptions, Row, Col, 
  Statistic, Divider, Tabs, Table as AntTable, Typography, 
  Timeline, Badge, Space, Progress, Modal
} from "antd";
import {
  DollarOutlined, BankOutlined, HomeOutlined, UserOutlined,
  CheckCircleOutlined, ClockCircleOutlined, RiseOutlined,
  FallOutlined, PercentageOutlined, WalletOutlined, FileTextOutlined,
  CalculatorOutlined, TrophyOutlined, GiftOutlined, CalendarOutlined,
  ArrowLeftOutlined, DownloadOutlined, PrinterOutlined, EyeOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const PURPLE = "#5C039B";
const SUCCESS_COLOR = "#10b981";
const WARNING_COLOR = "#f59e0b";
const ERROR_COLOR = "#ef4444";
const INFO_COLOR = "#3b82f6";

const roleSlugMap = {
  '0': 'superadmin',
  '1': 'admin',
  '2': "customer",
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

const DisbursedFullAmountCases = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "superadmin";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  const formatCurrency = (value) => {
    if (!value) return "AED 0";
    return `AED ${value.toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return dayjs(date).format("DD MMM YYYY, hh:mm A");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiService.get(`/vault/cases/ops/bank-decision/${caseId}/amount-details`);
        if (response?.success) {
          setData(response.data);
        } else {
          message.error("Failed to load amount details");
        }
      } catch (err) {
        console.error("Error fetching amount details:", err);
        message.error("Failed to load amount details");
      } finally {
        setLoading(false);
      }
    };
    
    if (caseId) {
      fetchData();
    }
  }, [caseId]);

  const handleBack = () => {
    navigate(`/dashboard/${roleSlug}/disbursed-cases`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Generate JSON export
    const exportData = {
      caseReference: data?.data?.caseReference,
      caseId: data?.data?.caseId,
      exportedAt: new Date().toISOString(),
      amountComparison: data?.data?.amountComparison,
      bankOffer: data?.data?.bankOffer,
      commissionCalculation: data?.data?.commissionCalculation,
      summary: data?.data?.summary,
      rawData: data?.data?.rawData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amount-details-${data?.data?.caseReference}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success("Export completed");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div style={{ padding: 48, textAlign: "center", background: "#F9FAFB", minHeight: "100vh" }}>
        <Alert message="Case Not Found" description="The requested case could not be found" type="error" showIcon />
        <Button onClick={handleBack} style={{ marginTop: 24 }}>Back to Disbursed Cases</Button>
      </div>
    );
  }

  const caseData = data.data;
  const comparison = caseData.amountComparison || {};
  const bankOffer = caseData.bankOffer || {};
  const commission = caseData.commissionCalculation || {};
  const summary = caseData.summary || {};
  const timeline = caseData.amountTimeline || [];

  // Amount Comparison Data
  const amountComparisonData = [
    { key: '1', label: 'Requested Amount', value: formatCurrency(comparison.requestedAmount), icon: <BankOutlined />, color: '#6B7280' },
    { key: '2', label: 'Approved Amount', value: formatCurrency(comparison.approvedAmount), icon: <CheckCircleOutlined />, color: WARNING_COLOR },
    { key: '3', label: 'Disbursed Amount', value: formatCurrency(comparison.disbursedAmount), icon: <DollarOutlined />, color: SUCCESS_COLOR },
    { key: '4', label: 'Difference', value: formatCurrency(Math.abs(comparison.amountDifference || 0)), icon: <RiseOutlined />, color: comparison.amountStatus === 'reduced' ? ERROR_COLOR : WARNING_COLOR },
  ];

  // Loan Details Data
  const loanDetailsData = [
    { key: '1', label: 'Bank Name', value: bankOffer.bankName, icon: <BankOutlined /> },
    { key: '2', label: 'Interest Rate', value: `${bankOffer.interestRate}% (${bankOffer.interestRateType})`, icon: <PercentageOutlined /> },
    { key: '3', label: 'Loan Tenure', value: `${bankOffer.tenureYears} years`, icon: <CalendarOutlined /> },
    { key: '4', label: 'Monthly EMI', value: formatCurrency(bankOffer.monthlyEMI), icon: <CalculatorOutlined /> },
    { key: '5', label: 'Processing Fee', value: formatCurrency(bankOffer.processingFee), icon: <FileTextOutlined /> },
    { key: '6', label: 'Valuation Fee', value: formatCurrency(bankOffer.valuationFee), icon: <FileTextOutlined /> },
    { key: '7', label: 'Early Settlement Fee', value: `${bankOffer.earlySettlementFee}%`, icon: <PercentageOutlined /> },
  ];

  // Financial Summary Data
  const financialSummaryData = [
    { key: '1', label: 'Property Value', value: formatCurrency(summary.propertyValue), icon: <HomeOutlined /> },
    { key: '2', label: 'Down Payment', value: formatCurrency(summary.downPayment), icon: <DollarOutlined /> },
    { key: '3', label: 'LTV Ratio', value: `${summary.ltvPercentage}%`, icon: <PercentageOutlined /> },
    { key: '4', label: 'DBR', value: `${summary.dbrPercentage}% (${summary.dbrStatus})`, icon: <PercentageOutlined /> },
    { key: '5', label: 'Total Upfront Cost', value: formatCurrency(summary.totalUpfrontCost), icon: <WalletOutlined /> },
    { key: '6', label: 'Total Interest Payable', value: formatCurrency(summary.totalInterestPayable), icon: <RiseOutlined /> },
    { key: '7', label: 'Total Amount Payable', value: formatCurrency(summary.totalAmountPayable), icon: <DollarOutlined /> },
  ];

  // Commission Data
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
    <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "24px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBack}
                style={{ borderRadius: 8 }}
              >
                Back
              </Button>
              <div>
                <Title level={3} style={{ margin: 0, color: "#1e1b4b" }}>
                  Amount Details
                </Title>
                <Text type="secondary">Case: {caseData.caseReference}</Text>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button icon={<PrinterOutlined />} onClick={handlePrint}>Print</Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <Alert
          message={`Case Status: ${caseData.currentStatus}`}
          description={comparison.message || 'Loan disbursed successfully'}
          type={caseData.currentStatus === 'Disbursed' ? 'success' : 'info'}
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
        />

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 16, textAlign: 'center' }}>
              <Statistic
                title="Requested Amount"
                value={comparison.requestedAmount}
                prefix={<BankOutlined />}
                valueStyle={{ fontSize: 20 }}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 16, textAlign: 'center', border: `1px solid ${WARNING_COLOR}` }}>
              <Statistic
                title="Approved Amount"
                value={comparison.approvedAmount}
                prefix={<CheckCircleOutlined style={{ color: WARNING_COLOR }} />}
                valueStyle={{ color: WARNING_COLOR, fontSize: 20 }}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 16, textAlign: 'center', background: `linear-gradient(135deg, ${SUCCESS_COLOR}08 0%, #fff 100%)` }}>
              <Statistic
                title="Disbursed Amount"
                value={comparison.disbursedAmount}
                prefix={<DollarOutlined style={{ color: SUCCESS_COLOR }} />}
                valueStyle={{ color: SUCCESS_COLOR, fontSize: 20 }}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 16, textAlign: 'center' }}>
              <Statistic
                title="Monthly EMI"
                value={bankOffer.monthlyEMI}
                prefix={<CalculatorOutlined />}
                valueStyle={{ fontSize: 20 }}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>
        </Row>

        {/* Comparison Banner */}
        {comparison.amountDifference !== 0 && (
          <Alert
            message={`Amount Difference: ${formatCurrency(Math.abs(comparison.amountDifference))}`}
            description={comparison.message}
            type={comparison.amountStatus === 'reduced' ? 'warning' : 'info'}
            showIcon
            style={{ marginBottom: 24, borderRadius: 12 }}
          />
        )}

        {/* Tabs */}
        <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab={<span><DollarOutlined /> Amount Summary</span>} key="summary">
              <AntTable 
                columns={columnsConfig} 
                dataSource={amountComparisonData} 
                pagination={false} 
                size="middle"
                bordered
                rowKey="key"
                style={{ borderRadius: 12, marginTop: 16 }}
              />
            </TabPane>

            <TabPane tab={<span><BankOutlined /> Loan Details</span>} key="loan">
              <AntTable 
                columns={columnsConfig} 
                dataSource={loanDetailsData} 
                pagination={false} 
                size="middle"
                bordered
                rowKey="key"
                style={{ borderRadius: 12, marginTop: 16 }}
              />
            </TabPane>

            <TabPane tab={<span><HomeOutlined /> Financial Summary</span>} key="financial">
              <AntTable 
                columns={columnsConfig} 
                dataSource={financialSummaryData} 
                pagination={false} 
                size="middle"
                bordered
                rowKey="key"
                style={{ borderRadius: 12, marginTop: 16 }}
              />
            </TabPane>

            <TabPane tab={<span><GiftOutlined /> Commission</span>} key="commission">
              <AntTable 
                columns={columnsConfig} 
                dataSource={commissionData} 
                pagination={false} 
                size="middle"
                bordered
                rowKey="key"
                style={{ borderRadius: 12, marginTop: 16 }}
              />
              <Card style={{ marginTop: 16, background: '#f0fdf4', border: `1px solid ${SUCCESS_COLOR}`, borderRadius: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <Text strong style={{ color: SUCCESS_COLOR }}>Commission Calculation Summary</Text>
                  <div style={{ marginTop: 8, fontSize: 14 }}>
                    {formatCurrency(commission.xotoCommissionFromBank)} × {commission.recipientPercentage}% = <Text strong style={{ color: SUCCESS_COLOR, fontSize: 18 }}>{formatCurrency(commission.commissionAmount)}</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Commission will be processed within 30 days after disbursement confirmation</Text>
                </div>
              </Card>
            </TabPane>

            <TabPane tab={<span><ClockCircleOutlined /> Timeline</span>} key="timeline">
              <div style={{ marginTop: 16 }}>
                {timeline.map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    marginBottom: 16, 
                    padding: 16, 
                    background: item.isFinal ? '#f0fdf4' : '#f8fafc', 
                    borderRadius: 12,
                    borderLeft: `4px solid ${item.isFinal ? SUCCESS_COLOR : PURPLE}`
                  }}>
                    <div style={{ minWidth: 180 }}>
                      <Text strong>{formatDate(item.date)}</Text>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text>{item.event}</Text>
                      {item.reference && (
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Reference: {item.reference}</Text>
                        </div>
                      )}
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                        By: {item.addedBy}
                      </Text>
                    </div>
                    {item.isFinal && <Tag color="success">Final Step</Tag>}
                  </div>
                ))}
                {timeline.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Text type="secondary">No timeline events found</Text>
                  </div>
                )}
              </div>
            </TabPane>
          </Tabs>
        </Card>

        {/* Summary Cards at Bottom */}
        <Divider />
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} lg={8}>
            <Card style={{ borderRadius: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">Total Upfront Cost</Text>
                <Title level={3} style={{ margin: '8px 0 0', color: ERROR_COLOR }}>
                  {formatCurrency(summary.totalUpfrontCost)}
                </Title>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card style={{ borderRadius: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">Total Interest Payable</Text>
                <Title level={3} style={{ margin: '8px 0 0', color: WARNING_COLOR }}>
                  {formatCurrency(summary.totalInterestPayable)}
                </Title>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card style={{ borderRadius: 16, background: `linear-gradient(135deg, ${PURPLE}08 0%, #fff 100%)` }}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">Total Amount Payable</Text>
                <Title level={3} style={{ margin: '8px 0 0', color: PURPLE }}>
                  {formatCurrency(summary.totalAmountPayable)}
                </Title>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Raw Data Section (Collapsible) */}
        <Card style={{ marginTop: 24, borderRadius: 16 }} size="small">
          <details>
            <summary style={{ cursor: 'pointer', color: PURPLE, fontWeight: 500 }}>
              <EyeOutlined /> View Raw Data
            </summary>
            <pre style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 8, overflow: 'auto', fontSize: 12 }}>
              {JSON.stringify(caseData.rawData, null, 2)}
            </pre>
          </details>
        </Card>
      </div>
    </div>
  );
};

export default DisbursedFullAmountCases;