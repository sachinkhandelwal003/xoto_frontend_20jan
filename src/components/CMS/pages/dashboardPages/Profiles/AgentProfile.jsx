import React, { useEffect, useState } from "react";
import { 
  Card, Avatar, Badge, Descriptions, Tag, Space, Row, Col, 
  Statistic, Divider, Typography, Button, Modal, Form, Input, message, Upload, Tooltip, Switch 
} from "antd"; 
import {
  UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
  SafetyCertificateOutlined, CheckCircleOutlined, CrownOutlined,
  FileDoneOutlined, TrophyOutlined, AreaChartOutlined, EditOutlined, 
  CameraOutlined, LoadingOutlined, FilePdfOutlined, EyeOutlined, 
  UploadOutlined, WhatsAppOutlined, MessageOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const { Text, Title } = Typography; 

const AgentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [form] = Form.useForm();

  const getProfile = async () => {
    setLoading(true);
    try {
      const response = await apiService.get("profile/get-profile-data");
      const data = response?.data?.data || response?.data;
      setProfile(data);
    } catch (error) {
      message.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getProfile(); }, []);

  // Generic File Upload for Photo, ID, and RERA
  const handleFileUpload = async (file, fieldName) => {
    const formData = new FormData();
    formData.append('profilePicture', file); 
    formData.append('targetField', fieldName); 

    setImageUploading(true);
    try {
      await apiService.post("profile/update-profile-picture", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success(`${fieldName.replace('_', ' ')} updated!`);
      getProfile();
    } catch (error) {
      message.error("Upload failed.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleUpdate = async (values) => {
    setUpdating(true);
    try {
      await apiService.put("profile/update-profile", values);
      message.success("Profile updated successfully!");
      setIsModalVisible(false);
      getProfile();
    } catch (error) {
      message.error("Update failed.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex justify-center p-6">
      <Card
        loading={loading}
        className="w-full max-w-4xl rounded-xl shadow-lg border-0"
        cover={<div className="h-32 bg-gradient-to-br from-purple-600 to-indigo-900" />}
      >
        <div className="relative -mt-16 mb-5 px-6">
          <div className="flex justify-between items-end">
            <Badge dot status={profile?.isVerified ? "success" : "warning"} offset={[-10, 80]}>
              <Upload showUploadList={false} customRequest={({file}) => handleFileUpload(file, 'profile_photo')}>
                <div className="relative group cursor-pointer rounded-full border-4 border-white shadow-md bg-white">
                  {imageUploading && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-20"><LoadingOutlined className="text-white text-xl" spin /></div>}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"><CameraOutlined className="text-white text-2xl" /></div>
                  <Avatar size={100} icon={<UserOutlined />} src={profile?.profile_photo} />
                </div>
              </Upload>
            </Badge>
            <Button icon={<EditOutlined />} onClick={() => { form.setFieldsValue(profile); setIsModalVisible(true); }}>Edit Profile</Button>
          </div>

          <div className="mt-4">
            <Title level={3} className="m-0">{profile?.first_name} {profile?.last_name}</Title>
            <Space className="mt-2">
              <Tag color="purple">{profile?.specialization}</Tag>
              <Tag color="gold"><CrownOutlined /> {profile?.subscriptionPlan || "Free"} Plan</Tag>
              {profile?.isVerified && <Tag color="blue"><CheckCircleOutlined /> Verified</Tag>}
            </Space>
          </div>
        </div>

      
        <div className="px-6 pb-6">
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1 }} size="middle">
            <Descriptions.Item label="Email">{profile?.email} {profile?.is_email_verified && <CheckCircleOutlined className="text-green-500 ml-1" />}</Descriptions.Item>
            <Descriptions.Item label="Phone">{profile?.country_code} {profile?.phone_number} {profile?.is_mobile_verified && <CheckCircleOutlined className="text-green-500 ml-1" />}</Descriptions.Item>
            <Descriptions.Item label="Operating City">{profile?.operating_city}</Descriptions.Item>
            <Descriptions.Item label="Country">{profile?.country || "UAE"}</Descriptions.Item>
            <Descriptions.Item label="ID Proof">
              {profile?.id_proof ? <Button type="link" icon={<EyeOutlined />} href={profile.id_proof} target="_blank">Emirates ID</Button> : "Not Uploaded"}
            </Descriptions.Item>
            <Descriptions.Item label="RERA Certificate">
              {profile?.rera_certificate ? <Button type="link" icon={<FilePdfOutlined />} href={profile.rera_certificate} target="_blank">Certificate</Button> : "Not Uploaded"}
            </Descriptions.Item>
            <Descriptions.Item label="Notification Settings" span={2}>
              <Space size="large">
                <span><MailOutlined /> Email: {profile?.notificationSettings_email ? "On" : "Off"}</span>
                <span><WhatsAppOutlined /> WhatsApp: {profile?.notificationSettings_whatsapp ? "On" : "Off"}</span>
                <span><MessageOutlined /> SMS: {profile?.notificationSettings_sms ? "On" : "Off"}</span>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal title="Update Agent Profile" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} width={800} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleUpdate} className="mt-4">
          <Title level={5} className="mb-4 text-gray-400">Personal Information</Title>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="first_name" label="First Name"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="last_name" label="Last Name"><Input /></Form.Item></Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}><Form.Item name="country_code" label="Code"><Input /></Form.Item></Col>
            <Col span={18}><Form.Item name="phone_number" label="Phone"><Input /></Form.Item></Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}><Form.Item name="operating_city" label="Operating City"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="country" label="Country"><Input /></Form.Item></Col>
          </Row>

          <Form.Item name="specialization" label="Specialization"><Input /></Form.Item>

          <Divider orientation="left">Documents</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary">Update Emirates ID</Text>
              <Upload showUploadList={false} customRequest={({file}) => handleFileUpload(file, 'id_proof')}>
                <Button icon={<UploadOutlined />} block className="mt-2">ID Proof</Button>
              </Upload>
            </Col>
            <Col span={12}>
              <Text type="secondary">Update RERA Certificate</Text>
              <Upload showUploadList={false} customRequest={({file}) => handleFileUpload(file, 'rera_certificate')}>
                <Button icon={<UploadOutlined />} block className="mt-2">RERA Document</Button>
              </Upload>
            </Col>
          </Row>

          <Divider orientation="left">Notification Preferences</Divider>
          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <Form.Item name="notificationSettings_email" label="Email Notifications" valuePropName="checked"><Switch /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="notificationSettings_whatsapp" label="WhatsApp Alerts" valuePropName="checked"><Switch /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="notificationSettings_sms" label="SMS Notifications" valuePropName="checked"><Switch /></Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating}>Update Profile</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentProfile;