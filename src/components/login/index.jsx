import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { Form, Input, Button, Card, Typography, Alert, Row, Col, Grid, ConfigProvider, Space, Select } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../manageApi/context/AuthContext.jsx";
import { toast } from "react-toastify";
import styled from "styled-components";
import { Country } from "country-state-city";


// Assets
import loginimage from "../../assets/img/one.png";
import logoNew from "../../assets/img/logooo.png";

import {
  ShopOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  LockOutlined,
  CodeOutlined,
  IdcardOutlined,
  ApartmentOutlined,
  BankOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// --- Styled Components --- (ALL ORIGINAL, UNCHANGED)
const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  font-family: "Poppins", sans-serif;
  background: url(${(props) => props.$bgImage}) center/cover no-repeat fixed;
  overflow: hidden;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(92, 3, 155, 0.85),
    rgba(3, 164, 244, 0.8)
  );
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
    padding: ${(props) => (props.$isMobile ? "30px 20px" : "40px")} !important;
  }
`;

const SelectionCard = styled.div`
  background: ${(props) =>
    props.$active ? `${props.$color}15` : "rgba(255,255,255,0.5)"};
  border: 2px solid ${(props) => (props.$active ? props.$color : "transparent")};
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
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    border-color: ${(props) => props.$color};
  }
