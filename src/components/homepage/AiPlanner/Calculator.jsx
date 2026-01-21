// src/components/homepage/AiPlanner/GardenCalculator.jsx
import React, { useState, useEffect } from 'react';
import {
  Card, Button, Typography, Form, Input, Select, Space, Row, Col,
  message, Spin, Result, Divider, Image, Badge, Empty, Tag, Checkbox, Radio
} from 'antd';
import {
  UserOutlined, MailOutlined, CheckCircleOutlined,
  SmileOutlined, HomeOutlined, BuildOutlined,
  EnvironmentOutlined, CalculatorOutlined, PhoneFilled,
  ArrowRightOutlined, ArrowLeftOutlined, CheckOutlined,
  CompassOutlined, PictureOutlined, ExperimentOutlined,
  EnvironmentFilled, SelectOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const { Title, Text } = Typography;
const { Option } = Select;

const BASE_URL = 'https://xoto.ae/api';
const BRAND_PURPLE = '#5C039B';


const steps = [
  { title: 'Location', icon: <CompassOutlined /> },
  { title: 'Service', icon: <EnvironmentOutlined /> },
  { title: 'Style', icon: <HomeOutlined /> },
  { title: 'Estimate Questions', icon: <BuildOutlined /> },
  { title: 'Contact', icon: <PhoneFilled /> },
];

// Reverse geocoding function
const reverseGeocode = async (lat, lng) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
  );
  const data = await res.json();
  const a = data.address || {};

  const city =
    a.city ||
    a.town ||
    a.municipality ||
    a.county ||
    "";

  const area =
    a.suburb ||
    a.neighbourhood ||
    a.quarter ||
    "";

  return {
    country: a.country || "",
    state: a.state || a.region || "",
    city,
    area,
    fullAddress: data.display_name || ""
  };
};

