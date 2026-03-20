import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, Avatar, Badge, Descriptions, Tag, Button, 
  Upload, message, Spin, Modal, Form, Input, Row, Col 
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  ArrowLeftOutlined,
  EditOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // Edit Modal States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();

  const getProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("profile/get-profile-data");
      setProfile(response?.data?.data || response?.data || response);
    } catch (error) {
      console.error(error);
      message.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleAvatarUpload = async (options) => {
    const { file } = options;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setAvatarUploading(true);
      const uploadRes = await apiService.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = uploadRes?.data?.file?.url || uploadRes?.file?.url;

      if (!imageUrl) {
        message.error("Image URL not found in server response");
        return;
      }

      await apiService.put("users/edit/customer", { profilePic: imageUrl });
      await getProfile();
      message.success("Profile photo updated successfully!");

    } catch (error) {
      console.error("❌ Auto-update failed:", error);
      message.error("Failed to update profile photo");
    } finally {
      setAvatarUploading(false);
    }
  };

  const uploadProps = {
    name: "avatar",
    showUploadList: false,
    customRequest: handleAvatarUpload,
    accept: "image/*",
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) { message.error("Only images allowed"); return false; }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) { message.error("Max 5MB allowed"); return false; }
      return true;
    },
  };

  const showEditModal = () => {
    form.setFieldsValue(profile);
    setIsModalVisible(true);
  };

  const handleUpdate = async (values) => {
    setUpdating(true);
    try {
      await apiService.put("profile/update-profile", values);
      message.success("Customer profile updated!");
      setIsModalVisible(false);
      getProfile();
    } catch (error) {
      console.error(error);
      message.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const fullName = profile?.name
    ? `${profile?.name?.first_name || ""} ${profile?.name?.last_name || ""}`
    : "Customer";

  const phoneNumber = profile?.mobile?.number
    ? `${profile?.mobile?.country_code || ""} ${profile?.mobile?.number}`
    : "Not provided";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 relative">
      <div className="absolute top-6 left-4 md:left-8">
        <Button
          type="link"
          icon={<ArrowLeftOutlined style={{ fontSize: "28px" }} />}
          onClick={() => navigate("/dashboard/customer")}
          className="text-[#5C039B]"
        />
      </div>

      <div className="w-full max-w-2xl mt-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading profile..." />
          </div>
        ) : (
          <Card
            className="rounded-2xl overflow-hidden shadow-lg border-0"
            cover={<div className="h-40 bg-gradient-to-r from-[#5C039B] to-[#9c27b0]" />}
          >
            {/* Header Section */}
            <div className="relative -mt-16 mb-8 px-6">
              
              {/* Flexbox for Avatar (Left) and Button (Right) */}
              <div className="flex justify-between items-end">
                <Badge
                  count={
                    <Upload {...uploadProps}>
                      <div className="bg-white border rounded-full p-2 shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        {avatarUploading ? <Spin size="small" /> : <CameraOutlined style={{ color: '#5C039B' }} />}
                      </div>
                    </Upload>
                  }
                  offset={[-15, 85]}
                >
                  <Avatar
                    size={120}
                    src={profile?.profilePic}
                    icon={!profile?.profilePic && <UserOutlined />}
                    className="border-4 border-white shadow-xl bg-gray-100 object-cover"
                  />
                </Badge>

                {/* Edit Button properly aligned to the right */}
                <Button 
                  icon={<EditOutlined />} 
                  onClick={showEditModal}
                  className="mb-2 font-medium border-gray-300 shadow-sm rounded-md"
                >
                  Edit Profile
                </Button>
              </div>

              {/* Name & Tag Below Avatar */}
              <div className="mt-4">
                <h2 className="text-2xl font-bold text-gray-800 m-0">{fullName}</h2>
                <div className="mt-2">
                  <Tag color="purple" className="px-4 py-1 rounded-full border-none bg-purple-100 text-[#5C039B]">
                    Customer Account
                  </Tag>
                </div>
              </div>
            </div>

            <Descriptions bordered column={1} className="bg-white rounded-lg">
              <Descriptions.Item label={<span className="font-semibold text-gray-600"><MailOutlined className="mr-2" /> Email</span>}>
                {profile?.email}
              </Descriptions.Item>
              <Descriptions.Item label={<span className="font-semibold text-gray-600"><PhoneOutlined className="mr-2" /> Mobile</span>}>
                {phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label={<span className="font-semibold text-gray-600"><EnvironmentOutlined className="mr-2" /> Location</span>}>
                {profile?.location?.city ? `${profile.location.city}, ${profile.location.country || ''}` : "Not provided"}
              </Descriptions.Item>
              <Descriptions.Item label={<span className="font-semibold text-gray-600"><CheckCircleOutlined className="mr-2" /> Status</span>}>
                <Tag color={profile?.isActive ? "green" : "red"}>
                  {profile?.isActive ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="font-semibold text-gray-600"><CalendarOutlined className="mr-2" /> Member Since</span>}>
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal 
        title="Edit Customer Profile" 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        footer={null} 
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate} className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={['name', 'first_name']} label="First Name" rules={[{ required: true }]}>
                <Input placeholder="John" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['name', 'last_name']} label="Last Name" rules={[{ required: true }]}>
                <Input placeholder="Doe" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="email" label="Email Address">
            <Input disabled placeholder="customer@example.com" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name={['mobile', 'country_code']} label="Code">
                <Input placeholder="+91" />
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item name={['mobile', 'number']} label="Mobile Number">
                <Input placeholder="1234567890" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={['location', 'city']} label="City">
                <Input placeholder="e.g. Mumbai" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={['location', 'country']} label="Country">
                <Input placeholder="e.g. India" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updating} className="bg-[#5C039B] hover:bg-purple-800">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

    </div>
  );
};

export default CustomerProfile;