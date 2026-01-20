import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../../manageApi/store/authSlice";
import { useCmsContext } from "../../contexts/CmsContext";

// Ant Design Imports
import { Input, Dropdown, Avatar, Badge, Space, Typography } from "antd";
import { 
  SearchOutlined, 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined 
} from "@ant-design/icons";

import { getRoleColors } from "../../../../manageApi/utils/roleColors";

const { Text } = Typography;

const Topbar = () => {
  const { toggleSidebar, sidebarCollapsed, toggleMobileSidebar } = useCmsContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth?.user);

  const colors = getRoleColors(user?.role?.code);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  // Profile Link Logic
  const roleCode = user?.role?.code?.toString();
  const roleSlug = {
    "0": "superadmin", "1": "admin", "2": "customer", "5": "vendor-b2c",
    "6": "vendor-b2b", "7": "freelancer", "11": "accountant", "12": "supervisor",
  }[roleCode] ?? "dashboard";

  const getProfileUrl = () => `/dashboard/${roleSlug}/myprofile`;

  // Ant Design Dropdown Items
  const menuItems = [
    {
      key: '1',
      label: 'Your Profile',
      icon: <UserOutlined />,
      onClick: () => navigate(getProfileUrl()),
    },
    {
      key: '2',
      label: 'Settings',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: 'Sign out',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header
      className={`
        fixed top-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 h-16
        transition-all duration-300 ease-in-out flex flex-col justify-center
        ${sidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'}
      `}
    >
      <div className="flex justify-between items-center w-full px-4 lg:px-6">
        
        {/* LEFT: Toggles + Search */}
        <div className="flex items-center gap-4">
          {/* Mobile Toggle */}
          <button 
            className="lg:hidden text-xl text-gray-600" 
            onClick={toggleMobileSidebar}
          >
            <MenuUnfoldOutlined />
          </button>

          {/* Desktop Toggle */}
          <button 
            className="hidden lg:block text-xl text-gray-600 hover:text-blue-600 transition-colors" 
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>

          {/* Ant Design Search (Desktop) */}
          <div className="hidden md:block w-64">
            <Input 
              prefix={<SearchOutlined className="text-gray-400" />} 
              placeholder="Search..." 
              allowClear
              className="rounded-full bg-gray-50"
            />
          </div>
        </div>

        {/* RIGHT: Notifications + Profile */}
        <div className="flex items-center gap-3 lg:gap-6">
          <Badge count={3} size="small" offset={[-2, 5]}>
            <button className="text-xl text-gray-500 hover:text-blue-600 flex items-center">
              <BellOutlined />
            </button>
          </Badge>

          <Dropdown 
            menu={{ items: menuItems }} 
            placement="bottomRight" 
            arrow={{ pointAtCenter: true }}
            trigger={['click']}
          >
            <div className="flex items-center gap-2 cursor-pointer group">
              <Avatar
                size="middle"
                style={{ 
                  backgroundColor: colors.primary || "#6366f1",
                  verticalAlign: 'middle' 
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
              <div className="hidden md:flex flex-col items-start leading-none">
                <Text strong className="text-sm group-hover:text-blue-600 transition-colors">
                  {user?.name?.split(" ")[0] || "User"}
                </Text>
                <Text type="secondary" style={{ fontSize: '10px' }}>
                  {roleSlug.toUpperCase()}
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