// Map Picker Component
const MapPicker = ({ coords, onChange }) => {
  const [position, setPosition] = useState(coords.lat && coords.lng ? [coords.lat, coords.lng] : [25.2048, 55.2708]);



  useEffect(() => {
    if (coords.lat && coords.lng) {
      setPosition([coords.lat, coords.lng]);
    }
  }, [coords.lat, coords.lng]);

  const LocationMarker = () => {
    useMapEvents({
      async click(e) {
        const newPosition = [e.latlng.lat, e.latlng.lng];
        setPosition(newPosition);
        onChange({ lat: newPosition[0], lng: newPosition[1] });
      },
    });

    return position ? <Marker position={position} /> : null;
  };

  return (
    <MapContainer
      center={position}
      zoom={15}
      style={{ height: 300, width: "100%", borderRadius: "1rem", zIndex: 1 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
};

const Calculator = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [form] = Form.useForm();
  const [estimationValue, setEstimationValue] = useState(0);
  // Data Collections
  const [subcategories, setSubcategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [packages, setPackages] = useState([]);

  // User Selections
  const [coords, setCoords] = useState({
    lat: null,
    lng: null,
    country: "",
    state: "",
    city: "",
    area: "",
    address: ""
  });

  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [countryCode, setCountryCode] = useState('+971');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const handlePhoneChange = (e) => {
  const value = e.target.value.replace(/\D/g, ""); // numbers only
  const rule = COUNTRY_PHONE_RULES[countryCode];

  if (!rule) return;

  if (value.length > rule.digits) return; // block extra digits

  setPhone(value);

  if (value.length < rule.digits) {
    setPhoneError(`Phone number must be ${rule.digits} digits`);
  } else {
    setPhoneError("");
  }
};


const handleCountryChange = (code) => {
  setCountryCode(code);
  setPhone(""); // reset phone on country change
  setPhoneError("");
};


  const toggleImageSelect = (img) => {
    setSelectedImages((prev) => {
      const exists = prev.some(i => i.id === img.id);

      if (exists) {
        // remove image
        return prev.filter(i => i.id !== img.id);
      }

      // add image
      return [...prev, img];
    });
  };

  const getAllImages = async () => {
    try {
      const res = await fetch(
        `https://xoto.ae/api/estimate/master/category/types/${selectedType}/gallery`
      );

      const data = await res.json();

      console.log("We got this from galllery images", data);
      // assuming res.data or res.gallery
      setGalleryImages(data?.gallery?.moodboardImages || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedType) {
      getAllImages();
    }
  }, [selectedType]);


  const [loading, setLoading] = useState({
    subcat: true,
    types: false,
    packages: true,
    submitting: false,
    geocoding: false
  });

  const areaSqFt = length && width ? Math.round(parseFloat(length) * parseFloat(width)) : 0;

  // Country codes for dropdown
  const countryCodes = [
    { value: '+971', label: 'UAE (+971)' },
    { value: '+966', label: 'KSA (+966)' },
    { value: '+974', label: 'Qatar (+974)' },
    { value: '+968', label: 'Oman (+968)' },
    { value: '+973', label: 'Bahrain (+973)' },
    { value: '+965', label: 'Kuwait (+965)' },
    { value: '+91', label: 'India (+91)' },
    { value: '+92', label: 'Pakistan (+92)' },
    { value: '+44', label: 'UK (+44)' },
    { value: '+1', label: 'USA/Canada (+1)' },
  ];

  const COUNTRY_PHONE_RULES = {
  "+971": { country: "UAE", digits: 9 },
  "+91": { country: "India", digits: 10 },
  "+966": { country: "KSA", digits: 9 },
  "+974": { country: "Qatar", digits: 8 },
  "+968": { country: "Oman", digits: 8 },
  "+973": { country: "Bahrain", digits: 8 },
  "+965": { country: "Kuwait", digits: 8 },
  "+92": { country: "Pakistan", digits: 10 },
  "+44": { country: "UK", digits: 10 },
  "+1": { country: "USA/Canada", digits: 10 },
};

  // --- API FETCHING ---
  useEffect(() => {
    const initFetch = async () => {
      try {
        const res = await apiService.get("/estimate/master/category/name/Landscaping/subcategories");
        if (res.success) setSubcategories(res.data || []);
      } catch (err) {
        message.error("Error loading services");
      } finally {
        setLoading(prev => ({ ...prev, subcat: false }));
      }
    };
    initFetch();
  }, []);


  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  const buildEstimateAnswersPayload = () => {
    return questions.map(q => {
      const userAnswer = answers[q._id];

      // TEXT / NUMBER / YES-NO
      if (q.questionType !== "options" && q.questionType !== "yesorno") {
        return {
          question: q._id,
          questionText: q.question,
          questionType: q.questionType,
          answerValue: userAnswer || null,
          includeInEstimate: true,
          areaQuestion: q.areaQuestion || false
        };
      }


      // OPTIONS / yes or no 
      const selectedOpt = q.options.find(
        opt => opt.title === userAnswer
      );

      return {
        question: q._id,
        questionText: q.question,
        questionType: q.questionType,
        selectedOption: selectedOpt
          ? {
            optionId: selectedOpt._id,
            title: selectedOpt.title,
            value: selectedOpt.value || 0,
            valueSubType: selectedOpt.valueSubType || "flat"
          }
          : null,
        includeInEstimate: true,
        areaQuestion: q.areaQuestion || false
      };
    });
  };



  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };


  useEffect(() => {
    if (!selectedType) return;

    const getAllQuestions = async () => {
      setLoading(prev => ({ ...prev, questions: true }));

      try {
        const res = await apiService.get(
          `/estimate/master/category/types/${selectedType}/questions`
        );

        if (res.success) {
          setQuestions(res.data || []);
          console.log("Questiiiiiiiiiiioooooooooonnnnnnnnnnns", res.data)
        }
      } catch (error) {
        message.error("Error loading questions");
        console.log("Error in fetching all questions of this type", error);
      } finally {
        setLoading(prev => ({ ...prev, questions: false }));
      }
    };

    getAllQuestions();
  }, [selectedType]);

  useEffect(() => {
    if (!selectedSubcategory) return;
    const fetchTypes = async () => {
      setLoading(prev => ({ ...prev, types: true }));
      try {
        const sub = subcategories.find(s => s._id === selectedSubcategory);
        const res = await apiService.get(`/estimate/master/category/${sub.category}/subcategories/${selectedSubcategory}/types`);
        if (res.success) setTypes(res.data || []);
      } catch (err) {
        message.error("Error loading styles");
      } finally {
        setLoading(prev => ({ ...prev, types: false }));
      }
    };
    fetchTypes();
  }, [selectedSubcategory, subcategories]);

  useEffect(() => {
    const fetchPkgs = async () => {
      try {
        const res = await apiService.get("/packages");
        if (res.success) setPackages(res.packages.filter(p => p.isActive));
      } catch (err) {
        message.error("Error loading packages");
      } finally {
        setLoading(prev => ({ ...prev, packages: false }));
      }
    };
    fetchPkgs();
  }, []);

  // --- ACTIONS ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) return message.error("Geolocation not supported");
    setLoading(prev => ({ ...prev, submitting: true, geocoding: true }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const geo = await reverseGeocode(lat, lng);

          setCoords({
            lat,
            lng,
            country: geo.country,
            state: geo.state,
            city: geo.city,
            area: geo.area,
            address: geo.fullAddress
          });

          message.success("Location synchronized!");
        } catch (error) {
          setCoords({
            lat,
            lng,
            country: "",
            state: "",
            city: "",
            area: "",
            address: ""
          });
          message.warning("Location detected but address details unavailable");
        } finally {
          setLoading(prev => ({ ...prev, submitting: false, geocoding: false }));
        }
      },
      () => {
        message.error("Location access denied");
        setLoading(prev => ({ ...prev, submitting: false, geocoding: false }));
      }
    );
  };

  const handleMapLocationChange = async ({ lat, lng }) => {
    setLoading(prev => ({ ...prev, geocoding: true }));
    try {
      const geo = await reverseGeocode(lat, lng);
      setCoords({
        lat,
        lng,
        country: geo.country,
        state: geo.state,
        city: geo.city,
        area: geo.area,
        address: geo.fullAddress
      });
      message.success("Location updated!");
    } catch (error) {
      message.error("Could not fetch address details");
    } finally {
      setLoading(prev => ({ ...prev, geocoding: false }));
    }
  };

  const onFinalSubmit = async () => {
    // Validate form fields

    const estimateAnswers = buildEstimateAnswersPayload();


    if (!firstName.trim() || !lastName.trim()) {
      message.error("Please enter both first and last name");
      return;
    }

    if (!email.trim()) {
      message.error("Please enter your email");
      return;
    }

    if (!phone.trim()) {
      message.error("Please enter your phone number");
      return;
    }

    // if (!selectedPackage) {
    //   message.error("Please select a package");
    //   return;
    // }

    setLoading(prev => ({ ...prev, submitting: true }));



    // Get selected type and subcategory details
    const selectedTypeData = types.find(t => t._id === selectedType);
    const selectedSubcat = subcategories.find(s => s._id === selectedSubcategory);

    // Prepare payload according to the example
    const payload = {
      service_type: "landscape",
      customer_name: {
        first_name: firstName.trim(),
        last_name: lastName.trim()
      },
      customer_email: email.trim(),
      customer_mobile: {
        country_code: countryCode,
        number: phone.trim()
      },
      type: selectedType,
      subcategory: selectedSubcategory,
      package: selectedPackage,
      area_length: parseFloat(length),
      area_width: parseFloat(width),
      area_sqft: areaSqFt,
      description: `Landscaping project for ${areaSqFt} sqft area with ${selectedTypeData?.label || 'selected'} style`,
      location: {
        lat: coords.lat,
        lng: coords.lng,
        country: coords.country,
        state: coords.state,
        city: coords.city,
        area: coords.area,
        address: coords.address
      },
      answers: estimateAnswers
    };

    console.log("Submitting payload:", JSON.stringify(payload, null, 2)); // For debugging

    try {
      const response = await apiService.post("/estimates/submit", payload);
      console.log("API Response:", response);

      if (response.success) {
        setActiveStep(5); // Move to success step
        message.success("Estimate submitted successfully!");
        setEstimationValue(response.final_price)
      } else {
        message.error(response.message || "Submission failed");
      }
    } catch (err) {
      console.error("Submission error:", err);
      message.error(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };


  const handleNext = () => {
    console.log("activeSteeeeeeeeeeeeeeeeeeeppppppppppppppppp", activeStep)
    if (activeStep == 5) {
      navigate("/")
    }


    if (activeStep > 3) {
      onFinalSubmit();
      return;
    }

    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const validateStep = () => {
    // switch (activeStep) {
    //   case 0: return !!coords.lat;
    //   case 1: return !!selectedSubcategory;
    //   case 2: return !!selectedType;
    //   case 3: return areaSqFt >= 100;
    //   case 4: return !!selectedPackage;
    //   case 5: return firstName.trim() && lastName.trim() && email.trim() && phone.trim();
    //   default: return true;
    // }
    return true;
  };

  // --- UI COMPONENTS ---
  const SelectionCard = ({ item, isSelected, onClick, colorClass }) => (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative h-full p-6 rounded-3xl cursor-pointer transition-all border-2 
        ${isSelected ? `bg-purple-50 shadow-xl` : 'border-gray-100 bg-white hover:border-gray-200'}`}
      style={{ borderColor: isSelected ? BRAND_PURPLE : 'transparent' }}
    >
      {isSelected && <Badge.Ribbon text="Selected" color={BRAND_PURPLE} />}
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4 ${colorClass}`}>
        {item.label ? item.label[0] : 'G'}
      </div>
      <Title level={4} className="mb-1">{item.label}</Title>
      <Text type="secondary" className="text-xs line-clamp-2">{item.description || 'Professional architectural landscaping.'}</Text>
    </motion.div>
  );

  const StepRenderer = () => {
    const variants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    };

    switch (activeStep) {
      case 0:
        return (
          <motion.div {...variants} className="text-center py-10">
            <div className="mb-6 inline-block p-6 rounded-full bg-purple-50">
              <CompassOutlined style={{ color: BRAND_PURPLE, fontSize: '3rem' }} />
            </div>
            <Title level={2}>Locate Your Address</Title>
            <Text className="text-lg text-gray-400 block mb-10">
              We use GPS coordinates for accurate site analysis. Click on the map to adjust your exact location.
            </Text>

            <Button
              size="large"
              type="primary"
              icon={<EnvironmentFilled />}
              onClick={handleGetLocation}
              loading={loading.submitting}
              className="h-16 px-12 rounded-2xl text-lg shadow-lg mb-8"
              style={{ backgroundColor: BRAND_PURPLE }}
            >
              {coords.lat ? "Update My Location" : "Auto-Detect My Location"}
            </Button>

            {coords.lat && (
              <div className="space-y-4">
                <div className="mt-6">
                  <Tag color="purple" className="px-4 py-1 rounded-full text-sm">
                    Coordinates: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                  </Tag>
                </div>

                <div className="space-y-2">
                  {coords.country && (
                    <Tag color="purple" className="px-4 py-1 rounded-full">
                      <strong>Country:</strong> {coords.country}
                    </Tag>
                  )}
                  {coords.state && (
                    <Tag color="blue" className="px-4 py-1 rounded-full">
                      <strong>State/Region:</strong> {coords.state}
                    </Tag>
                  )}
                  {coords.city && (
                    <Tag color="green" className="px-4 py-1 rounded-full">
                      <strong>City:</strong> {coords.city}
                    </Tag>
                  )}
                </div>

                {coords.address && (
                  <Text type="secondary" className="block mt-4 max-w-xl mx-auto">
                    <strong>Full Address:</strong> {coords.address}
                  </Text>
                )}

                <div className="mt-8 max-w-2xl mx-auto">
                  {loading.geocoding ? (
                    <div className="h-64 flex items-center justify-center rounded-2xl bg-gray-100">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <MapPicker
                      coords={coords}
                      onChange={handleMapLocationChange}
                    />
                  )}
                  <Text className="text-xs text-gray-400 mt-2 block">
                    Click anywhere on the map to set your exact location
                  </Text>
                </div>
              </div>
            )}
          </motion.div>
        );

      case 1:
        return (
          <motion.div {...variants}>
            <Title level={2} className="text-center mb-10">What are we designing?</Title>
            <Row gutter={[24, 24]}>
              {[...subcategories].reverse().map(sub => (
                <Col xs={24} sm={12} md={8} key={sub._id} className='p-10'>
                  <SelectionCard
                    item={sub}
                    isSelected={selectedSubcategory === sub._id}
                    onClick={() => setSelectedSubcategory(sub._id)}
                    colorClass="bg-blue-50 text-blue-600"
                  />
                </Col>
              ))}
            </Row>
          </motion.div>
        );

      case 2:
        return (
          <motion.div {...variants}>
            <Title level={2} className="text-center mb-10">Select Your Aesthetic Style</Title>
            {loading.types ? <div className="text-center py-20"><Spin size="large" /></div> : (
              <Row gutter={[24, 24]}>
                {types.map(t => (
                  <Col xs={24} sm={12} md={8} key={t._id}>
                    <SelectionCard
                      item={t}
                      isSelected={selectedType === t._id}
                      onClick={() => setSelectedType(t._id)}
                      colorClass="bg-emerald-50 text-emerald-600"
                    />
                  </Col>
                ))}
              </Row>
            )}
          </motion.div>
        );

      // case 3:
      //   return (
      //     <motion.div {...variants} className="max-w-lg mx-auto py-10">
      //       <Title level={2} className="text-center mb-10">Project Area</Title>
      //       <Card className="rounded-[3rem] shadow-2xl overflow-hidden border-none">
      //         <div className="p-12 text-center text-white" style={{ background: BRAND_PURPLE }}>
      //           <Text className="text-purple-200 uppercase tracking-widest text-xs font-bold">Total Footprint</Text>
      //           <div className="text-7xl font-bold my-4">{areaSqFt.toLocaleString()}</div>
      //           <Text className="text-lg opacity-80">Square Feet</Text>
      //         </div>
      //         <div className="p-12 bg-white">
      //           <Row gutter={24}>
      //             <Col span={12}>
      //               <Text strong className="text-gray-400 text-xs uppercase">Length (ft)</Text>
      //               <Input
      //                 size="large"
      //                 type="number"
      //                 value={length}
      //                 onChange={e => setLength(e.target.value)}
      //                 className="mt-3 h-14 rounded-2xl border-gray-100"
      //                 placeholder="Enter length"
      //                 min="1"
      //               />
      //             </Col>
      //             <Col span={12}>
      //               <Text strong className="text-gray-400 text-xs uppercase">Width (ft)</Text>
      //               <Input
      //                 size="large"
      //                 type="number"
      //                 value={width}
      //                 onChange={e => setWidth(e.target.value)}
      //                 className="mt-3 h-14 rounded-2xl border-gray-100"
      //                 placeholder="Enter width"
      //                 min="1"
      //               />
      //             </Col>
      //           </Row>
      //           {areaSqFt > 0 && (
      //             <div className="mt-6 text-center">
      //               <Text type={areaSqFt < 100 ? "danger" : "success"}>
      //                 Minimum area required: 100 sqft (Current: {areaSqFt} sqft)
      //               </Text>
      //             </div>
      //           )}
      //         </div>
      //       </Card>
      //     </motion.div>
      //   );

      case 3:
        return (
       <motion.div {...variants} className="py-10">
  <div className="max-w-3xl mx-auto">
    <Title level={3} className="text-center mb-8">
      Project Details
    </Title>

    <Card className="rounded-xl shadow-sm">
      {/* Condition: Agar questions hain aur unki length 0 se zyada hai */}
      {questions && questions.length > 0 ? (
        <Form layout="vertical" className="space-y-6">
          {questions.map((q) => (
            <Form.Item key={q._id} label={q.question} required={false}>
              {/* TEXT */}
              {q.questionType === "text" && (
                <Input
                  value={answers[q._id] || ""}
                  onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                  placeholder="Enter value"
                />
              )}

              {/* NUMBER */}
              {q.questionType === "number" && (
                <Input
                  type="number"
                  value={answers[q._id] || ""}
                  onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                  placeholder="Enter number"
                  min={q.minValue || 0}
                  max={q.maxValue || undefined}
                />
              )}

              {/* YES / NO */}
              {q.questionType === "yesorno" && (
                <Radio.Group
                  value={answers[q._id]}
                  onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                >
                  <Space>
                    {q.options?.map((opt) => (
                      <Radio key={opt._id} value={opt.title}>
                        {opt.title}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              )}

              {/* OPTIONS */}
              {q.questionType === "options" && (
                <Radio.Group
                  value={answers[q._id]}
                  onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                >
                  <Space direction="vertical">
                    {q.options?.map((opt) => (
                      <Radio key={opt._id} value={opt.title}>
                        {opt.title}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              )}
            </Form.Item>
          ))}
        </Form>
      ) : (
        /* Agar data nahi hai toh ye dikhega */
        <div className="text-center py-6">
          <p className="text-lg font-bold text-gray-400 m-0">
            No Question Available
          </p>
        </div>
      )}
    </Card>
  </div>
</motion.div>
        );

      case 4:
        const selectedPkg = packages.find(p => p._id === selectedPackage);
        const selectedTypeData = types.find(t => t._id === selectedType);
        const selectedSubcat = subcategories.find(s => s._id === selectedSubcategory);

        return (
          <motion.div {...variants} className="max-w-5xl mx-auto">
            <Row gutter={48}>
              <Col xs={24} lg={10}>
                <div className="rounded-[2.5rem] p-10 text-white h-full shadow-2xl" style={{ backgroundColor: BRAND_PURPLE }}>
                  <Title level={3} className="text-white mb-10">Design Summary</Title>
                  <div className="space-y-8">
                    <div>
                      <Text className="text-purple-300 block text-xs uppercase tracking-widest mb-1">Service Type</Text>
                      <Text strong className="text-white text-xl uppercase">
                        {selectedSubcat?.label || 'Landscaping'}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-purple-300 block text-xs uppercase tracking-widest mb-1">Selected Style</Text>
                      <Text strong className="text-white text-xl">
                        {selectedTypeData?.label || 'Not selected'}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-purple-300 block text-xs uppercase tracking-widest mb-1">Location</Text>
                      <Text strong className="text-white text-sm">
                        {coords.city ? `${coords.city}, ${coords.country}` : 'Location set'}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-purple-300 block text-xs uppercase tracking-widest mb-1">Area Details</Text>
                      <Text strong className="text-white text-xl">{areaSqFt} SQ FT</Text>
                      <Text className="text-purple-300 text-xs">
                        ({length}ft × {width}ft)
                      </Text>
                    </div>
                    {/* <Divider className="border-purple-400 opacity-30" /> */}
                    {/* <div className="p-5 bg-white/10 rounded-2xl flex items-center justify-between border border-white/10">
                      <Text className="text-white">Tier Selection</Text>
                      <Tag color="gold" className="m-0 border-none font-bold px-3">
                        {selectedPkg?.name || 'Not selected'}
                      </Tag>
                    </div> */}
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={14}>
                <Card className="rounded-[2.5rem] shadow-xl border-none p-6">
                  <div className="space-y-6">
                    <div>
                      <Text strong className="block mb-2">First Name *</Text>
                      <Input
                        size="large"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        prefix={<UserOutlined className="text-gray-300" />}
                        className="rounded-xl h-14"
                        placeholder="John"
                      />
                    </div>

                    <div>
                      <Text strong className="block mb-2">Last Name *</Text>
                      <Input
                        size="large"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        prefix={<UserOutlined className="text-gray-300" />}
                        className="rounded-xl h-14"
                        placeholder="Doe"
                      />
                    </div>

                    <div>
                      <Text strong className="block mb-2">Email Address *</Text>
                      <Input
                        size="large"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        prefix={<MailOutlined className="text-gray-300" />}
                        className="rounded-xl h-14"
                        placeholder="john@example.com"
                        type="email"
                      />
                    </div>

                    <div>
                       <Text strong className="block mb-2">Contact Number *</Text>

  <Row gutter={8}>
    <Col span={8}>
      <Select
        value={countryCode}
        onChange={handleCountryChange}
        className="w-full"
        size="large"
      >
        {countryCodes.map(code => (
          <Option key={code.value} value={code.value}>
            {code.label}
          </Option>
        ))}
      </Select>
    </Col>

    <Col span={16}>
      <Input
        size="large"
        value={phone}
        onChange={handlePhoneChange}
        placeholder={`Enter ${COUNTRY_PHONE_RULES[countryCode]?.digits || ""} digit number`}
        prefix={<PhoneFilled />}
        maxLength={COUNTRY_PHONE_RULES[countryCode]?.digits}
        status={phoneError ? "error" : ""}
        className="rounded-xl h-14"
      />
    </Col>
  </Row>

  {phoneError && (
    <Text type="danger" className="text-xs mt-1 block">
      {phoneError}
    </Text>
  )}
                    </div>
                    {/* 
                    <Button
                      type="primary"
                      onClick={onFinalSubmit}
                      loading={loading.submitting}
                      block
                      className="h-16 rounded-2xl text-lg mt-4 border-none shadow-xl"
                      style={{ backgroundColor: BRAND_PURPLE }}
                      disabled={!firstName || !lastName || !email || !phone}
                    >
                      Generate My Quotation
                    </Button> */}
                  </div>
                </Card>
              </Col>
            </Row>
          </motion.div>
        );

      case 5:
        const pkg = packages.find(p => p._id === selectedPackage);
        return (
          <motion.div {...variants} className="text-center ">
            {/* RESPONSIVE DISCLAIMER */}
<div className="max-w-5xl mx-auto mb-8 px-4">
  <div
    className="
      flex flex-col sm:flex-row
      items-start sm:items-center
      gap-3 sm:gap-4
      bg-red-50
      border border-red-200
      text-red-700
      px-4 sm:px-6
      py-4
      rounded-2xl
      shadow-sm
    "
  >
    {/* Icon */}
    <div className="flex-shrink-0">
      <EnvironmentOutlined className="text-red-500 text-xl sm:text-2xl" />
    </div>

    {/* Text */}
    <div className="text-left">
      <Text className="block font-semibold text-red-700 text-sm sm:text-base">
       DISCLAIMER:
      </Text>
      <Text className="block text-xs sm:text-sm text-red-600 leading-relaxed">
        This estimate is meant to give you a rough idea of costs. The final amount
        may change once details are finalized and the site is reviewed.
      </Text>
    </div>
  </div>
</div>
            <div className="bg-white p-16 rounded-[4rem] shadow-2xl inline-block border border-gray-50">
              <SmileOutlined style={{ color: BRAND_PURPLE, fontSize: '5rem' }} className="mb-8" />
              <Title level={1} style={{ color: BRAND_PURPLE }} className="m-0">Valuation Ready</Title>
              <div className="my-12">
                <Text className="text-gray-400 uppercase tracking-widest block mb-3">Estimated Investment Range</Text>
                <div className="text-8xl font-black text-gray-900">
                  {estimationValue || 0} <small className="text-3xl font-light">AED</small>
                </div>
              </div>
            </div>

            {/* IMAGE SELECTION SECTION */}
            <div className="mt-16 max-w-6xl mx-auto">
              <Text className="text-gray-400 uppercase tracking-widest block mb-6 text-center">
                Select Applicable Design / Finish
              </Text>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {galleryImages.map((img) => {
                  const isSelected = selectedImages.some(i => i.id === img.id);

                  return (
                    <div
                      key={img._id}
                      onClick={() => toggleImageSelect(img)}
                      className={`relative cursor-pointer rounded-2xl overflow-hidden border-4 transition-all
            ${isSelected ? "border-purple-600 scale-105" : "border-transparent hover:scale-105"}
          `}
                    >
                      <img
                        src={`https://xoto.ae/api${img.url}`}
                        alt={img.title}
                        className="w-full h-48 object-cover"
                      />

                      {/* Overlay */}
                      <div
                        className={`absolute inset-0 bg-black/40 flex items-center justify-center
              ${isSelected ? "opacity-100" : "opacity-0 hover:opacity-100"}
            `}
                      >
                        <span className="text-white text-lg font-semibold">
                          {isSelected ? "Selected" : "Select"}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="absolute bottom-0 w-full bg-black/60 text-white text-sm px-3 py-2">
                        {img.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        );

      default:
        return null;
    }
  };

  const buildEstimatePayload = () => {
    // ---- ESTIMATE OBJECT (matches Estimate schema) ----
    const estimate = {
      service_type: "landscape", // or derive dynamically
      subcategory: selectedSubcategory || null,
      type: selectedType,
      package: selectedPackage || null,

      area_length: length ? Number(length) : null,
      area_width: width ? Number(width) : null,
      area_sqft: Number(areaSqFt),

      description: "Generated from estimator flow",

      status: "pending",

      customer: {
        firstName,
        lastName,
        email,
        phone: `${countryCode}${phone}`,
        location: coords.address || null,
        city: coords.city || null,
        country: coords.country || null
      }
    };

    // ---- ANSWERS ARRAY (matches EstimateAnswer schema) ----
    const formattedAnswers = questions
      .filter(q => answers[q._id] !== undefined && answers[q._id] !== "")
      .map(q => {
        const base = {
          question: q._id,
          questionText: q.question,
          questionType: q.questionType,
          includeInEstimate: q.includeInEstimate ?? true,
          areaQuestion: q.areaQuestion ?? false
        };

        // TEXT / NUMBER / YESNO
        if (q.questionType !== "options") {
          return {
            ...base,
            answerValue: answers[q._id]
          };
        }

        // OPTIONS
        const selectedOpt = q.options.find(
          opt => opt.title === answers[q._id]
        );

        return {
          ...base,
          selectedOption: selectedOpt
            ? {
              optionId: selectedOpt._id,
              title: selectedOpt.title,
              value: selectedOpt.value || 0,
              valueSubType: selectedOpt.valueSubType || "flat"
            }
            : null
        };
      });

    return {
      estimate,
      answers: formattedAnswers
    };
  };


  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-40">
      {/* Step Indicator Header */}
      <div className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="hidden lg:flex items-center space-x-8">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 transition-colors ${i <= activeStep ? 'text-black' : 'text-gray-300'}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                    ${i === activeStep ? 'text-white border-transparent' :
                      i < activeStep ? 'bg-green-50 text-green-600 border-green-100' : 'border-gray-100'}`}
                  style={{ backgroundColor: i === activeStep ? BRAND_PURPLE : '' }}
                >
                  {i < activeStep ? <CheckOutlined /> : i + 1}
                </div>
                <span className={`text-xs font-bold uppercase tracking-tighter ${i === activeStep ? 'opacity-100' : 'opacity-50'}`}>
                  {s.title}
                </span>
                {i < steps.length - 1 && <div className="w-4 h-[2px] bg-gray-100" />}
              </div>
            ))}
          </div>
          <div className="lg:hidden">
            <Tag color="purple" style={{ backgroundColor: BRAND_PURPLE }}>Step {activeStep + 1} of {steps.length}</Tag>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 px-6">
        <AnimatePresence mode="wait">
          <div key={activeStep}>
            {StepRenderer()}
          </div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      {/* {activeStep < 6 && activeStep !== 5 && ( */}
      {activeStep < 6 && (
        <div className="fixed bottom-0 left-0 right-0 p-8 z-50 pointer-events-none">
          <div className="max-w-4xl mx-auto flex justify-between items-center bg-white/95 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-white/50 pointer-events-auto">
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              disabled={activeStep === 0}
              className="h-14 px-8 rounded-2xl border-none bg-gray-50 text-gray-400 hover:bg-gray-100"
            >
              Back
            </Button>

            <div className="flex items-center gap-8">
              {activeStep > 0 && (
                <div className="hidden sm:block text-right">
                  <Text className="text-[10px] text-gray-400 uppercase font-black block tracking-widest">Progress</Text>
                  {/* <Text strong style={{ color: BRAND_PURPLE }}>
                    {Math.round(((activeStep + 1) / steps.length) * 100)}% Complete
                  </Text> */}
                  <Text strong style={{ color: BRAND_PURPLE }}>
                    {Math.min(
                      Math.round(((activeStep + 1) / steps.length) * 100),
                      100
                    )}% Complete
                  </Text>
                </div>
              )}

              <Button
                type="primary"
                size="large"
                onClick={handleNext}
                disabled={!validateStep()}
                className="h-14 px-12 rounded-2xl border-none text-lg shadow-xl transition-all"
                style={{
                  backgroundColor: !validateStep() ? '#f5f5f5' : BRAND_PURPLE,
                  color: !validateStep() ? '#ccc' : 'white'
                }}
              >
                {activeStep === 4 ? 'Continue to Contact' : 'Continue'}
                <ArrowRightOutlined className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;