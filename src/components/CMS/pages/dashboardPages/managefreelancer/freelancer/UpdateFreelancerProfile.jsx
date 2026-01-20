import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../../../../manageApi/utils/toast";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  InputNumber,
  Upload,
  Avatar,
  Tag,
  Space,
  Typography,
  Switch,
  Spin,
  Tabs,
  Table,
  Alert,
} from "antd";
import {
  UserOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  EnvironmentOutlined,
  SolutionOutlined,
  DollarCircleOutlined,
  ToolFilled,
  FileTextOutlined,
  CameraOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// Define standard unit options - SAME AS REGISTRATION
const unitOptions = [
  { label: "Per Hour", value: "per hour" },
  { label: "Per Sq. Ft", value: "per sq.ft" },
  { label: "Per Sq. Meter", value: "per sq.m" },
  { label: "Fixed Price", value: "fixed" },
  { label: "Per Day", value: "per day" },
  { label: "Per Item", value: "per item" },
  { label: "Per Visit", value: "per visit" }
];

const UpdateFreelancerProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Rate Card specific state
  const [rateLoading, setRateLoading] = useState(false);
  const [rateCardValues, setRateCardValues] = useState({}); 

  // Data States - EXACTLY SAME AS REGISTRATION FORM
  const [subcategories, setSubcategories] = useState([]); // From /estimate/master/category/name/Landscaping/subcategories
  const [typesMap, setTypesMap] = useState({}); // { [serviceIndex]: [{value, label}] } - Same as Registration
  const [currencies, setCurrencies] = useState([]); 

  // File States
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [fileList, setFileList] = useState({
    resume: [],
    identityProof: [],
    addressProof: [],
    certificate: []
  });

  const [activeTab, setActiveTab] = useState("basic");

  // Use refs to store initial data and prevent unnecessary refreshes
  const initialDataRef = useRef(null);
  const isInitialMount = useRef(true);
  const hasFetchedTypesRef = useRef(false);

  // Initial Fetch - SAME AS REGISTRATION
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch subcategories FIRST (like Registration form)
        const subcategoriesRes = await fetchSubcategories();
        setSubcategories(subcategoriesRes);
        
        // Then fetch profile and currencies
        const [profileRes, currenciesRes] = await Promise.all([
          apiService.get("/freelancer/profile"),
          fetchCurrencies()
        ]);

        if (profileRes.success) {
          setFreelancer(profileRes.freelancer);
          
          // Store initial data in ref
          initialDataRef.current = {
            profile: profileRes.freelancer,
            subcategories: subcategoriesRes,
            currencies: currenciesRes
          };
          
          const formattedData = formatFormData(profileRes.freelancer);
          form.setFieldsValue(formattedData);
          
          if (profileRes.freelancer.profile_image) {
            setPreviewImage(`http://localhost:5000/${profileRes.freelancer.profile_image}`);
          }

          // Rate Card Init - Use actual type data with labels
          const initialRates = {};
          if (profileRes.freelancer.services_offered) {
            profileRes.freelancer.services_offered.forEach(service => {
              if (service.subcategories) {
                service.subcategories.forEach(subcat => {
                  const type = subcat.type;
                  if (type?._id) {
                    initialRates[type._id] = {
                      price_range: subcat.price_range || "",
                      unit: subcat.unit || "per hour",
                      serviceId: service._id,
                      typeId: type._id,
                      typeLabel: type.label
                    };
                  }
                });
              }
            });
          }
          setRateCardValues(initialRates);

          // Fetch types for existing services - SAME AS REGISTRATION
          if (profileRes.freelancer.services_offered?.length && subcategoriesRes.length) {
            // Reset the flag for initial fetch
            hasFetchedTypesRef.current = false;
            
            profileRes.freelancer.services_offered.forEach((service, index) => {
              const subcategoryId = service.category?._id;
              if (subcategoryId) {
                fetchTypes(subcategoryId, index);
              }
            });
          }
        }

        if (currenciesRes) setCurrencies(currenciesRes);

      } catch (error) {
        console.error("Error fetching data:", error);
        showToast("Failed to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [form]);

  // --- API Helpers - EXACTLY SAME AS REGISTRATION FORM ---
  const fetchSubcategories = async () => {
    try {
      const res = await apiService.get(
        "/estimate/master/category/name/Landscaping/subcategories"
      );
      if (res.success) {
        return res.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      return [];
    }
  };

  // Fetch types when subcategory selected - EXACTLY SAME AS REGISTRATION
  const fetchTypes = async (subcategoryId, serviceIndex, force = false) => {
    if (!subcategoryId) return;

    const sub = subcategories.find(s => s._id === subcategoryId);
    if (!sub?.category) return;

    // Don't fetch if already fetched and not forced
    if (!force && typesMap[serviceIndex] && hasFetchedTypesRef.current) {
      return;
    }

    try {
      const res = await apiService.get(
        `/estimate/master/category/${sub.category}/subcategories/${subcategoryId}/types`
      );

      if (res.success) {
        const formatted = (res.data || []).map(item => ({
          value: item._id,
          label: item.label
        }));

        setTypesMap(prev => ({
          ...prev,
          [serviceIndex]: formatted
        }));
        
        // Mark as fetched
        hasFetchedTypesRef.current = true;
      }
    } catch (err) {
      console.error("Error loading types:", err);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await apiService.get('/setting/currency');
      return response.success ? response.currencies : [];
    } catch (error) { return []; }
  };

  // Handle subcategory change - SAME AS REGISTRATION
  const handleSubcategoryChange = (value, index) => {
    const services = form.getFieldValue('services') || [];
    if (services[index]) {
      services[index].types = []; // Clear types when subcategory changes
      form.setFieldsValue({ services });
    }
    fetchTypes(value, index, true); // Force fetch
  };

  // --- Rate Card Logic ---
  const handleRateInputChange = (typeId, field, value) => {
    setRateCardValues(prev => ({
      ...prev,
      [typeId]: { ...prev[typeId], [field]: value }
    }));
  };

  const updateSingleRateCard = async (typeId) => {
    try {
      setRateLoading(true);
      const values = rateCardValues[typeId];
      if(!values?.price_range) {
        showToast("Price range is required", "warning");
        return;
      }

      const payload = {
        serviceId: values.serviceId,
        typeId: values.typeId,
        price_range: values.price_range,
        unit: values.unit
      };

      const response = await apiService.put('/freelancer/rate-card', payload);

      if (response.success) {
        showToast("Rate card updated successfully!", "success");
        // Update local state without refreshing everything
        setFreelancer(prev => {
          const updatedServices = prev.services_offered.map(service => {
            if (service._id === values.serviceId) {
              const updatedSubcats = service.subcategories.map(subcat => {
                if (subcat.type?._id === typeId) {
                  return { 
                    ...subcat, 
                    price_range: values.price_range, 
                    unit: values.unit 
                  };
                }
                return subcat;
              });
              return { ...service, subcategories: updatedSubcats };
            }
            return service;
          });
          return { ...prev, services_offered: updatedServices };
        });
        
        // Update rate card values
        setRateCardValues(prev => ({
          ...prev,
          [typeId]: { ...prev[typeId], price_range: values.price_range, unit: values.unit }
        }));
      } else {
        showToast(response.message || "Update failed", "error");
      }
    } catch (error) {
      console.error("Rate card update error:", error);
      showToast("Update failed", "error");
    } finally {
      setRateLoading(false);
    }
  };

  // Rate Card Columns - Shows type labels from your backend
  const rateCardColumns = [
    {
      title: 'Service Category',
      key: 'category',
      width: 200,
      render: (_, service) => {
        // Find category name from subcategories list (same as Registration)
        const subcategoryId = service.category?._id || service.category;
        const subcategory = subcategories.find(s => s._id === subcategoryId);
        const categoryName = subcategory?.label || 
                            service.category?.name || 
                            service.category?.label || 
                            "Unknown Category";
        
        return (
          <Space>
            {service.category?.icon && <Avatar src={service.category.icon} shape="square" size="small" />}
            <div className="flex flex-col">
              <Text strong>{categoryName}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {service.description || "No description"}
              </Text>
            </div>
          </Space>
        );
      }
    },
    {
      title: 'Service Type',
      key: 'type',
      width: 200,
      render: (_, service) => (
        <div>
          {service.subcategories?.map((subcat, index) => {
            const typeName = subcat.type?.label || 
                            subcat.type?.name || 
                            "Unknown Type";
            return (
              <div key={subcat._id || index} className="mb-2 p-2 bg-gray-50 rounded">
                <Text strong>{typeName}</Text>
              </div>
            );
          })}
        </div>
      )
    },
    {
      title: 'Price Range',
      key: 'price',
      width: 200,
      render: (_, service) => (
        <div>
          {service.subcategories?.map((subcat, index) => {
            const typeId = subcat.type?._id;
            if (!typeId) return null;
            
            return (
              <div key={subcat._id || index} className="mb-2">
                <Input 
                  value={rateCardValues[typeId]?.price_range || ""}
                  onChange={(e) => handleRateInputChange(typeId, 'price_range', e.target.value)}
                  placeholder="e.g. 100-200"
                  prefix={freelancer?.payment?.preferred_currency?.symbol || "$"}
                />
              </div>
            );
          })}
        </div>
      )
    },
    {
      title: 'Unit',
      key: 'unit',
      width: 180,
      render: (_, service) => (
        <div>
          {service.subcategories?.map((subcat, index) => {
            const typeId = subcat.type?._id;
            if (!typeId) return null;
            
            return (
              <div key={subcat._id || index} className="mb-2">
                <Select 
                  value={rateCardValues[typeId]?.unit || "per hour"}
                  onChange={(value) => handleRateInputChange(typeId, 'unit', value)}
                  placeholder="Select Unit"
                  style={{ width: '100%' }}
                >
                  {unitOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
              </div>
            );
          })}
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, service) => (
        <div>
          {service.subcategories?.map((subcat, index) => {
            const typeId = subcat.type?._id;
            if (!typeId) return null;
            
            return (
              <div key={subcat._id || index} className="mb-2">
                <Button 
                  type="primary" 
                  ghost 
                  size="small"
                  loading={rateLoading}
                  onClick={() => updateSingleRateCard(typeId)}
                >
                  Update
                </Button>
              </div>
            );
          })}
        </div>
      )
    }
  ];

  // --- Form Formatting - Matches Registration data structure ---
  const formatFormData = (data) => {
    if (!data) return {};

    return {
      firstName: data.name?.first_name || "",
      lastName: data.name?.last_name || "",
      mobile: data.mobile?.number || "",
      countryCode: data.mobile?.country_code || '+91',
      languages: data.languages || [],
      experienceYears: data.professional?.experience_years || 0,
      availability: data.professional?.availability || "Full-time",
      workingRadius: data.professional?.working_radius,
      bio: data.professional?.bio || "",
      skills: data.professional?.skills?.join(', ') || '',
      city: data.location?.city || "",
      state: data.location?.state || "",
      country: data.location?.country || 'UAE',
      po_box: data.location?.po_box || "",
      preferredMethod: data.payment?.preferred_method || "Cash",
      preferredCurrency: data.payment?.preferred_currency?._id || data.payment?.preferred_currency,
      advancePercentage: data.payment?.advance_percentage,
      gstNumber: data.payment?.gst_number || data.payment?.vat_number || "",
      // Format services EXACTLY like Registration form expects
      services: data.services_offered?.map(service => ({
        _id: service._id,
        category: service.category?._id, // SUBCATEGORY ID
        types: service.subcategories?.map(sub => sub.type?._id) || [],
        description: service.description || "",
        isActive: service.is_active !== false
      })) || [],
      portfolio: []
    };
  };

  // --- File Handling ---
  const handleProfileImageChange = (info) => {
    if (info.file.status === 'removed') {
      setProfileImage(null);
      setPreviewImage(null);
      return;
    }
    const file = info.file;
    setProfileImage(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setPreviewImage(reader.result);
    return false;
  };

  const handleDocumentChange = (info, type) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-1); 
    setFileList(prev => ({ ...prev, [type]: newFileList }));
  };

  const customRequest = ({ onSuccess }) => { 
    setTimeout(() => { onSuccess("ok"); }, 0); 
  };

  // --- RE-UPLOAD HANDLER ---
  const handleReupload = async (options, documentId) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file);

    try {
      showToast("Uploading...", "info");
      const res = await apiService.put(`/freelancer/document/${documentId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        onSuccess("Ok");
        showToast("Document re-uploaded successfully!", "success");
        
        // Update local state without full refresh
        setFreelancer(prev => {
          const updatedDocs = prev.documents.map(d => 
            d._id === documentId ? res.document : d
          );
          return { 
            ...prev, 
            documents: updatedDocs, 
            onboarding_status: res.onboarding_status || prev.onboarding_status 
          };
        });
      } else {
        showToast(res.message, "error");
        onError(new Error(res.message));
      }
    } catch (err) {
      console.error(err);
      showToast("Re-upload failed", "error");
      onError(err);
    }
  };

  // --- MAIN FORM SUBMISSION - Optimized to prevent unnecessary refreshes ---
  const onFinish = async (values) => {
    try {
      setSaving(true);
      
      // Check if anything actually changed
      const initialData = initialDataRef.current?.profile;
      if (initialData) {
        const isSameData = compareFormData(initialData, values);
        if (isSameData && !profileImage && Object.values(fileList).every(arr => arr.length === 0)) {
          showToast("No changes detected", "info");
          setSaving(false);
          return;
        }
      }
      
      const formData = new FormData();

      // Basic Info
      formData.append('name[first_name]', values.firstName || "");
      formData.append('name[last_name]', values.lastName || "");
      formData.append('mobile[country_code]', values.countryCode || '+91');
      formData.append('mobile[number]', values.mobile || "");
      
      // Languages
      if (values.languages) {
        values.languages.forEach(lang => formData.append('languages[]', lang));
      }

      // Profile Image
      if (profileImage) {
        formData.append('profile_image', profileImage);
      }

      // Professional Info
      const professionalData = {
        experience_years: values.experienceYears || 0,
        availability: values.availability || "Full-time",
        bio: values.bio || "",
        skills: typeof values.skills === 'string' ? 
          values.skills.split(',').map(s => s.trim()).filter(s => s) : 
          values.skills || []
      };
      formData.append('professional', JSON.stringify(professionalData));

      // Location
      const locationData = {
        city: values.city || "",
        state: values.state || "",
        country: values.country || "UAE",
        po_box: values.po_box || ""
      };
      formData.append('location', JSON.stringify(locationData));

      // Payment
      const paymentData = {
        preferred_method: values.preferredMethod || "Cash",
        preferred_currency: values.preferredCurrency
      };
      if (values.gstNumber) paymentData.vat_number = values.gstNumber;
      formData.append('payment', JSON.stringify(paymentData));

      // Services Offered - SAME STRUCTURE AS REGISTRATION
      if (values.services) {
        const servicesData = values.services.map(service => {
          // Find existing service to preserve existing subcategories
          const existingService = freelancer?.services_offered?.find(s => s._id === service._id);
          const existingSubcategories = existingService?.subcategories || [];
          
          // Create subcategories array with types
          const subcategoriesData = (service.types || []).map(typeId => {
            // Check if this type already exists
            const existingSubcat = existingSubcategories.find(subcat => 
              subcat.type?._id === typeId || subcat.type === typeId
            );
            
            if (existingSubcat) {
              // Keep existing price and unit
              return {
                type: typeId,
                price_range: existingSubcat.price_range || "",
                unit: existingSubcat.unit || "per hour",
                is_active: true
              };
            } else {
              // New type
              return {
                type: typeId,
                price_range: "",
                unit: "per hour",
                is_active: true
              };
            }
          });

          return {
            _id: service._id,
            category: service.category, // This is subcategory ID
            description: service.description || "",
            is_active: service.isActive !== false,
            subcategories: subcategoriesData
          };
        });
        formData.append('services_offered', JSON.stringify(servicesData));
      }

      // Documents
      if (fileList.resume.length) formData.append('resume', fileList.resume[0].originFileObj);
      if (fileList.identityProof.length) formData.append('identityProof', fileList.identityProof[0].originFileObj);
      if (fileList.addressProof.length) formData.append('addressProof', fileList.addressProof[0].originFileObj);
      if (fileList.certificate.length) formData.append('certificate', fileList.certificate[0].originFileObj);

      const response = await apiService.put("/freelancer/profile", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.success) {
        showToast("Profile updated successfully!", "success");
        
        // Update local state without triggering full re-fetch
        setFreelancer(prev => {
          const updated = response.freelancer || prev;
          return {
            ...prev,
            ...updated,
            profileProgress: response.freelancer?.profileProgress || prev.profileProgress
          };
        });
        
        // Update form with new data
        const formattedData = formatFormData(response.freelancer || freelancer);
        form.setFieldsValue(formattedData);
        
        // Update rate card values
        const updatedRates = {};
        if (response.freelancer?.services_offered) {
          response.freelancer.services_offered.forEach(service => {
            if (service.subcategories) {
              service.subcategories.forEach(subcat => {
                const type = subcat.type;
                if (type?._id) {
                  updatedRates[type._id] = {
                    price_range: subcat.price_range || "",
                    unit: subcat.unit || "per hour",
                    serviceId: service._id,
                    typeId: type._id,
                    typeLabel: type.label || "Unknown Type"
                  };
                }
              });
            }
          });
        }
        setRateCardValues(updatedRates);
        
        // Update initial data ref
        initialDataRef.current = {
          ...initialDataRef.current,
          profile: response.freelancer || freelancer
        };
        
        // Reset file states
        setProfileImage(null);
        setFileList({ resume: [], identityProof: [], addressProof: [], certificate: [] });
        
        // Update preview image if profile image was updated
        if (response.freelancer?.profile_image) {
          setPreviewImage(`http://localhost:5000/${response.freelancer.profile_image}`);
        }
      } else {
        showToast(response.message || "Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // Helper function to compare form data
  const compareFormData = (initial, current) => {
    // Compare basic info
    if (initial.name?.first_name !== current.firstName ||
        initial.name?.last_name !== current.lastName ||
        initial.mobile?.country_code !== current.countryCode ||
        initial.mobile?.number !== current.mobile) {
      return false;
    }
    
    // Compare professional info
    if (initial.professional?.experience_years !== current.experienceYears ||
        initial.professional?.availability !== current.availability ||
        initial.professional?.bio !== current.bio) {
      return false;
    }
    
    // Compare location
    if (initial.location?.city !== current.city ||
        initial.location?.state !== current.state ||
        initial.location?.country !== current.country ||
        initial.location?.po_box !== current.po_box) {
      return false;
    }
    
    // Compare payment
    if (initial.payment?.preferred_method !== current.preferredMethod ||
        initial.payment?.preferred_currency?._id !== current.preferredCurrency ||
        initial.payment?.vat_number !== current.gstNumber) {
      return false;
    }
    
    // Compare languages
    const currentLangs = Array.isArray(current.languages) ? current.languages : [];
    if (JSON.stringify(initial.languages?.sort()) !== JSON.stringify(currentLangs.sort())) {
      return false;
    }
    
    return true;
  };

  if (loading) return <Spin size="large" className="flex justify-center mt-10" />;
  if (!freelancer) return <div className="text-center mt-10">Profile Not Found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with progress */}
        <Card className="mb-6 shadow-sm border-0 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <Avatar
                  size={100}
                  src={previewImage}
                  icon={<UserOutlined />}
                  className="border-2 border-gray-200"
                />
                <div className="absolute bottom-0 right-0">
                  <Upload
                    name="profile_image"
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleProfileImageChange}
                  >
                    <Button type="primary" shape="circle" icon={<CameraOutlined />} size="small" />
                  </Upload>
                </div>
              </div>
              <div>
                <Title level={2} className="m-0 text-gray-800">
                  {freelancer.name?.first_name} {freelancer.name?.last_name}
                </Title>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Tag color="blue">
                    {freelancer.professional?.experience_years || 0} years exp
                  </Tag>
                  <Tag color={freelancer.onboarding_status === 'approved' ? 'green' : 
                            freelancer.onboarding_status === 'rejected' ? 'red' : 'blue'}>
                    {freelancer.onboarding_status?.replace('_', ' ') || 'Unknown'}
                  </Tag>
                  {freelancer.profileProgress && (
                    <Tag color="orange">
                      {freelancer.profileProgress.completionPercentage}% Complete
                    </Tag>
                  )}
                </div>
              </div>
            </div>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              loading={saving} 
              onClick={() => form.submit()} 
              size="large"
            >
              Save Full Profile
            </Button>
          </div>
          
          {/* Progress Bar */}
          {freelancer.profileProgress && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Profile Completion</span>
                <span className="font-medium">{freelancer.profileProgress.completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${freelancer.profileProgress.completionPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {freelancer.profileProgress.summary}
              </div>
            </div>
          )}
        </Card>

        {/* Main Form */}
        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" className="bg-white p-4 rounded shadow-sm">
            
            {/* Basic Info Tab */}
            <TabPane tab={<span><UserOutlined /> Basic Info</span>} key="basic">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Mobile" required style={{ marginBottom: 0 }}>
                    <Input.Group compact>
                      <Form.Item name="countryCode" noStyle rules={[{ required: true }]}>
                        <Select style={{ width: '30%' }}>
                          <Option value="+91">+91</Option>
                          <Option value="+971">+971</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name="mobile" noStyle rules={[{ required: true }]}>
                        <Input style={{ width: '70%' }} />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Languages" name="languages">
                    <Select mode="multiple">
                      <Option value="english">English</Option>
                      <Option value="hindi">Hindi</Option>
                      <Option value="arabic">Arabic</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* Professional Tab */}
            <TabPane tab={<span><SolutionOutlined /> Professional</span>} key="professional">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Experience (Years)" name="experienceYears">
                    <InputNumber className="w-full" min={0} max={50} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Availability" name="availability">
                    <Select>
                      <Option value="Full-time">Full-time</Option>
                      <Option value="Part-time">Part-time</Option>
                      <Option value="Project-based">Project-based</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Bio" name="bio" rules={[{ required: true, message: 'Please enter your professional bio' }]}>
                    <TextArea rows={4} maxLength={1000} showCount placeholder="Describe your professional background..." />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* Location Tab */}
            <TabPane tab={<span><EnvironmentOutlined /> Location</span>} key="location">
              <Row gutter={[24, 16]}>
                 <Col xs={24} md={12}>
                  <Form.Item label="Country" name="country">
                    <Select>
                      <Option value="UAE">UAE</Option>
                      <Option value="India">India</Option>
                    </Select>
                  </Form.Item>
                </Col>
                   <Col xs={24} md={12}>
                  <Form.Item label="State" name="state">
                    <Input placeholder="Enter your state/province" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="City" name="city">
                    <Input placeholder="Enter your city" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="po_box/ZIP Code" name="po_box">
                    <Input placeholder="Enter your po_box" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* Services Setup Tab - EXACTLY LIKE REGISTRATION FORM */}
            <TabPane tab={<span><ToolFilled /> Services (Setup)</span>} key="services">
              <div className="bg-blue-50 p-3 mb-4 rounded border border-blue-100">
                <Text type="secondary">
                  <ToolFilled /> Add your services here. Select a service category and specializations.
                </Text>
              </div>
              <Form.List name="services">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card key={key} size="small" className="mb-4 bg-gray-50" 
                        extra={<Button danger icon={<DeleteOutlined />} onClick={() => remove(name)} />}>
                        <Row gutter={[16, 16]}>
                          {/* Service Category - SAME AS REGISTRATION */}
                          <Col xs={24} md={12}>
                            <Form.Item 
                              {...restField} 
                              label="What service do you offer?" 
                              name={[name, 'category']} 
                              rules={[{ required: true, message: 'Please select a service category' }]}
                            >
                              <Select
                                placeholder="Select a service category"
                                onChange={(value) => handleSubcategoryChange(value, name)}
                              >
                                {subcategories.map(sub => (
                                  <Option key={sub._id} value={sub._id}>
                                    {sub.label}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          
                          {/* Specializations - SAME AS REGISTRATION */}
                          <Col xs={24} md={12}>
                            <Form.Item 
                              {...restField} 
                              label="Specializations (Multiple)" 
                              name={[name, 'types']}
                              rules={[{ required: true, message: 'Please select at least one specialization' }]}
                            >
                              <Select mode="multiple">
                                {(typesMap[name] || []).map(t => (
                                  <Option key={t.value} value={t.value}>
                                    {t.label}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          
                          {/* Description - SAME AS REGISTRATION */}
                          <Col xs={24}>
                            <Form.Item 
                              {...restField} 
                              label="Service Description" 
                              name={[name, 'description']}
                              rules={[{ required: true, message: 'Please enter service description' }]}
                            >
                              <TextArea 
                                rows={4}
                                placeholder="Describe your expertise..."
                                maxLength={500}
                                showCount
                              />
                            </Form.Item>
                          </Col>
                          
                          <Col xs={24}>
                            <Form.Item 
                              {...restField} 
                              label="Status" 
                              name={[name, 'isActive']} 
                              valuePropName="checked" 
                              initialValue={true}
                            >
                              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Another Service
                    </Button>
                  </>
                )}
              </Form.List>
            </TabPane>

            {/* Rate Card Tab - Shows existing types with labels */}
            <TabPane tab={<span><CreditCardOutlined /> Rate Card</span>} key="rate-card">
              <div className="mb-4">
                <Title level={5}>Quick Price Adjustment</Title>
                <Text type="secondary">Update your pricing for each service specialization.</Text>
              </div>
              
              {freelancer.services_offered?.length > 0 ? (
                <Table 
                  dataSource={freelancer.services_offered} 
                  columns={rateCardColumns}
                  rowKey="_id"
                  pagination={false}
                  bordered
                  loading={rateLoading}
                  scroll={{ x: 800 }}
                />
              ) : (
                <Alert
                  message="No services found"
                  description="Please add services in the Services tab first."
                  type="info"
                  showIcon
                />
              )}
            </TabPane>

            {/* Payment Tab */}
            <TabPane tab={<span><DollarCircleOutlined /> Payment</span>} key="payment">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Preferred Payment Method" name="preferredMethod">
                    <Select>
                      <Option value="Cash">Cash</Option>
                      <Option value="Bank Transfer">Bank Transfer</Option>
                      <Option value="Online Payment">Online Payment</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Currency" name="preferredCurrency">
                    <Select placeholder="Select Currency" loading={!currencies.length}>
                      {currencies.map(curr => (
                        <Option key={curr._id} value={curr._id}>
                          {curr.code} - {curr.symbol} ({curr.name})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="VAT Number" name="gstNumber">
                    <Input placeholder="Enter VAT if applicable" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* Documents Tab */}
            <TabPane tab={<span><FileTextOutlined /> Documents</span>} key="documents">
              <Row gutter={[24, 24]}>
                {['resume', 'identityProof', 'addressProof', 'certificate'].map(type => {
                  const doc = freelancer.documents?.find(d => d.type === type);
                  const isRejected = doc?.verified === false && doc?.reason;
                  const isVerified = doc?.verified === true;
                  
                  return (
                    <Col xs={24} md={12} key={type}>
                      <Card 
                        title={type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')} 
                        size="small"
                        className={isRejected ? "border-red-400" : ""}
                        headStyle={isRejected ? { color: '#ff4d4f' } : {}}
                      >
                        {/* Verified State */}
                        {isVerified && (
                          <div className="mb-4 text-green-600 flex items-center">
                            <CheckCircleOutlined className="mr-2" /> Verified & Approved
                          </div>
                        )}

                        {/* Rejected State */}
                        {isRejected && (
                          <Alert 
                            message="Document Rejected" 
                            description={
                              <div>
                                <div><strong>Reason:</strong> {doc.reason}</div>
                                {doc.suggestion && <div><strong>Suggestion:</strong> {doc.suggestion}</div>}
                              </div>
                            }
                            type="error" 
                            showIcon 
                            className="mb-4"
                          />
                        )}

                        {/* Pending/New State */}
                        {!isVerified && !isRejected && doc && (
                          <div className="mb-2 text-blue-600">
                            <FileTextOutlined /> Document Uploaded (Pending Review)
                          </div>
                        )}

                        {/* Action Area */}
                        {!isVerified && (
                          <Upload
                            customRequest={isRejected ? (options) => handleReupload(options, doc._id) : customRequest}
                            fileList={isRejected ? [] : fileList[type]}
                            onChange={(info) => {
                              if (!isRejected) handleDocumentChange(info, type);
                            }}
                            showUploadList={!isRejected}
                            maxCount={1}
                            beforeUpload={() => false}
                          >
                            <Button 
                              icon={isRejected ? <SyncOutlined /> : <UploadOutlined />}
                              type={isRejected ? "primary" : "default"}
                              danger={isRejected}
                            >
                              {isRejected ? "Re-upload Document" : "Click to Upload"}
                            </Button>
                          </Upload>
                        )}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </TabPane>

          </Tabs>
        </Form>
      </div>
    </div>
  );
};

export default UpdateFreelancerProfile;