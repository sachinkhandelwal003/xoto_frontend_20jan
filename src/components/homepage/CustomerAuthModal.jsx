import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Modal, Tabs, Form, Input, Button, notification, Typography } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Text } = Typography;
const { TabPane } = Tabs;
const BRAND_PURPLE = "#5C039B";

// X icon component
const XIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const CustomerAuthModal = ({ 
  visible, 
  onCancel, 
  onSuccess,
  selectedImage 
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');

  const handleSignUp = async (values) => {
    setIsSubmitting(true);
    
    try {
      // Format the data as per API requirements
      const signupData = {
        name: {
          first_name: values.firstName,
          last_name: values.lastName
        },
        email: values.email,
        mobile: {
          country_code: values.countryCode || "+91",
          number: values.mobile
        },
        location: values.location || {
          country: "India",
          state: "",
          city: "",
          address: ""
        }
      };

      const response = await apiService.post('auth/signup/customer', signupData);
      
      if (response.success) {
        notification.success({
          message: 'Sign Up Successful!',
          description: 'Your account has been created.',
          duration: 2,
        });
        
        // Store token and user data (your auth system should handle this)
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.customer));
        
        onSuccess();
      }
    } catch (error) {
      console.error('Sign up error:', error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          notification.error({
            message: `Validation Error: ${err.field}`,
            description: err.message,
          });
        });
      } else {
        notification.error({
          message: 'Sign Up Failed',
          description: error.response?.data?.message || 'Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (values) => {
    setIsSubmitting(true);
    
    try {
      const loginData = {
        mobile: values.mobile
      };

      const response = await apiService.post('auth/login/customer', loginData);
      
      if (response.success) {
        notification.success({
          message: 'Sign In Successful!',
          description: 'Welcome back!',
          duration: 2,
        });
        
        // Store token and user data (your auth system should handle this)
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.customer));
        
        onSuccess();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      notification.error({
        message: 'Sign In Failed',
        description: error.response?.data?.message || 'Invalid mobile number. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFinish = (values) => {
    if (activeTab === 'signup') {
      handleSignUp(values);
    } else {
      handleSignIn(values);
    }
  };

  const SignUpFormContent = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="space-y-3"
      size="middle"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Form.Item
          name="firstName"
          rules={[{ required: true, message: 'First name required' }]}
          className="mb-2"
        >
          <Input 
            placeholder="First Name" 
            className="rounded-lg h-10"
          />
        </Form.Item>

        <Form.Item
          name="lastName"
          rules={[{ required: true, message: 'Last name required' }]}
          className="mb-2"
        >
          <Input 
            placeholder="Last Name" 
            className="rounded-lg h-10"
          />
        </Form.Item>
      </div>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Email required' },
          { type: 'email', message: 'Valid email required' }
        ]}
        className="mb-2"
      >
        <Input 
          placeholder="Email Address" 
          className="rounded-lg h-10"
        />
      </Form.Item>

      <div className="grid grid-cols-3 gap-3">
        <Form.Item
          name="countryCode"
          initialValue="+91"
          className="mb-2"
        >
          <Input 
            placeholder="+91" 
            className="rounded-lg h-10"
          />
        </Form.Item>

        <Form.Item
          name="mobile"
          rules={[
            { required: true, message: 'Mobile number required' },
            { pattern: /^[0-9]{10}$/, message: '10 digit mobile number required' }
          ]}
          className="mb-2 col-span-2"
        >
          <Input 
            placeholder="Mobile Number" 
            className="rounded-lg h-10"
          />
        </Form.Item>
      </div>

      <div className="pt-2">
        <Button 
          type="primary" 
          size="large" 
          htmlType="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          style={{ 
            background: 'linear-gradient(135deg, #5C039B 0%, #8E2DE2 100%)',
            border: 'none'
          }}
          className="w-full h-12 rounded-lg font-semibold text-sm shadow-lg shadow-purple-300 hover:shadow-xl hover:shadow-purple-400 transition-all duration-300"
          icon={<Sparkles size={16} />}
        >
          {isSubmitting ? 'Signing Up...' : 'Sign Up & Generate Design'}
        </Button>
      </div>
    </Form>
  );

  const SignInFormContent = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="space-y-3"
      size="middle"
    >
      <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
        <div className="text-xs text-blue-700">
          <div className="font-semibold mb-1">Sign in with your mobile number</div>
          <div>Use the mobile number you registered with</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Form.Item
          name="countryCode"
          initialValue="+91"
          className="mb-2"
        >
          <Input 
            placeholder="+91" 
            className="rounded-lg h-10"
          />
        </Form.Item>

        <Form.Item
          name="mobile"
          rules={[
            { required: true, message: 'Mobile number required' },
            { pattern: /^[0-9]{10}$/, message: '10 digit mobile number required' }
          ]}
          className="mb-2 col-span-2"
        >
          <Input 
            placeholder="Mobile Number" 
            className="rounded-lg h-10"
          />
        </Form.Item>
      </div>

      <div className="pt-2">
        <Button 
          type="primary" 
          size="large" 
          htmlType="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          style={{ 
            background: 'linear-gradient(135deg, #5C039B 0%, #8E2DE2 100%)',
            border: 'none'
          }}
          className="w-full h-12 rounded-lg font-semibold text-sm shadow-lg shadow-purple-300 hover:shadow-xl hover:shadow-purple-400 transition-all duration-300"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In & Generate Design'}
        </Button>
      </div>
    </Form>
  );

  return (
    <Modal
      open={visible}
      footer={null}
      onCancel={onCancel}
      width={1000}
      centered
      closable={false}
      bodyStyle={{ padding: 0, borderRadius: '20px', overflow: 'hidden' }}
    >
      <div className="flex flex-col lg:flex-row h-[550px] relative">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-gray-300"
          aria-label="Close modal"
        >
          <XIcon size={16} className="text-gray-600 hover:text-gray-800" />
        </button>

        {/* Left Side: Auth Form */}
        <div className="lg:w-1/2 p-6 lg:p-8 bg-white flex flex-col justify-center">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="m-0 text-xl font-bold text-gray-900">Access AI Designer</h2>
                <Text className="m-0 text-xs text-gray-500 mt-1">
                  Sign up or sign in to generate AI designs
                </Text>
              </div>
            </div>
          </div>

          <Tabs 
            defaultActiveKey="signup" 
            centered 
            onChange={(key) => {
              setActiveTab(key);
              form.resetFields();
            }}
          >
            <TabPane tab="Sign Up" key="signup">
              <SignUpFormContent />
            </TabPane>
            <TabPane tab="Sign In" key="signin">
              <SignInFormContent />
            </TabPane>
          </Tabs>
        </div>

        {/* Right Side: AI Background */}
        <div 
          className="lg:w-1/2 relative hidden lg:block"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(92, 3, 155, 0.85) 0%, rgba(142, 45, 226, 0.75) 100%), url(https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative z-10 h-full flex flex-col justify-center items-center p-6 text-center text-white">
            <div className="max-w-xs">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  Your Vision<br />Awaits!
                </h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  Create stunning AI-powered landscape designs with Xoto.
                  Sign up or sign in to start designing.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm">AI-Powered Designs</h4>
                    <p className="text-white/80 text-xs">Generate unlimited landscape designs</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm">Save Your Designs</h4>
                    <p className="text-white/80 text-xs">Access your designs anytime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile view */}
        <div className="lg:hidden p-4 bg-gradient-to-br from-purple-600 to-purple-800 text-white">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">
              Your Design Awaits!
            </h3>
            <p className="text-xs text-white/90">
              Sign up or sign in to generate AI landscape designs.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CustomerAuthModal;