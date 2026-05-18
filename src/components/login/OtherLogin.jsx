// src/pages/auth/OtherLogin.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Row,
  Col,
} from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../manageApi/context/AuthContext.jsx";
import { CheckCircleFilled, CalculatorOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const OtherLogin = () => {
  const [form] = Form.useForm();
  const [activeStep, setActiveStep] = useState(0);
  const [userType, setUserType] = useState(""); // supervisor, accountant
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState(null);

  const { login, isAuthenticated, user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Auto redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user && token) {
      const userName = user?.name || user?.firstName || "User";
      const roleName = user?.role?.name || "Team Member";

      setWelcomeUser({ name: userName, role: roleName });
      setShowSuccessBanner(true);

      const timer = setTimeout(() => {
        const roleCode = user?.role?.code?.toString();
        const redirectMap = {
          "11": "/dashboard/accountant",
          "12": "/dashboard/supervisor",
        };
        const path = redirectMap[roleCode] || "/dashboard";
        navigate(path, { replace: true });
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, token, navigate]);

  const handleNext = () => {
    if (!userType) {
      setGeneralError("Please select your role");
      return;
    }
    setActiveStep(1);
    setGeneralError("");
  };

  const handleBack = () => {
    setActiveStep(0);
    setUserType("");
    form.resetFields();
    setGeneralError("");
  };

  const onFinishLogin = async (values) => {
    setLoading(true);
    setGeneralError("");

    try {
      await login("/users/login", {
        email: values.email,
        password: values.password,
      });
    } catch (err) {
      const errorMsg = typeof err === "object" ? err.message || "Invalid credentials" : err;
      setGeneralError(errorMsg || "Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  // Only supervisor and accountant roles
  const roles = [
    {
      value: "supervisor",
      label: "Supervisor",
      icon: <UserOutlined style={{ fontSize: "36px" }} />,
      color: "#fa8c16",
      desc: "Manage team & operations",
    },
    {
      value: "accountant",
      label: "Accountant",
      icon: <CalculatorOutlined style={{ fontSize: "36px" }} />,
      color: "#52c41a",
      desc: "Handle finances & reports",
    },
  ];

  const getRoleDisplay = () => {
    const map = {
      supervisor: "Supervisor",
      accountant: "Accountant",
    };
    return map[userType] || "User";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        fontFamily: "'Poppins', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Success Banner */}
      {showSuccessBanner && welcomeUser && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "#fff",
            color: "#1f1f1f",
            padding: "1rem",
            textAlign: "center",
            fontWeight: "bold",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            borderBottom: "5px solid #722ed1",
          }}
        >
          <CheckCircleFilled style={{ color: "#722ed1", fontSize: "1.8rem", marginRight: "12px" }} />
          Welcome back, {welcomeUser.name}! ({welcomeUser.role})
          <br />
          <Text style={{ fontSize: "0.9rem", opacity: 0.8 }}>Redirecting to your dashboard...</Text>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ width: "100%", maxWidth: "550px" }}
      >
        <Card
          style={{
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <Title level={2} style={{ color: "#722ed1", margin: 0, fontWeight: 800 }}>
              {activeStep === 0 ? "Team Login" : `Login as ${getRoleDisplay()}`}
            </Title>
            <Text type="secondary" style={{ fontSize: "1.1rem" }}>
              {activeStep === 0 ? "Select your role to continue" : "Enter your credentials"}
            </Text>
          </div>

          {/* Back Button */}
          {activeStep === 1 && (
            <Button
              type="text"
              onClick={handleBack}
              style={{ marginBottom: "1.5rem", color: "#722ed1", fontWeight: 500 }}
            >
              ← Back to Role Selection
            </Button>
          )}

          {/* Error Alert */}
          {generalError && (
            <Alert
              message={generalError}
              type="error"
              showIcon
              closable
              onClose={() => setGeneralError("")}
              style={{ marginBottom: "1.5rem", borderRadius: "12px" }}
            />
          )}

          {/* Step 0: Role Selection */}
          {activeStep === 0 ? (
            <>
              <Row gutter={[20, 20]}>
                {roles.map((role) => (
                  <Col xs={24} key={role.value}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        hoverable
                        onClick={() => setUserType(role.value)}
                        style={{
                          textAlign: "center",
                          borderRadius: "18px",
                          cursor: "pointer",
                          border: userType === role.value ? `3px solid ${role.color}` : "1px solid #e0e0e0",
                          boxShadow: userType === role.value ? `0 0 25px ${role.color}40` : "0 4px 15px rgba(0,0,0,0.05)",
                          transition: "all 0.4s ease",
                          height: "100%",
                          padding: "1.5rem",
                        }}
                      >
                        <div style={{ color: role.color, marginBottom: "12px" }}>
                          {role.icon}
                        </div>
                        <Text strong style={{ fontSize: "1.2rem", display: "block", color: userType === role.value ? role.color : "#333" }}>
                          {role.label}
                        </Text>
                        <Text type="secondary" style={{ fontSize: "0.9rem" }}>
                          {role.desc}
                        </Text>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleNext}
                disabled={!userType}
                style={{
                  marginTop: "2.5rem",
                  height: "56px",
                  borderRadius: "16px",
                  background: "#722ed1",
                  border: "none",
                  fontSize: "18px",
                  fontWeight: "bold",
                  boxShadow: "0 8px 20px rgba(114, 46, 209, 0.4)",
                }}
              >
                Continue →
              </Button>
            </>
          ) : (
            /* Login Form */
            <Form form={form} layout="vertical" onFinish={onFinishLogin}>
              <Form.Item
                name="email"
                label={<Text strong style={{ color: "#722ed1" }}>Email Address</Text>}
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="you@company.com"
                  style={{
                    borderRadius: "12px",
                    height: "50px",
                    fontSize: "16px",
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<Text strong style={{ color: "#722ed1" }}>Password</Text>}
                rules={[{ required: true, message: "Please enter your password" }]}
              >
                <Input.Password
                  size="large"
                  placeholder="••••••••"
                  style={{
                    borderRadius: "12px",
                    height: "50px",
                    fontSize: "16px",
                  }}
                />
              </Form.Item>

              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: "56px",
                  borderRadius: "16px",
                  background: "#722ed1",
                  border: "none",
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginTop: "1rem",
                  boxShadow: "0 8px 20px rgba(114, 46, 209, 0.4)",
                }}
              >
                {loading ? "Signing In..." : "Login Now"}
              </Button>
            </Form>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default OtherLogin;