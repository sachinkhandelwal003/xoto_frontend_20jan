// src/components/ecommerce/vault/EmployeeLogin.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import styled from "styled-components";
import {
  MonitorOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";

import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { AuthContext } from "../../../manageApi/context/AuthContext.jsx"; // ✅ Use AuthContext
import loginBgImage from "../../../assets/img/one.png";
import logoNew from "../../../assets/img/logooo.png";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// --- Styled Components (unchanged) ---
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

// --- Role Configuration ---
const ROLES = [
  {
    id: "ops",
    label: "Mortgage Ops",
    description: "Applications & Bank Ops",
    Icon: MonitorOutlined,
    color: "#5C039B",
    gradient: "linear-gradient(135deg, #5C039B, #8E44AD)",
    dashPath: "/dashboard/vault-admin/mortgage/dashboard",
    apiEndpoint: "/vault/ops/login",
  },
  {
    id: "advisor",
    label: "Xoto Advisor",
    description: "Lead & Client Management",
    Icon: UserOutlined,
    color: "#03A4F4",
    gradient: "linear-gradient(135deg, #03A4F4, #0077b6)",
    dashPath: "/dashboard/vault-admin/advisor/dashboard",
    apiEndpoint: "/vault/advisor/login",
  },
];

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // ✅ Use AuthContext instead of direct Redux
  const { login, isAuthenticated, user, token } = useContext(AuthContext);

  const [view, setView] = useState("select"); // 'select' | 'login'
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form] = Form.useForm();
  const hasRedirected = useRef(false);

  const selectedRole = ROLES.find((r) => r.id === selectedRoleId);

  // ✅ Redirect after successful authentication (same pattern as Login.jsx)
  useEffect(() => {
    if (isAuthenticated && token && !hasRedirected.current) {
      hasRedirected.current = true;

      if (user) {
        localStorage.setItem("user_data", JSON.stringify(user));
      }

      const roleCode = user?.role?.code?.toString() || (typeof user?.role === 'string' ? user.role : "");

      // Determine dashboard path based on selected role
      let dashPath = selectedRole?.dashPath;

      // Fallback to roleCode mapping if needed
      if (!dashPath) {
        const rolePathMap = {
          "18": "/dashboard/vault-admin",
          "22": "/dashboard/vaultagent",
          "21": "/dashboard/vaultpartner",
        };
        dashPath = rolePathMap[roleCode] || "/dashboard";
      }

      toast.success(`Welcome back, ${selectedRole?.label || 'User'}!`);
      setTimeout(() => {
        navigate(dashPath, { replace: true });
      }, 1500);
    }
  }, [isAuthenticated, user, token, navigate, selectedRole]);

  const handleRoleSelect = (roleId) => {
    setSelectedRoleId(roleId);
    setView("login");
    setError("");
    form.resetFields();
  };

  const handleBack = () => {
    setView("select");
    setSelectedRoleId(null);
    setError("");
    form.resetFields();
  };

  // ✅ Login handler using AuthContext login function
  const onFinish = async (values) => {
    setLoading(true);
    setError("");

    try {
      await login(selectedRole.apiEndpoint, {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      // Redirection is handled by the useEffect above
    } catch (err) {
      console.log("🔥 Backend Error Object:", err);

      let errorMessage = "Invalid credentials";

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (typeof err === 'object' && err?.message && !err.message.includes("status code")) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      const errorStr = errorMessage.toLowerCase();
      const isPendingOrUnapproved = errorStr.includes("not approved") || errorStr.includes("pending") || errorStr.includes("approv");

      if (isPendingOrUnapproved) {
        toast.warning(errorMessage, { position: "top-center", autoClose: 5000 });
      } else {
        toast.error(errorMessage, { position: "top-center" });
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Render Selection Screen ---
  const renderSelection = () => (
    <motion.div
      key="selection"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Title level={3} style={{ margin: 0, color: "#333" }}>
          Staff Portal Access
        </Title>
        <Text type="secondary">Select your role to continue</Text>
      </div>

      <Row gutter={[20, 20]}>
        {ROLES.map((role) => {
          const IconComponent = role.Icon;
          return (
            <Col xs={24} sm={12} key={role.id}>
              <SelectionCard
                $active={false}
                $color={role.color}
                onClick={() => handleRoleSelect(role.id)}
              >
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    background: role.gradient,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  }}
                >
                  <IconComponent style={{ fontSize: "28px" }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
                    {role.label}
                  </div>
                  <div style={{ fontSize: 14, color: "#888" }}>{role.description}</div>
                </div>
              </SelectionCard>
            </Col>
          );
        })}
      </Row>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Button type="link" onClick={() => navigate("/")}>
          ← Back to Home
        </Button>
      </div>
    </motion.div>
  );

  // --- Render Login Form ---
  const renderLoginForm = () => {
    const IconComponent = selectedRole?.Icon;
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
          Back to Role Selection
        </Button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              background: selectedRole?.gradient,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            {IconComponent && <IconComponent style={{ fontSize: "28px" }} />}
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: "#333" }}>
              Sign in as {selectedRole?.label}
            </Title>
            <Text type="secondary">Enter your credentials to access dashboard</Text>
          </div>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24, borderRadius: 12 }}
            closable
            onClose={() => setError("")}
          />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            rules={[{ required: true, type: "email", message: "Valid email required" }]}
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
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: -8, marginBottom: 16 }}>
            <Button
              type="link"
              onClick={() => alert("Contact Xoto Admin to reset your password.")}
              style={{ padding: 0, fontSize: 13, color: selectedRole?.color }}
            >
              Forgot Password?
            </Button>
          </div>

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
              background: selectedRole?.gradient,
              border: "none",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            }}
          >
            {loading ? "Signing In..." : `Login as ${selectedRole?.label}`}
          </Button>
        </Form>
      </motion.div>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: selectedRole?.color || "#5C039B",
          borderRadius: 8,
          fontFamily: "Poppins, sans-serif",
        },
      }}
    >
      <PageWrapper $bgImage={loginBgImage}>
        <GradientOverlay />
        <ContentLayer>
          <Row
            style={{
              width: "100%",
              maxWidth: 1200,
              padding: isMobile ? 16 : 0,
            }}
          >
            {/* Left side branding */}
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
                  alt="Xoto Logo"
                  style={{
                    width: isMobile ? 200 : 260,
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
                  Staff <span style={{ color: "#03A4F4" }}>Portal</span>
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
                  Secure access for Xoto Vault employees.
                  <br />
                  {selectedRole
                    ? `Welcome back, ${selectedRole.label}.`
                    : "Select your role to get started."}
                </Text>
              </motion.div>
            </Col>

            {/* Right side card */}
            <Col
              xs={24}
              lg={12}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                style={{ width: "100%", maxWidth: 650 }}
              >
                <GlassCard bordered={false} $isMobile={isMobile}>
                  <AnimatePresence mode="wait">
                    {view === "select" && renderSelection()}
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

export default EmployeeLogin;