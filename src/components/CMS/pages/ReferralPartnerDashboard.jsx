import React, { useContext } from 'react';
import { Card, Row, Col, Typography, Statistic } from 'antd';
import { 
  UsergroupAddOutlined, 
  WalletOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';
import { AuthContext } from '../../../manageApi/context/AuthContext'; // Apna exact path check karlena

const { Title, Text } = Typography;

const ReferralPartnerDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <Title level={2} style={{ color: '#4c1d95', marginBottom: 0 }}>
          Welcome back, {user?.firstName || 'Partner'}! 👋
        </Title>
        <Text type="secondary" className="text-lg">
          Here is your referral overview and recent activity.
        </Text>
      </div>

      {/* Stats Cards Section */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="rounded-2xl shadow-sm border-l-4 border-[#03A4F4] hover:shadow-md transition-all">
            <Statistic 
              title={<span className="text-gray-500 font-semibold text-base">Total Referrals Submitted</span>}
              value={0} 
              prefix={<UsergroupAddOutlined className="text-[#03A4F4] mr-2" />}
              valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '28px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="rounded-2xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all">
            <Statistic 
              title={<span className="text-gray-500 font-semibold text-base">Successful Deals</span>}
              value={0} 
              prefix={<CheckCircleOutlined className="text-green-500 mr-2" />}
              valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '28px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="rounded-2xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-all">
            <Statistic 
              title={<span className="text-gray-500 font-semibold text-base">Total Earnings (AED)</span>}
              value={0} 
              prefix={<WalletOutlined className="text-purple-500 mr-2" />}
              valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '28px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Area (For Future Tables/Charts) */}
      <Card className="mt-8 rounded-2xl shadow-sm border-0">
        <Title level={4}>Recent Activity</Title>
        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
          <UsergroupAddOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#e5e7eb' }} />
          <Text className="text-gray-500 text-lg">No referrals submitted yet.</Text>
          <Text className="text-gray-400">Submit your first lead to start tracking your progress!</Text>
        </div>
      </Card>
    </div>
  );
};

export default ReferralPartnerDashboard;