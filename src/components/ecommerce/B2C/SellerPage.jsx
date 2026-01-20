import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Steps,
  Card,
  Row,
  Col,
  Checkbox,
  Typography,
  message,
  Spin
} from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SafetyOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SellerPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiErrors, setApiErrors] = useState({});

  const themeColor = 'var(--color-primary)';

  const {
    control,
    handleSubmit,
    trigger,
    setError,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      mobile: { country_code: '+971' }
    }
  });

  const businessTypes = [
    { label: 'Individual / Sole Proprietor', value: 'Individual / Sole Proprietor' },
    { label: 'Partnership', value: 'Partnership' },
    { label: 'Limited Liability Partnership (LLP)', value: 'Limited Liability Partnership (LLP)' },
    { label: 'Private Limited Company', value: 'Private Limited Company' },
    { label: 'Public Limited Company', value: 'Public Limited Company' },
    { label: 'Non-profit Organization', value: 'Non-profit Organization' }
  ];

  const countries = [
    { label: 'United Arab Emirates', value: 'United Arab Emirates' },
    { label: 'India', value: 'India' },
    { label: 'United States', value: 'United States' },
    { label: 'United Kingdom', value: 'United Kingdom' },
    { label: 'Canada', value: 'Canada' },
    { label: 'Australia', value: 'Australia' }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/categories');
      const categoryData = response.data || response;
      if (categoryData.categories) {
        const categoryOptions = categoryData.categories.map(category => ({
          label: category.parent ? `${category.name} (${category.parent.name})` : category.name,
          value: category._id
        }));
        setCategories(categoryOptions);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Personal', 'Store', 'Business'];

  const handleNext = async () => {
    let fieldsToValidate = [];

    if (currentStep === 0) {
      fieldsToValidate = ['first_name', 'last_name', 'email', 'mobile.country_code', 'mobile.number', 'password', 'confirmPassword'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['store_details.store_name', 'store_details.store_type', 'store_details.categories'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['registration.pan_number', 'store_details.store_address', 'store_details.city', 'store_details.country', 'store_details.pincode', 'meta.agreed_to_terms'];
    }

    const result = await trigger(fieldsToValidate);
    if (result) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      // First step se back → browser history se previous page par le jao
      window.history.back();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    setApiErrors({});

    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      mobile: {
        country_code: data.mobile?.country_code || '+91',
        number: data.mobile?.number || ''
      },
      password: data.password,
      confirmPassword: data.confirmPassword,
      store_details: {
        store_name: data.store_details?.store_name,
        store_description: data.store_details?.store_description || '',
        store_type: data.store_details?.store_type,
        store_address: data.store_details?.store_address,
        city: data.store_details?.city,
        country: data.store_details?.country,
        pincode: data.store_details?.pincode,
        categories: data.store_details?.categories || []
      },
      registration: {
        pan_number: data.registration?.pan_number,
        gstin: data.registration?.gstin || ''
      },
      meta: {
        agreed_to_terms: data.meta?.agreed_to_terms
      }
    };

    try {
      await apiService.post('/vendor/b2c', payload);
      setSuccess(true);
      message.success('Registration successful! Awaiting approval.');
    } catch (err) {
      const res = err.response?.data;

      if (res?.errors && Array.isArray(res.errors)) {
        const errorMap = {};
        res.errors.forEach(e => {
          errorMap[e.field] = e.message;
          setError(e.field, { type: "server", message: e.message });
        });
        setApiErrors(errorMap);

        const firstErrorField = res.errors[0].field;
        const el = document.querySelector(`[name="${firstErrorField}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });

        message.error(`Please fix ${res.errors.length} error(s).`);
      } else {
        message.error(res?.message || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleFilled style={{ fontSize: '48px', color: '#52c41a' }} />
          </div>
          <Title level={2}>Registration Successful!</Title>
          <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '32px' }}>
            Your request has been sent to the <strong>Admin</strong>.<br />
            You will receive an email once approved.
          </Text>
          <Button type="primary" size="large" href="/login" block
            style={{ height: '48px', fontSize: '16px', backgroundColor: themeColor, borderColor: themeColor }}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center py-10 px-4">
      <div style={{ maxWidth: 1200, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40, color: 'white' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            marginBottom: 20,
            backdropFilter: 'blur(10px)'
          }}>
            <ShopOutlined style={{ fontSize: 36, color: '#fff' }} />
          </div>
          <Title level={2} style={{ color: '#fff', margin: 0 }}>Vendor Registration</Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
            Join our marketplace in 3 simple steps
          </Text>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={8}>
            <Card bordered={false} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', height: '100%', color: 'white' }} bodyStyle={{ padding: 32 }}>
              <Steps direction="vertical" current={currentStep}>
                {steps.map((title, index) => (
                  <Steps.Step
                    key={index}
                    title={<span style={{ color: currentStep >= index ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>{title}</span>}
                    icon={
                      <div style={{
                        background: currentStep >= index ? '#fff' : 'transparent',
                        color: currentStep >= index ? themeColor : 'rgba(255,255,255,0.5)',
                        border: `1px solid ${currentStep >= index ? '#fff' : 'rgba(255,255,255,0.5)'}`,
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {currentStep > index ? <CheckCircleOutlined /> : index === 0 ? <UserOutlined /> : index === 1 ? <ShopOutlined /> : <FileTextOutlined />}
                      </div>
                    }
                  />
                ))}
              </Steps>
              <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 20 }}>
                <Text style={{ color: '#fff', display: 'block', marginBottom: 10 }}><CheckCircleOutlined /> Fast Approval</Text>
                <Text style={{ color: '#fff', display: 'block', marginBottom: 10 }}><CheckCircleOutlined /> Low Commission</Text>
                <Text style={{ color: '#fff', display: 'block' }}><CheckCircleOutlined /> 24/7 Support</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', background: '#fff' }} bodyStyle={{ padding: 40 }}>
              <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                <Spin spinning={submitting}>
                  {/* Step 0: Personal Information */}
                  {currentStep === 0 && (
                    <>
                      <Title level={4} style={{ marginBottom: 24, color: '#333' }}>
                        <UserOutlined style={{ color: themeColor }} /> Personal Information
                      </Title>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="First Name" required validateStatus={errors.first_name ? 'error' : ''} help={errors.first_name?.message || apiErrors.first_name}>
                            <Controller name="first_name" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input size="large" {...field} />} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Last Name" required validateStatus={errors.last_name ? 'error' : ''} help={errors.last_name?.message || apiErrors.last_name}>
                            <Controller name="last_name" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input size="large" {...field} />} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item label="Email Address" required validateStatus={errors.email ? 'error' : ''} help={errors.email?.message || apiErrors.email}>
                        <Controller name="email" control={control} rules={{ required: 'Required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } }} render={({ field }) => <Input size="large" {...field} />} />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Item label="Code">
                            <Controller name="mobile.country_code" control={control} render={({ field }) => (
                              <Select size="large" {...field}>
                                <Select.Option value="+971">+971 (AE)</Select.Option>
                                <Select.Option value="+91">+91 (IN)</Select.Option>
                                <Select.Option value="+1">+1 (US)</Select.Option>
                                <Select.Option value="+44">+44 (UK)</Select.Option>
                              </Select>
                            )} />
                          </Form.Item>
                        </Col>
                        <Col span={18}>
                          <Form.Item label="Phone Number" required validateStatus={errors.mobile?.number ? 'error' : ''} help={errors.mobile?.number?.message || apiErrors['mobile.number']}>
                            <Controller name="mobile.number" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input size="large" {...field} />} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Password" required validateStatus={errors.password ? 'error' : ''} help={errors.password?.message}>
                            <Controller name="password" control={control} rules={{ required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } }} render={({ field }) => <Input.Password size="large" {...field} />} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Confirm Password" required validateStatus={errors.confirmPassword ? 'error' : ''} help={errors.confirmPassword?.message}>
                            <Controller name="confirmPassword" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input.Password size="large" {...field} />} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )}

                  {/* Step 1: Store Information */}
                  {currentStep === 1 && (
                    <>
                      <Title level={4} style={{ marginBottom: 24, color: '#333' }}>
                        <ShopOutlined style={{ color: themeColor }} /> Store Information
                      </Title>
                      <Form.Item label="Store Name" required validateStatus={errors.store_details?.store_name ? 'error' : ''} help={errors.store_details?.store_name?.message}>
                        <Controller name="store_details.store_name" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input size="large" {...field} />} />
                      </Form.Item>

                      <Form.Item label="Business Type" required validateStatus={errors.store_details?.store_type ? 'error' : ''} help={errors.store_details?.store_type?.message}>
                        <Controller name="store_details.store_type" control={control} rules={{ required: 'Required' }} render={({ field }) => (
                          <Select size="large" options={businessTypes} {...field} />
                        )} />
                      </Form.Item>

                      <Form.Item label="Categories" required validateStatus={errors.store_details?.categories ? 'error' : ''} help={errors.store_details?.categories?.message}>
                        <Controller name="store_details.categories" control={control} rules={{ required: 'Select at least one category' }} render={({ field }) => (
                          <Select mode="multiple" size="large" loading={loading} options={categories} optionFilterProp="label" {...field} />
                        )} />
                      </Form.Item>

                      <Form.Item label="Description">
                        <Controller name="store_details.store_description" control={control} render={({ field }) => (
                          <TextArea rows={4} showCount maxLength={500} {...field} />
                        )} />
                      </Form.Item>
                    </>
                  )}

                  {/* Step 2: Business Details */}
                  {currentStep === 2 && (
                    <>
                      <Title level={4} style={{ marginBottom: 24, color: '#333' }}>
                        <FileTextOutlined style={{ color: themeColor }} /> Business Details
                      </Title>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="TRN Number" required validateStatus={errors.registration?.pan_number ? 'error' : ''} help={errors.registration?.pan_number?.message}>
                            <Controller name="registration.pan_number" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input size="large" {...field} />} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="VAT (Optional)">
                            <Controller name="registration.gstin" control={control} render={({ field }) => <Input size="large" {...field} />} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item label="Address" required validateStatus={errors.store_details?.store_address ? 'error' : ''} help={errors.store_details?.store_address?.message}>
                        <Controller name="store_details.store_address" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input size="large" {...field} />} />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item label="City" required validateStatus={errors.store_details?.city ? 'error' : ''} help={errors.store_details?.city?.message}>
                            <Controller name="store_details.city" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input size="large" {...field} />} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="Country" required validateStatus={errors.store_details?.country ? 'error' : ''} help={errors.store_details?.country?.message}>
                            <Controller name="store_details.country" control={control} rules={{ required: 'Required' }} render={({ field }) => (
                              <Select size="large" options={countries} {...field} />
                            )} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="PO" required validateStatus={errors.store_details?.pincode ? 'error' : ''} help={errors.store_details?.pincode?.message}>
                            <Controller name="store_details.pincode" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input size="large" {...field} />} />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item validateStatus={errors.meta?.agreed_to_terms ? 'error' : ''} help={errors.meta?.agreed_to_terms?.message}>
                        <Controller
                          name="meta.agreed_to_terms"
                          control={control}
                          rules={{ required: 'You must agree to terms' }}
                          render={({ field }) => (
                            <Checkbox checked={field.value} onChange={e => field.onChange(e.target.checked)}>
                              I agree to the Terms and Conditions
                            </Checkbox>
                          )}
                        />
                      </Form.Item>
                    </>
                  )}

                  {/* Buttons Section - Back button always visible */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
                    <Button size="large" onClick={handleBack} icon={<ArrowLeftOutlined />}>
                      Back
                    </Button>

                    <div>
                      {currentStep < steps.length - 1 ? (
                        <Button
                          type="primary"
                          size="large"
                          onClick={handleNext}
                          style={{ background: themeColor, borderColor: themeColor }}
                          icon={<ArrowRightOutlined />}
                        >
                          Continue
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          size="large"
                          htmlType="submit"
                          loading={submitting}
                          style={{ background: themeColor, borderColor: themeColor }}
                          icon={<CheckCircleOutlined />}
                        >
                          Register Vendor
                        </Button>
                      )}
                    </div>
                  </div>
                </Spin>
              </Form>

              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <SafetyOutlined style={{ color: '#52c41a' }} /> Your data is encrypted and secure.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SellerPage;