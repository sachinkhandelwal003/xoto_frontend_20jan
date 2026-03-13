import React, { useEffect, useState } from "react";
import { Card, Avatar, Badge, Descriptions, Tag, Space, Row, Col, Statistic, Divider } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  FileDoneOutlined,
  TrophyOutlined,
  AreaChartOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const AgentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProfile = async () => {
    try {
      const response = await apiService.get("profile/get-profile-data");
      // Aapke backend structure ke hisaab se data set karein
      const data = response?.data?.data || response?.data;
      setProfile(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="flex justify-center p-6">
      <Card
        loading={loading}
        className="w-full max-w-4xl rounded-xl overflow-hidden shadow-lg border-0"
        cover={
          <div className="h-32 bg-gradient-to-br from-purple-600 to-indigo-900" />
        }
      >
        {/* Header Section */}
        <div className="text-center -mt-16 mb-5">
          <Badge
            dot
            status={profile?.isVerified ? "success" : "warning"}
            offset={[-10, 80]}
            title={profile?.isVerified ? "Verified" : "Unverified"}
          >
            <Avatar
              size={100}
              icon={<UserOutlined />}
              src={profile?.profile_photo}
              className="border-4 border-white shadow-md bg-white"
            />
          </Badge>

          <h2 className="mt-4 mb-0 text-2xl font-bold text-gray-800">
            {profile?.first_name} {profile?.last_name}
          </h2>

          <Space className="mt-2">
            <Tag color="purple" className="px-3 py-1 rounded-full text-sm capitalize">
              {profile?.specialization || "Real Estate Agent"}
            </Tag>
            <Tag color={profile?.subscriptionPlan === "paid" ? "gold" : "default"} className="px-3 py-1 rounded-full text-sm capitalize">
              <CrownOutlined /> {profile?.subscriptionPlan || "Free"} Plan
            </Tag>
          </Space>
        </div>

        {/* Performance Stats (From your model) */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
          <Row gutter={16} justify="center" className="text-center">
            <Col span={8}>
              <Statistic title="Leads Created" value={profile?.leadsCreated_count || 0} prefix={<AreaChartOutlined className="text-blue-500" />} />
            </Col>
            <Col span={8}>
              <Statistic title="Deals Closed" value={profile?.dealsClosed_count || 0} prefix={<TrophyOutlined className="text-green-500" />} />
            </Col>
            <Col span={8}>
              <Statistic title="Presentations" value={profile?.presentationsGenerated_count || 0} prefix={<FileDoneOutlined className="text-purple-500" />} />
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Detailed Information */}
        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle">
          
          <Descriptions.Item label={<span className="flex items-center gap-2"><MailOutlined /> Email</span>}>
            {profile?.email} 
            {profile?.is_email_verified && <CheckCircleOutlined className="text-green-500 ml-2" title="Verified" />}
          </Descriptions.Item>

          <Descriptions.Item label={<span className="flex items-center gap-2"><PhoneOutlined /> Phone</span>}>
            {profile?.country_code} {profile?.phone_number}
            {profile?.is_mobile_verified && <CheckCircleOutlined className="text-green-500 ml-2" title="Verified" />}
          </Descriptions.Item>

          <Descriptions.Item label={<span className="flex items-center gap-2"><EnvironmentOutlined /> Location</span>}>
            <span className="capitalize">{profile?.operating_city}</span>
            {profile?.country && `, ${profile?.country}`}
          </Descriptions.Item>

          <Descriptions.Item label={<span className="flex items-center gap-2"><SafetyCertificateOutlined /> Onboarding Status</span>}>
            <Tag color={
              profile?.onboarding_status === "completed" ? "green" : 
              profile?.onboarding_status === "approved" ? "blue" : "orange"
            } className="capitalize">
              {profile?.onboarding_status || "Registered"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Member Since" span={2}>
            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric'
            }) : "N/A"}
          </Descriptions.Item>

        </Descriptions>
      </Card>
    </div>
  );
};

export default AgentProfile;