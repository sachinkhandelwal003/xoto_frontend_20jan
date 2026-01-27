import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Button,
  Typography,
  Form,
  Input,
  Select,
  Space,
  Row,
  Col,
  message,
  Spin,
  Tag,
  Radio,
  Badge,
  Image,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  SmileOutlined,
  HomeOutlined,
  BuildOutlined,
  EnvironmentOutlined,
  PhoneFilled,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  CompassOutlined,
  EnvironmentFilled,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";




// Fix for default marker icons in Leaflet

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const { Title, Text } = Typography;
const { Option } = Select;

const BRAND_PURPLE = "#5C039B";
const BASE_URL = "https://xoto.ae"; // ✅ Your API Base URL for images

const steps = [
  { title: "Location", icon: <CompassOutlined /> },
  { title: "Service", icon: <EnvironmentOutlined /> },
  { title: "Style", icon: <HomeOutlined /> },
  { title: "Estimate Questions", icon: <BuildOutlined /> },
  { title: "Contact", icon: <PhoneFilled /> },
];

// Reverse geocoding function
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await res.json();
    const a = data.address || {};

    const city = a.city || a.town || a.municipality || a.county || "";
    const area = a.suburb || a.neighbourhood || a.quarter || "";

    return {
      country: a.country || "",
      state: a.state || a.region || "",
      city,
      area,
      fullAddress: data.display_name || "",
    };
  } catch (error) {
    console.error("Geocoding error", error);
    return {
      country: "",
      state: "",
      city: "",
      area: "",
      fullAddress: "",
    };
  }
};

// Map Picker Component
const MapPicker = ({ coords, onChange }) => {
  const position = useMemo(
    () =>
      coords.lat && coords.lng
        ? [coords.lat, coords.lng]
        : [25.2048, 55.2708],
    [coords.lat, coords.lng]
  );

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return <Marker position={position} />;
  };

  return (
    <MapContainer
      center={position}
      zoom={15}
      style={{ height: 300, width: "100%", borderRadius: "1rem", zIndex:1 }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker />
    </MapContainer>
  );
};

// UI Component: Selection Card (Same Layout)
const SelectionCard = ({ item, isSelected, onClick, colorClass }) => (
  <motion.div
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative h-full p-6 rounded-3xl cursor-pointer transition-all border-2
      ${
        isSelected
          ? `bg-purple-50 shadow-xl`
          : "border-gray-100 bg-white hover:border-gray-200"
      }`}
    style={{ borderColor: isSelected ? BRAND_PURPLE : "transparent" }}
  >
    {isSelected && <Badge.Ribbon text="Selected" color={BRAND_PURPLE} />}
    <div
      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4 ${colorClass}`}
    >
      {item.label ? item.label[0] : "G"}
    </div>
    <Title level={4} className="mb-1">
      {item.label}
    </Title>
    <Text type="secondary" className="text-xs line-clamp-2">
      {item.description || "Professional architectural landscaping."}
    </Text>
  </motion.div>
);

