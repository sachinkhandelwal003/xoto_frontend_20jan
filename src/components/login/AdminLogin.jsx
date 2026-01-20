// src/components/login/AdminLogin.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Spin, ConfigProvider } from 'antd';
import { 
  EyeInvisibleOutlined, 
  EyeTwoTone, 
  MailOutlined, 
  LockOutlined,
  CrownFilled,
  SafetyCertificateFilled
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../manageApi/context/AuthContext.jsx';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const { Title, Text } = Typography;

// --- Styled Components ---

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(-45deg, #240046, #5C039B, #03A4F4, #001f3f);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  font-family: 'Poppins', sans-serif;

  @keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const GlassCard = styled(Card)`
  width: 100%;
  max-width: 480px;
  border-radius: 24px !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.95) !important; // Slightly opaque for readability
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;

  .ant-card-body {
    padding: 40px 32px !important;
    
    @media (max-width: 480px) {
      padding: 30px 20px !important;
    }
  }
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #5C039B 0%, #03A4F4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
`;

const TestCredBox = styled.div`
  background: #f0f2f5;
  border-left: 4px solid #5C039B;
  padding: 12px;
  border-radius: 0 8px 8px 0;
  margin-top: 24px;
  font-size: 13px;
  color: #555;
`;

// --- Logic ---

const getDashboardPath = (roleCode) => {
  const map = { '0': '/superadmin', '1': '/admin' };
  return `/dashboard${map[roleCode] || ''}`;
};

const AdminLogin = () => {
  const [form] = Form.useForm();
  const [generalError, setGeneralError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const hasRedirected = useRef(false);

  const { login, isAuthenticated, user, token, loading } = useContext(AuthContext);
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

  // Auto redirect logic
  useEffect(() => {
    if (isAuthenticated && user && token && !hasRedirected.current) {
      hasRedirected.current = true;
      const roleCode = user?.role?.code?.toString() || user?.role;
      const roleName = roleCode === '0' ? 'SuperAdmin' : 'Admin';
      const userName = user?.name || user?.email?.split('@')[0] || 'User';

      // --- THE "PERFECT" ALERT DESIGN ---
      const isSuper = roleCode === '0';
      
      toast.success(
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: isSuper ? '#FFD700' : 'rgba(255,255,255,0.2)', 
            borderRadius: '50%', 
            width: 40, height: 40, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {isSuper ? <CrownFilled style={{ color: '#5C039B', fontSize: 20 }} /> : <SafetyCertificateFilled style={{ color: '#fff', fontSize: 20 }} />}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Welcome, {roleName}</div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>Dashboard Access Granted</div>
          </div>
        </div>, 
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: isSuper 
              ? "linear-gradient(135deg, #4b0082 0%, #240046 100%)" // Deep Royal Purple for Super
              : "linear-gradient(135deg, #03A4F4 0%, #0077b6 100%)", // Professional Blue for Admin
            color: "#fff",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.45)",
            border: isSuper ? "1px solid #FFD700" : "1px solid rgba(255,255,255,0.2)",
            minWidth: "350px",
            padding: "16px"
          },
          progressStyle: {
            background: isSuper ? "#FFD700" : "#ffffff"
          }
        }
      );

      setTimeout(() => {
        navigate(getDashboardPath(roleCode), { replace: true });
      }, 1500);
    }
  }, [isAuthenticated, user, token, navigate]);

  const onFinish = async (values) => {
    setGeneralError('');

    if (lockUntil && Date.now() < lockUntil) {
      const seconds = Math.ceil((lockUntil - Date.now()) / 1000);
      toast.warn(`Please wait ${seconds}s before retrying.`, { position: "top-center" });
      return;
    }

    try {
      await login("/auth/login", {
        email: values.email.trim(),
        password: values.password,
      });

      setAttemptCount(0);
      setLockUntil(null);
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : err?.message || "Login failed";
      const newCount = attemptCount + 1;
      setAttemptCount(newCount);

      if (newCount >= 5) {
        const lockTime = Date.now() + 5 * 60 * 1000; 
        setLockUntil(lockTime);
        setGeneralError("Security Lock: Too many failed attempts. Try again in 5 minutes.");
        return;
      }

      let displayError = "Invalid email or password";
      if (errorMsg.toLowerCase().includes("verify")) displayError = "Please verify your email first.";
      else if (errorMsg.includes("Network")) displayError = "Network error. Check your connection.";

      setGeneralError(displayError);
      toast.error(displayError, { position: "top-center" });
    }
  };

  const getLockMessage = () => {
    if (!lockUntil) return null;
    const seconds = Math.ceil((lockUntil - Date.now()) / 1000);
    return `Security Lockout: Try again in ${seconds} seconds`;
  };

  return (
    // Override Ant Design Theme to match Purple/Blue
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#5C039B',
          borderRadius: 8,
          fontFamily: 'Poppins, sans-serif',
        },
        components: {
          Button: {
            colorPrimary: '#5C039B',
            algorithm: true, // Enable hover algorithms
          },
          Input: {
            activeBorderColor: '#5C039B',
            hoverBorderColor: '#03A4F4',
          }
        }
      }}
    >
      <PageWrapper>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 50 }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <GlassCard bordered={false}>
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ 
                width: 64, height: 64, margin: '0 auto 16px', 
                background: 'linear-gradient(135deg, #5C039B, #03A4F4)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 20px rgba(92, 3, 155, 0.3)'
              }}>
                <LockOutlined style={{ fontSize: 30, color: '#fff' }} />
              </div>
              <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
                Admin <GradientText>Portal</GradientText>
              </Title>
              <Text type="secondary">Secure Gateway for Management</Text>
            </div>

            {/* Alerts */}
            {lockUntil && (
              <Alert
                message={getLockMessage()}
                type="error"
                showIcon
                style={{ marginBottom: 24, borderRadius: 12, border: '1px solid #ffccc7' }}
              />
            )}

            {generalError && !lockUntil && (
              <Alert
                message={generalError}
                type="error"
                showIcon
                closable
                onClose={() => setGeneralError('')}
                style={{ marginBottom: 24, borderRadius: 12 }}
              />
            )}

            {loading && (
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Spin size="large" />
                <div style={{ marginTop: 10, color: '#5C039B', fontWeight: 500 }}>Authenticating...</div>
              </div>
            )}

            {/* Login Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              disabled={loading || !!lockUntil}
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Invalid email address' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
                  placeholder="Email Address" 
                  style={{ borderRadius: 12 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Password"
                  style={{ borderRadius: 12 }}
                  iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#5C039B" /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24, marginTop: -10 }}>
                <a href="/forgot-password" style={{ color: '#03A4F4', fontWeight: 600, fontSize: 13 }}>
                  Forgot Password?
                </a>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  style={{
                    height: 52,
                    fontSize: 16,
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #5C039B 0%, #7B1FA2 100%)',
                    border: 'none',
                    borderRadius: 14,
                    boxShadow: '0 8px 20px rgba(92, 3, 155, 0.3)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {loading ? 'Accessing...' : 'Secure Login'}
                </Button>
              </Form.Item>
            </Form>

            {/* Back Link */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <a href="/login" style={{ color: '#888', fontSize: 13, transition: '0.3s' }}>
                <span style={{ marginRight: 4 }}>←</span> Back to User Login
              </a>
            </div>

            {/* Test Credentials Box */}
            <TestCredBox>
               <div style={{ marginBottom: 4, fontWeight: 'bold', color: '#333' }}>Developer Test Mode:</div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span>SuperAdmin:</span>
                 <Text copyable={{ text: 'Super1@gmail.com' }} style={{ color: '#5C039B', fontWeight: 600 }}>Super1@gmail.com</Text>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                 <span>Password:</span>
                 <Text copyable={{ text: 'Super1@gmail.com' }} style={{ color: '#5C039B', fontWeight: 600 }}>Super1@gmail.com</Text>
               </div>
            </TestCredBox>

          </GlassCard>
        </motion.div>
      </PageWrapper>
    </ConfigProvider>
  );
};

export default AdminLogin;