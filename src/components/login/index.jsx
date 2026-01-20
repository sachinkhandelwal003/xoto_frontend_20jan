// src/pages/auth/Login.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Row,
  Col,
  Grid,
  ConfigProvider,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../manageApi/context/AuthContext.jsx";
import { toast } from "react-toastify";
import styled from "styled-components";

// Assets
import loginimage from "../../assets/img/one.png";
import logoNew from "../../assets/img/logooo.png";

import {
  ShopOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  LockOutlined,
  RocketFilled,
  ShoppingFilled,
  TeamOutlined,
  CodeOutlined,
  IdcardOutlined,
  ApartmentOutlined, // ✅ Icon for Agency
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// --- Styled Components ---
const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  font-family: "Poppins", sans-serif;
  background: url(${(props) => props.$bgImage}) center/cover no-repeat fixed;
  overflow: hidden;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(92, 3, 155, 0.85),
    rgba(3, 164, 244, 0.8)
  );
  backdrop-filter: blur(2px);
  z-index: 1;
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GlassCard = styled(Card)`
  width: 100%;
  border-radius: 24px !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  .ant-card-body {
    padding: ${(props) => (props.$isMobile ? "30px 20px" : "40px")} !important;
  }
`;

const SelectionCard = styled.div`
  background: ${(props) =>
    props.$active ? `${props.$color}15` : "rgba(255,255,255,0.5)"};
  border: 2px solid ${(props) => (props.$active ? props.$color : "transparent")};
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  min-height: 180px;

  &:hover {
    transform: translateY(-5px);
    background: #fff;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    border-color: ${(props) => props.$color};
  }
`;