`;

const Login = () => {
  const [form] = Form.useForm();
  
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { login, isAuthenticated, user, token } = useContext(AuthContext);
const selectedPartnerTypeRef = useRef(null);

  const isGridMode = location.pathname.includes("/grid/login");

  // ── view states: 'main' | 'xoto-select' | 'agent-select' | 'alliance-select' | 'login'
  const [view, setView] = useState(isGridMode ? "xoto-select" : "main"); 
  const [selectedPartnerType, setSelectedPartnerType] = useState(null);
  const [parentMenu, setParentMenu] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const hasRedirected = useRef(false);

  const countryOptions = useMemo(() => {
  const priorityIsoCodes = ["AE", "IN", "SA", "US", "GB", "AU"];
  return Country.getAllCountries()
    .map((country) => ({
      name: country.name,
      code: country.phonecode,
      iso: country.isoCode,
    }))
    .sort((a, b) => {
      const aPriority = priorityIsoCodes.includes(a.iso);
      const bPriority = priorityIsoCodes.includes(b.iso);
      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;
      return a.name.localeCompare(b.name);
    });
}, []);

  useEffect(() => {
    if (location.pathname.includes("/grid/login")) {
        setView("xoto-select");
        setSelectedPartnerType(null);
    } else {
        setView("main");
        setSelectedPartnerType(null);
    }
  }, [location.pathname]);

  useEffect(() => {
  if (selectedPartnerType) {
    selectedPartnerTypeRef.current = selectedPartnerType;
  }
}, [selectedPartnerType]);

  // --- Configuration ---
  const mainCategories = [
    {
      id: "freelancer",
      label: "Execution Partners",
      desc: "For Service Providers",
      icon: <UserOutlined style={{ fontSize: "28px" }} />,
      color: "#5C039B",
      gradient: "linear-gradient(135deg, #5C039B, #8E44AD)",
      type: "direct",
    },
    {
      id: "vendor-b2c",
      label: "Strategic Alliances",
      desc: "For Product Sellers & Vault",
      icon: <ShopOutlined style={{ fontSize: "28px" }} />,
      color: "#03A4F4",
      gradient: "linear-gradient(135deg, #03A4F4, #0077b6)",
      type: "direct",
    },
    {
      id: "agent",
      label: "Agents",
      desc: "For Agents",
      icon: <IdcardOutlined style={{ fontSize: "28px" }} />,
      color: "#10B981",
      gradient: "linear-gradient(135deg, #10B981, #059669)",
      type: "direct",
    },
    // ── DEVELOPER COMMENTED OUT ──────────────────────────────────────────
    {
      id: "developer",
      label: "Developers",
      desc: "For Developers",
      icon: <CodeOutlined style={{ fontSize: "28px" }} />,
      color: "#F97316",
      gradient: "linear-gradient(135deg, #10B981, #059669)",
      type: "direct",
    },
    // ─────────────────────────────────────────────────────────────────────
  ];

  const partnerTypes = [
    ...mainCategories,
    // {
    //   value: "developer",
    //   label: "Developer",
    //   desc: "For Real Estate Developers",
    //   icon: <CodeOutlined style={{ fontSize: "28px" }} />,
    //   color: "#F97316",
    //   gradient: "linear-gradient(135deg, #F97316, #EA580C)",
    // // },
    // {
    //   value: "agent",
    //   label: "Agent",
    //   desc: "For Real Estate Agents",
    //   icon: <IdcardOutlined style={{ fontSize: "28px" }} />,
    //   color: "#E11D48",
    //   gradient: "linear-gradient(135deg, #E11D48, #BE123C)",
    // },
    // {
    //   value: "agency",
    //   label: "Agency",
    //   desc: "For Property Agencies",
    //   icon: <ApartmentOutlined style={{ fontSize: "28px" }} />,
    //   color: "#4F46E5",
    //   gradient: "linear-gradient(135deg, #4F46E5, #4338ca)",
    // },
    // {
    //   value: "vault-admin",
    //   label: "Vault Partner",
    //   desc: "Vault Platform Access",
    //   icon: <BankOutlined style={{ fontSize: "28px" }} />,
    //   color: "#5C039B",
    //   gradient: "linear-gradient(135deg, #5C039B, #03A4F4)",
    // },
    // {
    //   value: "vaultagent",
    //   label: "Xoto Vault Agent",
    //   desc: "Mortgage Platform - Agent",
    //   icon: <BankOutlined style={{ fontSize: "28px" }} />,
    //   color: "#5C039B",
    //   gradient: "linear-gradient(135deg, #5C039B, #03A4F4)",
    // },
  ];

  const getSelectedPartner = () =>
    partnerTypes.find((t) => t.value === selectedPartnerType) || 
    partnerTypes.find((t) => t.id === selectedPartnerType);

  // ✅ Login success effect
useEffect(() => {
  if (isAuthenticated && token && !hasRedirected.current) {
    hasRedirected.current = true;

    if (user) {
      localStorage.setItem("user_data", JSON.stringify(user));
    }

    // ✅ Use ref as primary, state as fallback
    const partnerType = selectedPartnerTypeRef.current || selectedPartnerType;

    const roleCode = user?.role?.code?.toString() || (typeof user?.role === 'string' ? user.role : "");
    
    if (partnerType === "developer") {
      const developerId = user?._id || user?.id;
      localStorage.setItem("developerId", developerId);
      toast.success("Welcome Developer! Accessing your dashboard...");
      setTimeout(() => navigate("/dashboard/developer", { replace: true }), 1500);
      return;
    }

    if (partnerType === "agent") {
      toast.success("Welcome Agent! Accessing your dashboard...");
      setTimeout(() => navigate("/dashboard/agent", { replace: true }), 1500);
      return;
    }

    if (partnerType === "agency") {
      toast.success("Welcome Agency! Accessing your dashboard...");
      setTimeout(() => navigate("/dashboard/agency", { replace: true }), 1500);
      return;
    }

    if (partnerType === "vaultpartner") {
      toast.success("Welcome to Xoto Vault!");
      setTimeout(() => navigate("/dashboard/vaultpartner", { replace: true }), 1500);
      return;
    }

    if (partnerType === "vaultagent") {
      toast.success("Welcome to Xoto Vault!");
      setTimeout(() => navigate("/dashboard/vaultagent", { replace: true }), 1500);
      return;
    }

    // ✅ Also check user.type from JWT as extra fallback
    const userType = user?.type?.toLowerCase();
    if (userType === 'agent') {
      setTimeout(() => navigate("/dashboard/agent", { replace: true }), 1500);
      return;
    }
    if (userType === 'agency') {
      setTimeout(() => navigate("/dashboard/agency", { replace: true }), 1500);
      return;
    }
    if (userType === 'developer') {
      setTimeout(() => navigate("/dashboard/developer", { replace: true }), 1500);
      return;
    }

    const rolePathMap = {
      "0":  "/dashboard/superadmin",
      "1":  "/dashboard/admin",
      "2":  "/dashboard/customer",
      "5":  "/dashboard/vendor-b2c",
      "6":  "/dashboard/vendor-b2b",
      "7":  "/dashboard/freelancer",
      "15": "/dashboard/agency",
      "16": "/dashboard/agent",
      "17": "/dashboard/developer",
      "18": "/dashboard/vault-admin",
      "22": "/dashboard/vaultagent",
      "21": "/dashboard/vaultpartner",
    };

    const path = rolePathMap[roleCode] || "/dashboard";
    if (rolePathMap[roleCode]) {
      toast.success("Welcome back! Redirecting...");
      setTimeout(() => navigate(path, { replace: true }), 1500);
    } else {
      navigate("/dashboard", { replace: true });
    }
  }
}, [isAuthenticated, user, token, navigate, selectedPartnerType]);
  
  // --- Handlers ---
  
  const handleMainSelect = (category) => {
    if (category.id === "agent") {
      // Vault Agent commented out hai, isliye seedha login pe le jao
      setSelectedPartnerType("agent");
      setView("login");
      setParentMenu("main");
      setGeneralError("");
      form.resetFields();
      return;
    }
    if (category.id === "vendor-b2c") {
      setView("alliance-select"); 
      setParentMenu("alliance-select");
      setGeneralError("");
      return;
    }
    
    setSelectedPartnerType(category.id);
    setView("login");
    setParentMenu("main");
    setGeneralError("");
    form.resetFields();
  };

  const handleSubSelect = (type) => {
    setSelectedPartnerType(type);
    setView("login");
    setGeneralError("");
    form.resetFields();
  }

  const handleBack = () => {
    setGeneralError("");
    form.resetFields();
    
    if (view === "login") {
        if (isGridMode) {
            setView("xoto-select"); 
        } else if (selectedPartnerType === "vault-admin") {
            setView(parentMenu || "main");
            setSelectedPartnerType(null);
        } else if (selectedPartnerType === "agent") {
            setView("agent-select");
            setSelectedPartnerType(null);
        } else if (selectedPartnerType === "vendor-b2c") {
            setView("alliance-select");
            setSelectedPartnerType(null);
        } else {
            setView("main"); 
            setSelectedPartnerType(null);
        }
    } else if (view === "agent-select" || view === "alliance-select") {
        setView("main");
        setSelectedPartnerType(null);
        setParentMenu(null);
    } else if (view === "xoto-select") {
        navigate("/");
    }
  };

const onFinish = async (values) => {
  setLoading(true);
  setGeneralError("");

  try {
    let endpoint = "";

 if (selectedPartnerType === "agent") {
  const countryCode = values.agent_country_code || "971";
  const rawPhone    = values.agent_phone;
  const fullPhone   = `+${countryCode}${rawPhone}`;

  await login("/agent/login-agent", {
    phone:    fullPhone,        // ✅ "+917850006052"
    password: values.password,
  });
} else {
  let endpoint = "";
  if (selectedPartnerType === "freelancer")    endpoint = "/freelancer/login";
  else if (selectedPartnerType === "vendor-b2c")  endpoint = "/vendor/login";
  else if (selectedPartnerType === "developer")   endpoint = "/developer/login-developer";
  else if (selectedPartnerType === "agency")      endpoint = "/agency/auth/login";
  else if (selectedPartnerType === "vaultpartner")endpoint = "/vault/partner/login";
  else if (selectedPartnerType === "vaultagent")  endpoint = "/vault/agent/login";

  await login(endpoint, {
    email:    values.email,
    password: values.password,
  });
}
  } catch (err) {
    console.log("🔥 Backend Error Object:", err);

    let errorMessage = "Invalid credentials";

    if (err?.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err?.data?.message) {
      errorMessage = err.data.message;
    } else if (typeof err === 'object' && err?.message && !err.message.includes("status code")) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }

    const errorStr = errorMessage.toLowerCase();
    const isPendingOrUnapproved = errorStr.includes("not approved") || errorStr.includes("pending") || errorStr.includes("approv");

    if (isPendingOrUnapproved) {
      toast.warning(errorMessage, { position: "top-center", autoClose: 5000 });
    } else {
      toast.error(errorMessage, { position: "top-center" });
    }

    setGeneralError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleRegister = () => {
    if (selectedPartnerType === "freelancer") navigate("/freelancer/registration");
    else if (selectedPartnerType === "vendor-b2c") navigate("/ecommerce/seller");
    else if (selectedPartnerType === "developer") navigate("/developer/registration");
    else if (selectedPartnerType === "agent") navigate("/agent/registration"); 
    else if (selectedPartnerType === "agency") navigate("/agency/registration"); 
    else if (selectedPartnerType === "vaultpartner") navigate("/vault/vault-register");
    else if (selectedPartnerType === "vaultagent") navigate("/vault/vault-register");
  };

  // --- RENDER CONTENT ---
  
  // 1. Main Selection Screen 
  const renderMainSelection = () => (
    <motion.div
      key="main-selection"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ marginBottom: 24 }}>
        <ArrowLeftOutlined
          onClick={() => navigate("/")}
          style={{ fontSize: "24px", color: "#000", cursor: "pointer", padding: "8px", marginLeft: "-8px" }}
        />
      </div>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Title level={3} style={{ margin: 0, color: "#333" }}>Select Partner Type</Title>
        <Text type="secondary">Choose your Account type to continue</Text>
      </div>

      <Row gutter={[20, 20]}>
        {mainCategories.map((cat) => (
             <Col xs={24} sm={12} md={12} key={cat.id}>
             <SelectionCard
               $active={false} 
               $color={cat.color}
               onClick={() => handleMainSelect(cat)}
             >
               <div
                 style={{
                   width: 70, height: 70, borderRadius: "50%",
                   background: cat.color, color: "#fff",
                   display: "flex", alignItems: "center", justifyContent: "center",
                   boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                 }}
               >
                 {cat.icon}
               </div>
               <div>
                 <div style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
                   {cat.label}
                 </div>
                 <div style={{ fontSize: 14, color: "#888" }}>
                   {cat.desc}
                 </div>
               </div>
             </SelectionCard>
           </Col>
        ))}
      </Row>
    </motion.div>
  );

  // ── Agent Sub-Selection Screen ───────────────────────────────────────────────
  const renderAgentSelection = () => (
    <motion.div
      key="agent-selection"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{ marginBottom: 16, paddingLeft: 0, color: "#888" }}
      >
        Back to Selection
      </Button>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Title level={3} style={{ margin: 0, color: "#333" }}>Agents</Title>
        <Text type="secondary">Select your platform to continue</Text>
      </div>

      <Row gutter={[20, 20]} justify="center">
        {/* Existing Agent */}
        <Col xs={24} sm={12}>
          <SelectionCard
            $active={false}
            $color="#10B981"
            onClick={() => handleSubSelect("agent")}
          >
            <div
              style={{
                width: 70, height: 70, borderRadius: "50%",
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              }}
            >
              <IdcardOutlined style={{ fontSize: "28px" }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
                Agent
              </div>
              <div style={{ fontSize: 14, color: "#888" }}>
                Real Estate Platform
              </div>
            </div>
          </SelectionCard>
        </Col>

        {/* ── VAULT AGENT COMMENTED OUT ────────────────────────────────────── */}
        <Col xs={24} sm={12}>
          <SelectionCard
            $active={false}
            $color="#5C039B"
            onClick={() => handleSubSelect("vaultagent")}
          >
            <div
              style={{
                width: 70, height: 70, borderRadius: "50%",
                background: "linear-gradient(135deg, #5C039B, #03A4F4)",
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 10px rgba(92,3,155,0.3)",
              }}
            >
              <BankOutlined style={{ fontSize: "28px" }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
                Xoto Vault
              </div>
              <div style={{ fontSize: 14, color: "#888" }}>
                Mortgage Platform
              </div>
            </div>
          </SelectionCard>
        </Col>
        {/* ─────────────────────────────────────────────────────────────────── */}
      </Row>
    </motion.div>
  );

  // ── Strategic Alliances Sub-Selection Screen ──────────────────────────────
  const renderAllianceSelection = () => (
    <motion.div
      key="alliance-selection"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{ marginBottom: 16, paddingLeft: 0, color: "#888" }}
      >
        Back to Selection
      </Button>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Title level={3} style={{ margin: 0, color: "#333" }}>Strategic Alliances</Title>
        <Text type="secondary">Select your portal to continue</Text>
      </div>

      <Row gutter={[20, 20]} justify="center">
        {/* Strategic Alliance (B2C Vendor) */}
        <Col xs={24} sm={12}>
          <SelectionCard
            $active={false}
            $color="#03A4F4"
            onClick={() => handleSubSelect("vendor-b2c")}
          >
            <div
              style={{
                width: 70, height: 70, borderRadius: "50%",
                background: "linear-gradient(135deg, #03A4F4, #0077b6)",
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              }}
            >
              <ShopOutlined style={{ fontSize: "28px" }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
                Alliance Partner
              </div>
              <div style={{ fontSize: 14, color: "#888" }}>
                For Product Sellers
              </div>
            </div>
          </SelectionCard>
        </Col>

        {/* ── VAULT PARTNER COMMENTED OUT ──────────────────────────────────── */}
        {/* <Col xs={24} sm={12}>
          <SelectionCard
            $active={false}
            $color="#5C039B"
onClick={() => handleSubSelect("vaultpartner")}          >
            <div
              style={{
                width: 70, height: 70, borderRadius: "50%",
                background: "linear-gradient(135deg, #5C039B, #03A4F4)",
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 10px rgba(92,3,155,0.3)",
              }}
            >
              <BankOutlined style={{ fontSize: "28px" }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
                Vault Partner
              </div>
              <div style={{ fontSize: 14, color: "#888" }}>
                Vault Access Portal
              </div>
            </div>
          </SelectionCard>
        </Col> */}
        {/* ─────────────────────────────────────────────────────────────────── */}
      </Row>
    </motion.div>
  );

  // 2. Xoto Sub-Selection Screen (ORIGINAL, UNCHANGED)
  const renderXotoSelection = () => (
    <motion.div
      key="xoto-selection"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      {!isGridMode && (
         <Button
           type="text"
           icon={<ArrowLeftOutlined />}
           onClick={handleBack}
           style={{ marginBottom: 16, paddingLeft: 0, color: "#888" }}
         >
           Back to Selection
         </Button>
      )}

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Title level={3} style={{ margin: 0, color: "#333" }}>Xoto Grid Access</Title>
        <Text type="secondary">Select your role to proceed</Text>
      </div>

      <Row gutter={[16, 16]} justify="center">
        {/* Developer Card */}
        <Col xs={24} sm={12} md={8}>
          <SelectionCard
            $active={selectedPartnerType === "developer"}
            $color="#F97316"
            onClick={() => handleSubSelect("developer")}
          >
              <div
                  style={{
                    width: 60, height: 60, borderRadius: "50%",
                    background: "#F97316", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  }}
                >
                  <CodeOutlined style={{ fontSize: "24px" }} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
                    Developer
                  </div>
                  <div style={{ fontSize: 13, color: "#888" }}>
                    Real Estate Developers
                  </div>
                </div>
          </SelectionCard>
        </Col>

        {/* Agency Card */}
        <Col xs={24} sm={12} md={8}>
          <SelectionCard
            $active={selectedPartnerType === "agency"}
            $color="#4F46E5"
            onClick={() => handleSubSelect("agency")}
          >
              <div
                  style={{
                    width: 60, height: 60, borderRadius: "50%",
                    background: "#4F46E5", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  }}
                >
                  <ApartmentOutlined style={{ fontSize: "24px" }} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
                    Agency
                  </div>
                  <div style={{ fontSize: 13, color: "#888" }}>
                    Property Agencies
                  </div>
                </div>
          </SelectionCard>
        </Col>

        {/* Agent Card */}
        <Col xs={24} sm={12} md={8}>
          <SelectionCard
            $active={selectedPartnerType === "agent"}
            $color="#E11D48"
            onClick={() => handleSubSelect("agent")}
          >
              <div
                  style={{
                    width: 60, height: 60, borderRadius: "50%",
                    background: "#E11D48", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  }}
                >
                  <IdcardOutlined style={{ fontSize: "24px" }} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
                    Agent
                  </div>
                  <div style={{ fontSize: 13, color: "#888" }}>
                    Real Estate Agents
                  </div>
                </div>
          </SelectionCard>
        </Col>
      </Row>
    </motion.div>
  );

  // 3. Login Form (ORIGINAL, UNCHANGED)
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
        onClick={handleBack}
        style={{ marginBottom: 16, paddingLeft: 0, color: "#888" }}
      >
        {isGridMode ? "Back to Xoto Grid" : "Back to Selection"}
      </Button>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 12,
            background: activePartner?.gradient,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          {activePartner?.icon}
        </div>
        <div>
          <Title level={4} style={{ margin: 0, color: "#333" }}>
            Login as {activePartner?.label}
          </Title>
          <Text type="secondary">
            Enter your credentials to access dashboard
          </Text>
        </div>
      </div>

      {generalError && (
        <Alert
          message={generalError}
          type={generalError.toLowerCase().includes("not approved") || generalError.toLowerCase().includes("pending") ? "warning" : "error"}
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
          closable
        />
      )}

      <Form form={form} layout="vertical" onFinish={onFinish} size="large">
        {/* Agent → phone input, Others → email input */}
        {selectedPartnerType === "agent" ? (
          <Form.Item label="Phone Number" style={{ marginBottom: 0 }} required>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="agent_country_code"
                noStyle
                initialValue="971"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  style={{ width: '120px', height: '48px' }}
                >
                  {countryOptions.map((item) => (
                    <Option key={item.iso} value={item.code}>
                      +{item.code}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="agent_phone"
                noStyle
                getValueFromEvent={(e) => e.target.value.replace(/\D/g, '')}
                rules={[{ required: true, message: 'Phone number is required' }]}
              >
                <Input
                  placeholder="50 123 4567"
                  style={{
                    width: '100%',
                    height: '48px',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
        ) : (
          <Form.Item
            name="email"
            rules={[{ required: true, type: "email", message: "Valid email required" }]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Email Address"
              style={{ borderRadius: 12, height: 48 }}
            />
          </Form.Item>
        )}

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Password required" }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Password"
            style={{ borderRadius: 12, height: 48 }}
          />
        </Form.Item>

        {/* Forgot Password — only for certain roles */}
        {(selectedPartnerType === "agent" ||
          selectedPartnerType === "vendor-b2c" ||
          selectedPartnerType === "freelancer" ||
          selectedPartnerType === "developer" ||
          selectedPartnerType === "vault-admin") && (
          <div style={{ textAlign: "right", marginTop: -8, marginBottom: 16 }}>
            <Link
              to={`/forgot-password?role=${
                selectedPartnerType === "agent" ? "agent" :
                selectedPartnerType === "vendor-b2c" ? "vendor" :
                selectedPartnerType === "freelancer" ? "freelancer" :
                selectedPartnerType === "developer" ? "developer" :
                selectedPartnerType === "vault-admin" ? "vault" : ""
              }`}
              style={{
                color:
                  selectedPartnerType === "agent" ? "#E11D48" :
                  selectedPartnerType === "vendor-b2c" ? "#03A4F4" :
                  selectedPartnerType === "freelancer" ? "#5C039B" :
                  selectedPartnerType === "developer" ? "#F97316" :
                  selectedPartnerType === "vault-admin" ? "#5C039B" : "#888",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Forgot Password?
            </Link>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: 52,
              borderRadius: 12,
              fontWeight: "bold",
              fontSize: "15px",
              background: activePartner?.gradient,
              border: "none",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            }}
          >
            {loading ? "Signing In..." : "Login Now"}
          </Button>

          <Button
            onClick={handleRegister}
            block
            style={{
              height: 52,
              borderRadius: 12,
              fontWeight: "bold",
              fontSize: "15px",
              borderColor: activePartner?.color,
              color: activePartner?.color,
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
          colorPrimary:
            selectedPartnerType === "vendor-b2c"
              ? "#03A4F4"
              : selectedPartnerType === "developer"
              ? "#F97316"
              : selectedPartnerType === "agent"
              ? "#10B981"
              : selectedPartnerType === "agency"
              ? "#4F46E5"
              : selectedPartnerType === "vaultpartner" 
              ? "#5C039B"
              : selectedPartnerType === "vaultagent"  
              ? "#5C039B"
              : "#5C039B",
          borderRadius: 8,
          fontFamily: "Poppins, sans-serif",
        },
      }}
    >
      <PageWrapper $bgImage={loginimage}>
        <GradientOverlay />

        <ContentLayer>
          <Row style={{ width: "100%", maxWidth: 1200, padding: isMobile ? 16 : 0 }}>
            <Col
              xs={24}
              lg={12}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: isMobile ? "center" : "flex-start",
                padding: 40,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ textAlign: isMobile ? "center" : "left" }}
              >
                <img
                  src={logoNew}
                  alt="Logo"
                  style={{
                    width: isMobile ? 200 : 260,
                    marginBottom: 4,
                    marginLeft: isMobile ? "auto" : 0,
                    marginRight: isMobile ? "auto" : 0,
                    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))",
                  }}
                />

                <Title
                  style={{
                    color: "#fff",
                    fontSize: isMobile ? 32 : 48,
                    fontWeight: 800,
                    marginTop: 0,
                    marginBottom: 6,
                    lineHeight: 1.02,
                    whiteSpace: "nowrap",
                  }}
                >
                  {isGridMode ? "Xoto Grid" : "Partner"} <span style={{ color: "#03A4F4" }}>Access</span>
                </Title>

                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 18,
                    marginTop: 0,
                    display: "block",
                    maxWidth: 400,
                  }}
                >
                  {!selectedPartnerType
                    ? (isGridMode ? "Specialized access for Developers, Agents, and Agencies." : "Connect, Collaborate, and Grow with our extensive ecosystem.")
                    : `Welcome back, ${getSelectedPartner()?.label}. Let's get to work.`}
                </Text>
              </motion.div>
            </Col>

            <Col xs={24} lg={12} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                style={{ width: "100%", maxWidth: 650 }}
              >
                <GlassCard bordered={false} $isMobile={isMobile}>
                  <AnimatePresence mode="wait">
                    {view === "main"            && renderMainSelection()}
                    {view === "xoto-select"     && renderXotoSelection()}
                    {view === "agent-select"    && renderAgentSelection()}    
                    {view === "alliance-select" && renderAllianceSelection()} 
                    {view === "login"           && renderLoginForm()}
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