// --- FIX START: Component separated to prevent Re-render/Fluctuation ---
const QuestionField = React.memo(function QuestionField({
  question,
  value,
  onChange,
}) {
  const id = `q-${question._id}`;
  const isYesNo = question.questionType === "yesorno";
  const isOptions = question.questionType === "options";

  return (
    // We keep Form.Item for the LAYOUT (Label styling) but we don't bind it to the Form instance
    // This keeps your UI exactly the same but fixes the lag.
    <Form.Item
      label={question.question}
      required
      className="mb-6"
    >
      {question.questionType === "text" && (
        <Input
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(question._id, e.target.value)}
          size="large"
          className="rounded-xl"
        />
      )}

      {question.questionType === "number" && (
        <Input
          id={id}
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(question._id, e.target.value)}
          size="large"
          className="rounded-xl"
        />
      )}

      {(isOptions || isYesNo) && (
        <Radio.Group
          value={value}
          onChange={(e) => onChange(question._id, e.target.value)}
          className="w-full"
        >
          {/* FIX: Horizontal for Yes/No, Vertical for long options */}
          <Space direction={isYesNo ? "horizontal" : "vertical"} wrap className="w-full">
            {question.options?.map((opt) => (
              <Radio key={opt._id} value={opt.title}>
                {opt.title}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      )}
    </Form.Item>
  );
});

// Step 3 Container
const Step3Questions = React.memo(function Step3Questions({
  questions,
  answers,
  loading,
  onAnswerChange,
}) {
  if (loading) {
    return (
      <div className="py-20 text-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!questions?.length) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold">NO QUESTIONS AVAILABLE</h2>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="max-w-3xl mx-auto">
        <Title level={3} className="text-center mb-8">
          Project Details
        </Title>

        <Card className="rounded-xl shadow-sm">
          {/* Using 'preserve' ensures values stick, but we manage state manually */}
          <Form layout="vertical">
            {questions.map((q) => (
              <QuestionField
                key={q._id}
                question={q}
                value={answers[q._id]}
                onChange={onAnswerChange}
              />
            ))}
          </Form>
        </Card>
      </div>
    </div>
  );
});
// --- FIX END ---

const Calculator = () => {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [estimationValue, setEstimationValue] = useState(0);

  const [subcategories, setSubcategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [packages, setPackages] = useState([]);
  
  // Note: We are not using step3Form instance anymore to avoid the conflict
  const [coords, setCoords] = useState({
    lat: null,
    lng: null,
    country: "",
    state: "",
    city: "",
    area: "",
    address: "",
  });

  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [countryCode, setCountryCode] = useState("+971");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [galleryImages, setGalleryImages] = useState([]); 
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const [messageApi, contextHolder] = message.useMessage();

  const areaSqFt =
    length && width ? Math.round(parseFloat(length) * parseFloat(width)) : 0;

  const countryCodes = [
    { value: "+971", label: "UAE (+971)" },
    { value: "+966", label: "KSA (+966)" },
    { value: "+974", label: "Qatar (+974)" },
    { value: "+968", label: "Oman (+968)" },
    { value: "+973", label: "Bahrain (+973)" },
    { value: "+965", label: "Kuwait (+965)" },
    { value: "+91", label: "India (+91)" },
    { value: "+92", label: "Pakistan (+92)" },
    { value: "+44", label: "UK (+44)" },
    { value: "+1", label: "USA/Canada (+1)" },
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

  const [loading, setLoading] = useState({
    subcat: true,
    types: false,
    packages: true,
    submitting: false,
    geocoding: false,
    questions: false,
  });

  const handleSelectType = useCallback(
    (id) => setSelectedType(id),
    []
  );

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const rule = COUNTRY_PHONE_RULES[countryCode];
    if (!rule) return;

    if (value.length > rule.digits) return;

    setPhone(value);

    if (value.length < rule.digits) {
      setPhoneError(`Phone number must be ${rule.digits} digits`);
    } else {
      setPhoneError("");
    }
  };

  const handleCountryChange = (code) => {
    setCountryCode(code);
    setPhone("");
    setPhoneError("");
  };

  const getAllImages = async () => {
    try {
      const res = await fetch(
        `https://xoto.ae/api/estimate/master/category/types/${selectedType}/gallery`
      );
      const data = await res.json();
      setGalleryImages(data?.gallery?.moodboardImages || []); 
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedType) getAllImages();
  }, [selectedType]);

  // Fetch subcategories
  useEffect(() => {
    const initFetch = async () => {
      try {
        const res = await apiService.get(
          "/estimate/master/category/name/Landscaping/subcategories"
        );
        if (res.success) setSubcategories(res.data || []);
      } catch (err) {
        messageApi.error("Error loading services");
      } finally {
        setLoading((prev) => ({ ...prev, subcat: false }));
      }
    };
    initFetch();
  }, []);

  // Fetch questions
  useEffect(() => {
    if (!selectedType) return;

    const getAllQuestions = async () => {
      setLoading((prev) => ({ ...prev, questions: true }));
      try {
        const res = await apiService.get(
          `/estimate/master/category/types/${selectedType}/questions`
        );

        if (res.success) {
          setQuestions(res.data || []);
          setAnswers({});
        }
      } catch (error) {
        messageApi.error("Error loading questions");
      } finally {
        setLoading((prev) => ({ ...prev, questions: false }));
      }
    };

    getAllQuestions();
  }, [selectedType]);

  // Fetch types
  useEffect(() => {
    if (!selectedSubcategory) return;
    const fetchTypes = async () => {
      setLoading((prev) => ({ ...prev, types: true }));
      try {
        const sub = subcategories.find((s) => s._id === selectedSubcategory);
        const res = await apiService.get(
          `/estimate/master/category/${sub.category}/subcategories/${selectedSubcategory}/types`
        );
        if (res.success) setTypes(res.data || []);
      } catch (err) {
        messageApi.error("Error loading styles");
      } finally {
        setLoading((prev) => ({ ...prev, types: false }));
      }
    };
    fetchTypes();
  }, [selectedSubcategory, subcategories]);

  // Fetch packages
  useEffect(() => {
    const fetchPkgs = async () => {
      try {
        const res = await apiService.get("/packages");
        if (res.success) setPackages(res.packages.filter((p) => p.isActive));
      } catch (err) {
        // messageApi.error("Error loading packages");
      } finally {
        setLoading((prev) => ({ ...prev, packages: false }));
      }
    };
    fetchPkgs();
  }, []);

  // Get location
  const handleGetLocation = () => {
    if (!navigator.geolocation)
      return messageApi.error("Geolocation not supported");

    setLoading((prev) => ({ ...prev, submitting: true, geocoding: true }));

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
            address: geo.fullAddress,
          });

          messageApi.success("Location synchronized!");
        } catch (error) {
          setCoords({
            lat,
            lng,
            country: "",
            state: "",
            city: "",
            area: "",
            address: "",
          });
          messageApi.warning("Location detected but address details unavailable");
        } finally {
          setLoading((prev) => ({
            ...prev,
            submitting: false,
            geocoding: false,
          }));
        }
      },
      () => {
        messageApi.error("Location access denied");
        setLoading((prev) => ({
          ...prev,
          submitting: false,
          geocoding: false,
        }));
      }
    );
  };

  const handleMapLocationChange = async ({ lat, lng }) => {
    setLoading((prev) => ({ ...prev, geocoding: true }));
    try {
      const geo = await reverseGeocode(lat, lng);
      setCoords({
        lat,
        lng,
        country: geo.country,
        state: geo.state,
        city: geo.city,
        area: geo.area,
        address: geo.fullAddress,
      });
      messageApi.success("Location updated!");
    } catch (error) {
      messageApi.error("Could not fetch address details");
    } finally {
      setLoading((prev) => ({ ...prev, geocoding: false }));
    }
  };


  
  // ✅ Optimized Answer Handler (Fixes fluctuation)
  const handleAnswerChange = useCallback((questionId, newValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: newValue }));
  }, []);


  

  // ✅ CHECK VALIDATION FOR NEXT BUTTON
  const isStepValid = () => {
    if (activeStep === 0) return !!coords.lat; // Step 1: Location required
    if (activeStep === 1) return !!selectedSubcategory; // Step 2: Service required
    if (activeStep === 2) return !!selectedType; // Step 3: Style required
    if (activeStep === 3) {
      // Step 4: All questions must be answered
      if (!questions || questions.length === 0) return true;
      return questions.every(q => {
        const val = answers[q._id];
        return val !== undefined && val !== null && val !== "";
      });
    }
    if (activeStep === 4) {
        // Step 5: Contact details
        const isPhoneValid = phone.length === COUNTRY_PHONE_RULES[countryCode]?.digits;
        return !!firstName && !!lastName && !!email && isPhoneValid && !phoneError;
    }
    return true;
  };

  const buildEstimateAnswersPayload = () => {
    return questions.map((q) => {
      const userAnswer = answers[q._id];

      if (q.questionType !== "options" && q.questionType !== "yesorno") {
        return {
          question: q._id,
          questionText: q.question,
          questionType: q.questionType,
          answerValue: userAnswer || null,
          includeInEstimate: true,
          areaQuestion: q.areaQuestion || false,
        };
      }

      const selectedOpt = q.options.find((opt) => opt.title === userAnswer);

      return {
        question: q._id,
        questionText: q.question,
        questionType: q.questionType,
        selectedOption: selectedOpt
          ? {
              optionId: selectedOpt._id,
              title: selectedOpt.title,
              value: selectedOpt.value || 0,
              valueSubType: selectedOpt.valueSubType || "flat",
            }
          : null,
        includeInEstimate: true,
        areaQuestion: q.areaQuestion || false,
      };
    });
  };

  const onFinalSubmit = async () => {
    // Safety check again
    if (!isStepValid()) {
        messageApi.error("Please fill all required fields");
        return;
    }

    const estimateAnswers = buildEstimateAnswersPayload();

    setLoading((prev) => ({ ...prev, submitting: true }));

    const selectedTypeData = types.find((t) => t._id === selectedType);

    const payload = {
      service_type: "landscape",
      customer_name: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      },
      customer_email: email.trim(),
      customer_mobile: {
        country_code: countryCode,
        number: phone.trim(),
      },
      type: selectedType,
      subcategory: selectedSubcategory,
      package: selectedPackage,
      area_length: parseFloat(length) || 0,
      area_width: parseFloat(width) || 0,
      area_sqft: areaSqFt,
      description: `Landscaping project for ${areaSqFt} sqft area with ${
        selectedTypeData?.label || "selected"
      } style`,
      location: {
        lat: coords.lat,
        lng: coords.lng,
        country: coords.country,
        state: coords.state,
        city: coords.city,
        area: coords.area,
        address: coords.address,
      },
      answers: estimateAnswers,
    };

    try {
      const response = await apiService.post("/estimates/submit", payload);

      if (response.success) {
        setActiveStep(5);
        messageApi.success("Estimate submitted successfully!");
        setEstimationValue(response.final_price);
      } else {
        messageApi.error(response.message || "Submission failed");
      }
    } catch (err) {
      messageApi.error(
        err.response?.data?.message || "Submission failed. Please try again."
      );
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleNext = () => {
    if (!isStepValid()) {
        messageApi.warning("Please complete the required fields to continue");
        return;
    }

    if (activeStep === 5) {
      navigate("/");
      return;
    }

    if (activeStep === 4) {
      onFinalSubmit();
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) return;
    setActiveStep((prev) => prev - 1);
  };

  // Main Render Helper
  const renderStepContent = () => {
    const variants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    };

    switch (activeStep) {
      case 0:
        return (
          <motion.div
            className="text-center py-10"
          >
            <div className="mb-6 inline-block p-6 rounded-full bg-purple-50">
              <CompassOutlined style={{ color: BRAND_PURPLE, fontSize: "3rem" }} />
            </div>

            <Title level={2}>Locate Your Address</Title>
            <Text className="text-lg text-gray-400 block mb-10">
              We use GPS coordinates for accurate site analysis. Click on the map to adjust your
              exact location.
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
                    <MapPicker coords={coords} onChange={handleMapLocationChange} />
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
          <motion.div
          >
            <Title level={2} className="text-center mb-10">
              What are we designing?
            </Title>

            <Row gutter={[24, 24]}>
              {[...subcategories].reverse().map((sub) => (
                <Col xs={24} sm={12} md={8} key={sub._id} className="p-10">
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
          <motion.div
          >
            <Title level={2} className="text-center mb-10">
              Select Your Aesthetic Style
            </Title>

            {loading.types ? (
              <div className="text-center py-20">
                <Spin size="large" />
              </div>
            ) : (
              <Row gutter={[24, 24]}>
                {types.map((t) => (
                  <Col xs={24} sm={12} md={8} key={t._id}>
                    <SelectionCard
                      item={t}
                      isSelected={selectedType === t._id}
                      onClick={() => handleSelectType(t._id)}
                      colorClass="bg-emerald-50 text-emerald-600"
                    />
                  </Col>
                ))}
              </Row>
            )}
          </motion.div>
        );

      case 3:
        return (
            // Using the separated Component to avoid re-renders
            <Step3Questions
                questions={questions}
                answers={answers}
                loading={loading.questions}
                onAnswerChange={handleAnswerChange}
            />
        );

      case 4:
        return (
          <motion.div
            className="max-w-5xl mx-auto"
          >
            <Row gutter={48}>
              <Col xs={24} lg={10}>
                <div
                  className="rounded-[2.5rem] p-10 text-white h-full shadow-2xl"
                  style={{ backgroundColor: BRAND_PURPLE }}
                >
                  <Title level={3} className="text-white mb-10">
                    Design Summary
                  </Title>

                  <div className="space-y-8">
                    <div>
                      <Text className="text-purple-300 block text-xs uppercase tracking-widest mb-1">
                        Service
                      </Text>
                      <Text strong className="text-white text-xl">
                        {subcategories.find(s => s._id === selectedSubcategory)?.label || "-"}
                      </Text>
                    </div>
                    <div>
                        <Text className="text-purple-300 block text-xs uppercase tracking-widest mb-1">
                            Style
                        </Text>
                        <Text strong className="text-white text-xl">
                            {types.find(t => t._id === selectedType)?.label || "-"}
                        </Text>
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} lg={14}>
                <Card className="rounded-[2.5rem] shadow-xl border-none p-6">
                  <div className="space-y-6">
                    <div>
                      <Text strong className="block mb-2">
                        First Name *
                      </Text>
                      <Input
                        size="large"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        prefix={<UserOutlined className="text-gray-300" />}
                        className="rounded-xl h-14"
                        placeholder="John"
                      />
                    </div>

                    <div>
                      <Text strong className="block mb-2">
                        Last Name *
                      </Text>
                      <Input
                        size="large"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        prefix={<UserOutlined className="text-gray-300" />}
                        className="rounded-xl h-14"
                        placeholder="Doe"
                      />
                    </div>

                    <div>
                      <Text strong className="block mb-2">
                        Email Address *
                      </Text>
                      <Input
                        size="large"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        prefix={<MailOutlined className="text-gray-300" />}
                        className="rounded-xl h-14"
                        placeholder="john@example.com"
                        type="email"
                      />
                    </div>

                    <div>
                      <Text strong className="block mb-2">
                        Contact Number *
                      </Text>

                      <Row gutter={8}>
                        <Col span={8}>
                          <Select
                            value={countryCode}
                            onChange={handleCountryChange}
                            className="w-full"
                            size="large"
                          >
                            {countryCodes.map((code) => (
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
                            placeholder={`Enter ${
                              COUNTRY_PHONE_RULES[countryCode]?.digits || ""
                            } digit number`}
                            prefix={<PhoneFilled />}
                            maxLength={COUNTRY_PHONE_RULES[countryCode]?.digits}
                            status={phoneError ? "error" : ""}
                            className="rounded-xl"
                          />
                        </Col>
                      </Row>

                      {phoneError && (
                        <Text type="danger" className="text-xs mt-1 block">
                          {phoneError}
                        </Text>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            className="text-center pb-20"
          >
            {/* 1. Valuation Card */}
            <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl inline-block border border-gray-50 mb-12">
              <SmileOutlined
                style={{ color: BRAND_PURPLE, fontSize: "5rem" }}
                className="mb-8"
              />
              <Title level={1} style={{ color: BRAND_PURPLE }} className="m-0">
                Valuation Ready
              </Title>

              <div className="my-8">
                <Text className="text-gray-400 uppercase tracking-widest block mb-3">
                  Estimated Investment Range
                </Text>
                <div className="text-6xl md:text-8xl font-black text-gray-900">
                  {estimationValue || 0}{" "}
                  <small className="text-2xl md:text-3xl font-light">AED</small>
                </div>
              </div>
            </div>

            {/* 2. Moodboard / Gallery Section */}
            {galleryImages && galleryImages.length > 0 && (
              <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="h-[1px] bg-gray-200 w-20"></div>
                  <Title level={3} className="m-0 text-gray-700">
                    Style Inspiration
                  </Title>
                  <div className="h-[1px] bg-gray-200 w-20"></div>
                </div>

                <Row gutter={[24, 24]} justify="center">
                  {galleryImages.map((img, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={index}>
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="rounded-2xl overflow-hidden shadow-lg h-full bg-white"
                      >
                        <Image
                          src={`${BASE_URL}${img.url}`} // ✅ Combine Base URL + Image Path
                          alt="Moodboard"
                          className="object-cover w-full h-64"
                          style={{ objectFit: "cover", height: "250px", width: "100%" }}
                          fallback="https://via.placeholder.com/300?text=No+Image"
                        />
                      </motion.div>
                    </Col>
                  ))}
                </Row>
                
                <Text type="secondary" className="mt-6 block text-sm">
                  Based on your selection of {types.find(t => t._id === selectedType)?.label || "style"}
                </Text>
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-40">
      {contextHolder}

      {/* Step Indicator Header */}
      <div className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="hidden lg:flex items-center space-x-8">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 transition-colors ${
                  i <= activeStep ? "text-black" : "text-gray-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                  ${
                    i === activeStep
                      ? "text-white border-transparent"
                      : i < activeStep
                      ? "bg-green-50 text-green-600 border-green-100"
                      : "border-gray-100"
                  }`}
                  style={{ backgroundColor: i === activeStep ? BRAND_PURPLE : "" }}
                >
                  {i < activeStep ? <CheckOutlined /> : i + 1}
                </div>

                <span
                  className={`text-xs font-bold uppercase tracking-tighter ${
                    i === activeStep ? "opacity-100" : "opacity-50"
                  }`}
                >
                  {s.title}
                </span>

                {i < steps.length - 1 && <div className="w-4 h-[2px] bg-gray-100" />}
              </div>
            ))}
          </div>

          <div className="lg:hidden">
            <Tag color="purple" style={{ backgroundColor: BRAND_PURPLE }}>
              Step {activeStep + 1} of {steps.length}
            </Tag>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 px-6">
        <AnimatePresence mode="wait">
          <div key={activeStep}>{renderStepContent()}</div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
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
                  <Text className="text-[10px] text-gray-400 uppercase font-black block tracking-widest">
                    Progress
                  </Text>
                  <Text strong style={{ color: BRAND_PURPLE }}>
                    {Math.min(
                      Math.round(((activeStep + 1) / steps.length) * 100),
                      100
                    )}
                    % Complete
                  </Text>
                </div>
              )}

              {/* ✅ Button with validation logic */}
              <Button
                type="primary"
                size="large"
                onClick={handleNext}
                disabled={!isStepValid()}
                className="h-14 px-12 rounded-2xl border-none text-lg shadow-xl transition-all"
                style={{
                  backgroundColor: !isStepValid() ? "#e5e7eb" : BRAND_PURPLE,
                  color: !isStepValid() ? "#9ca3af" : "white",
                  cursor: !isStepValid() ? "not-allowed" : "pointer"
                }}
              >
                {activeStep === 4 ? "Submit Estimate" : "Continue"}
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