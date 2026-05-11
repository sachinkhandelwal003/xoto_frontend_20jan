import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../../manageApi/store/authSlice";
import { useCmsContext } from "../../contexts/CmsContext";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

// Ant Design
import {
  Input,
  Dropdown,
  Avatar,
  Badge,
  Typography,
  List,
  Empty,
  Card,
  Button
} from "antd";

import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";

import { getRoleColors } from "../../../../manageApi/utils/roleColors";

const { Text } = Typography;

const Topbar = () => {
  const { toggleSidebar, sidebarCollapsed, toggleMobileSidebar } = useCmsContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  
  // ✅ State for Profile Data
  const [userProfile, setUserProfile] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const colors = getRoleColors(user?.role?.code);

  // ✅ Fetch Profile Data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await apiService.get('/profile/get-profile-data');
        if (res.data) {
          setUserProfile(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch profile data in Topbar", err);
      }
    };

    fetchProfileData();
  }, []);

  // ✅ Helper to safely get Name
 const getDisplayName = () => {
  try {
    const apiData = userProfile?.data || userProfile;
    const reduxData = user?.data || user;

    // API data se try karo
    if (apiData?.first_name && typeof apiData.first_name === 'string') {
      const full = `${apiData.first_name} ${apiData.last_name || ''}`.trim();
      if (full) return full;
    }

    if (apiData?.name) {
      if (typeof apiData.name === 'object') {
        const full = `${apiData.name.first_name || ''} ${apiData.name.last_name || ''}`.trim();
        if (full) return full;
      }
      if (typeof apiData.name === 'string' && apiData.name.trim()) {
        return apiData.name.trim();
      }
    }

    // Redux data se try karo
    if (reduxData?.first_name && typeof reduxData.first_name === 'string') {
      const full = `${reduxData.first_name} ${reduxData.last_name || ''}`.trim();
      if (full) return full;
    }

    if (reduxData?.name) {
      if (typeof reduxData.name === 'object') {
        const full = `${reduxData.name.first_name || ''} ${reduxData.name.last_name || ''}`.trim();
        if (full) return full;
      }
      if (typeof reduxData.name === 'string' && reduxData.name.trim()) {
        return reduxData.name.trim();
      }
    }

    // Username ya email se fallback
    if (reduxData?.username && typeof reduxData.username === 'string') {
      return reduxData.username.trim();
    }

    if (reduxData?.email && typeof reduxData.email === 'string') {
      return reduxData.email.split('@')[0]; // email ka pehla part use karo
    }

  } catch (e) {
    // kuch bhi ho, crash mat karo
  }

  return "User"; // Last fallback
};
  // ✅ Helper for Email
  const getDisplayEmail = () => {
    const apiData = userProfile?.data || userProfile;
    const reduxData = user?.data || user;
    return apiData?.email || reduxData?.email || "";
  };

  // 🚀 NAYA HELPER: Photo ko safely nikalne ke liye
  const getProfilePhoto = () => {
    const apiData = userProfile?.data || userProfile;
    const reduxData = user?.data || user;
    
    // Check karega dono formats: profile_photo (Agent) aur profilePic (Customer)
    return apiData?.profile_photo || apiData?.profilePic || reduxData?.profile_photo || reduxData?.profilePic || null;
  };

  /* ---------------- NOTIFICATIONS ---------------- */
  const [notifications, setNotifications] = useState([]);
  const lastCountRef = useRef(0); 

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      const res = await apiService.get(
        `/notifications/receiver-notification/${user.id}`
      );

      if (res?.success && Array.isArray(res.data)) {
        if (res.data.length !== lastCountRef.current) {
          lastCountRef.current = res.data.length;
          setNotifications(res.data);
        }
      }
    } catch (err) {
      console.error("Notification error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications(); 
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  /* ---------------- ROLE LOGIC ---------------- */
  const roleCode = user?.role?.code?.toString();
  const roleSlug = {
    "0": "superadmin",
    "1": "admin",
    "2": "customer",
    "5": "vendor-b2c",
    "6": "vendor-b2b",
    "7": "freelancer",
    "11": "accountant",
    "12": "supervisor",
    "16": "agent",
    "21":"vaultpartner",
    "25":"gridreferralpartner",
  }[roleCode] ?? "dashboard";

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  /* ---------------- PROFILE DROPDOWN ---------------- */
  const profileMenuItems = [
    {
      key: "profile-info",
      label: (
        <div className="px-2 py-1">
          <Text strong className="block text-sm">
            {getDisplayName()} 
          </Text>
          <Text type="secondary" className="text-xs">
            {getDisplayEmail()} 
          </Text>
        </div>
      ),
      disabled: true
    },
    { type: "divider" },
    {
      key: "1",
      label: "My Profile",
      icon: <UserOutlined />,
      onClick: () => navigate(`/dashboard/${roleSlug}/myprofile`)
    },
  
    { type: "divider" },
    {
      key: "3",
      label: "Sign out",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout
    }
  ];

  /* ---------------- NOTIFICATION DROPDOWN ---------------- */
  const notificationDropdown = (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span>Notifications</span>
          <Badge count={unreadCount} size="small" />
        </div>
      }
      style={{ width: 320 }}
      bodyStyle={{ padding: 0 }}
      className="shadow-lg"
    >
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications"
          />
        ) : (
          <List
            dataSource={notifications.slice(0, 10)}
            renderItem={(item) => (
              <List.Item
                className={`px-4 hover:bg-purple-50 ${
                  !item.isRead ? "bg-purple-50/30" : ""
                }`}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<BellOutlined />}
                      style={{
                        backgroundColor: "#f9f0ff",
                        color: "#722ed1"
                      }}
                    />
                  }
                  title={
                    <Text strong style={{ fontSize: 13 }}>
                      {item.title}
                    </Text>
                  }
                  description={
                    <>
                      <Text type="secondary" className="text-xs line-clamp-2">
                        {item.message}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        <ClockCircleOutlined />{" "}
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      <div className="p-2 border-t text-center">
        <Button
        type="link"
        size="small"
        onClick={() => {
          setNotifOpen(false);  
          navigate(`/dashboard/${roleSlug}/notifications/view`);
        }}
        >
          View all notifications
        </Button>
      </div>
    </Card>
  );

  /* ---------------- UI ---------------- */
  return (
    <header
      className={`fixed top-0 right-0 z-30 bg-white/80 backdrop-blur-md h-16 transition-all
      ${sidebarCollapsed ? "left-0 lg:left-20" : "left-0 lg:left-64"}`}
    >
      <div className="flex justify-between items-center h-full px-4 lg:px-6">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-xl" onClick={toggleMobileSidebar}>
            <MenuUnfoldOutlined />
          </button>

          <button className="hidden lg:block text-xl" onClick={toggleSidebar}>
            {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>

          <Input
            prefix={<SearchOutlined />}
            placeholder="Search..."
            allowClear
            className="hidden md:flex w-64 rounded-full bg-gray-50"
          />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6">

          {/* 🔔 Notifications */}
          <Dropdown
            open={notifOpen}
            onOpenChange={setNotifOpen}
            dropdownRender={() => notificationDropdown}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Badge count={unreadCount} size="small">
              <button className="text-xl text-gray-500 hover:text-purple-600">
                <BellOutlined />
              </button>
            </Badge>
          </Dropdown>

          {/* 👤 Profile */}
          <Dropdown
            menu={{ items: profileMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div className="flex items-center gap-2 cursor-pointer">
              
              {/* ✅ PHOTO FIX: Naya getProfilePhoto() helper laga diya */}
              <Avatar
                title={getDisplayName()}
                src={getProfilePhoto()} 
                style={{ 
                  backgroundColor: colors?.primary || "#722ed1",
                  verticalAlign: 'middle' 
                }}
              >
                {!getProfilePhoto() && getDisplayName()?.charAt(0)?.toUpperCase()}
              </Avatar>

              <div className="hidden md:flex flex-col leading-tight">
                <Text strong className="text-sm">
                  {getDisplayName()} 
                </Text>
                <Text type="secondary" className="text-[11px]">
                  {getDisplayEmail()} 
                </Text>
              </div>
            </div>
          </Dropdown>

        </div>
      </div>
    </header>
  );
};

export default Topbar;