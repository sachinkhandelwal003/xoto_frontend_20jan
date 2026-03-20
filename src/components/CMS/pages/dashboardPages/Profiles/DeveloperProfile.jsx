import React, { useEffect, useState } from "react";
import { 
  Card, Avatar, Badge, Descriptions, Tag, Space, Row, Col, 
  Statistic, Divider, Typography, Button, Modal, Form, Input, message, Upload, Tooltip 
} from "antd"; 
import {
  UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
  SafetyCertificateOutlined, GlobalOutlined, FileProtectOutlined,
  InfoCircleOutlined, CheckCircleOutlined, FileDoneOutlined,
  TrophyOutlined, AreaChartOutlined, EditOutlined, CameraOutlined, LoadingOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const { Text } = Typography; 

const DeveloperProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const [imageUploading, setImageUploading] = useState(false);

  const getProfile = async () => {
    setLoading(true);
    try {
      const response = await apiService.get("profile/get-profile-data");
      const data = response?.data?.data || response?.data;
      setProfile(data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const beforeImageUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) message.error('You can only upload JPG/PNG file!');
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error('Image must be smaller than 2MB!');
    return isJpgOrPng && isLt2M;
  };

  const handleImageUploadRequest = async ({ file }) => {
    const formData = new FormData();
    formData.append('profilePicture', file); 

    setImageUploading(true);
    try {
      await apiService.post("profile/update-profile-picture", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success("Profile picture updated successfully!");
      getProfile(); 
    } catch (error) {
      message.error("Failed to upload profile picture.");
    } finally {
      setImageUploading(false);
    }
  };

  const showEditModal = () => {
    form.setFieldsValue(profile); 
    setIsModalVisible(true);
  };

  const handleUpdate = async (values) => {
    setUpdating(true);
    try {
      await apiService.put("profile/update-profile", values);
      message.success("Profile updated successfully!");
      setIsModalVisible(false);
      getProfile(); 
    } catch (error) {
      message.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex justify-center p-4">
      <Card
        loading={loading}
        className="w-full max-w-4xl rounded-xl overflow-hidden shadow-lg border-0"
        cover={<div className="h-32 bg-gradient-to-br from-indigo-800 to-black" />}
      >
        {/* Header Section */}
        <div className="relative -mt-16 mb-5 px-6">
          <div className="flex justify-between items-end">
            <Badge
              dot
              status={profile?.isVerifiedByAdmin ? "success" : "warning"}
              offset={[-10, 80]}
            >
              <Upload
                showUploadList={false}
                beforeUpload={beforeImageUpload}
                customRequest={handleImageUploadRequest}
                disabled={imageUploading}
              >
                <Tooltip title="Change Photo">
                  <div className="relative group cursor-pointer rounded-full border-4 border-white shadow-md bg-white">
                    {imageUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20">
                        <LoadingOutlined className="text-white text-xl" spin />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <CameraOutlined className="text-white text-2xl" />
                    </div>
                    <Avatar size={100} icon={<UserOutlined />} src={profile?.logo} />
                  </div>
                </Tooltip>
              </Upload>
            </Badge>

            <Button 
              icon={<EditOutlined />} 
              onClick={showEditModal}
              className="mb-2 font-medium border-gray-300 shadow-sm"
            >
              Edit Profile
            </Button>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {profile?.name || "Company Name"}
            </h2>
            <Space>
              <Tag color="purple" className="rounded-full">Property Developer</Tag>
              {profile?.isVerifiedByAdmin && (
                <Tag color="green" className="rounded-full"><CheckCircleOutlined /> Verified</Tag>
              )}
            </Space>
          </div>
        </div>

        {/* Stats Row */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100 mx-6">
          <Row gutter={16} className="text-center">
            <Col span={6}>
              <Statistic title="Leads" value={profile?.leadsGenerated_stats || 0} prefix={<AreaChartOutlined className="text-blue-500" />} />
            </Col>
            <Col span={6}>
              <Statistic title="Units" value={profile?.unitsSold_stats || 0} prefix={<TrophyOutlined className="text-green-500" />} />
            </Col>
            <Col span={6}>
              <Statistic title="Presentations" value={profile?.presentationsGenerated_stats || 0} prefix={<FileDoneOutlined className="text-purple-500" />} />
            </Col>
            <Col span={6}>
              <Statistic title="Conv. Rate" value={profile?.conversionRate_stats || 0} suffix="%" />
            </Col>
          </Row>
        </div>

        <Divider />

        <div className="px-6 pb-6">
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle">
            <Descriptions.Item label={<><MailOutlined className="mr-2" /> Email</>}>{profile?.email || "N/A"}</Descriptions.Item>
            <Descriptions.Item label={<><PhoneOutlined className="mr-2" /> Phone</>}>{profile?.country_code} {profile?.phone_number}</Descriptions.Item>
            <Descriptions.Item label={<><EnvironmentOutlined className="mr-2" /> Location</>} span={2}>
              <span className="capitalize">{profile?.address || "N/A"}</span>
              {profile?.city && <div className="text-gray-400 text-xs">{profile.city}, {profile.country}</div>}
            </Descriptions.Item>
            <Descriptions.Item label={<><GlobalOutlined className="mr-2" /> Website</>}>
              {profile?.websiteUrl ? <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-500">{profile.websiteUrl}</a> : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label={<><FileProtectOutlined className="mr-2" /> RERA Number</>}>{profile?.reraNumber || "N/A"}</Descriptions.Item>
            <Descriptions.Item label={<><InfoCircleOutlined className="mr-2" /> About Company</>} span={2}>{profile?.description || "No description provided."}</Descriptions.Item>
          </Descriptions>
        </div>
      </Card>

      {/* Edit Modal with ALL FIELDS */}
      <Modal 
        title="Update Profile Information" 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        footer={null} 
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate} className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Company Name" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="e.g. Acme Properties" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Official Email" rules={[{ type: 'email', message: 'Invalid email' }]}>
                <Input placeholder="email@company.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="country_code" label="Code">
                <Input placeholder="+91" />
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item name="phone_number" label="Phone Number">
                <Input placeholder="9876543210" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="websiteUrl" label="Website URL">
                <Input placeholder="https://www.company.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reraNumber" label="RERA Registration Number">
                <Input placeholder="RERA-12345-XYZ" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" plain><Text type="secondary" style={{fontSize: '12px'}}>Location Details</Text></Divider>

          <Form.Item name="address" label="Office Address">
            <Input.TextArea rows={2} placeholder="Full building address..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="City">
                <Input placeholder="e.g. Dubai" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="country" label="Country">
                <Input placeholder="e.g. UAE" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" plain><Text type="secondary" style={{fontSize: '12px'}}>Company Bio</Text></Divider>

          <Form.Item name="description" label="About Company">
            <Input.TextArea rows={4} placeholder="Briefly describe your company's history and expertise..." />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating}>
              Update Profile
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DeveloperProfile;