const Login = () => {
  const [form] = Form.useForm();
  
  // view states: 'main' | 'xoto-select' | 'login'
  const [view, setView] = useState("main"); 
  const [selectedPartnerType, setSelectedPartnerType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const hasRedirected = useRef(false);

  const { login, isAuthenticated, user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // --- Configuration ---
  
  // 1. Main Categories (First Screen)
  const mainCategories = [
    {
      id: "freelancer",
      label: "Execution Partners",
      desc: "For Service Providers",
      icon: <UserOutlined style={{ fontSize: "28px" }} />,
      color: "#5C039B",
      gradient: "linear-gradient(135deg, #5C039B, #8E44AD)",
      type: "direct",
    },
    {
      id: "vendor-b2c",
      label: "Strategic Alliances",
      desc: "For Product Sellers",
      icon: <ShopOutlined style={{ fontSize: "28px" }} />,
      color: "#03A4F4",
      gradient: "linear-gradient(135deg, #03A4F4, #0077b6)",
      type: "direct",
    },
    {
      id: "business-association",
      label: "Business Associates",
      desc: "For Business Networks",
      icon: <TeamOutlined style={{ fontSize: "28px" }} />,
      color: "#10B981",
      gradient: "linear-gradient(135deg, #10B981, #059669)",
      type: "direct",
    },
    {
      id: "xoto-grid", // Group Trigger
      label: "Xoto Grid",
      desc: "Devs, Agents & Agencies",
      icon: <CodeOutlined style={{ fontSize: "28px" }} />,
      color: "#F97316",
      gradient: "linear-gradient(135deg, #F97316, #EA580C)",
      type: "group", 
    },
  ];

  // 2. All Partner Types (For Login Logic & Sub-selection)
  const partnerTypes = [
    ...mainCategories,
    {
      value: "developer",
      label: "Developer",
      desc: "For Real Estate Developers",
      icon: <CodeOutlined style={{ fontSize: "28px" }} />,
      color: "#F97316", // Orange
      gradient: "linear-gradient(135deg, #F97316, #EA580C)",
    },
    {
      value: "agent",
      label: "Agent",
      desc: "For Real Estate Agents",
      icon: <IdcardOutlined style={{ fontSize: "28px" }} />,
      color: "#E11D48", // Rose/Red
      gradient: "linear-gradient(135deg, #E11D48, #BE123C)",
    },
    {
      value: "agency",
      label: "Agency",
      desc: "For Property Agencies",
      icon: <ApartmentOutlined style={{ fontSize: "28px" }} />,
      color: "#4F46E5", // Indigo/Blue
      gradient: "linear-gradient(135deg, #4F46E5, #4338ca)",
    },
  ];

  const getSelectedPartner = () =>
    partnerTypes.find((t) => t.value === selectedPartnerType) || 
    partnerTypes.find((t) => t.id === selectedPartnerType);

  // ✅ Login success effect
  useEffect(() => {
    if (isAuthenticated && token && !hasRedirected.current) {
      hasRedirected.current = true;

      const userName = user?.name || user?.firstName || "Partner";
      const roleCode = user?.role?.code?.toString() || user?.role;

      let themeColor = "#5C039B";
      let themeIcon = <RocketFilled />;

      // Determine theme based on partner type
      if (selectedPartnerType === "developer") {
        themeColor = "#F97316";
        themeIcon = <CodeOutlined />;
      } else if (selectedPartnerType === "agent") {
        themeColor = "#E11D48";
        themeIcon = <IdcardOutlined />;
      } else if (selectedPartnerType === "agency") {
        themeColor = "#4F46E5"; // Indigo for Agency
        themeIcon = <ApartmentOutlined />;
      } else if (["5", "6"].includes(roleCode)) {
        themeColor = "#03A4F4";
        themeIcon = <ShoppingFilled />;
      } else if (["8", "9"].includes(roleCode)) {
        themeColor = "#10B981";
        themeIcon = <TeamOutlined />;
      }

      toast.success(
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {React.cloneElement(themeIcon, {
              style: { color: "#fff", fontSize: 20 },
            })}
          </div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>
              Welcome, {userName}
            </div>
            <div style={{ fontSize: "13px", opacity: 0.9 }}>
              Login Successful
            </div>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 2000,
          style: {
            background:
              selectedPartnerType === "agent"
                ? "linear-gradient(135deg, #E11D48, #BE123C)"
                : selectedPartnerType === "agency"
                ? "linear-gradient(135deg, #4F46E5, #4338ca)"
                : themeColor === "#5C039B"
                ? "linear-gradient(135deg, #5C039B, #8E44AD)"
                : themeColor === "#03A4F4"
                ? "linear-gradient(135deg, #03A4F4, #0077b6)"
                : themeColor === "#10B981"
                ? "linear-gradient(135deg, #10B981, #059669)"
                : "linear-gradient(135deg, #F97316, #EA580C)",
            color: "#fff",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.45)",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "16px",
          },
        }
      );

      // ✅ Redirect after toast
      setTimeout(() => {
        if (selectedPartnerType === "developer") {
          navigate("/dashboard/developer", { replace: true });
          return;
        }
        if (selectedPartnerType === "agent") {
          navigate("/dashboard/agent", { replace: true });
          return;
        }
        if (selectedPartnerType === "agency") {
          navigate("/dashboard/agency", { replace: true });
          return;
        }

        const rolePathMap = {
          "0": "/dashboard/superadmin",
          "1": "/dashboard/admin",
          "2": "/dashboard/customer",
          "5": "/dashboard/vendor-b2c",
          "6": "/dashboard/vendor-b2b",
          "7": "/dashboard/freelancer",
          "8": "/dashboard/business-association",
          "9": "/dashboard/association-admin",
        };

        const path = rolePathMap[roleCode] || "/dashboard";
        navigate(path, { replace: true });
      }, 2000);
    }
  }, [isAuthenticated, user, token, navigate, selectedPartnerType]);

  // --- Handlers ---
  
  const handleMainSelect = (category) => {
    if (category.type === "group") {
        setView("xoto-select"); 
    } else {
        setSelectedPartnerType(category.id);
        setView("login");
        setGeneralError("");
        form.resetFields();
    }
  };

  const handleSubSelect = (type) => {
    setSelectedPartnerType(type);
    setView("login");
    setGeneralError("");
    form.resetFields();
  }

  const handleBack = () => {
    setGeneralError("");
    form.resetFields();
    
    if (view === "login") {
        if (["developer", "agent", "agency"].includes(selectedPartnerType)) {
            setView("xoto-select"); 
        } else {
            setView("main"); 
            setSelectedPartnerType(null);
        }
    } else if (view === "xoto-select") {
        setView("main");
    }
  };

  // ✅ MAIN LOGIN SUBMIT
  const onFinish = async (values) => {
    setLoading(true);
    setGeneralError("");

    try {
      let endpoint = "";

      if (selectedPartnerType === "freelancer") endpoint = "/freelancer/login";
      else if (selectedPartnerType === "vendor-b2c")
        endpoint = "/vendor/b2c/login";
      else if (selectedPartnerType === "business-association")
        endpoint = "/association/login";
      else if (selectedPartnerType === "developer")
        endpoint = "/property/login-developer"; 
      else if (selectedPartnerType === "agent")
        endpoint = "/property/login-agent";
      else if (selectedPartnerType === "agency")
        endpoint = "/property/login-agency"; // ✅ Agency Endpoint

      await login(endpoint, {
        email: values.email,
        password: values.password,
      });
    } catch (err) {
      const errorMessage = err?.message || err?.status || "Invalid credentials";
      setGeneralError(errorMessage);
      toast.error(errorMessage, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (selectedPartnerType === "freelancer")
      navigate("/freelancer/registration");
    else if (selectedPartnerType === "vendor-b2c") navigate("/ecommerce/seller");
    else if (selectedPartnerType === "business-association")
      navigate("/ecommerce/seller");
    else if (selectedPartnerType === "developer")
      navigate("/developer/registration");
    else if (selectedPartnerType === "agent")
      navigate("/agent/registration"); 
    else if (selectedPartnerType === "agency")
      navigate("/agency/registration"); // ✅ Agency Registration
  };

  // --- RENDER CONTENT ---
  
  // 1. Main Selection Screen
  const renderMainSelection = () => (
    <motion.div
      key="main-selection"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ marginBottom: 24 }}>
        <ArrowLeftOutlined
          onClick={() => navigate("/")}
          style={{ fontSize: "24px", color: "#000", cursor: "pointer", padding: "8px", marginLeft: "-8px" }}
        />
      </div>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Title level={3} style={{ margin: 0, color: "#333" }}>Select Partner Type</Title>
        <Text type="secondary">Choose your Account type to continue</Text>
      </div>

      <Row gutter={[20, 20]}>
        {mainCategories.map((cat) => (
             <Col xs={24} sm={12} md={12} key={cat.id}>
             <SelectionCard
               $active={false} 
               $color={cat.color}
               onClick={() => handleMainSelect(cat)}
             >
               <div
                 style={{
                   width: 70, height: 70, borderRadius: "50%",
                   background: cat.color, color: "#fff",
                   display: "flex", alignItems: "center", justifyContent: "center",
                   boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                 }}
               >
                 {cat.icon}
               </div>
               <div>
                 <div style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
                   {cat.label}
                 </div>
                 <div style={{ fontSize: 14, color: "#888" }}>
                   {cat.desc}
                 </div>
               </div>
             </SelectionCard>
           </Col>
        ))}
      </Row>
    </motion.div>
  );

  // 2. Xoto Sub-Selection Screen (Developer, Agent & Agency)
  const renderXotoSelection = () => (
    <motion.div
      key="xoto-selection"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: 16, paddingLeft: 0, color: "#888" }}
        >
          Back to Selection
        </Button>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Title level={3} style={{ margin: 0, color: "#333" }}>Xoto Grid Access</Title>
        <Text type="secondary">Select your role to proceed</Text>
      </div>

      <Row gutter={[16, 16]} justify="center">
        {/* Developer Card */}
        <Col xs={24} sm={12} md={8}>
          <SelectionCard
            $active={selectedPartnerType === "developer"}
            $color="#F97316"
            onClick={() => handleSubSelect("developer")}
          >
             <div
                 style={{
                   width: 60, height: 60, borderRadius: "50%",
                   background: "#F97316", color: "#fff",
                   display: "flex", alignItems: "center", justifyContent: "center",
                   boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                 }}
               >
                 <CodeOutlined style={{ fontSize: "24px" }} />
               </div>
               <div>
                 <div style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
                   Developer
                 </div>
                 <div style={{ fontSize: 13, color: "#888" }}>
                   Real Estate Developers
                 </div>
               </div>
          </SelectionCard>
        </Col>

        {/* Agency Card */}
        <Col xs={24} sm={12} md={8}>
          <SelectionCard
            $active={selectedPartnerType === "agency"}
            $color="#4F46E5"
            onClick={() => handleSubSelect("agency")}
          >
             <div
                 style={{
                   width: 60, height: 60, borderRadius: "50%",
                   background: "#4F46E5", color: "#fff",
                   display: "flex", alignItems: "center", justifyContent: "center",
                   boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                 }}
               >
                 <ApartmentOutlined style={{ fontSize: "24px" }} />
               </div>
               <div>
                 <div style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
                   Agency
                 </div>
                 <div style={{ fontSize: 13, color: "#888" }}>
                   Property Agencies
                 </div>
               </div>
          </SelectionCard>
        </Col>

        {/* Agent Card */}
        <Col xs={24} sm={12} md={8}>
          <SelectionCard
            $active={selectedPartnerType === "agent"}
            $color="#E11D48"
            onClick={() => handleSubSelect("agent")}
          >
             <div
                 style={{
                   width: 60, height: 60, borderRadius: "50%",
                   background: "#E11D48", color: "#fff",
                   display: "flex", alignItems: "center", justifyContent: "center",
                   boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                 }}
               >
                 <IdcardOutlined style={{ fontSize: "24px" }} />
               </div>
               <div>
                 <div style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
                   Agent
                 </div>
                 <div style={{ fontSize: 13, color: "#888" }}>
                   Real Estate Agents
                 </div>
               </div>
          </SelectionCard>
        </Col>
      </Row>
    </motion.div>
  );

  // 3. Login Form
  const renderLoginForm = () => {
    const activePartner = getSelectedPartner();

    return (
      <motion.div
        key="form"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: 16, paddingLeft: 0, color: "#888" }}
        >
          {view === 'xoto-select' ? "Back to Xoto Grid" : "Back to Selection"}
        </Button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              background: activePartner?.gradient,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            {activePartner?.icon}
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: "#333" }}>
              Login as {activePartner?.label}
            </Title>
            <Text type="secondary">
              Enter your credentials to access dashboard
            </Text>
          </div>
        </div>

        {generalError && (
          <Alert
            message={generalError}
            type="error"
            showIcon
            style={{ marginBottom: 24, borderRadius: 12 }}
            closable
          />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, type: "email", message: "Valid email required" },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Email Address"
              style={{ borderRadius: 12, height: 48 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Password required" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Password"
              style={{ borderRadius: 12, height: 48 }}
            />
          </Form.Item>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 52,
                borderRadius: 12,
                fontWeight: "bold",
                fontSize: "15px",
                background: activePartner?.gradient,
                border: "none",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              }}
            >
              {loading ? "Signing In..." : "Login Now"}
            </Button>

            <Button
              onClick={handleRegister}
              block
              style={{
                height: 52,
                borderRadius: 12,
                fontWeight: "bold",
                fontSize: "15px",
                borderColor: activePartner?.color,
                color: activePartner?.color,
              }}
            >
              Register
            </Button>
          </div>
        </Form>
      </motion.div>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary:
            selectedPartnerType === "vendor-b2c"
              ? "#03A4F4"
              : selectedPartnerType === "business-association"
              ? "#10B981"
              : selectedPartnerType === "developer"
              ? "#F97316"
              : selectedPartnerType === "agent"
              ? "#E11D48"
              : selectedPartnerType === "agency"
              ? "#4F46E5"
              : "#5C039B",
          borderRadius: 8,
          fontFamily: "Poppins, sans-serif",
        },
      }}
    >
      <PageWrapper $bgImage={loginimage}>
        <GradientOverlay />

        <ContentLayer>
          <Row style={{ width: "100%", maxWidth: 1200, padding: isMobile ? 16 : 0 }}>
            <Col
              xs={24}
              lg={12}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: isMobile ? "center" : "flex-start",
                padding: 40,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ textAlign: isMobile ? "center" : "left" }}
              >
                <img
                  src={logoNew}
                  alt="Logo"
                  style={{
                    width: isMobile ? 200 : 260,
                    height: isMobile ? 200 : 260,
                    marginBottom: 4,
                    marginLeft: isMobile ? "auto" : 0,
                    marginRight: isMobile ? "auto" : 0,
                    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))",
                  }}
                />

                <Title
                  style={{
                    color: "#fff",
                    fontSize: isMobile ? 32 : 48,
                    fontWeight: 800,
                    marginTop: 0,
                    marginBottom: 6,
                    lineHeight: 1.02,
                    whiteSpace: "nowrap",
                  }}
                >
                  Partner <span style={{ color: "#03A4F4" }}>Login</span>
                </Title>

                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 18,
                    marginTop: 0,
                    display: "block",
                    maxWidth: 400,
                  }}
                >
                  {!selectedPartnerType
                    ? "Connect, Collaborate, and Grow with our extensive ecosystem."
                    : `Welcome back, ${getSelectedPartner()?.label}. Let's get to work.`}
                </Text>
              </motion.div>
            </Col>

            <Col xs={24} lg={12} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                style={{ width: "100%", maxWidth: 650 }} // Increased slightly for 3 columns
              >
                <GlassCard bordered={false} $isMobile={isMobile}>
                  <AnimatePresence mode="wait">
                    {view === "main" && renderMainSelection()}
                    {view === "xoto-select" && renderXotoSelection()}
                    {view === "login" && renderLoginForm()}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            </Col>
          </Row>
        </ContentLayer>
      </PageWrapper>
    </ConfigProvider>
  );
};

export default Login;