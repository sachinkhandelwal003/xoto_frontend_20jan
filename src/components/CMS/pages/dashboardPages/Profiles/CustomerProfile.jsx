import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Avatar, Badge, Descriptions, Tag, Button, Upload, message, Spin } from "antd";
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { apiService } from "../../../../../manageApi/utils/custom.apiservice";

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // ✅ 1. Get Profile Data
  const getProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("profile/get-profile-data");
      // Unwrap data as per your API structure
      setProfile(response?.data?.data || response?.data || response);
    } catch (error) {
      console.error(error);
      message.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 2. Automatic Upload & Save Flow
  const handleAvatarUpload = async (options) => {
    const { file } = options;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setAvatarUploading(true);

      // STEP A: S3 Upload
      const uploadRes = await apiService.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("📸 UPLOAD RESPONSE:", uploadRes);

      // Extracting the URL from your specific response structure
      // uploadRes.data.file.url -> "https://xotostaging.s3..."
      const imageUrl = uploadRes?.data?.file?.url || uploadRes?.file?.url;

      if (!imageUrl) {
        message.error("Image URL not found in server response");
        return;
      }

      // STEP B: Update Database Immediately
      // URL: http://localhost:5000/api/users/edit/customer
      await apiService.put("users/edit/customer", {
        profilePic: imageUrl,
      });

      // STEP C: Refresh UI
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

  useEffect(() => {
    getProfile();
  }, []);

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
            <div className="flex flex-col items-center -mt-20 mb-8 relative">
              <Badge
                count={
                  <Upload {...uploadProps}>
                    <div className="bg-white border rounded-full p-2 shadow-lg cursor-pointer hover:scale-110 transition-transform">
                      {avatarUploading ? <Spin size="small" /> : <CameraOutlined style={{ color: '#5C039B' }} />}
                    </div>
                  </Upload>
                }
                offset={[-10, 105]}
              >
                <Avatar
                  size={140}
                  src={profile?.profilePic}
                  icon={!profile?.profilePic && <UserOutlined />}
                  className="border-4 border-white shadow-xl bg-gray-100 object-cover"
                />
              </Badge>

              <h2 className="mt-5 text-2xl font-bold text-gray-800">{fullName}</h2>
              <Tag color="purple" className="px-4 py-1 rounded-full border-none bg-purple-100 text-[#5C039B]">
                Customer Account
              </Tag>
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
    </div>
  );
};

export default CustomerProfile;