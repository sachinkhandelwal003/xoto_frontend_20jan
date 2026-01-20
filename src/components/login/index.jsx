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
  ConfigProvider
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../manageApi/context/AuthContext.jsx";
import { toast } from 'react-toastify';
import styled from 'styled-components';

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
  TeamOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// --- Styled Components ---

const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  font-family: 'Poppins', sans-serif;
  background: url(${props => props.$bgImage}) center/cover no-repeat fixed;
  overflow: hidden;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(92, 3, 155, 0.85), rgba(3, 164, 244, 0.8));
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
    padding: ${props => props.$isMobile ? "30px 20px" : "40px"} !important;
  }
`;

const SelectionCard = styled.div`
  background: ${props => props.$active ? `${props.$color}15` : 'rgba(255,255,255,0.5)'};
  border: 2px solid ${props => props.$active ? props.$color : 'transparent'};
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
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    border-color: ${props => props.$color};
  }
`;

const Login = () => {
  const [form] = Form.useForm();
  const [selectedPartnerType, setSelectedPartnerType] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const hasRedirected = useRef(false);

  const { login, isAuthenticated, user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // --- Partner Configuration ---
  const partnerTypes = [
    {
      value: 'freelancer',
      label: 'Execution Partners',
      desc: 'For Service Providers',
      icon: <UserOutlined style={{ fontSize: "28px" }} />,
      color: "#5C039B",
      gradient: "linear-gradient(135deg, #5C039B, #8E44AD)"
    },
    {
      value: 'vendor-b2c',
      label: 'Strategic Alliances',
      desc: 'For Product Sellers',
      icon: <ShopOutlined style={{ fontSize: "28px" }} />,
      color: "#03A4F4",
      gradient: "linear-gradient(135deg, #03A4F4, #0077b6)"
    },
    {
      value: 'business-association',
      label: 'Business Associates',
      desc: 'For Business Networks',
      icon: <TeamOutlined style={{ fontSize: "28px" }} />,
      color: "#10B981",
      gradient: "linear-gradient(135deg, #10B981, #059669)"
    }
  ];

  const getSelectedPartner = () => partnerTypes.find(t => t.value === selectedPartnerType);

  // --- Auth Effect (Success Toast) ---
  useEffect(() => {
    if (isAuthenticated && user && token && !hasRedirected.current) {
      hasRedirected.current = true;
      const userName = user?.name || user?.firstName || "Partner";
      const roleCode = user?.role?.code?.toString() || user?.role;
      
      let themeColor = "#5C039B";
      let themeIcon = <RocketFilled />;
      
      if (['5', '6'].includes(roleCode)) {
        themeColor = "#03A4F4";
        themeIcon = <ShoppingFilled />;
      } else if (['8', '9'].includes(roleCode)) {
        themeColor = "#10B981";
        themeIcon = <TeamOutlined />;
      }

      toast.success(
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '50%', 
            width: 40, height: 40, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {React.cloneElement(themeIcon, { style: { color: '#fff', fontSize: 20 } })}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Welcome, {userName}</div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>Login Successful</div>
          </div>
        </div>, 
        {
          position: "top-center",
          autoClose: 2000,
          style: {
            background: themeColor === "#5C039B" 
              ? "linear-gradient(135deg, #5C039B, #8E44AD)"
              : themeColor === "#03A4F4"
              ? "linear-gradient(135deg, #03A4F4, #0077b6)"
              : "linear-gradient(135deg, #10B981, #059669)",
            color: "#fff",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.45)",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "16px"
          }
        }
      );

      setTimeout(() => {
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
  }, [isAuthenticated, user, token, navigate]);

  // --- Handlers ---

  const handlePartnerSelect = (type) => {
    setSelectedPartnerType(type);
    setGeneralError("");
    form.resetFields();
  };

  const handleBackToSelection = () => {
    setSelectedPartnerType(null);
    setGeneralError("");
    form.resetFields();
  };

  const onFinish = async (values) => {
    setLoading(true);
    setGeneralError("");
    try {
      let endpoint = '';
      if (selectedPartnerType === 'freelancer') endpoint = '/freelancer/login';
      else if (selectedPartnerType === 'vendor-b2c') endpoint = '/vendor/b2c/login';
      else if (selectedPartnerType === 'business-association') endpoint = '/association/login';
      
      await login(endpoint, { email: values.email, password: values.password });
    } catch (err) {
      const errorMessage = err?.message || err?.status || 'Invalid credentials';
      setGeneralError(errorMessage);
      toast.error(errorMessage, { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (selectedPartnerType === 'freelancer') navigate('/freelancer/registration');
    else if (selectedPartnerType === 'vendor-b2c') navigate('/ecommerce/seller');
    else if (selectedPartnerType === 'business-association') navigate('/ecommerce/seller');
  };

  // --- RENDER CONTENT ---

const renderPartnerSelection = () => (
    <motion.div
      key="selection"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* --- ICON ONLY BACK BUTTON --- */}
      <div style={{ marginBottom: 24 }}> 
        <ArrowLeftOutlined 
          onClick={() => navigate("/")}
          style={{ 
            fontSize: "24px", 
            color: "#000", 
            cursor: "pointer",
            padding: "8px",
            marginLeft: "-8px" // Aligns icon flush with left content
          }} 
        />
      </div>

      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <Title level={3} style={{ margin: 0, color: '#333' }}>Select Partner Type</Title>
        <Text type="secondary">Choose your Account type to continue</Text>
      </div>

      {/* First Row: 2 boxes */}
      <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={12}>
          <SelectionCard 
            $active={selectedPartnerType === 'freelancer'} 
            $color="#5C039B"
            onClick={() => handlePartnerSelect('freelancer')}
          >
            <div style={{ 
              width: 70, height: 70, borderRadius: '50%', 
              background: "#5C039B", color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
              <UserOutlined style={{ fontSize: "28px" }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Execution Partners</div>
              <div style={{ fontSize: 14, color: '#888' }}>For Service Providers</div>
            </div>
          </SelectionCard>
        </Col>
        
        <Col xs={24} sm={12} md={12}>
          <SelectionCard 
            $active={selectedPartnerType === 'vendor-b2c'} 
            $color="#03A4F4"
            onClick={() => handlePartnerSelect('vendor-b2c')}
          >
            <div style={{ 
              width: 70, height: 70, borderRadius: '50%', 
              background: "#03A4F4", color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
              <ShopOutlined style={{ fontSize: "28px" }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Strategic Alliances</div>
              <div style={{ fontSize: 14, color: '#888' }}>For Product Sellers</div>
            </div>
          </SelectionCard>
        </Col>
      </Row>

      {/* Second Row: Business Associates box centered */}
      <Row justify="center">
        <Col xs={24} sm={12} md={12}>
          <SelectionCard 
            $active={selectedPartnerType === 'business-association'} 
            $color="#10B981"
            onClick={() => handlePartnerSelect('business-association')}
          >
            <div style={{ 
              width: 70, height: 70, borderRadius: '50%', 
              background: "#10B981", color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
              <TeamOutlined style={{ fontSize: "28px" }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Business Associates</div>
              <div style={{ fontSize: 14, color: '#888' }}>For Business Networks</div>
            </div>
          </SelectionCard>
        </Col>
      </Row>
    </motion.div>
  );

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
          onClick={handleBackToSelection}
          style={{ marginBottom: 16, paddingLeft: 0, color: '#888' }}
        >
          Back to Selection
        </Button>

        {/* Form Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ 
            width: 60, height: 60, borderRadius: 12, 
            background: activePartner.gradient, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            {activePartner.icon}
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#333' }}>Login as {activePartner.label}</Title>
            <Text type="secondary">Enter your credentials to access dashboard</Text>
          </div>
        </div>

        {generalError && (
          <Alert message={generalError} type="error" showIcon style={{ marginBottom: 24, borderRadius: 12 }} closable />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" rules={[{ required: true, type: "email", message: "Valid email required" }]}>
            <Input 
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Email Address" 
              style={{ borderRadius: 12, height: 48 }} 
            />
          </Form.Item>
          
          <Form.Item name="password" rules={[{ required: true, message: "Password required" }]}>
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Password" 
              style={{ borderRadius: 12, height: 48 }} 
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ 
                height: 52, borderRadius: 12, fontWeight: 'bold', fontSize: '15px',
                background: activePartner.gradient, border: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}
            >
              {loading ? "Signing In..." : "Login Now"}
            </Button>
            
            <Button
              onClick={handleRegister}
              block
              style={{ 
                height: 52, borderRadius: 12, fontWeight: 'bold', fontSize: '15px',
                borderColor: activePartner.color, color: activePartner.color
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
          colorPrimary: selectedPartnerType === 'vendor-b2c' 
            ? '#03A4F4' 
            : selectedPartnerType === 'business-association'
            ? '#10B981'
            : '#5C039B',
          borderRadius: 8,
          fontFamily: 'Poppins, sans-serif',
        }
      }}
    >
      <PageWrapper $bgImage={loginimage}>
        <GradientOverlay />
        
        <ContentLayer>
          <Row style={{ width: '100%', maxWidth: 1200, padding: isMobile ? 16 : 0 }}>
            <Col xs={24} lg={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: isMobile ? 'center' : 'flex-start', padding: 40 }}>
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ textAlign: isMobile ? 'center' : 'left' }}
              >
              {/* <img 
  src={logoNew} 
  alt="Logo" 
  style={{
    width: isMobile ? 200 : 260,
    height: isMobile ? 200 : 260,
    marginBottom: 24,
    marginLeft: isMobile ? "auto" : 0,
    marginRight: isMobile ? "auto" : 0,
    display: "block",
    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))"
  }} 
/>

                
                <Title style={{ color: '#fff', fontSize: isMobile ? 32 : 48, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
                  Partner <br/>
                  <span style={{ color: '#03A4F4' }}>Login</span>
                </Title>
                
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginTop: 16, display: 'block', maxWidth: 400 }}>
                  {!selectedPartnerType 
                    ? "Connect, Collaborate, and Grow with our extensive ecosystem."
                    : `Welcome back, ${getSelectedPartner().label}. Let's get to work.`
                  }
                </Text> */}
   <img 
  src={logoNew} 
  alt="Logo" 
  style={{
    width: isMobile ? 200 : 260,
    height: isMobile ? 200 : 260,
    marginBottom: 4, // 👈 same for mobile & desktop
    marginLeft: isMobile ? "auto" : 0,
    marginRight: isMobile ? "auto" : 0,
    // display: "block",
 
    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))"
  }} 
/>


<Title
  style={{
    color: '#fff',
    fontSize: isMobile ? 32 : 48,
    fontWeight: 800,
    marginTop: 0,   // 👈 remove default gap
    marginBottom: 6,
    lineHeight: 1.02,
       whiteSpace:"nowrap",
  }}
>
  Partner 
  <span style={{ color: '#03A4F4' }}>Login</span>
</Title>



<Text
  style={{
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    marginTop: 0, // 👈 no extra space
    display: 'block',
    maxWidth: 400
  }}
>
  {!selectedPartnerType 
    ? "Connect, Collaborate, and Grow with our extensive ecosystem."
    : `Welcome back, ${getSelectedPartner().label}. Let's get to work.`
  }
</Text>


              </motion.div>
            </Col>

            <Col xs={24} lg={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                style={{ width: '100%', maxWidth: 550 }}
              >
                <GlassCard bordered={false} $isMobile={isMobile}>
                  <AnimatePresence mode="wait">
                    {!selectedPartnerType ? renderPartnerSelection() : renderLoginForm()}
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