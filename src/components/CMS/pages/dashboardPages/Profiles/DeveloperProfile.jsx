import React, { useEffect, useState } from "react";
// 1. Typography ko yahan import list mein add karein
import { Card, Avatar, Badge, Descriptions, Tag, Space, Row, Col, Statistic, Divider, Typography } from "antd"; 
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  FileProtectOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  TrophyOutlined,
  AreaChartOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const { Text } = Typography; 

const DeveloperProfile = () => {
const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);

  const getProfile = async () => {
    try {
      const response = await apiService.get("profile/get-profile-data");
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
    <div className="flex justify-center p-2">
      <Card
        loading={loading}
        className="w-full max-w-4xl rounded-xl overflow-hidden shadow-lg border-0"
        cover={
          <div className="h-32 bg-gradient-to-br from-indigo-800 to-black" />
        }
      >
        {/* Header Section */}
        <div className="text-center -mt-16 mb-5">
          <Badge
            dot
            status={profile?.isVerifiedByAdmin ? "success" : "warning"}
            offset={[-10, 80]}
            title={profile?.isVerifiedByAdmin ? "Verified by Admin" : "Unverified"}
          >
            <Avatar
              size={100}
              icon={<UserOutlined />}
              src={profile?.logo}
              className="border-4 border-white shadow-md bg-white"
            />
          </Badge>

          <h2 className="mt-4 mb-0 text-2xl font-bold text-gray-800">
            {profile?.name || "Company Name"}
          </h2>

          <Space className="mt-2">
            <Tag color="purple" className="px-3 py-1 rounded-full text-sm">
              Property Developer
            </Tag>
            {profile?.isVerifiedByAdmin && (
              <Tag color="green" className="px-3 py-1 rounded-full text-sm">
                <CheckCircleOutlined /> Verified
              </Tag>
            )}
          </Space>
        </div>

        {/* Performance Stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
          <Row gutter={16} justify="center" className="text-center">
            <Col span={6}>
              <Statistic title="Leads Generated" value={profile?.leadsGenerated_stats || 0} prefix={<AreaChartOutlined className="text-blue-500" />} />
            </Col>
            <Col span={6}>
              <Statistic title="Units Sold" value={profile?.unitsSold_stats || 0} prefix={<TrophyOutlined className="text-green-500" />} />
            </Col>
            <Col span={6}>
              <Statistic title="Presentations" value={profile?.presentationsGenerated_stats || 0} prefix={<FileDoneOutlined className="text-purple-500" />} />
            </Col>
            <Col span={6}>
              <Statistic title="Conversion Rate" value={profile?.conversionRate_stats || 0} suffix="%" valueStyle={{ color: '#cf1322' }} />
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Detailed Information */}
        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle">
          
          <Descriptions.Item label={<span className="flex items-center gap-2"><MailOutlined /> Email</span>}>
            {profile?.email || "N/A"} 
          </Descriptions.Item>

          <Descriptions.Item label={<span className="flex items-center gap-2"><PhoneOutlined /> Phone</span>}>
            {profile?.country_code} {profile?.phone_number}
          </Descriptions.Item>

          <Descriptions.Item label={<span className="flex items-center gap-2"><EnvironmentOutlined /> Location</span>}>
            <span className="capitalize">{profile?.address || profile?.city || "Location not updated"}</span>
            {(profile?.city || profile?.country) && <><br /><span className="text-gray-500 text-sm">{profile?.city}{profile?.city && profile?.country && ', '}{profile?.country}</span></>}
          </Descriptions.Item>

          <Descriptions.Item label={<span className="flex items-center gap-2"><GlobalOutlined /> Website</span>}>
            {profile?.websiteUrl ? (
              <a href={profile?.websiteUrl.startsWith('http') ? profile.websiteUrl : `https://${profile.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {profile.websiteUrl}
              </a>
            ) : "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label={<span className="flex items-center gap-2"><FileProtectOutlined /> RERA Number</span>}>
            {profile?.reraNumber ? <Text strong>{profile.reraNumber}</Text> : "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label={<span className="flex items-center gap-2"><SafetyCertificateOutlined /> Commission Status</span>}>
            <Tag color={
              profile?.commissionStatus_stats === "approved" ? "blue" : 
              profile?.commissionStatus_stats === "paid" ? "green" : 
              profile?.commissionStatus_stats === "rejected" ? "red" : "orange"
            } className="capitalize">
              {profile?.commissionStatus_stats || "Pending"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label={<span className="flex items-center gap-2"><InfoCircleOutlined /> About Company</span>} span={2}>
            {profile?.description || "No description provided."}
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

export default DeveloperProfile;