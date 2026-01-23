import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { 
  UserOutlined, 
  ArrowLeftOutlined, 
  MobileOutlined 
} from '@ant-design/icons';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Grid,
  ConfigProvider,
  Select
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../manageApi/context/AuthContext.jsx';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { Country } from 'country-state-city'; // Import Library

// Assets
import loginimage from '../../assets/img/one.png';
import logoNew from '../../assets/img/logoNew.png';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

/* ---------------- PHONE LENGTH RULES ---------------- */
const PHONE_LENGTH_RULES = {
  "AE": 9,  // UAE
  "IN": 10, // India
  "SA": 9,  // Saudi Arabia
  "US": 10, // USA
  "CA": 10, // Canada
  "GB": 10, // UK
  "AU": 9,  // Australia
};

/* ---------------- STYLED COMPONENTS ---------------- */

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
  background: linear-gradient(135deg, rgba(3, 164, 244, 0.8), rgba(0, 31, 63, 0.85));
  backdrop-filter: blur(3px);
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
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  .ant-card-body {
    padding: ${props => (props.$isMobile ? '30px 20px' : '40px')} !important;
  }
`;

/* ---------------- COMPONENT ---------------- */

const CustomerLogin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // ✅ DEFAULT COUNTRY ISO CODE (UAE)
  const [countryIso, setCountryIso] = useState('AE');

  const hasRedirected = useRef(false);
  const { login, isAuthenticated, user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Memoized Country Data
  const countryOptions = useMemo(() => {
    const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "AU"];
    return Country.getAllCountries().map((country) => ({
      name: country.name,
      code: country.phonecode,
      iso: country.isoCode,
    })).sort((a, b) => {
      const aPriority = priorityIsoCodes.includes(a.iso);
      const bPriority = priorityIsoCodes.includes(b.iso);
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  /* ---------------- AUTH SUCCESS EFFECT ---------------- */

  useEffect(() => {
    if (isAuthenticated && user && token && !hasRedirected.current) {
      hasRedirected.current = true;

      toast.success(`Welcome, ${user?.name || 'Customer'}!`, {
        position: 'top-center',
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate('/dashboard/customer', { replace: true });
      }, 2000);
    }
  }, [isAuthenticated, user, token, navigate]);

  /* ---------------- FORM SUBMIT ---------------- */

  const onFinish = async (values) => {
    setLoading(true);
    
    // Get phone code dynamically based on selected ISO
    const selectedCountryData = Country.getCountryByCode(countryIso);
    const phoneCode = selectedCountryData ? `+${selectedCountryData.phonecode}` : '+971';

    try {
      await login('/users/login/customer', {
        mobile: {
          country_code: phoneCode,
          number: values.mobile,
        },
      });
    } catch (err) {
      toast.error(err?.message || 'Login failed', {
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#03A4F4',
          borderRadius: 8,
          fontFamily: 'Poppins, sans-serif',
        },
      }}
    >
      <PageWrapper $bgImage={loginimage}>
        <GradientOverlay />

        <ContentLayer>
          <Row style={{ width: '100%', maxWidth: 1200, padding: isMobile ? 16 : 0 }}>

            {/* LEFT SECTION */}
            <Col xs={24} lg={12} style={{ padding: 40 }}>
              <img src={logoNew} alt="Logo" style={{ width: 150 }} />
              <Title style={{ color: '#fff', marginTop: 24 }}>
                Customer <span style={{ color: '#03A4F4' }}>Login</span>
              </Title>
              <Text style={{ color: '#fff' }}>
                Login using your mobile number
              </Text>
            </Col>

            {/* RIGHT SECTION */}
            <Col xs={24} lg={12} style={{ display: 'flex', justifyContent: 'center' }}>
              <GlassCard bordered={false} $isMobile={isMobile}>

                <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }}>

                  {/* --- BACK BUTTON SECTION --- */}
                  <div
                    onClick={() => navigate('/')}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      cursor: 'pointer',
                      fontSize: 20,
                      color: '#595959', 
                      display: 'flex',
                      alignItems: 'center',
                      height: 28 
                    }}
                  >
                    <ArrowLeftOutlined />
                  </div>
                  {/* --------------------------- */}

                  <div style={{
                    width: 64,
                    height: 64,
                    margin: '0 auto 16px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,#03A4F4,#0077b6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 28,
                  }}>
                    <UserOutlined />
                  </div>

                  <Title level={3}>Welcome Back</Title>
                  <Text type="secondary">Login using your mobile number</Text>
                </div>

                {/* FORM */}
                <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                  <Form.Item
                    name="mobile"
                    rules={[
                      { required: true, message: 'Please enter mobile number' },
                      () => ({
                        validator(_, value) {
                          if (!value) return Promise.resolve();

                          // Dynamic Length Validation
                          const requiredDigits = PHONE_LENGTH_RULES[countryIso] || 10;
                          const regex = new RegExp(`^\\d{${requiredDigits}}$`);

                          return regex.test(value)
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error(`Enter a valid ${requiredDigits}-digit number`)
                              );
                        },
                      }),
                    ]}
                  >
                    <Input
                      addonBefore={
                        <Select
                          value={countryIso}
                          style={{ width: 100 }}
                          onChange={(val) => {
                            setCountryIso(val);
                            form.setFieldsValue({ mobile: '' }); // Clear input on country change
                          }}
                          dropdownMatchSelectWidth={300}
                          optionLabelProp="label"
                        >
                          {countryOptions.map((item) => (
                            <Option key={item.iso} value={item.iso} label={`+${item.code}`}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img
                                  src={`https://flagcdn.com/w20/${item.iso.toLowerCase()}.png`}
                                  srcSet={`https://flagcdn.com/w40/${item.iso.toLowerCase()}.png 2x`}
                                  width="20"
                                  alt={item.name}
                                  style={{ marginRight: 8, borderRadius: 2 }}
                                />
                                <span style={{ color: '#555' }}>{item.name} (+{item.code})</span>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      }
                      prefix={<MobileOutlined />}
                      placeholder={`Mobile Number`}
                      maxLength={PHONE_LENGTH_RULES[countryIso] || 15}
                      style={{ height: 50, borderRadius: 12 }}
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{
                      height: 50,
                      borderRadius: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    Secure Login
                  </Button>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Text>Don’t have an account? </Text>
                  <span
                    onClick={() => navigate('/register')}
                    style={{ color: '#03A4F4', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Register Now
                  </span>
                </div>

              </GlassCard>
            </Col>
          </Row>
        </ContentLayer>
      </PageWrapper>
    </ConfigProvider>
  );
};

export default CustomerLogin;