import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';

import {
  RiUserAddLine, RiMoneyDollarCircleLine, RiFileTextLine, RiBarChartLine,
  RiTrophyLine, RiCalculatorLine, RiArrowUpLine, RiArrowDownLine,
  RiTimeLine, RiCheckDoubleLine
} from 'react-icons/ri';
import { Card, Row, Col, Statistic, Tag, List, Avatar, Button, Typography, Spin, Alert } from 'antd';

const { Title, Text } = Typography;

const VAULT_COLORS = {
  primary: '#5C039B',
  secondary: '#03A4F4',
  success: '#10B981',
  warning: '#F97316',
  purple: '#722ED1',
};

const VaultAgentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Mock Data (Replace with real API call later)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        setData({
          totalReferrals: 47,
          activeCases: 12,
          totalCommission: 124500,
          pendingCommission: 28500,
          conversionRate: 68,
          thisMonthReferrals: 18,
          leaderboardRank: 7,
          recentLeads: [
            { id: 1, name: "Ahmed Al Mansoori", status: "Qualified", time: "2h ago", amount: "AED 4.2M" },
            { id: 2, name: "Fatima Khan", status: "Docs Pending", time: "Yesterday", amount: "AED 6.8M" },
            { id: 3, name: "Mohammed Rashid", status: "Pre-Approved", time: "3d ago", amount: "AED 3.1M" },
          ],
          statusBreakdown: [
            { name: "New", value: 8, color: "#94A3B8" },
            { name: "Contacted", value: 14, color: "#03A4F4" },
            { name: "Qualified", value: 11, color: "#5C039B" },
            { name: "Docs Pending", value: 7, color: "#F97316" },
            { name: "Disbursed", value: 7, color: "#10B981" },
          ],
          monthlyTrend: [
            { month: "Jan", referrals: 8, commission: 24500 },
            { month: "Feb", referrals: 12, commission: 37800 },
            { month: "Mar", referrals: 15, commission: 46200 },
            { month: "Apr", referrals: 18, commission: 52100 },
          ]
        });
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  if (error) return <Alert message="Error" description={error} type="error" showIcon className="m-6" />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2} className="text-gray-900 mb-1">Welcome back, Agent</Title>
          <Text className="text-gray-500 text-lg">Xoto Vault • Mortgage Referral Dashboard</Text>
        </div>
        <Button type="primary" icon={<RiUserAddLine />} size="large" className="bg-[#5C039B] hover:bg-[#4a027c]">
          Refer New Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Referrals"
              value={data.totalReferrals}
              prefix={<RiUserAddLine className="text-[#5C039B]" />}
              valueStyle={{ color: VAULT_COLORS.primary, fontWeight: 'bold' }}
            />
            <div className="mt-2 flex items-center gap-1 text-emerald-600 text-sm">
              <RiArrowUpLine /> +{data.thisMonthReferrals} this month
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Active Cases"
              value={data.activeCases}
              prefix={<RiFileTextLine className="text-[#03A4F4]" />}
              valueStyle={{ color: VAULT_COLORS.secondary }}
            />
            <Tag color="blue" className="mt-2">In Progress</Tag>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Commission"
              value={data.totalCommission}
              prefix="AED "
              valueStyle={{ color: VAULT_COLORS.success }}
            />
            <div className="text-xs text-gray-500 mt-1">Earned till date</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Pending Payout"
              value={data.pendingCommission}
              prefix="AED "
              valueStyle={{ color: VAULT_COLORS.warning }}
            />
            <Tag color="orange" className="mt-2">Awaiting Disbursement</Tag>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Lead Status Breakdown */}
        <Col xs={24} lg={12}>
          <Card title="My Referral Pipeline" bordered={false} className="shadow-sm">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={data.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {data.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Monthly Trend */}
        <Col xs={24} lg={12}>
          <Card title="Referral & Commission Trend" bordered={false} className="shadow-sm">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="referrals"
                  stackId="1"
                  stroke={VAULT_COLORS.primary}
                  fill={VAULT_COLORS.primary}
                  fillOpacity={0.2}
                  name="Referrals"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="commission"
                  stroke={VAULT_COLORS.success}
                  fill={VAULT_COLORS.success}
                  fillOpacity={0.15}
                  name="Commission (AED)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Recent Leads */}
        <Col xs={24}>
          <Card title="Recent Referrals" bordered={false} className="shadow-sm">
            <List
              dataSource={data.recentLeads}
              renderItem={(lead) => (
                <List.Item
                  actions={[
                    <Tag color={
                      lead.status === "Qualified" ? "green" :
                      lead.status === "Pre-Approved" ? "blue" : "orange"
                    }>
                      {lead.status}
                    </Tag>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: VAULT_COLORS.primary }} icon={<RiUserAddLine />} />}
                    title={<Text strong>{lead.name}</Text>}
                    description={`Property Value: ${lead.amount} • ${lead.time}`}
                  />
                </List.Item>
              )}
            />
            <div className="text-center mt-4">
              <Button type="link" className="text-[#5C039B]">View All Referrals →</Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mt-8">
        <Col xs={24} sm={8}>
          <Button
            block
            size="large"
            icon={<RiCalculatorLine />}
            className="h-14 text-lg font-medium border-[#5C039B] text-[#5C039B] hover:bg-[#5C039B] hover:text-white"
          >
            Mortgage Calculator
          </Button>
        </Col>
        <Col xs={24} sm={8}>
          <Button
            block
            size="large"
            icon={<RiTrophyLine />}
            className="h-14 text-lg font-medium border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white"
          >
            Leaderboard
          </Button>
        </Col>
        <Col xs={24} sm={8}>
          <Button
            block
            size="large"
            type="primary"
            icon={<RiFileTextLine />}
            className="h-14 text-lg font-medium bg-[#5C039B]"
          >
            Refer New Lead
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default VaultAgentDashboard;