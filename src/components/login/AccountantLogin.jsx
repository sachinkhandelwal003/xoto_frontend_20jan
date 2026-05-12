// src/components/login/AccountantLogin.jsx
import React, { useState, useContext, useEffect, useRef } from "react";
import { Form, Input, Button, Card, Alert, Typography, Spin } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../manageApi/context/AuthContext.jsx";
import { toast } from "react-toastify";
import styled from "styled-components";

const { Title, Text } = Typography;

const StyledContainer = styled.div`
  display: flex;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #5C039B 0%, #03A4F4 100%);
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
`;

const getDashboardPath = (roleCode) => {
  const map = { '0': '/superadmin', '1': '/admin', '11': '/accountant' };
  return `/dashboard${map[roleCode] || ''}`;
};

const AccountantLogin = () => {
  const [form] = Form.useForm();
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const hasRedirected = useRef(false);

  const { user, token, loading, login, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Lock countdown timer
  useEffect(() => {
    if (!lockUntil) return;
    const timer = setInterval(() => {
      if (Date.now() >= lockUntil) {
        setLockUntil(null);
        setAttemptCount(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockUntil]);

  // Auto redirect + role-based TOAST
  useEffect(() => {
    if (isAuthenticated && user && token && !hasRedirected.current) {
      hasRedirected.current = true;
      const roleCode = user?.role?.code?.toString();

      if (roleCode !== "11") {
        logout();
        toast.error("Access Denied! Only Accountants can log in here.", {
          style: { background: "#ff4d4f", color: "white" },
        });
        return;
      }

      const userName = user?.name || user?.email?.split("@")[0] || "Accountant";
      setSuccessMessage(`Login successful! Welcome back, Accountant ${userName}`);

      // Beautiful Green & Gold Toast for Accountant
      toast.success(`Welcome back, Accountant ${userName}!`, {
        position: "top-center",
        autoClose: 4000,
        style: {
          background: "linear-gradient(135deg, #1E6B52, #2ECC71)",
          color: "#FFD700",
          fontSize: "18px",
          fontWeight: "bold",
          borderRadius: "16px",
          padding: "16px",
          boxShadow: "0 10px 30px rgba(30, 107, 82, 0.6)",
        },
        icon: "Calculator", // or "Money" or custom icon
      });

      setTimeout(() => {
        navigate(getDashboardPath(roleCode), { replace: true });
      }, 1800);
    }
  }, [isAuthenticated, user, token, navigate, logout]);

  const onFinish = async (values) => {
    setFieldErrors({});
    setGeneralError('');
    setSuccessMessage('');
    hasRedirected.current = false;

    if (lockUntil && Date.now() < lockUntil) {
      const seconds = Math.ceil((lockUntil - Date.now()) / 1000);
      toast.warn(`Too many attempts. Please wait ${seconds}s`, {
        style: { background: "#ff9f1a", color: "white" },
      });
      return;
    }

    const result = await login(
      values.email.trim(),
      values.password,
      "/accountant/login"
    );

    if (result.success) {
      setAttemptCount(0);
      setLockUntil(null);
      return; // Redirect handled in useEffect
    }

    const newCount = attemptCount + 1;
    setAttemptCount(newCount);

    if (newCount >= 5) {
      const lockTime = Date.now() + 5 * 60 * 1000; // 5 minutes
      setLockUntil(lockTime);
      toast.error("Account locked for 5 minutes due to too many attempts", {
        autoClose: 8000,
        style: { background: "#ff4d4f", color: "white" },
      });
    }

    const errorMsg = result.error || "Login failed";
    const raw = result.raw;

    const errors = {};

    if (raw?.errors?.length) {
      raw.errors.forEach((err) => {
        errors[err.field] = err.message;
      });
    }

    if (errorMsg.includes("Invalid") || errorMsg.includes("credentials")) {
      errors.general = "Incorrect email or password";
    } else if (errorMsg.includes("inactive")) {
      errors.general = "Your account is deactivated";
    } else if (errorMsg.includes("verify")) {
      errors.general = "Please verify your email first";
    } else if (errorMsg.includes("Network") || errorMsg.includes("fetch")) {
      setGeneralError("No internet connection");
      toast.error("Connection failed");
      return;
    } else {
      errors.general = errorMsg;
    }

    setFieldErrors(errors);
  };

  const getLockMessage = () => {
    if (!lockUntil) return null;
    const seconds = Math.ceil((lockUntil - Date.now()) / 1000);
    return `Too many attempts. Try again in ${seconds} seconds`;
  };

  return (
    <StyledContainer>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        style={{ width: "100%", maxWidth: 460 }}
      >
        <Card
          style={{
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            border: "2px solid #1E6B52",
          }}
        >
          {/* Header */}
          <div
            style={{
            background: 'linear-gradient(135deg, #5C039B, #03A4F4)',
              padding: "32px 24px",
              textAlign: "center",
              color: "white",
            }}
          >
            <Title level={2} style={{ color: "#fff", margin: 0, fontWeight: 800 }}>
              Accountant Portal
            </Title>
            <Text style={{ color: "#e0ffea", fontSize: 16 }}>
              Secure Financial Access
            </Text>
          </div>

          <div style={{ padding: "40px 32px" }}>
            {/* Success Message */}
            {successMessage && (
              <Alert
                message={successMessage}
                type="success"
                showIcon
                style={{
                  marginBottom: 20,
                  fontWeight: "bold",
                  borderRadius: 12,
                  background: "#34C759",
                  color: "#fff",
                  border: "none",
                }}
              />
            )}

            {/* Lock Alert */}
            {lockUntil && (
              <Alert
                message={getLockMessage()}
                type="warning"
                showIcon
                style={{ marginBottom: 20, borderRadius: 12 }}
              />
            )}

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <Spin size="large" tip="Signing you in..." style={{ color: "#5C039B" }} />
              </div>
            )}

            <Form form={form} layout="vertical" onFinish={onFinish} disabled={loading || !!lockUntil}>
              <Form.Item
                label={<span style={{color: "#5C039B", fontWeight: 600 }}>Email Address</span>}
                name="email"
                validateStatus={fieldErrors.email ? "error" : ""}
                help={fieldErrors.email}
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Invalid email format" },
                ]}
              >
                <Input size="large" placeholder="accountant@kotibox.com" style={{ borderRadius: 12, height: 50 }} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: "#5C039B", fontWeight: 600 }}>Password</span>}
                name="password"
                validateStatus={fieldErrors.password ? "error" : ""}
                help={fieldErrors.password}
                rules={[
                  { required: true, message: "Password is required" },
                  { min: 6, message: "Minimum 6 characters" },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter secure password"
                  style={{ borderRadius: 12, height: 50 }}
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone twoToneColor="#1E6B52" /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 12 }}>
                <a href="/forgot-password" style={{ float: "right", color: "#34C759", fontWeight: 600 }}>
                  Forgot Password?
                </a>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  disabled={!!lockUntil}
                  style={{
                    height: 56,
                    fontSize: 18,
                    fontWeight: "bold",
                    background: "#5C039B",
                    borderColor: "#1E6B52",
                    borderRadius: 16,
                  }}
                >
                  {loading ? "Signing In..." : "Login as Accountant"}
                </Button>
              </Form.Item>
            </Form>

            {/* Test Credentials */}
            <Alert
              message={
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                  <strong>Test Accountant Account:</strong><br />
                  Email: <Text code>rahul.sharma@accountant.com</Text><br />
                  Password: <Text code>secure123</Text>
                </div>
              }
              type="info"
              showIcon
              style={{ marginTop: 20, borderRadius: 12 }}
            />

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <a href="/login" style={{ color: "#34C759", fontWeight: 600 }}>
                Back to User Login
              </a>
            </div>
          </div>
        </Card>
      </motion.div>
    </StyledContainer>
  );
};

export default AccountantLogin;